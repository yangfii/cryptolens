import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getTopCoins } from "@/lib/coingecko";

export const runtime = "nodejs";

type AllocateRequest = {
  budget: number;
  currency?: string;
  riskProfile: "conservative" | "balanced" | "aggressive";
  horizon: "short" | "medium" | "long";
  preferredCoins?: string[];
  excludeStablecoins?: boolean;
};

type Allocation = {
  coinId: string;
  symbol: string;
  name: string;
  percentage: number;
  amount: number;
  currentPrice: number;
  entryStrategy: "current" | "dca" | "limit";
  entryPriceUSD: number | null;
  entryNote: string;
  reasoning: string;
};

type AllocateResponse = {
  strategy: string;
  allocations: Allocation[];
  cashReserved: number;
  cashReservedPercentage: number;
  totalAllocated: number;
  riskNotes: string;
  rebalanceFreq: string;
  generatedAt: string;
  model: string;
};

type AiAllocation = {
  coinId: string;
  percentage: number;
  entryStrategy: "current" | "dca" | "limit";
  entryPriceUSD: number | null;
  entryNote: string;
  reasoning: string;
};

type AiResponse = {
  strategy: string;
  allocations: AiAllocation[];
  cashReservedPercentage: number;
  riskNotes: string;
  rebalanceFreq: string;
};

