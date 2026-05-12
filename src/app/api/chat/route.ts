import { NextRequest } from "next/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are CryptoLens AI, a crypto research assistant for spot traders.

Guidelines:
- Be concise, factual, and balanced.
- Focus on spot trading, not derivatives or leverage.
- Discuss fundamentals, tokenomics, on-chain context, technical levels, and risks.
- NEVER give specific price targets or financial advice.
- Always remind users to do their own research (DYOR).
- If asked about live prices, say you don't have real-time data in this chat — point them to the coin page.
- Refuse to help with rug pulls, pump-and-dumps, or anything fraudulent.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured on the server" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as { messages: ChatMessage[] };
  if (!body.messages || body.messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const messages = body.messages.slice(-20).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const client = getAnthropic();

  let stream;
  try {
    stream = await client.messages.stream({
      model: MODELS.fast,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });
  } catch (err) {
    const e = err as { status?: number; message?: string; error?: { error?: { message?: string } } };
    const apiMessage = e?.error?.error?.message ?? e?.message ?? "Unknown Anthropic API error";
    return Response.json(
      { error: apiMessage },
      { status: e?.status ?? 500 }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const e = err as { error?: { error?: { message?: string } }; message?: string };
        const apiMessage = e?.error?.error?.message ?? e?.message ?? "Stream error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${apiMessage}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
