"use client";

import { useState } from "react";

type Props = {
  symbol: string;
  height?: number;
};

type Interval = { label: string; value: string };

const INTERVALS: Interval[] = [
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

export default function TradingViewChart({ symbol, height = 700 }: Props) {
  const [interval, setInterval] = useState<string>("240");

  const params = new URLSearchParams({
    symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
    interval,
    theme: "dark",
    style: "1",
    locale: "en",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hide_side_toolbar: "0",
    allow_symbol_change: "0",
    save_image: "0",
    studies: JSON.stringify([
      "MASimple@tv-basicstudies",
      "RSI@tv-basicstudies",
    ]),
    hideideas: "1",
    enable_publishing: "0",
  });

  const iframeSrc = `https://s.tradingview.com/widgetembed/?${params.toString()}`;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-background-elev/50">
        <div className="flex items-center gap-2">
          <span className="pulse-dot" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Live · {symbol.toUpperCase()}/USDT
          </span>
        </div>
        <div className="flex items-center gap-1 bg-background-elev rounded-lg p-1 border border-white/[0.06]">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => setInterval(iv.value)}
              className={`px-3 py-1 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                interval === iv.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>
      <iframe
        key={`${symbol}-${interval}`}
        src={iframeSrc}
        title={`${symbol.toUpperCase()} price chart`}
        style={{
          width: "100%",
          height: `${height}px`,
          border: 0,
          display: "block",
        }}
        allowTransparency
        scrolling="no"
        allow="fullscreen"
      />
    </div>
  );
}
