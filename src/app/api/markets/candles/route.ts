import { NextRequest, NextResponse } from "next/server";
import { getCandles, type ChartRange } from "@/lib/yahoo-finance";
import { getCoinOhlc } from "@/lib/coingecko";
import { findAsset, type MarketCategory } from "@/lib/markets-catalog";

export const runtime = "nodejs";
export const revalidate = 120;

const RANGE_TO_DAYS: Partial<Record<ChartRange, number>> = {
  "1d": 1,
  "5d": 7,
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") as MarketCategory | null;
  const symbol = sp.get("symbol");
  const range = (sp.get("range") ?? "1mo") as ChartRange;
  if (!category || !symbol) {
    return NextResponse.json({ candles: [] }, { status: 400 });
  }

  if (category === "crypto") {
    try {
      const ohlc = await getCoinOhlc(symbol, RANGE_TO_DAYS[range] ?? 30);
      const candles = ohlc.map(([t, o, h, l, c]) => ({
        time: Math.floor(t / 1000),
        open: o,
        high: h,
        low: l,
        close: c,
        volume: 0,
      }));
      return NextResponse.json({ candles });
    } catch {
      return NextResponse.json({ candles: [] }, { status: 502 });
    }
  }

  const asset = findAsset(category, symbol);
  if (!asset?.yahooSymbol) {
    return NextResponse.json({ candles: [] }, { status: 404 });
  }
  const candles = await getCandles(asset.yahooSymbol, range);
  return NextResponse.json({ candles });
}
