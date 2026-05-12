import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";

export const revalidate = 1800;

type SentimentResult = { id: string; sentiment: "bullish" | "bearish" | "neutral" };

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as {
    headlines: Array<{ id: string; title: string }>;
  };

  if (!body.headlines || body.headlines.length === 0) {
    return Response.json({ results: [] });
  }

  const list = body.headlines
    .slice(0, 30)
    .map((h, i) => `${i + 1}. [${h.id}] ${h.title}`)
    .join("\n");

  const prompt = `Classify each crypto news headline as bullish, bearish, or neutral for the broad crypto market.

HEADLINES:
${list}

Respond ONLY with strict JSON in this shape:
{"results": [{"id": "...", "sentiment": "bullish|bearish|neutral"}]}

Rules:
- Use the [id] in brackets as the id field.
- "bullish" = positive/supportive for prices.
- "bearish" = negative/risk-off.
- "neutral" = informational, regulatory updates without clear direction, or mixed signals.`;

  const client = getAnthropic();
  let result;
  try {
    result = await client.messages.create({
      model: MODELS.fast,
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
    return Response.json({ error: "No text response" }, { status: 500 });
  }

  const text = textBlock.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return Response.json({ error: "Failed to parse" }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      results: SentimentResult[];
    };
    return Response.json(parsed, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return Response.json({ error: "Invalid JSON in response" }, { status: 500 });
  }
}
