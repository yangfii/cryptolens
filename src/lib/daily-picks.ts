import { unstable_cache } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { getTopCoins } from "@/lib/coingecko";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { recordSnapshot, type PickSnapshot } from "@/lib/picks-history";

export type RiskLevel = "low" | "medium" | "high";

// ============================================================================
// AI Daily Picks for Spot Traders
// ----------------------------------------------------------------------------
// Auto-curated every 12 hours by Claude Sonnet 4.6 with web search.
// Focused on good-value, liquid coins suitable for spot trading.
// ============================================================================

export type DailyPick = {
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  change24h: number;
  change7d: number;
  category: string;
  riskLevel: RiskLevel;
  thesis: string;
  spotTradingAngle: string;
  valueSignals: string[];
  watchPoints: string[];
};

export type DailyPicksResult = {
  picks: DailyPick[];
  marketContext: string;
  generatedAt: string;
  nextRefreshAt: string;
  model: string;
  searchesUsed: number;
};

type AiPick = {
  coinId: string;
  category: string;
  riskLevel: RiskLevel;
  thesis: string;
  spotTradingAngle: string;
  valueSignals: string[];
  watchPoints: string[];
};

type AiResponse = {
  marketContext: string;
  picks: AiPick[];
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

// Stablecoins to exclude — they're not "investment picks"
const STABLECOIN_IDS = new Set([
  "tether",
  "usd-coin",
  "binance-usd",
  "dai",
  "true-usd",
  "first-digital-usd",
  "ethena-usde",
  "paypal-usd",
]);

async function generateDailyPicks(): Promise<DailyPicksResult> {
  // Fetch top 50 (same URL as homepage table — shares cache, avoids extra HTTP call)
  const topCoins = await getTopCoins(1, 50);
  const investmentPool = topCoins.filter((c) => !STABLECOIN_IDS.has(c.id)).slice(0, 30);

  // Compact summary for the AI prompt
  const poolForAi = investmentPool.slice(0, 25).map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    rank: c.market_cap_rank,
    price_usd: c.current_price,
    market_cap_usd: c.market_cap,
    volume_24h_usd: c.total_volume,
    change_24h_pct: c.price_change_percentage_24h,
    change_7d_pct: c.price_change_percentage_7d_in_currency,
  }));

  const now = new Date().toISOString();

  const prompt = `You are a crypto research analyst curating today's BEST VALUE picks for SPOT TRADERS across MULTIPLE RISK LEVELS. Today's date: ${now}.

USE WEB SEARCH (3-5 searches) to find:
- Recent news, developments, and catalysts for the coins in the pool below
- Current market sentiment and notable price action
- Any fundamental updates (partnerships, upgrades, tokenomics changes)
- Sector trends affecting these coins

LIVE COIN POOL (top 30 by market cap, USD):
${JSON.stringify(poolForAi, null, 2)}

Your task: SELECT 8 COINS from this pool that represent the BEST VALUE for spot traders RIGHT NOW. Diversify across:
- **Sectors** (Store of Value, L1s, L2s, DeFi, AI, etc.)
- **Risk levels** — exactly 3 "low" risk + 3 "medium" risk + 2 "high" risk picks

RISK LEVEL DEFINITIONS:
- **low**: Top 10 by market cap, deep liquidity, established projects (e.g., BTC, ETH). For conservative spot traders.
- **medium**: Rank 11-25, solid fundamentals, moderate volatility (e.g., SOL, AVAX, LINK). For balanced spot traders.
- **high**: Rank 26+ OR top alts with strong recent momentum/speculation. Higher reward potential with higher risk. For aggressive spot traders. AVOID memecoins.

VALUE CRITERIA (in priority order):
1. **Fundamentally sound** — real utility, active development, strong team
2. **Reasonable entry** — not at ATH stretch, ideally near support or in consolidation
3. **Good liquidity** — high 24h volume relative to market cap (easy spot entry/exit)
4. **Positive catalyst nearby** — upcoming event, recent good news, or oversold from a quality dip
5. **Spot-tradeable** — no need for derivatives/leverage to capture the move

AVOID:
- Coins at new all-time highs with no clear support (poor risk/reward for spot entry)
- Coins in clear downtrend with no reversal signal
- Anything that smells like a pump-and-dump

Respond ONLY with strict JSON in this exact shape (no markdown, no prose outside JSON):
{
  "marketContext": "2-3 sentence summary of overall market state and what spot traders should focus on this period.",
  "picks": [
    {
      "coinId": "bitcoin",
      "category": "Store of Value | L1 | DeFi | AI | DePIN | Gaming | Privacy | etc.",
      "riskLevel": "low | medium | high",
      "thesis": "2-3 sentences explaining WHY this is good value RIGHT NOW. Reference recent developments from your web searches.",
      "spotTradingAngle": "1-2 sentences with concrete entry guidance: e.g., 'Current consolidation between $X-$Y offers low-risk entry', or 'DCA on weakness toward $X', or 'Wait for retest of broken resistance as support around $X'. NEVER give exact price targets for selling.",
      "valueSignals": ["3-4 concrete bullish factors grounded in data + recent news"],
      "watchPoints": ["2-3 things to monitor that could invalidate the thesis"]
    }
  ]
}

STRICT RULES:
- coinId MUST be from the pool above (use exact "id" field).
- Pick EXACTLY 8 coins: 3 low-risk + 3 medium-risk + 2 high-risk.
- riskLevel must match the rank tier guidance above.
- spotTradingAngle MUST be specific and actionable — no vague advice.
- NEVER promise gains. Avoid "moon", "guaranteed", "next 100x", "explosive".
- Cite specific developments you found via web search (with dates if possible).
- Be honest about risks in watchPoints.`;

  const client = getAnthropic();
  let response: Anthropic.Message;
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
    const e = err as { message?: string };
    throw new Error(e?.message ?? "AI request failed");
  }

  const textBlocks = response.content.filter(
    (c): c is Anthropic.TextBlock => c.type === "text"
  );
  const combinedText = textBlocks.map((b) => b.text).join("\n");

  const parsed = extractJson(combinedText);
  if (!parsed || !Array.isArray(parsed.picks)) {
    throw new Error("Failed to parse AI response");
  }

  // Enrich AI picks with live coin data
  const coinIndex = new Map(investmentPool.map((c) => [c.id, c]));
  const picks: DailyPick[] = [];
  for (const p of parsed.picks) {
    const coin = coinIndex.get(p.coinId);
    if (!coin) continue;
    picks.push({
      coinId: p.coinId,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d_in_currency ?? 0,
      category: p.category,
      riskLevel: p.riskLevel,
      thesis: p.thesis,
      spotTradingAngle: p.spotTradingAngle,
      valueSignals: p.valueSignals,
      watchPoints: p.watchPoints,
    });
  }

  const searchesUsed = response.content.filter(
    (c) => c.type === "server_tool_use"
  ).length;

  const nextRefresh = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

  // Snapshot for performance tracking — non-blocking, errors swallowed
  const snapshotPicks: PickSnapshot[] = picks.map((p) => ({
    coinId: p.coinId,
    symbol: p.symbol,
    name: p.name,
    image: p.image,
    priceAtPick: p.currentPrice,
    category: p.category,
    riskLevel: p.riskLevel,
  }));
  recordSnapshot(snapshotPicks).catch((err) => {
    console.error("[daily-picks] Failed to record snapshot:", err);
  });

  return {
    picks,
    marketContext: parsed.marketContext,
    generatedAt: now,
    nextRefreshAt: nextRefresh,
    model: MODELS.smart,
    searchesUsed,
  };
}

// Cached for 12 hours — auto-refreshes globally for all users.
// Cache key is bumped (v2) to invalidate stale empty results.
const cachedGenerator = unstable_cache(
  async () => {
    console.log("[daily-picks] Generating fresh picks…");
    const result = await generateDailyPicks();
    console.log(
      `[daily-picks] Generated ${result.picks.length} picks using ${result.searchesUsed} web searches`
    );
    return result;
  },
  ["daily-picks-v3"],
  { revalidate: 43200, tags: ["daily-picks"] }
);

export async function getDailyPicks(): Promise<DailyPicksResult> {
  try {
    return await cachedGenerator();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[daily-picks] Generation failed:", message);
    return {
      picks: [],
      marketContext:
        "AI Daily Picks temporarily unavailable. Reason: " +
        message +
        ". Picks refresh automatically every 12 hours.",
      generatedAt: new Date().toISOString(),
      nextRefreshAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      model: MODELS.smart,
      searchesUsed: 0,
    };
  }
}
