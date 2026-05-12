"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  DollarSign,
  Shield,
  Scale,
  Flame,
  Clock,
  Calendar,
  CalendarDays,
  Sparkles,
  Loader2,
} from "lucide-react";

export type AllocatorParams = {
  budget: number;
  riskProfile: "conservative" | "balanced" | "aggressive";
  horizon: "short" | "medium" | "long";
  excludeStablecoins: boolean;
};

const STORAGE_KEY = "cryptolens:allocator-params";

type Props = {
  onSubmit: (params: AllocatorParams) => void;
  loading: boolean;
};

const RISK_PROFILES = [
  {
    value: "conservative" as const,
    label: "Conservative",
    icon: Shield,
    color: "#22d3ee",
    description: "Heavy on BTC + ETH. Lower volatility. 10–20% cash buffer.",
  },
  {
    value: "balanced" as const,
    label: "Balanced",
    icon: Scale,
    color: "#fbbf24",
    description: "Solid majors + top-20 alts. Moderate exposure. 5–10% cash.",
  },
  {
    value: "aggressive" as const,
    label: "Aggressive",
    icon: Flame,
    color: "#f43f5e",
    description: "Higher-beta alts mixed with majors. Maximum upside potential.",
  },
];

const HORIZONS = [
  {
    value: "short" as const,
    label: "Short-term",
    icon: Clock,
    description: "Weeks to a few months",
  },
  {
    value: "medium" as const,
    label: "Medium-term",
    icon: Calendar,
    description: "3 to 12 months",
  },
  {
    value: "long" as const,
    label: "Long-term",
    icon: CalendarDays,
    description: "1+ year",
  },
];

export default function AllocatorForm({ onSubmit, loading }: Props) {
  const [budget, setBudget] = useState("1000");
  const [riskProfile, setRiskProfile] = useState<AllocatorParams["riskProfile"]>("balanced");
  const [horizon, setHorizon] = useState<AllocatorParams["horizon"]>("medium");
  const [excludeStablecoins, setExcludeStablecoins] = useState(true);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AllocatorParams;
        if (parsed.budget) setBudget(String(parsed.budget));
        if (parsed.riskProfile) setRiskProfile(parsed.riskProfile);
        if (parsed.horizon) setHorizon(parsed.horizon);
        if (typeof parsed.excludeStablecoins === "boolean") {
          setExcludeStablecoins(parsed.excludeStablecoins);
        }
      }
    } catch {}
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numBudget = Number(budget);
    if (!numBudget || numBudget < 50) return;

    const params: AllocatorParams = {
      budget: numBudget,
      riskProfile,
      horizon,
      excludeStablecoins,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch {}

    onSubmit(params);
  }

  const numBudget = Number(budget);
  const isValid = numBudget >= 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BUDGET */}
      <div className="premium-card rounded-2xl p-6">
        <label className="flex items-center gap-2 text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3">
          <DollarSign className="w-3.5 h-3.5" />
          Investment Budget
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="1000"
              min={50}
              step={10}
              className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50 text-2xl font-bold tabular-nums"
            />
          </div>
          <span className="text-xs text-muted font-mono uppercase tracking-wider">
            USD
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {[100, 500, 1000, 5000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBudget(String(preset))}
              className="text-xs px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-muted hover:text-foreground transition-colors"
            >
              ${preset.toLocaleString()}
            </button>
          ))}
        </div>
        {!isValid && budget !== "" && (
          <p className="mt-2 text-xs text-danger">
            Minimum budget is $50 USD.
          </p>
        )}
      </div>

      {/* RISK PROFILE */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          Risk Profile
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {RISK_PROFILES.map((profile) => {
            const Icon = profile.icon;
            const selected = riskProfile === profile.value;
            return (
              <button
                key={profile.value}
                type="button"
                onClick={() => setRiskProfile(profile.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-white/[0.2] bg-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                style={
                  selected
                    ? { boxShadow: `0 0 0 1px ${profile.color}30, 0 0 30px -10px ${profile.color}40` }
                    : undefined
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: profile.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-sm">{profile.label}</span>
                </div>
                <div className="text-xs text-muted leading-relaxed">
                  {profile.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZON */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          Investment Horizon
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {HORIZONS.map((h) => {
            const Icon = h.icon;
            const selected = horizon === h.value;
            return (
              <button
                key={h.value}
                type="button"
                onClick={() => setHorizon(h.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-accent/30 bg-accent/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${selected ? "text-accent" : "text-muted"}`} />
                  <span className="font-bold text-sm">{h.label}</span>
                </div>
                <div className="text-xs text-muted">{h.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OPTIONS */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          Options
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-semibold">Exclude stablecoins</div>
            <div className="text-xs text-muted mt-0.5">
              Skip USDT, USDC, DAI from allocation suggestions
            </div>
          </div>
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              excludeStablecoins ? "bg-accent" : "bg-white/[0.08]"
            }`}
          >
            <input
              type="checkbox"
              checked={excludeStablecoins}
              onChange={(e) => setExcludeStablecoins(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${
                excludeStablecoins ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </div>
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full btn-primary py-4 rounded-2xl text-base inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing market with Sonnet 4.6…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Allocation
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center leading-relaxed max-w-md mx-auto">
        AI-generated suggestions only — not financial advice. Always do your own
        research and never invest more than you can afford to lose.
      </p>
    </form>
  );
}
