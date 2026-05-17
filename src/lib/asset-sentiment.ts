// AI-driven sentiment analysis for a single asset. Given price action +
// recent news headlines, Claude returns an overall bull/bear/neutral
// signal with reasoning and per-headline tags.

import { getAnthropic, MODELS } from "./anthropic";

export type SentimentLabel = "bullish" | "bearish" | "neutral";

export type HeadlineInput = {
  id: string;
  title: string;
  publisher?: string;
};

export type HeadlineSentiment = {
  id: string;
  sentiment: SentimentLabel;
  reason: string;
};

export type AssetSentiment = {
  overall: SentimentLabel;
  confidence: number; // 0-100
  summary: string;
  drivers: string[]; // 2-4 bullet points explaining the call
  headlines: HeadlineSentiment[];
};

type AnalyzeInput = {
  symbol: string;
  displayName: string;
  category: string;
  price: number;
  currency: string;
  changePercent24h: number;
  high52w?: number | null;
  low52w?: number | null;
  headlines: HeadlineInput[];
};

const SYSTEM_PROMPT = `You are an expert markets analyst covering crypto, equities, metals, forex, and commodities. Given current price action and recent headlines for ONE asset, produce a calm, factual sentiment read.

You MUST respond with strict JSON matching this shape (no markdown, no preamble):
{
  "overall": "bullish" | "bearish" | "neutral",
  "confidence": <integer 0-100>,
  "summary": "<one sentence, max 30 words>",
  "drivers": ["<short bullet>", "<short bullet>", ...],
  "headlines": [
    {"id": "<exact id from input>", "sentiment": "bullish"|"bearish"|"neutral", "reason": "<short reason, max 20 words>"}
  ]
}

Rules:
- Be balanced. "neutral" is a valid call when signals conflict.
- Each headline gets ONE sentiment tag with a one-line reason.
- The "drivers" array should have 2-4 bullets covering price context AND news themes.
- Never give financial advice. Stick to observable signals.`;

function buildPrompt(input: AnalyzeInput): string {
  const range =
    input.high52w && input.low52w
      ? ` (52w range ${input.low52w.toFixed(2)} - ${input.high52w.toFixed(2)} ${input.currency})`
      : "";
  const headlinesBlock =
    input.headlines.length === 0
      ? "(no recent headlines available — base the call on price action alone)"
      : input.headlines
          .slice(0, 10)
          .map(
            (h) =>
              `[${h.id}] ${h.title}${h.publisher ? ` — ${h.publisher}` : ""}`,
          )
          .join("\n");

  return `Asset: ${input.displayName} (${input.symbol}) · ${input.category}
Current price: ${input.price.toFixed(2)} ${input.currency}${range}
24h change: ${input.changePercent24h >= 0 ? "+" : ""}${input.changePercent24h.toFixed(2)}%

Recent headlines:
${headlinesBlock}

Return the JSON described in the system prompt now.`;
}

function extractJson(text: string): AssetSentiment | null {
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

export async function analyzeAsset(
  input: AnalyzeInput,
): Promise<AssetSentiment | null> {
  const client = getAnthropic();
  const result = await client.messages.create({
    model: MODELS.fast,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const textBlock = result.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;
  const parsed = extractJson(textBlock.text);
  if (!parsed) return null;
  // Clamp confidence to [0, 100]
  parsed.confidence = Math.max(0, Math.min(100, Math.round(parsed.confidence)));
  return parsed;
}
