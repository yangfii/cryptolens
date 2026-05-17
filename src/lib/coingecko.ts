import type { CoinDetail, MarketCoin } from "@/types/crypto";

const BASE_URL = "https://api.coingecko.com/api/v3";

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COINGECKO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key;
  return headers;
}

async function cgFetch<T>(
  path: string,
  init?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(),
    next: {
      revalidate: init?.revalidate ?? 60,
      tags: init?.tags,
    },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getTopCoins(
  page = 1,
  perPage = 100,
  vsCurrency = "usd"
): Promise<MarketCoin[]> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "24h,7d",
  });
  return cgFetch<MarketCoin[]>(`/coins/markets?${params}`, {
    revalidate: 60,
    tags: ["coins:markets"],
  });
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  const params = new URLSearchParams({
    localization: "false",
    tickers: "false",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "false",
  });
  return cgFetch<CoinDetail>(`/coins/${id}?${params}`, {
    revalidate: 120,
    tags: [`coin:${id}`],
  });
}

export async function searchCoins(query: string): Promise<
  Array<{ id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }>
> {
  const params = new URLSearchParams({ query });
  const data = await cgFetch<{ coins: Array<{ id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }> }>(
    `/search?${params}`,
    { revalidate: 300 }
  );
  return data.coins.slice(0, 10);
}

export type CoinChartPoint = [number, number]; // [timestamp_ms, price_usd]

export async function getCoinChart(
  id: string,
  days = 30,
  vsCurrency = "usd",
): Promise<{ prices: CoinChartPoint[]; total_volumes: CoinChartPoint[] }> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    days: String(days),
  });
  return cgFetch<{
    prices: CoinChartPoint[];
    market_caps: CoinChartPoint[];
    total_volumes: CoinChartPoint[];
  }>(`/coins/${id}/market_chart?${params}`, {
    revalidate: 300,
    tags: [`coin:${id}:chart:${days}`],
  });
}

export async function getGlobalData(): Promise<{
  total_market_cap_usd: number;
  total_volume_usd: number;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage_btc: number;
  active_cryptocurrencies: number;
}> {
  const res = await cgFetch<{
    data: {
      total_market_cap: Record<string, number>;
      total_volume: Record<string, number>;
      market_cap_change_percentage_24h_usd: number;
      market_cap_percentage: Record<string, number>;
      active_cryptocurrencies: number;
    };
  }>("/global", { revalidate: 300 });
  return {
    total_market_cap_usd: res.data.total_market_cap.usd,
    total_volume_usd: res.data.total_volume.usd,
    market_cap_change_percentage_24h_usd: res.data.market_cap_change_percentage_24h_usd,
    market_cap_percentage_btc: res.data.market_cap_percentage.btc,
    active_cryptocurrencies: res.data.active_cryptocurrencies,
  };
}
