"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  ArrowUpRight,
  Clock,
  Shield,
  Scale,
  Flame,
  Languages,
} from "lucide-react";
import type { DailyPick, RiskLevel } from "@/lib/daily-picks";
import { formatPrice, formatCompact, formatRelativeTime } from "@/lib/format";
import { useLang } from "./lang-provider";

type Props = {
  picks: DailyPick[];
  marketContext: string;
  generatedAt: string;
  nextRefreshAt: string;
  model: string;
  searchesUsed: number;
};

type RiskProfile = "all" | "conservative" | "balanced" | "aggressive";

const PROFILE_STORAGE_KEY = "cryptolens:risk-profile";

const PROFILE_INCLUDES: Record<RiskProfile, RiskLevel[]> = {
  all: ["low", "medium", "high"],
  conservative: ["low"],
  balanced: ["low", "medium"],
  aggressive: ["low", "medium", "high"],
};

const PROFILES: Array<{
  value: RiskProfile;
  labelKey: string;
  icon: typeof Shield;
  color: string;
}> = [
  { value: "all", labelKey: "picks.profile_all", icon: Sparkles, color: "#fbbf24" },
  { value: "conservative", labelKey: "picks.profile_conservative", icon: Shield, color: "#22d3ee" },
  { value: "balanced", labelKey: "picks.profile_balanced", icon: Scale, color: "#fbbf24" },
  { value: "aggressive", labelKey: "picks.profile_aggressive", icon: Flame, color: "#f43f5e" },
];

const RISK_LABEL_KEY: Record<RiskLevel, string> = {
  low: "picks.risk_low",
  medium: "picks.risk_medium",
  high: "picks.risk_high",
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#22d3ee",
  medium: "#fbbf24",
  high: "#f43f5e",
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
  "Smart Contract": "#a78bfa",
};

function categoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#fbbf24";
}

type TranslatedPicks = {
  marketContext: string;
  picks: Array<{
    thesis: string;
    spotTradingAngle: string;
    valueSignals: string[];
    watchPoints: string[];
  }>;
};

