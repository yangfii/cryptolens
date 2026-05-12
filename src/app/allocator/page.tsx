"use client";

import { useState } from "react";
import { PieChart, AlertCircle } from "lucide-react";
import AllocatorForm, { type AllocatorParams } from "@/components/allocator-form";
import AllocatorResults, { type AllocateResult } from "@/components/allocator-results";

export default function AllocatorPage() {
  const [result, setResult] = useState<AllocateResult | null>(null);
  const [budget, setBudget] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: AllocatorParams) {
    setLoading(true);
    setError(null);
    setResult(null);
    setBudget(params.budget);

    try {
      const res = await fetch("/api/allocate", {
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
          if (parseErr instanceof Error && parseErr.message !== `Request failed: ${res.status}`) {
            throw parseErr;
          }
          throw new Error(text || `Request failed: ${res.status}`);
        }
      }
      const data = (await res.json()) as AllocateResult;
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("allocator-results")
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
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              AI Portfolio Builder
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Allocator
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Enter your budget and preferences. Claude Sonnet 4.6 will analyze
          current market conditions and suggest how to split your investment
          across coins — including how much to allocate, what entry strategy to
          use, and when to consider rebalancing.
        </p>
      </header>

      <AllocatorForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="mt-6 premium-card rounded-2xl p-5 border border-danger/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-danger mb-1">
                Could not generate allocation
              </div>
              <div className="text-xs text-muted">{error}</div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div id="allocator-results" className="mt-10">
          <AllocatorResults result={result} budget={budget} onReset={() => setResult(null)} />
        </div>
      )}
    </div>
  );
}
