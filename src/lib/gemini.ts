// ============================================================================
// Google Gemini API client — for translation (free tier, no Anthropic credits)
// Docs: https://ai.google.dev/api/generate-content
// Free tier: 15 req/min, 1,500 req/day on Gemini 2.0 Flash
// ============================================================================

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Multiple model candidates — we try them in order if quota is hit or model unavailable.
// 2.5-flash-lite has the lowest cost/quota on free tier and is plenty for translation.
export const GEMINI_MODELS = {
  fast: "gemini-2.5-flash-lite",
  pro: "gemini-2.5-pro",
} as const;

export const GEMINI_FALLBACK_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
};

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callGeminiSingle(opts: {
  model: string;
  prompt: string;
  responseMimeType?: "application/json" | "text/plain";
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `${GEMINI_BASE_URL}/models/${opts.model}:generateContent`;

  const body = {
    contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: opts.maxOutputTokens ?? 8192,
      ...(opts.responseMimeType
        ? { responseMimeType: opts.responseMimeType }
        : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errBody = (await res.json()) as GeminiResponse;
      if (errBody.error?.message) detail = errBody.error.message;
    } catch {}
    const err = new Error(`Gemini API error: ${detail}`);
    // Tag quota errors so caller can decide to try fallback
    if (res.status === 429 || detail.toLowerCase().includes("quota")) {
      (err as Error & { isQuotaError?: boolean }).isQuotaError = true;
    }
    throw err;
  }

  const data = (await res.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini blocked request: ${data.promptFeedback.blockReason}`
    );
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no text content");
  }

  return text;
}

export async function callGemini(opts: {
  model?: string;
  prompt: string;
  responseMimeType?: "application/json" | "text/plain";
  maxOutputTokens?: number;
}): Promise<{ text: string; model: string }> {
  const candidates = opts.model
    ? [opts.model, ...GEMINI_FALLBACK_CHAIN.filter((m) => m !== opts.model)]
    : [...GEMINI_FALLBACK_CHAIN];

  let lastErr: Error | null = null;
  for (const model of candidates) {
    try {
      const text = await callGeminiSingle({ ...opts, model });
      return { text, model };
    } catch (err) {
      lastErr = err as Error;
      const e = err as Error & { isQuotaError?: boolean };
      const isQuota = e.isQuotaError;
      const isNotFound = e.message?.includes("is not found") || e.message?.includes("404");
      if (!isQuota && !isNotFound) {
        // Non-recoverable error — stop trying other models
        throw err;
      }
      console.warn(
        `[gemini] ${model} unavailable (${isQuota ? "quota" : "not found"}), trying next model…`
      );
    }
  }
  throw lastErr ?? new Error("All Gemini models failed");
}
