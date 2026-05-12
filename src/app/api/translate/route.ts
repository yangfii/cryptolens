import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { callGemini, GEMINI_MODELS, isGeminiConfigured } from "@/lib/gemini";
import {
  isMicrosoftTranslatorConfigured,
  translateBatch as msTranslateBatch,
} from "@/lib/microsoft-translator";

export const revalidate = 3600;

type TranslateBody = {
  items: Array<{ id: string; title: string; description?: string }>;
  to: "kh" | "en";
};

type TranslatedItem = {
  id: string;
  title: string;
  description?: string;
};

function buildPrompt(
  items: TranslateBody["items"],
  to: "kh" | "en"
): string {
  const targetLang = to === "kh" ? "Khmer (ភាសាខ្មែរ)" : "English";

  const list = items
    .slice(0, 30)
    .map(
      (item, i) =>
        `${i + 1}. [${item.id}]\n   TITLE: ${item.title}${
          item.description ? `\n   DESC: ${item.description}` : ""
        }`
    )
    .join("\n\n");

  return `Translate the following crypto news items to ${targetLang}.

Rules:
- Keep crypto terms in original form when appropriate (Bitcoin, ETH, BTC, DeFi, etc.).
- Preserve numerical values, ticker symbols, and proper nouns.
- Translate naturally, not word-for-word.
- Keep tone professional and factual.

ITEMS:
${list}

Respond ONLY with strict JSON in this exact shape (no markdown, no preamble):
{"results":[{"id":"...","title":"translated title","description":"translated description if provided"}]}

The id field must match the [id] in brackets.`;
}

function extractJson(text: string): { results: TranslatedItem[] } | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function translateWithMicrosoft(
  body: TranslateBody
): Promise<{ results: TranslatedItem[]; model: string }> {
  const target = body.to === "kh" ? "km" : "en";

  // Flatten titles + descriptions into a single batch for one API call
  const texts: string[] = [];
  const itemMap: Array<{ id: string; titleIdx: number; descIdx: number | null }> = [];
  for (const item of body.items.slice(0, 50)) {
    const titleIdx = texts.length;
    texts.push(item.title);
    let descIdx: number | null = null;
    if (item.description) {
      descIdx = texts.length;
      texts.push(item.description);
    }
    itemMap.push({ id: item.id, titleIdx, descIdx });
  }

  const translated = await msTranslateBatch(texts, target);

  const results: TranslatedItem[] = itemMap.map((m) => ({
    id: m.id,
    title: translated[m.titleIdx] ?? "",
    description: m.descIdx !== null ? translated[m.descIdx] : undefined,
  }));

  return { results, model: "microsoft-translator" };
}

async function translateWithGemini(
  body: TranslateBody
): Promise<{ results: TranslatedItem[]; model: string }> {
  const prompt = buildPrompt(body.items, body.to);
  const { text, model } = await callGemini({
    model: GEMINI_MODELS.fast,
    prompt,
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
  });
  const parsed = extractJson(text);
  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error("Failed to parse Gemini response");
  }
  return { results: parsed.results, model };
}

async function translateWithClaude(
  body: TranslateBody
): Promise<{ results: TranslatedItem[]; model: string }> {
  const prompt = buildPrompt(body.items, body.to);
  const client = getAnthropic();
  const result = await client.messages.create({
    model: MODELS.fast,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = result.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response");
  }
  const parsed = extractJson(textBlock.text);
  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error("Failed to parse Claude response");
  }
  return { results: parsed.results, model: MODELS.fast };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TranslateBody;
  if (!body.items || body.items.length === 0) {
    return Response.json({ results: [] });
  }

  // Try Gemini first (free tier, fastest if available)
  if (isGeminiConfigured()) {
    try {
      const result = await translateWithGemini(body);
      return Response.json(result, {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("[translate] Gemini failed, trying next:", message);
      // Fall through
    }
  }

  // Try Microsoft Translator (free tier 2M chars/month, works in Cambodia)
  if (isMicrosoftTranslatorConfigured()) {
    try {
      const result = await translateWithMicrosoft(body);
      return Response.json(result, {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn(
        "[translate] Microsoft Translator failed, falling back to Claude:",
        message
      );
      // Fall through to Claude
    }
  }

  // Fallback to Claude Haiku
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "Translation unavailable: configure GEMINI_API_KEY (recommended, free) or ANTHROPIC_API_KEY",
      },
      { status: 503 }
    );
  }

  try {
    const result = await translateWithClaude(body);
    return Response.json(result, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    const e = err as {
      status?: number;
      message?: string;
      error?: { error?: { message?: string } };
    };
    const apiMessage =
      e?.error?.error?.message ?? e?.message ?? "Translation error";
    return Response.json({ error: apiMessage }, { status: e?.status ?? 500 });
  }
}
