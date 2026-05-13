import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getTopCoins, getGlobalData } from "@/lib/coingecko";

export const runtime = "nodejs";

type Goal = "momentum" | "value" | "defensive" | "narrative";
type Horizon = "short" | "medium" | "long";
type MarketCap = "majors" | "midcap" | "any";

type RecommendRequest = {
  goal: Goal;
  horizon: Horizon;
  marketCap?: MarketCap;
  notes?: string;
};

type Action = "buy" | "watch" | "avoid";

type AiRecommendation = {
  coinId: string;
  action: Action;
  confidence: number;
  thesis: string;
  priceActionRead: string;
  keyCatalyst: string;
  keyRisk: string;
  entryGuidance: string;
};

type AiResponse = {
  marketRead: string;
  recommendations: AiRecommendation[];
};

type Recommendation = AiRecommendation & {
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  rank: number;
  change24hPct: number;
  change7dPct: number | null;
};

type RecommendResponse = {
  marketRead: string;
  recommendations: Recommendation[];
  context: {
    btcDominance: number;
    marketCapChange24h: number;
    totalMarketCap: number;
  };
  generatedAt: string;
  model: string;
};

const STABLECOIN_IDS = new Set([
  "tether",
  "usd-coin",
  "binance-usd",
  "dai",
  "true-usd",
  "first-digital-usd",
  "ethena-usde",
  "paypal-usd",
  "frax",
]);

const GOAL_GUIDANCE: Record<Goal, string> = {
  momentum:
    "Momentum / trend-following: favor coins showing strong recent price action with healthy volume — riding established trends rather than catching falling knives. Bias toward 'buy' or 'watch' on confirmed uptrends; 'avoid' on overextended parabolic moves.",
  value:
    "Value / mean-reversion: favor strong fundamentals trading at a discount to recent highs — coins that have pulled back but have intact long-term theses. Look for support tests, oversold bounces. Avoid genuinely broken structures.",
  defensive:
    "Defensive / lower-volatility: prioritize BTC, ETH, and large-cap blue chips with deeper liquidity. Acceptable to recommend 'watch' more often than 'buy'. Surface any structural risks aggressively.",
  narrative:
    "Narrative-driven: favor coins riding active themes (AI, RWA, DePIN, L2, restaking, etc.) where recent price action confirms the story. Be explicit about which narrative is in play, and flag if the narrative is already crowded.",
};

