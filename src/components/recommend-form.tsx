"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  TrendingUp,
  Gem,
  Shield,
  Sparkles as SparkIcon,
  Clock,
  Calendar,
  CalendarDays,
  Layers,
  Coins,
  Boxes,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useLang } from "./lang-provider";

export type RecommendParams = {
  goal: "momentum" | "value" | "defensive" | "narrative";
  horizon: "short" | "medium" | "long";
  marketCap: "majors" | "midcap" | "any";
  notes: string;
};

const STORAGE_KEY = "cryptolens:recommend-params";

type Props = {
  onSubmit: (params: RecommendParams) => void;
  loading: boolean;
};

const GOALS = [
  {
    value: "momentum" as const,
    icon: TrendingUp,
    color: "#10b981",
    en: { label: "Momentum", desc: "Ride confirmed uptrends with healthy volume." },
    kh: { label: "Momentum", desc: "តាមនិន្នាការ​ឡើង​ដែល​មាន volume ល្អ​។" },
  },
  {
    value: "value" as const,
    icon: Gem,
    color: "#22d3ee",
    en: { label: "Value", desc: "Strong fundamentals trading at a discount." },
    kh: { label: "តម្លៃ", desc: "មូលដ្ឋាន​ល្អ​ដែល​​ធ្លាក់ចុះ​​ពី​កំពូល​។" },
  },
  {
    value: "defensive" as const,
    icon: Shield,
    color: "#a78bfa",
    en: { label: "Defensive", desc: "Lower-vol majors. Capital preservation focus." },
    kh: { label: "ការពារ", desc: "កាក់​ធំៗ​ ហានិភ័យ​ទាប​។ រក្សា​ដើម​ទុន​។" },
  },
  {
    value: "narrative" as const,
    icon: SparkIcon,
    color: "#fbbf24",
    en: { label: "Narrative", desc: "Active themes — AI, RWA, DePIN, L2, restaking." },
    kh: { label: "Narrative", desc: "Theme សកម្ម​ — AI, RWA, DePIN, L2​។" },
  },
];

const HORIZONS = [
  {
    value: "short" as const,
    icon: Clock,
    en: { label: "Short-term", desc: "Days to weeks" },
    kh: { label: "រយៈពេលខ្លី", desc: "ថ្ងៃ​ដល់​សប្តាហ៍" },
  },
  {
    value: "medium" as const,
    icon: Calendar,
    en: { label: "Medium-term", desc: "1 to 6 months" },
    kh: { label: "មធ្យម", desc: "១ ដល់ ៦ ខែ" },
  },
  {
    value: "long" as const,
    icon: CalendarDays,
    en: { label: "Long-term", desc: "6+ months" },
    kh: { label: "រយៈពេលវែង", desc: "៦ ខែ​ឡើង" },
  },
];

const CAPS = [
  {
    value: "majors" as const,
    icon: Coins,
    en: { label: "Majors", desc: "Top 10 only" },
    kh: { label: "កាក់​ធំ", desc: "Top 10 តែ​ប៉ុណ្ណោះ" },
  },
  {
    value: "midcap" as const,
    icon: Boxes,
    en: { label: "Mid-caps", desc: "Rank 11–40" },
    kh: { label: "មធ្យម", desc: "ចំណាត់ ១១–៤០" },
  },
  {
    value: "any" as const,
    icon: Layers,
    en: { label: "Any size", desc: "Top 40 mix" },
    kh: { label: "ទាំងអស់", desc: "Top 40 ច្រើនមុខ" },
  },
];

export default function RecommendForm({ onSubmit, loading }: Props) {
  const { lang } = useLang();
  const [goal, setGoal] = useState<RecommendParams["goal"]>("momentum");
  const [horizon, setHorizon] = useState<RecommendParams["horizon"]>("medium");
  const [marketCap, setMarketCap] = useState<RecommendParams["marketCap"]>("any");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<RecommendParams>;
        if (parsed.goal) setGoal(parsed.goal);
        if (parsed.horizon) setHorizon(parsed.horizon);
        if (parsed.marketCap) setMarketCap(parsed.marketCap);
        if (typeof parsed.notes === "string") setNotes(parsed.notes);
      }
    } catch {}
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params: RecommendParams = { goal, horizon, marketCap, notes: notes.trim() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch {}
    onSubmit(params);
  }

  const L = lang === "kh" ? "kh" : "en";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* GOAL */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          {L === "kh" ? "រចនាប័ទ្មនៃយោបល់" : "Recommendation Style"}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const selected = goal === g.value;
            const labels = g[L];
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(g.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-white/[0.2] bg-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                style={
                  selected
                    ? { boxShadow: `0 0 0 1px ${g.color}30, 0 0 30px -10px ${g.color}40` }
                    : undefined
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: g.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-sm">{labels.label}</span>
                </div>
                <div className="text-xs text-muted leading-relaxed">
                  {labels.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZON */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          {L === "kh" ? "រយៈពេល" : "Time Horizon"}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {HORIZONS.map((h) => {
            const Icon = h.icon;
            const selected = horizon === h.value;
            const labels = h[L];
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
                  <span className="font-bold text-sm">{labels.label}</span>
                </div>
                <div className="text-xs text-muted">{labels.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MARKET CAP */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          {L === "kh" ? "ទំហំទីផ្សារ" : "Market Cap Filter"}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {CAPS.map((c) => {
            const Icon = c.icon;
            const selected = marketCap === c.value;
            const labels = c[L];
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setMarketCap(c.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-accent/30 bg-accent/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${selected ? "text-accent" : "text-muted"}`} />
                  <span className="font-bold text-sm">{labels.label}</span>
                </div>
                <div className="text-xs text-muted">{labels.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTES */}
      <div className="premium-card rounded-2xl p-6">
        <label className="block text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3">
          {L === "kh" ? "ចំណាំ (ស្រេច​ចិត្ត)" : "Notes (optional)"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            L === "kh"
              ? "ឧ. ខ្ញុំចូលចិត្ត L1 និងគេចពីកាក់ memecoin"
              : "e.g. I prefer L1s and want to avoid memecoins"
          }
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50 text-sm resize-none"
        />
        <div className="mt-1 text-[10px] text-muted text-right tabular-nums">
          {notes.length}/500
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4 rounded-2xl text-base inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {L === "kh" ? "កំពុងវិភាគ​ដោយ Sonnet 4.6…" : "Analyzing with Sonnet 4.6…"}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {L === "kh" ? "បង្កើតយោបល់ AI" : "Generate Recommendations"}
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center leading-relaxed max-w-md mx-auto">
        {L === "kh"
          ? "យោបល់ AI ប៉ុណ្ណោះ — មិនមែនការផ្តល់ប្រឹក្សាហិរញ្ញវត្ថុ​ទេ​។"
          : "AI suggestions only — not financial advice."}
      </p>
    </form>
  );
}
