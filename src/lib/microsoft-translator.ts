// ============================================================================
// Microsoft Translator (Azure Cognitive Services) API client
// Docs: https://learn.microsoft.com/en-us/azure/ai-services/translator/
// Free tier (F0): 2 million characters/month
// Supports Khmer (km) and works in Cambodia.
// ============================================================================

const ENDPOINT = "https://api.cognitive.microsofttranslator.com";

type MsTranslateResponse = Array<{
  detectedLanguage?: { language: string; score: number };
  translations: Array<{ text: string; to: string }>;
}>;

type MsError = {
  error?: { code: number; message: string };
};

export function isMicrosoftTranslatorConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_TRANSLATOR_KEY &&
      process.env.MICROSOFT_TRANSLATOR_REGION
  );
}

/**
 * Translate a batch of texts via Microsoft Translator.
 * Accepts up to 100 texts per request, 50,000 characters total per request.
 */
export async function translateBatch(
  texts: string[],
  targetLang: "km" | "en"
): Promise<string[]> {
  const key = process.env.MICROSOFT_TRANSLATOR_KEY;
  const region = process.env.MICROSOFT_TRANSLATOR_REGION;
  if (!key || !region) {
    throw new Error(
      "MICROSOFT_TRANSLATOR_KEY and MICROSOFT_TRANSLATOR_REGION must be set"
    );
  }
  if (texts.length === 0) return [];

  const params = new URLSearchParams({
    "api-version": "3.0",
    to: targetLang,
  });
  const url = `${ENDPOINT}/translate?${params}`;

  const body = texts.map((text) => ({ text }));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errBody = (await res.json()) as MsError;
      if (errBody.error?.message) detail = errBody.error.message;
    } catch {}
    throw new Error(`Microsoft Translator error: ${detail}`);
  }

  const data = (await res.json()) as MsTranslateResponse;
  return data.map((item) => item.translations[0]?.text ?? "");
}
