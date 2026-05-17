"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { Loader2 } from "lucide-react";

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "1y";

const RANGES: { id: ChartRange; label: string }[] = [
  { id: "1d", label: "1D" },
  { id: "5d", label: "5D" },
  { id: "1mo", label: "1M" },
  { id: "3mo", label: "3M" },
  { id: "1y", label: "1Y" },
];

type Props = {
  initialCandles: Candle[];
  initialRange?: ChartRange;
  fetchCandles: (range: ChartRange) => Promise<Candle[]>;
  height?: number;
};

export default function TradingChart({
  initialCandles,
  initialRange = "1mo",
  fetchCandles,
  height = 380,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [candles, setCandles] = useState<Candle[]>(initialCandles);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [loading, setLoading] = useState(false);

  // Initial chart setup
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "var(--font-geist-sans), system-ui",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(251, 191, 36, 0.4)", width: 1 },
        horzLine: { color: "rgba(251, 191, 36, 0.4)", width: 1 },
      },
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderUpColor: "#10b981",
      borderDownColor: "#f43f5e",
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
      priceLineVisible: true,
      priceLineColor: "rgba(251, 191, 36, 0.5)",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "rgba(148, 163, 184, 0.3)",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Apply candles whenever they change
  useEffect(() => {
    const cs = candleSeriesRef.current;
    const vs = volumeSeriesRef.current;
    const chart = chartRef.current;
    if (!cs || !vs || !chart) return;
    cs.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    vs.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(244, 63, 94, 0.4)",
      })),
    );
    chart.timeScale().fitContent();
  }, [candles]);

  async function switchRange(next: ChartRange) {
    if (next === range || loading) return;
    setRange(next);
    setLoading(true);
    try {
      const fresh = await fetchCandles(next);
      if (fresh.length > 0) setCandles(fresh);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
          Price · Candlestick
        </div>
        <div className="flex items-center gap-1">
          {loading && <Loader2 className="w-3 h-3 text-muted animate-spin mr-1" />}
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => switchRange(r.id)}
              disabled={loading}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors disabled:opacity-40 ${
                range === r.id
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        style={{ width: "100%", height }}
        className="rounded-xl overflow-hidden"
      />
    </div>
  );
}
