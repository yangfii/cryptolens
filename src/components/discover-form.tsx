"use client";

import { useState, type FormEvent } from "react";
import {
  Sparkles,
  Brain,
  Wifi,
  Building2,
  Gamepad2,
  Coins,
  Layers,
  Network,
  EyeOff,
  Globe,
  Search,
  Loader2,
} from "lucide-react";

export type DiscoverParams = {
  theme: string;
  customQuery: string;
};

type Props = {
  onSubmit: (params: DiscoverParams) => void;
  loading: boolean;
};

type Theme = {
  value: string;
  label: string;
  icon: typeof Sparkles;
  color: string;
};

const THEMES: Theme[] = [
  { value: "All", label: "All Sectors", icon: Globe, color: "#fbbf24" },
  { value: "AI", label: "AI", icon: Brain, color: "#a78bfa" },
  { value: "DePIN", label: "DePIN", icon: Wifi, color: "#22d3ee" },
  { value: "RWA", label: "RWA", icon: Building2, color: "#10b981" },
  { value: "Gaming", label: "Gaming", icon: Gamepad2, color: "#f43f5e" },
  { value: "DeFi", label: "DeFi", icon: Coins, color: "#f97316" },
  { value: "L1", label: "Layer 1", icon: Network, color: "#3b82f6" },
  { value: "L2", label: "Layer 2", icon: Layers, color: "#8b5cf6" },
  { value: "Privacy", label: "Privacy", icon: EyeOff, color: "#7e7e95" },
];

export default function DiscoverForm({ onSubmit, loading }: Props) {
  const [theme, setTheme] = useState<string>("All");
  const [customQuery, setCustomQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ theme, customQuery });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Theme grid */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-4">
          Choose a Sector
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const selected = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  selected
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                style={
                  selected
                    ? { boxShadow: `0 0 0 1px ${t.color}40, 0 0 20px -5px ${t.color}30` }
                    : undefined
                }
              >
                <Icon
                  className="w-4 h-4 mx-auto mb-1.5"
                  style={{ color: t.color }}
                />
                <div className="text-xs font-semibold">{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom query */}
      <div className="premium-card rounded-2xl p-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          Custom Query (Optional)
        </div>
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="e.g., zero-knowledge L2s, AI agent tokens, modular blockchains…"
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50 text-sm"
        />
        <p className="mt-2 text-xs text-muted">
          Override the sector and search for anything specific. Leave empty to
          use the sector above.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4 rounded-2xl text-base inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Researching the web…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Discover Projects
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center leading-relaxed max-w-md mx-auto">
        AI searches multiple sources, synthesizes a balanced research note,
        and provides citations. Takes <strong className="text-foreground">1–3 minutes</strong>. Not financial advice.
      </p>
    </form>
  );
}
