"use client";

import { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import RecommendForm, { type RecommendParams } from "@/components/recommend-form";
import RecommendResults, { type RecommendResult } from "@/components/recommend-results";
import { useLang } from "@/components/lang-provider";

export default function RecommendPage() {
  const { lang } = useLang();
  const L = lang === "kh" ? "kh" : "en";

  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: RecommendParams) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text) as { error?: string };
          throw new Error(json.error || `Request failed: ${res.status}`);
        } catch (parseErr) {
          if (
            parseErr instanceof Error &&
            parseErr.message !== `Request failed: ${res.status}`
          ) {
            throw parseErr;
          }
          throw new Error(text || `Request failed: ${res.status}`);
        }
      }
      const data = (await res.json()) as RecommendResult;
      setResult(data);
      setTimeout(() => {
        document
          .getElementById("recommend-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-tile text-accent" style={{ width: 44, height: 44 }}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              {L === "kh" ? "យោបល់ដោយ AI" : "AI Recommendations"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {L === "kh" ? "យោបល់ Crypto" : "Crypto Picks"}
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          {L === "kh"
            ? "ជ្រើស​រចនាប័ទ្ម​ និង​រយៈពេល​។ Claude Sonnet 4.6 នឹង​​​វិភាគ​ទីផ្សារ​ផ្ទាល់ ហើយ​​ផ្តល់​​យោបល់ ៣ ដល់ ៥ កាក់​​ ជាមួយ​សញ្ញា​ Buy / Watch / Avoid និង​មូលហេតុ​ច្បាស់​លាស់​សម្រាប់​ Spot trader។"
            : "Pick a style and horizon. Claude Sonnet 4.6 analyzes live market data and returns 3–5 specific coin recommendations with Buy / Watch / Avoid signals, confidence scores, and a price-action read built for spot traders."}
        </p>
      </header>

      <RecommendForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="mt-6 premium-card rounded-2xl p-5 border border-danger/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-danger mb-1">
                {L === "kh"
                  ? "មិន​អាច​បង្កើត​យោបល់​បាន​ទេ"
                  : "Could not generate recommendations"}
              </div>
              <div className="text-xs text-muted">{error}</div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div id="recommend-results" className="mt-10">
          <RecommendResults result={result} onReset={() => setResult(null)} />
        </div>
      )}
    </div>
  );
}
