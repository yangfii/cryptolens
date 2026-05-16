"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";

type Props = {
  coinId: string;
};

type SummaryResponse = {
  summary: string;
  bullishPoints: string[];
  bearishPoints: string[];
  spotTradingNote: string;
  model: string;
};

export default function AiSummary({ coinId }: Props) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/ai-summary?coin=${encodeURIComponent(coinId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          try {
            const json = JSON.parse(text) as { error?: string };
            throw new Error(json.error || `Request failed: ${res.status}`);
          } catch {
            throw new Error(text || `Request failed: ${res.status}`);
          }
        }
        return res.json();
      })
      .then((json: SummaryResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coinId]);

  if (loading) {
    return (
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
          <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Sastra trader AI
              <span className="pulse-dot" />
            </div>
            <div className="text-xs text-muted">
              Analyzing with Sonnet 4.6…
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-full" />
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-5/6" />
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="icon-tile text-danger" style={{ width: 40, height: 40 }}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold mb-1">AI analysis unavailable</div>
            <div className="text-xs text-muted">{error}</div>
            <div className="text-xs text-muted mt-2">
              Check{" "}
              <code className="text-accent font-mono px-1 py-0.5 rounded bg-white/[0.04]">
                ANTHROPIC_API_KEY
              </code>{" "}
              and your Anthropic credit balance.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Sastra trader AI Research
              <span className="pulse-dot" />
            </div>
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
              {data.model}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">
          Generated · Cached 30min
        </span>
      </div>

      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted mb-2">
          Summary
        </div>
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-success/[0.04] border border-success/15">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <div className="text-[11px] font-bold uppercase tracking-wider text-success">
              Bullish Points
            </div>
          </div>
          <ul className="space-y-2.5 text-sm">
            {data.bullishPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed">
                <span className="text-success mt-0.5 text-xs">▲</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4 bg-danger/[0.04] border border-danger/15">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-danger" />
            <div className="text-[11px] font-bold uppercase tracking-wider text-danger">
              Bearish Points
            </div>
          </div>
          <ul className="space-y-2.5 text-sm">
            {data.bearishPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed">
                <span className="text-danger mt-0.5 text-xs">▼</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-accent/[0.04] border border-accent/15">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-accent" />
          <div className="text-[11px] font-bold uppercase tracking-wider text-accent">
            Spot Trading Note
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {data.spotTradingNote}
        </p>
      </div>

      <p className="mt-5 text-xs text-muted italic flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" />
        AI-generated analysis. Not financial advice — always DYOR.
      </p>
    </div>
  );
}
