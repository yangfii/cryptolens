// Yahoo Finance client (unofficial API — stable for years but no SLA).
// Endpoints used:
//   /v7/finance/spark        batch quotes for many symbols at once
//   /v8/finance/chart/<sym>  detailed chart for one symbol (intraday/range)
//   /v1/finance/search       news + symbol search

const SPARK_URL = "https://query1.finance.yahoo.com/v7/finance/spark";
const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";

const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "application/json",
} as const;

export type YahooQuote = {
  symbol: string;
  shortName: string | null;
  currency: string;
  price: number;
  previousClose: number;
  changePercent: number;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  volume: number | null;
  exchange: string | null;
  /** Recent close prices for an inline sparkline. */
  sparkline: number[];
};

type SparkResultMeta = {
  symbol: string;
  shortName?: string;
  currency: string;
  regularMarketPrice: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketVolume?: number;
  exchangeName?: string;
};

type SparkResponse = {
  spark?: {
    result?: Array<{
      symbol: string;
      response?: Array<{
        meta: SparkResultMeta;
        timestamp?: number[];
        indicators?: {
          quote?: Array<{ close?: Array<number | null> }>;
        };
      }>;
    }>;
  };
};

/**
 * Batch-fetch quote data for many Yahoo symbols at once. Returns one
 * YahooQuote per symbol that resolved; missing symbols are silently dropped.
 */
export async function getQuotes(symbols: string[]): Promise<YahooQuote[]> {
  if (symbols.length === 0) return [];
  const url = `${SPARK_URL}?symbols=${encodeURIComponent(
    symbols.join(","),
  )}&range=5d&interval=1h`;
  const res = await fetch(url, {
    headers: COMMON_HEADERS,
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as SparkResponse;
  const results = data.spark?.result ?? [];

  const quotes: YahooQuote[] = [];
  for (const r of results) {
    const resp = r.response?.[0];
    const meta = resp?.meta;
    if (!meta?.regularMarketPrice) continue;
    const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
    const changePercent =
      prev > 0 ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0;
    const closes = resp?.indicators?.quote?.[0]?.close ?? [];
    quotes.push({
      symbol: meta.symbol,
      shortName: meta.shortName ?? null,
      currency: meta.currency ?? "USD",
      price: meta.regularMarketPrice,
      previousClose: prev,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
      volume: meta.regularMarketVolume ?? null,
      exchange: meta.exchangeName ?? null,
      sparkline: closes.filter((c): c is number => typeof c === "number"),
    });
  }
  return quotes;
}

export type YahooChart = {
  symbol: string;
  currency: string;
  shortName: string | null;
  price: number;
  previousClose: number;
  changePercent: number;
  exchange: string | null;
  timestamps: number[]; // unix seconds
  closes: Array<number | null>;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
};

type ExtendedMeta = SparkResultMeta & {
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
};

type ChartResponse = {
  chart?: {
    result?: Array<{
      meta: ExtendedMeta;
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
};

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function getCandles(
  symbol: string,
  range: ChartRange = "1mo",
): Promise<Candle[]> {
  const interval =
    range === "1d"
      ? "5m"
      : range === "5d"
      ? "15m"
      : range === "1mo"
      ? "1h"
      : range === "3mo" || range === "6mo"
      ? "1d"
      : "1d";
  const url = `${CHART_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: COMMON_HEADERS,
    next: { revalidate: 120 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ChartResponse;
  const result = data.chart?.result?.[0];
  if (!result?.timestamp || !result.indicators?.quote?.[0]) return [];
  const q = result.indicators.quote[0];
  const out: Candle[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    const v = q.volume?.[i];
    if (
      typeof o === "number" &&
      typeof h === "number" &&
      typeof l === "number" &&
      typeof c === "number"
    ) {
      out.push({
        time: result.timestamp[i],
        open: o,
        high: h,
        low: l,
        close: c,
        volume: typeof v === "number" ? v : 0,
      });
    }
  }
  return out;
}

export type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y";

export async function getChart(
  symbol: string,
  range: ChartRange = "1mo",
): Promise<YahooChart | null> {
  const interval =
    range === "1d" ? "5m" : range === "5d" ? "30m" : range === "1mo" ? "1d" : "1d";
  const url = `${CHART_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: COMMON_HEADERS,
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as ChartResponse;
  const result = data.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
  return {
    symbol: meta.symbol,
    currency: meta.currency ?? "USD",
    shortName: meta.shortName ?? null,
    price: meta.regularMarketPrice,
    previousClose: prev,
    changePercent: prev > 0 ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0,
    exchange: meta.exchangeName ?? null,
    timestamps: result.timestamp ?? [],
    closes: result.indicators?.quote?.[0]?.close ?? [],
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    dayHigh: meta.regularMarketDayHigh ?? null,
    dayLow: meta.regularMarketDayLow ?? null,
    volume: meta.regularMarketVolume ?? null,
  };
}

export type YahooNews = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
};

type SearchResponse = {
  news?: Array<{
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type?: string;
  }>;
};

/** Fetch recent news articles related to a symbol. */
export async function getNewsForSymbol(
  symbol: string,
  count = 6,
): Promise<YahooNews[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(symbol)}&newsCount=${count}&quotesCount=0`;
  const res = await fetch(url, {
    headers: COMMON_HEADERS,
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as SearchResponse;
  return (data.news ?? []).map((n) => ({
    uuid: n.uuid,
    title: n.title,
    publisher: n.publisher,
    link: n.link,
    providerPublishTime: n.providerPublishTime,
  }));
}