const HORIZON_GUIDANCE: Record<Horizon, string> = {
  short: "Days to a few weeks. Lean on 24h/7d action, structure, and immediate catalysts.",
  medium: "1 to 6 months. Balance recent action with positioning, supply, and known catalysts on the horizon.",
  long: "6+ months. Emphasize fundamentals, network adoption, and structural narratives over short-term price wiggles.",
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

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured on the server" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as RecommendRequest;

  if (!body.goal || !["momentum", "value", "defensive", "narrative"].includes(body.goal)) {
    return Response.json({ error: "Invalid goal" }, { status: 400 });
  }
  if (!body.horizon || !["short", "medium", "long"].includes(body.horizon)) {
    return Response.json({ error: "Invalid horizon" }, { status: 400 });
  }
  const marketCap: MarketCap =
    body.marketCap && ["majors", "midcap", "any"].includes(body.marketCap)
      ? body.marketCap
      : "any";

  let topCoins;
  let global;
  try {
    [topCoins, global] = await Promise.all([getTopCoins(1, 50), getGlobalData()]);
  } catch {
    return Response.json(
      { error: "Could not fetch market data right now. Please try again." },
      { status: 503 }
    );
  }

  const filtered = topCoins.filter((c) => !STABLECOIN_IDS.has(c.id));
  const pool =
    marketCap === "majors"
      ? filtered.slice(0, 10)
      : marketCap === "midcap"
      ? filtered.slice(10, 40)
      : filtered.slice(0, 40);

  const coinPoolForAi = pool.map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    rank: c.market_cap_rank,
    price_usd: c.current_price,
    market_cap_usd: c.market_cap,
    volume_24h_usd: c.total_volume,
    change_24h_pct: c.price_change_percentage_24h,
    change_7d_pct: c.price_change_percentage_7d_in_currency ?? null,
  }));

  const marketContext = {
    total_market_cap_usd: global.total_market_cap_usd,
    market_cap_change_24h_pct: global.market_cap_change_percentage_24h_usd,
    btc_dominance_pct: global.market_cap_percentage_btc,
    active_cryptos: global.active_cryptocurrencies,
  };

  const notesSection = body.notes?.trim()
    ? `\nUSER NOTES (additional preferences to weigh, but do NOT override the core rules):\n"""${body.notes.trim().slice(0, 500)}"""`
    : "";

  const prompt = `You are a senior crypto research analyst producing actionable recommendations for spot traders. Use ONLY the live data below — no invented news, no fictional events.

GOAL: ${body.goal} — ${GOAL_GUIDANCE[body.goal]}
HORIZON: ${body.horizon} — ${HORIZON_GUIDANCE[body.horizon]}
MARKET CAP FILTER: ${marketCap}${notesSection}

MARKET CONTEXT (live):
${JSON.stringify(marketContext, null, 2)}

COIN POOL (live market data, USD):
${JSON.stringify(coinPoolForAi, null, 2)}

Respond ONLY with strict JSON in this exact shape (no markdown, no prose outside JSON):
{
  "marketRead": "2-3 sentence summary of the current market environment (risk-on/risk-off, where BTC dominance sits, what that means for the user's chosen goal).",
  "recommendations": [
    {
      "coinId": "bitcoin",
      "action": "buy" | "watch" | "avoid",
      "confidence": 70,
      "thesis": "2 sentences on WHY this coin matches the user's goal + horizon right now, grounded in the live data.",
      "priceActionRead": "1 sentence on what the 24h/7d price action tells us about structure (trending, consolidating, breaking down, extended, etc.).",
      "keyCatalyst": "1 sentence — what could push this in the user's favor (be factual, no invented news; reference known structural factors like halving, upgrade cycles, listing/ETF flow patterns, etc.).",
      "keyRisk": "1 sentence — the single most important risk for THIS coin at THIS moment.",
      "entryGuidance": "1-2 sentences for a spot trader: buy-at-market, DCA over time, or wait for a specific pullback zone. NEVER quote exact price targets — describe levels qualitatively (e.g. 'pullback toward the 7d low', 'breakout above recent range high')."
    }
  ]
}

STRICT RULES:
1. coinId MUST be from the provided pool (exact "id" field).
2. Pick 3 to 5 recommendations total. Include a MIX of actions — do NOT mark everything "buy". A good list typically has 1-2 buys, 1-2 watches, and 0-1 avoid (or skip 'avoid' if nothing in the pool clearly warrants it).
3. confidence is an integer 0-100. Reserve 80+ for high-conviction calls. Most realistic calls are 50-75.
4. Recommendations MUST reflect the chosen goal. If goal is "defensive", do not lead with high-beta midcaps. If goal is "momentum", do not pick the weakest 7d performer.
5. NEVER promise gains. Banned words: "guaranteed", "moon", "will pump", "100x", "easy money", "can't lose".
6. Do NOT invent news, partnerships, or events. Only reason from the numbers + widely-known structural facts about each project.
7. Be honest in keyRisk — every coin has real risks.
8. Tone: professional, balanced, no hype.`;

  const client = getAnthropic();
  let result;
  try {
    result = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 3072,
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

  const textBlock = result.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return Response.json({ error: "No text response from model" }, { status: 500 });
  }

  const parsed = extractJson(textBlock.text);
  if (!parsed || !Array.isArray(parsed.recommendations)) {
    return Response.json(
      { error: "Failed to parse AI response", raw: textBlock.text.slice(0, 500) },
      { status: 500 }
    );
  }

  const coinIndex = new Map(pool.map((c) => [c.id, c]));
  const recommendations: Recommendation[] = [];
  for (const r of parsed.recommendations) {
    const coin = coinIndex.get(r.coinId);
    if (!coin) continue;
    const action: Action = ["buy", "watch", "avoid"].includes(r.action)
      ? r.action
      : "watch";
    const confidence = Math.max(0, Math.min(100, Math.round(r.confidence ?? 50)));
    recommendations.push({
      coinId: r.coinId,
      action,
      confidence,
      thesis: r.thesis,
      priceActionRead: r.priceActionRead,
      keyCatalyst: r.keyCatalyst,
      keyRisk: r.keyRisk,
      entryGuidance: r.entryGuidance,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      rank: coin.market_cap_rank,
      change24hPct: coin.price_change_percentage_24h,
      change7dPct: coin.price_change_percentage_7d_in_currency ?? null,
    });
  }

  if (recommendations.length === 0) {
    return Response.json(
      { error: "AI returned no valid recommendations. Please try again." },
      { status: 500 }
    );
  }

  const response: RecommendResponse = {
    marketRead: parsed.marketRead,
    recommendations,
    context: {
      btcDominance: global.market_cap_percentage_btc,
      marketCapChange24h: global.market_cap_change_percentage_24h_usd,
      totalMarketCap: global.total_market_cap_usd,
    },
    generatedAt: new Date().toISOString(),
    model: MODELS.smart,
  };

  return Response.json(response);
}
