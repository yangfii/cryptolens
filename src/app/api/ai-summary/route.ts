import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getCoinDetail } from "@/lib/coingecko";

export const revalidate = 1800;

type AiResult = {
  summary: string;
  bullishPoints: string[];
  bearishPoints: string[];
  spotTradingNote: string;
};

function extractJson(text: string): AiResult | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as AiResult;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const coinId = req.nextUrl.searchParams.get("coin");
  if (!coinId) {
    return Response.json({ error: "Missing 'coin' parameter" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error: "ANTHROPIC_API_KEY not configured on the server",
      },
      { status: 503 }
    );
  }

  let coin;
  try {
    coin = await getCoinDetail(coinId);
  } catch {
    return Response.json({ error: "Coin not found" }, { status: 404 });
  }

  const md = coin.market_data;
  const facts = {
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    rank: coin.market_cap_rank,
    price_usd: md.current_price.usd,
    market_cap_usd: md.market_cap.usd,
    volume_24h_usd: md.total_volume.usd,
    change_24h_pct: md.price_change_percentage_24h,
    change_7d_pct: md.price_change_percentage_7d,
    change_30d_pct: md.price_change_percentage_30d,
    ath_usd: md.ath.usd,
    atl_usd: md.atl.usd,
    circulating_supply: md.circulating_supply,
    max_supply: md.max_supply,
    categories: coin.categories?.slice(0, 5),
  };

  const prompt = `You are a crypto research analyst writing for a spot-trading audience. Analyze the following live data and produce a concise, balanced research note.

DATA:
${JSON.stringify(facts, null, 2)}

Respond ONLY with strict JSON in this exact shape (no markdown, no prose outside JSON):
{
  "summary": "2-3 sentence overview of current state — price action context, market cap position, and 1 notable observation.",
  "bullishPoints": ["3 short factual bullish points based on the data and known fundamentals"],
  "bearishPoints": ["3 short factual bearish points based on the data and known risks"],
  "spotTradingNote": "1-2 sentences specifically for spot traders considering entries/exits at current levels — mention key support/resistance ideas based on ATH/ATL/recent moves. NEVER give exact price targets."
}

Rules:
- Be factual and grounded in the data.
- Do NOT invent specific news events.
- Mention spot trading context, not leverage or futures.
- Tone: professional, balanced, no hype.`;

  const client = getAnthropic();
  let result;
  try {
    result = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 1024,
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

  const parsed = extractJson(textBlock.text);
  if (!parsed) {
    return Response.json(
      { error: "Failed to parse AI response", raw: textBlock.text },
      { status: 500 }
    );
  }

  return Response.json(
    { ...parsed, model: MODELS.smart },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