export default function DailyPicksClient({
  picks,
  marketContext,
  generatedAt,
  nextRefreshAt,
  model,
  searchesUsed,
}: Props) {
  const { lang, t } = useLang();
  const [profile, setProfile] = useState<RiskProfile>("all");
  const [translations, setTranslations] = useState<TranslatedPicks | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Restore profile from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY) as RiskProfile | null;
      if (savedProfile && PROFILES.find((p) => p.value === savedProfile)) {
        setProfile(savedProfile);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, profile);
    } catch {}
  }, [profile]);

  // Fetch translations when global language switches to Khmer
  useEffect(() => {
    if (lang !== "kh" || translations) return;
    let cancelled = false;
    setTranslating(true);
    setTranslationError(null);

    const items: Array<{ id: string; title: string }> = [
      { id: "ctx", title: marketContext },
    ];
    picks.forEach((p, i) => {
      items.push({ id: `p${i}-thesis`, title: p.thesis });
      items.push({ id: `p${i}-angle`, title: p.spotTradingAngle });
      p.valueSignals.forEach((s, j) => {
        items.push({ id: `p${i}-sig-${j}`, title: s });
      });
      p.watchPoints.forEach((w, j) => {
        items.push({ id: `p${i}-watch-${j}`, title: w });
      });
    });

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "kh", items }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          try {
            const json = JSON.parse(text) as { error?: string };
            throw new Error(json.error || `HTTP ${res.status}`);
          } catch {
            throw new Error(text || `HTTP ${res.status}`);
          }
        }
        return res.json();
      })
      .then((data: { results: Array<{ id: string; title: string }> }) => {
        if (cancelled) return;
        const map = new Map(data.results.map((r) => [r.id, r.title]));
        const translated: TranslatedPicks = {
          marketContext: map.get("ctx") ?? marketContext,
          picks: picks.map((p, i) => ({
            thesis: map.get(`p${i}-thesis`) ?? p.thesis,
            spotTradingAngle: map.get(`p${i}-angle`) ?? p.spotTradingAngle,
            valueSignals: p.valueSignals.map(
              (s, j) => map.get(`p${i}-sig-${j}`) ?? s
            ),
            watchPoints: p.watchPoints.map(
              (w, j) => map.get(`p${i}-watch-${j}`) ?? w
            ),
          })),
        };
        setTranslations(translated);
      })
      .catch((err: Error) => {
        if (!cancelled) setTranslationError(err.message);
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, picks, marketContext, translations]);

  const displayContext =
    lang === "kh" && translations ? translations.marketContext : marketContext;

  const filteredPicks = useMemo(() => {
    const allowed = PROFILE_INCLUDES[profile];
    return picks
      .map((p, originalIndex) => ({ pick: p, originalIndex }))
      .filter(({ pick }) => allowed.includes(pick.riskLevel));
  }, [picks, profile]);

  const counts = useMemo(() => {
    return {
      all: picks.length,
      conservative: picks.filter((p) => p.riskLevel === "low").length,
      balanced: picks.filter(
        (p) => p.riskLevel === "low" || p.riskLevel === "medium"
      ).length,
      aggressive: picks.length,
    };
  }, [picks]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            {t("picks.section_label")}
            <span className="pulse-dot" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("picks.section_title")}
          </h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            {t("picks.section_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {t("picks.refreshed")} {formatRelativeTime(generatedAt)}
          </span>
        </div>
      </div>

      {/* Risk profile filter */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-background-elev rounded-lg p-1 border border-white/[0.06] flex-wrap w-full sm:w-auto">
          {PROFILES.map((p) => {
            const Icon = p.icon;
            const selected = profile === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setProfile(p.value)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
                  selected
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" style={{ color: p.color }} />
                <span className="truncate">{t(p.labelKey)}</span>
                <span className="text-[10px] text-muted tabular-nums shrink-0">
                  {counts[p.value]}
                </span>
              </button>
            );
          })}
        </div>

        {lang === "kh" && translating && (
          <div className="text-xs text-muted flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-accent" />
            {t("picks.translating")}{" "}
            <span className="font-mono text-accent">Claude Haiku 4.5</span>
            <span className="pulse-dot" />
          </div>
        )}
      </div>

      {lang === "kh" && translationError && (
        <div className="mb-4 text-xs text-danger">
          Translation failed: {translationError}. Showing English.
        </div>
      )}

      {/* Market context */}
      <div className="premium-card rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div
            className="icon-tile text-accent shrink-0"
            style={{ width: 36, height: 36 }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted mb-1">
              {t("picks.market_context")}
            </div>
            <p className="text-sm leading-relaxed">{displayContext}</p>
          </div>
        </div>
      </div>

      {/* Picks grid */}
      {filteredPicks.length === 0 ? (
        <div className="premium-card rounded-2xl p-8 text-center text-muted text-sm">
          {t("picks.no_picks")}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredPicks.map(({ pick, originalIndex }, i) => {
            const catColor = categoryColor(pick.category);
            const riskColor = RISK_COLOR[pick.riskLevel];
            const positive24h = pick.change24h >= 0;
            const tr = lang === "kh" ? translations?.picks[originalIndex] : null;
            return (
              <Link
                key={pick.coinId}
                href={`/coin/${pick.coinId}`}
                className="premium-card rounded-2xl p-4 sm:p-6 block fade-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Image
                      src={pick.image}
                      alt={pick.name}
                      width={40}
                      height={40}
                      className="rounded-full ring-1 ring-white/10 shrink-0 w-9 h-9 sm:w-11 sm:h-11"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-base sm:text-lg leading-tight group-hover:text-accent transition-colors truncate">
                        {pick.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-[0.15em] font-semibold">
                          {pick.symbol}
                        </span>
                        <span
                          className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border whitespace-nowrap"
                          style={{
                            color: catColor,
                            borderColor: catColor + "40",
                            background: catColor + "10",
                          }}
                        >
                          {pick.category}
                        </span>
                        <span
                          className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border whitespace-nowrap"
                          style={{
                            color: riskColor,
                            borderColor: riskColor + "40",
                            background: riskColor + "10",
                          }}
                        >
                          {t(RISK_LABEL_KEY[pick.riskLevel])}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-base sm:text-lg tabular-nums">
                      {formatPrice(pick.currentPrice)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
                        positive24h ? "text-success" : "text-danger"
                      }`}
                    >
                      {positive24h ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(pick.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted mb-1.5">
                    {t("picks.value_thesis")}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {tr?.thesis ?? pick.thesis}
                  </p>
                </div>

                <div className="mb-4 rounded-xl p-4 bg-accent/[0.06] border border-accent/20">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-accent">
                    <Target className="w-3 h-3" />
                    {t("picks.spot_angle")}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {tr?.spotTradingAngle ?? pick.spotTradingAngle}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-success">
                      <TrendingUp className="w-3 h-3" />
                      {t("picks.value_signals")}
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {(tr?.valueSignals ?? pick.valueSignals).map((signal, j) => (
                        <li key={j} className="flex gap-2 leading-relaxed">
                          <span className="text-success mt-0.5 text-[10px]">▲</span>
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                      <Eye className="w-3 h-3" />
                      {t("picks.watch_points")}
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {(tr?.watchPoints ?? pick.watchPoints).map((wp, j) => (
                        <li key={j} className="flex gap-2 leading-relaxed">
                          <span className="text-muted mt-0.5 text-[10px]">•</span>
                          <span>{wp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                  <span className="text-muted tabular-nums">
                    MCap ${formatCompact(pick.marketCap)} ·{" "}
                    <span
                      className={
                        pick.change7d >= 0 ? "text-success" : "text-danger"
                      }
                    >
                      {pick.change7d >= 0 ? "+" : ""}
                      {pick.change7d.toFixed(2)}% 7d
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-accent font-semibold">
                    {t("picks.full_research")}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center text-xs text-muted">
        {t("picks.next_refresh")}{" "}
        <span className="font-semibold text-foreground">
          {formatRelativeTime(nextRefreshAt).replace(" ago", "")}
        </span>{" "}
        · <span className="font-mono text-accent">{model}</span> ·{" "}
        {searchesUsed} web searches · {t("common.disclaimer_short")}
      </div>
    </section>
  );
}
