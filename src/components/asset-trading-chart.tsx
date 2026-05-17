"use client";

import { useCallback } from "react";
import TradingChart, { type Candle, type ChartRange } from "./trading-chart";

type Props = {
  category: string;
  symbol: string;
  initialCandles: Candle[];
  initialRange?: ChartRange;
};

/**
 * Bridge component: gives TradingChart a fetchCandles callback that hits
 * our /api/markets/candles endpoint with the asset coordinates.
 */
export default function AssetTradingChart({
  category,
  symbol,
  initialCandles,
  initialRange = "1mo",
}: Props) {
  const fetchCandles = useCallback(
    async (range: ChartRange): Promise<Candle[]> => {
      const res = await fetch(
        `/api/markets/candles?category=${encodeURIComponent(
          category,
        )}&symbol=${encodeURIComponent(symbol)}&range=${range}`,
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { candles: Candle[] };
      return data.candles ?? [];
    },
    [category, symbol],
  );

  return (
    <TradingChart
      initialCandles={initialCandles}
      initialRange={initialRange}
      fetchCandles={fetchCandles}
    />
  );
}
