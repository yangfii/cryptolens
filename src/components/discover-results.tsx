"use client";

import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Globe,
  Clock,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";

type Source = { title: string; url: string };

type Project = {
  name: string;
  symbol: string;
  coinGeckoId: string | null;
  category: string;
  thesis: string;
  bullishPoints: string[];
  risks: string[];
  recentDevelopments: string[];
  website: string | null;
  sources: Source[];
};

export type DiscoverResult = {
  searchSummary: string;
  projects: Project[];
  generatedAt: string;
  model: string;
  searchesUsed: number;
  allSources: Source[];
};

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#a78bfa",
  DePIN: "#22d3ee",
  RWA: "#10b981",
  Gaming: "#f43f5e",
  DeFi: "#f97316",
  "Layer 1": "#3b82f6",
  L1: "#3b82f6",
  "Layer 2": "#8b5cf6",
  L2: "#8b5cf6",
  Privacy: "#7e7e95",
  "Store of Value": "#fbbf24",
  Infrastructure: "#22d3ee",
};

function categoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#fbbf24";
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function DiscoverResults({
  result,
  onReset,
}: {
  result: DiscoverResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5 fade-up">
      {/* Summary */}
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                AI Discovery Report
                <span className="pulse-dot" />
              </div>
              <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
                {result.model} · {result.searchesUsed} searches
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New search
          </button>
        </div>
        <p className="text-sm leading-relaxed">{result.searchSummary}</p>
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          {result.projects.length} Projects Found
        </h2>

        {result.projects.map((p, i) => {
          const catColor = categoryColor(p.category);
          return (
            <div
              key={`${p.symbol}-${i}`}
              className="premium-card rounded-2xl p-6 fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-xl grid place-items-center font-black"
                    style={{
                      background: catColor + "20",
                      color: catColor,
                      border: `1px solid ${catColor}40`,
                    }}
                  >
                    {p.symbol.slice(0, 4)}
                  </span>
                  <div>
                    <div className="font-bold text-xl leading-tight">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted uppercase tracking-[0.15em] font-semibold">
                        {p.symbol}
                      </span>
                      <span className="text-border">·</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border"
                        style={{
                          color: catColor,
                          borderColor: catColor + "40",
                          background: catColor + "10",
                        }}
                      >
                        {p.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.coinGeckoId && (
                    <Link
                      href={`/coin/${p.coinGeckoId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      View live data
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Site
                    </a>
                  )}
                </div>
              </div>

              {/* Thesis */}
              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted mb-2">
                  Thesis
                </div>
                <p className="text-sm leading-relaxed">{p.thesis}</p>
              </div>

              {/* Recent developments */}
              {p.recentDevelopments && p.recentDevelopments.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-accent">
                    <Clock className="w-3 h-3" />
                    Recent Developments
                  </div>
                  <ul className="space-y-2 text-sm">
                    {p.recentDevelopments.map((d, j) => (
                      <li key={j} className="flex gap-2.5 leading-relaxed">
                        <span className="text-accent mt-0.5 text-xs">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bullish + Risks */}
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl p-4 bg-success/[0.04] border border-success/15">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                    <div className="text-[11px] font-bold uppercase tracking-wider text-success">
                      Bullish Points
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {p.bullishPoints?.map((point, j) => (
                      <li key={j} className="flex gap-2 leading-relaxed">
                        <span className="text-success mt-0.5">▲</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-4 bg-danger/[0.04] border border-danger/15">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-3.5 h-3.5 text-danger" />
                    <div className="text-[11px] font-bold uppercase tracking-wider text-danger">
                      Risks
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {p.risks?.map((risk, j) => (
                      <li key={j} className="flex gap-2 leading-relaxed">
                        <span className="text-danger mt-0.5">▼</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sources */}
              {p.sources && p.sources.length > 0 && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted mb-2 flex items-center gap-1.5">
                    <Search className="w-3 h-3" />
                    Sources ({p.sources.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.sources.map((s, j) => (
                      <a
                        key={j}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-muted hover:text-foreground transition-colors"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        {hostname(s.url)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> These are
            AI-generated research notes based on real-time web searches. They
            are <strong className="text-foreground">not financial advice</strong>.
            AI may include outdated or inaccurate information — always verify
            claims independently before making investment decisions. Crypto is
            highly volatile.
          </p>
        </div>
      </div>
    </div>
  );
}
