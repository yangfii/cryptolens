import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

type DiscoverRequest = {
  theme?: string;
  customQuery?: string;
};

type Source = { title: string; url: string };

type Project = {
  name: string;
  symbol: string;
  coinGeckoId: string | null;
  category: string;
  thesis: string;
  bullishPoints: string[];
  risks: string[];
  recentDevelopments: string[];
  website: string | null;
  sources: Source[];
};

type AiResponse = {
  searchSummary: string;
  projects: Project[];
};

const THEME_PROMPTS: Record<string, string> = {
  AI:
    "AI-related crypto projects: decentralized AI, AI tokens, machine learning networks, AI agents on-chain.",
  DePIN:
    "Decentralized Physical Infrastructure Network (DePIN) projects: wireless networks, storage, compute, sensors, energy.",
  RWA:
    "Real-World Assets (RWA) tokenization projects: tokenized treasuries, real estate, commodities, credit.",
  Gaming:
    "Gaming and metaverse crypto projects: play-to-earn, on-chain games, gaming infrastructure, metaverse platforms.",
  DeFi:
    "Decentralized Finance (DeFi) projects: DEXes, lending protocols, derivatives, yield aggregators.",
  L1:
    "Layer 1 (L1) blockchain projects: new or growing base-layer chains with novel consensus or tech.",
  L2:
    "Layer 2 (L2) scaling solutions: rollups, sidechains, app-chains for Ethereum and other L1s.",
  Privacy:
    "Privacy-focused crypto projects: zero-knowledge proofs, mixers, private smart contracts.",
};

function extractJson(text: string): AiResponse | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as AiResponse;
  } catch {
    return null;
  }
}

function extractCitations(
  response: Anthropic.Message
): Source[] {
  const citations: Source[] = [];
  const seen = new Set<string>();

  for (const block of response.content) {
    if (block.type === "text") {
      const citationList = (block as unknown as { citations?: Array<{ url?: string; title?: string }> }).citations;
      if (Array.isArray(citationList)) {
        for (const cit of citationList) {
          if (cit.url && !seen.has(cit.url)) {
            seen.add(cit.url);
            citations.push({
              url: cit.url,
              title: cit.title ?? new URL(cit.url).hostname,
            });
          }
        }
      }
    }
    if (block.type === "web_search_tool_result") {
      const result = (block as unknown as { content?: Array<{ url?: string; title?: string; type?: string }> }).content;
      if (Array.isArray(result)) {
        for (const r of result) {
          if (r.type === "web_search_result" && r.url && !seen.has(r.url)) {
            seen.add(r.url);
            citations.push({
              url: r.url,
              title: r.title ?? new URL(r.url).hostname,
            });
          }
        }
      }
    }
  }
  return citations;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured on the server" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as DiscoverRequest;
  const theme = body.theme || "All";
  const customQuery = body.customQuery?.trim();

  const themeDescription = THEME_PROMPTS[theme] || null;

  const focusInstruction = customQuery
    ? `The user is specifically interested in: "${customQuery}". Find projects matching this query.`
    : themeDescription
    ? `Focus on this sector: ${themeDescription}`
    : `Find the most interesting and promising crypto projects across all sectors right now. Mix major and emerging names.`;

  const prompt = `You are a crypto research analyst. Use web search to find 4-6 currently-promising crypto projects, then return a balanced research note with citations.

${focusInstruction}

Process:
1. Search the web for "best crypto projects 2026", "${theme !== "All" ? theme + " crypto projects" : "promising crypto"}", "${customQuery || theme} fundamentals", "${customQuery || theme} recent developments". Use 3-5 searches total.
2. Identify 4-6 distinct projects with real traction.
3. For each project, gather: thesis, recent developments, market position, risks.

STRICT RULES:
- ONLY recommend projects with real utility, active development, and meaningful market cap (avoid micro-caps under $50M unless exceptional).
- AVOID: memecoins without utility, projects with rug-pull history, unverified team projects, anything that seems like a pump-and-dump.
- Be honest about risks for every project.
- Don't promise gains. Avoid words like "moon", "guaranteed", "next 100x".
- Cite specific recent news/developments (with dates if possible) from your searches.

Respond ONLY with strict JSON in this exact shape (no markdown):
{
  "searchSummary": "1-2 sentence overview of what you found and the current market environment.",
  "projects": [
    {
      "name": "Bitcoin",
      "symbol": "BTC",
      "coinGeckoId": "bitcoin",
      "category": "Store of Value | L1 | DeFi | AI | DePIN | Gaming | etc.",
      "thesis": "2-3 sentence summary of why this project matters and current state.",
      "bullishPoints": ["3-4 concrete bullish points grounded in your research"],
      "risks": ["2-3 honest risk factors"],
      "recentDevelopments": ["2-3 recent news/updates from your searches (with rough dates if possible)"],
      "website": "https://... (project's official website, if found)"
    }
  ]
}

Rules for the response:
- coinGeckoId should be the lowercase id used by CoinGecko (e.g., "bitcoin", "ethereum", "solana", "render-token"). Set null if you're not sure.
- Provide ONLY the JSON, no preamble.`;

  const client = getAnthropic();

  let response;
  try {
    response = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 8192,
      tools: [
        {
          type: "web_search_20260209" as const,
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const e = err as {
      status?: number;
      message?: string;
      error?: { error?: { message?: string } };
    };
    const apiMessage =
      e?.error?.error?.message ?? e?.message ?? "Anthropic API error";
    return Response.json({ error: apiMessage }, { status: e?.status ?? 500 });
  }

  const textBlocks = response.content.filter(
    (c): c is Anthropic.TextBlock => c.type === "text"
  );
  const combinedText = textBlocks.map((b) => b.text).join("\n");

  if (!combinedText) {
    return Response.json(
      { error: "No text response from model" },
      { status: 500 }
    );
  }

  const parsed = extractJson(combinedText);
  if (!parsed || !Array.isArray(parsed.projects)) {
    return Response.json(
      { error: "Failed to parse AI response", raw: combinedText.slice(0, 500) },
      { status: 500 }
    );
  }

  // Extract all web sources Claude found during searches
  const allSources = extractCitations(response);

  // Attach sources to each project (best-effort: distribute or use top sources)
  const projectsWithSources: Project[] = parsed.projects.map((p) => ({
    ...p,
    sources: allSources
      .filter((s) =>
        s.title
          ?.toLowerCase()
          .includes(p.name.toLowerCase()) ||
        s.title?.toLowerCase().includes(p.symbol.toLowerCase()) ||
        s.url?.toLowerCase().includes(p.name.toLowerCase().replace(/\s+/g, "")) ||
        s.url?.toLowerCase().includes(p.symbol.toLowerCase())
      )
      .slice(0, 3),
  }));

  // For projects with no matched sources, attach 1-2 general sources from the pool
  const generalSources = allSources.slice(0, 5);
  for (const p of projectsWithSources) {
    if (p.sources.length === 0 && generalSources.length > 0) {
      p.sources = generalSources.slice(0, 2);
    }
  }

  const searchesUsed = response.content.filter(
    (c) => c.type === "server_tool_use"
  ).length;

  return Response.json(
    {
      searchSummary: parsed.searchSummary,
      projects: projectsWithSources,
      generatedAt: new Date().toISOString(),
      model: MODELS.smart,
      searchesUsed,
      allSources: allSources.slice(0, 10),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
      },
    }
  );
}
