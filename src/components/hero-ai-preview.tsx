"use client";

import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

const FULL_TEXT = `Bitcoin is trading at $81,799 with a market cap of $1.64T, maintaining dominance at 58.3%. The 30-day appreciation of ~12% indicates sustained momentum, while sitting ~35% below the all-time high suggests room to run.`;

export default function HeroAiPreview() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= FULL_TEXT.length) {
        clearInterval(interval);
        setDone(true);
        return;
      }
      i += 2;
      setTyped(FULL_TEXT.slice(0, i));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-preview rounded-2xl p-5 fade-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="logo-premium inline-grid place-items-center w-7 h-7 rounded-lg text-accent-foreground font-black text-xs">
            C
          </span>
          <div>
            <div className="text-xs font-semibold flex items-center gap-1.5">
              CryptoLens AI
              <span className="text-[9px] font-mono text-accent/80 px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                SONNET 4.6
              </span>
            </div>
            <div className="text-[10px] text-muted">Analyzing Bitcoin · Live data</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-success font-semibold uppercase tracking-wider">
          <span className="pulse-dot" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.15em] font-semibold text-muted">
          Research Summary
        </div>
        <p className="text-sm leading-relaxed">
          {typed}
          {!done && <span className="typing-cursor" />}
        </p>

        {done && (
          <div className="grid grid-cols-2 gap-3 pt-3 fade-in">
            <div className="rounded-lg p-3 bg-success/5 border border-success/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success mb-2">
                <TrendingUp className="w-3 h-3" />
                Bullish (3)
              </div>
              <ul className="text-[11px] text-muted space-y-1 leading-tight">
                <li>• 30d momentum +11.9%</li>
                <li>• Supply scarcity (95%+ mined)</li>
                <li>• $37.7B daily volume</li>
              </ul>
            </div>
            <div className="rounded-lg p-3 bg-danger/5 border border-danger/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-danger mb-2">
                <TrendingDown className="w-3 h-3" />
                Bearish (3)
              </div>
              <ul className="text-[11px] text-muted space-y-1 leading-tight">
                <li>• 35% below ATH ceiling</li>
                <li>• 24h indecision (~0.08%)</li>
                <li>• 7d momentum cooling</li>
              </ul>
            </div>
          </div>
        )}

        {done && (
          <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[10px] text-muted fade-in">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Not financial advice · Always DYOR</span>
          </div>
        )}
      </div>
    </div>
  );
}
