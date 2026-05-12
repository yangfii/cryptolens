"use client";

import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import DiscoverForm, { type DiscoverParams } from "@/components/discover-form";
import DiscoverResults, { type DiscoverResult } from "@/components/discover-results";

export default function DiscoverPage() {
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: DiscoverParams) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/discover", {
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
      const data = (await res.json()) as DiscoverResult;
      setResult(data);
      setTimeout(() => {
        document
          .getElementById("discover-results")
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
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              AI Web Research
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Discover Projects
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Claude Sonnet 4.6 searches across crypto media, project websites, and
          analyst reports to find promising projects in your chosen sector.
          Every finding comes with source citations you can verify yourself.
        </p>
      </header>

      <DiscoverForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="mt-6 premium-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-tile text-accent" style={{ width: 36, height: 36 }}>
              <Search className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm">Searching the web…</div>
              <div className="text-xs text-muted">This usually takes 1–3 minutes — feel free to switch tabs</div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Claude Sonnet 4.6 is searching across multiple crypto media sites
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" style={{ background: "#22d3ee" }} />
              Gathering recent developments, news, and analyst opinions
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
              Synthesizing balanced research with source citations
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 premium-card rounded-2xl p-5 border border-danger/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-danger mb-1">
                Discovery failed
              </div>
              <div className="text-xs text-muted">{error}</div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div id="discover-results" className="mt-10">
          <DiscoverResults result={result} onReset={() => setResult(null)} />
        </div>
      )}
    </div>
  );
}