function extractJson(text: string): unknown | null {
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

const STABLECOIN_IDS = new Set([
  "tether",
  "usd-coin",
  "binance-usd",
  "dai",
  "true-usd",
  "first-digital-usd",
  "ethena-usde",
]);

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured on the server" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as AllocateRequest;

  if (!body.budget || body.budget <= 0) {
    return Response.json({ error: "Budget must be a positive number" }, { status: 400 });
  }
  if (body.budget < 50) {
    return Response.json(
      { error: "Minimum recommended budget is $50 USD" },
      { status: 400 }
    );
  }
  if (!["conservative", "balanced", "aggressive"].includes(body.riskProfile)) {
    return Response.json({ error: "Invalid risk profile" }, { status: 400 });
  }
  if (!["short", "medium", "long"].includes(body.horizon)) {
    return Response.json({ error: "Invalid horizon" }, { status: 400 });
  }

  // Fetch top 30 coins as the pool the AI can choose from
  let topCoins;
  try {
    topCoins = await getTopCoins(1, 30);
  } catch {
    return Response.json(
      { error: "Could not fetch market data right now. Please try again." },
      { status: 503 }
    );
  }

  // Optionally remove stablecoins
  const pool = body.excludeStablecoins
    ? topCoins.filter((c) => !STABLECOIN_IDS.has(c.id))
    : topCoins;

  const coinPoolForAi = pool.slice(0, 25).map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    rank: c.market_cap_rank,
    price_usd: c.current_price,
    market_cap_usd: c.market_cap,
    change_24h_pct: c.price_change_percentage_24h,
    change_7d_pct: c.price_change_percentage_7d_in_currency,
  }));

  const horizonDescription = {
    short: "Short-term (weeks to a few months)",
    medium: "Medium-term (3–12 months)",
    long: "Long-term (1+ year)",
  }[body.horizon];

  const riskGuidance = {
    conservative:
      "Heavy on BTC + ETH (combined 60–75%). Include 10–20% cash reserve. Limit altcoin exposure to top-10 only.",
    balanced:
      "Solid BTC + ETH base (50–65% combined). Mix of top-20 alts. 5–10% cash reserve.",
    aggressive:
      "Lower BTC + ETH base (40–55% combined). Include some higher-beta top-30 alts. 0–5% cash reserve. Avoid micro-caps.",
  }[body.riskProfile];

  const preferredSection =
    body.preferredCoins && body.preferredCoins.length > 0
      ? `\nUSER PREFERENCES (try to include these if they fit the strategy and are in the pool): ${body.preferredCoins.join(", ")}`
      : "";

  const prompt = `You are a spot-trading portfolio strategist. Build an allocation for the user based on live market data and their parameters.

USER PARAMETERS:
- Budget: $${body.budget.toLocaleString()} USD
- Risk profile: ${body.riskProfile} — ${riskGuidance}
- Investment horizon: ${horizonDescription}${preferredSection}

COIN POOL (live market data, USD):
${JSON.stringify(coinPoolForAi, null, 2)}

Respond ONLY with strict JSON in this exact shape (no markdown):
{
  "strategy": "1–2 sentence overall approach explaining the choices and how they match the risk profile.",
  "allocations": [
    {
      "coinId": "bitcoin",
      "percentage": 40,
      "entryStrategy": "current" | "dca" | "limit",
      "entryPriceUSD": null,
      "entryNote": "Brief 1–2 sentence explanation of WHY this entry strategy now (mention recent price action context).",
      "reasoning": "2–3 sentences on why this coin fits the strategy, grounded in the data."
    }
  ],
  "cashReservedPercentage": 5,
  "riskNotes": "2–3 sentences on specific risks of THIS allocation (concentration, volatility, etc.).",
  "rebalanceFreq": "weekly | monthly | quarterly"
}

STRICT RULES:
1. coinId MUST be from the provided pool (use the exact "id" field).
2. percentages of all allocations + cashReservedPercentage MUST sum to exactly 100.
3. Pick 3–6 coins total (more for higher risk profiles).
4. NEVER allocate more than 70% to a single coin.
5. entryStrategy logic:
   - "current": price is stable/consolidating → buy now at market.
   - "dca": price is volatile → DCA over a few days/weeks (set entryPriceUSD to null).
   - "limit": price is near a recent high or extended → wait for pullback (set entryPriceUSD to a specific number 3–8% below current).
6. NEVER promise gains. NEVER use words like "guaranteed", "will moon", "guaranteed profit".
7. Be honest about risks in riskNotes.
8. Match the risk profile guidance above.`;

  const client = getAnthropic();
  let result;
  try {
    result = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const e = err as { status?: number; message?: string; error?: { error?: { message?: string } } };
    const apiMessage = e?.error?.error?.message ?? e?.message ?? "Anthropic API error";
    return Response.json({ error: apiMessage }, { status: e?.status ?? 500 });
  }

  const textBlock = result.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return Response.json({ error: "No text response from model" }, { status: 500 });
  }

  const parsed = extractJson(textBlock.text) as AiResponse | null;
  if (!parsed || !Array.isArray(parsed.allocations)) {
    return Response.json(
      { error: "Failed to parse AI response", raw: textBlock.text },
      { status: 500 }
    );
  }

  // Enrich allocations with coin data from our pool
  const coinIndex = new Map(pool.map((c) => [c.id, c]));
  const allocations: Allocation[] = [];
  for (const a of parsed.allocations) {
    const coin = coinIndex.get(a.coinId);
    if (!coin) continue;
    const amount = (body.budget * a.percentage) / 100;
    allocations.push({
      coinId: a.coinId,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      percentage: a.percentage,
      amount: Math.round(amount * 100) / 100,
      currentPrice: coin.current_price,
      entryStrategy: a.entryStrategy,
      entryPriceUSD: a.entryPriceUSD,
      entryNote: a.entryNote,
      reasoning: a.reasoning,
    });
  }

  const totalPct = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const cashReservedPct = Math.max(0, 100 - totalPct);
  const cashReserved = (body.budget * cashReservedPct) / 100;
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

  const response: AllocateResponse = {
    strategy: parsed.strategy,
    allocations,
    cashReserved: Math.round(cashReserved * 100) / 100,
    cashReservedPercentage: cashReservedPct,
    totalAllocated: Math.round(totalAllocated * 100) / 100,
    riskNotes: parsed.riskNotes,
    rebalanceFreq: parsed.rebalanceFreq,
    generatedAt: new Date().toISOString(),
    model: MODELS.smart,
  };

  return Response.json(response);
}
