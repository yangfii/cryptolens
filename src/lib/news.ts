import type { NewsItem, Sentiment } from "@/types/crypto";

// ============================================================================
// CryptoCompare CCData News API — FREE, no API key required
// Endpoint: https://data-api.cryptocompare.com/news/v1/article/list
// ============================================================================

type CCDataNewsItem = {
  TYPE: string;
  ID: number;
  GUID: string;
  PUBLISHED_ON: number;
  IMAGE_URL: string;
  TITLE: string;
  SUBTITLE: string | null;
  AUTHORS: string;
  URL: string;
  BODY: string;
  KEYWORDS: string;
  LANG: string;
  SENTIMENT: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  STATUS: string;
  SOURCE_DATA: {
    ID: number;
    NAME: string;
    IMAGE_URL: string;
    URL: string;
    SOURCE_KEY: string;
  };
  CATEGORY_DATA: Array<{
    NAME: string;
    CATEGORY: string;
  }> | { NAME: string; CATEGORY: string };
};

type CCDataResponse = {
  Data: CCDataNewsItem[];
  Err: Record<string, unknown>;
};

const FALLBACK: NewsItem[] = [
  {
    id: "fallback-1",
    title: "News feed temporarily unavailable",
    url: "#",
    source: "CryptoLens",
    published_at: new Date().toISOString(),
    description: "News providers are unreachable. This usually resolves quickly.",
    sentiment: "neutral",
  },
];

function mapSentiment(s: CCDataNewsItem["SENTIMENT"]): Sentiment {
  if (s === "POSITIVE") return "bullish";
  if (s === "NEGATIVE") return "bearish";
  return "neutral";
}

function mapCCDataItem(post: CCDataNewsItem): NewsItem {
  const body = post.BODY ?? "";
  const categories = Array.isArray(post.CATEGORY_DATA)
    ? post.CATEGORY_DATA.map((c) => c.NAME || c.CATEGORY).filter(Boolean)
    : post.CATEGORY_DATA
    ? [post.CATEGORY_DATA.NAME || post.CATEGORY_DATA.CATEGORY]
    : [];
  return {
    id: String(post.ID),
    title: post.TITLE,
    url: post.URL,
    source: post.SOURCE_DATA?.NAME ?? "Unknown",
    published_at: new Date(post.PUBLISHED_ON * 1000).toISOString(),
    description: body.slice(0, 200).trim() + (body.length > 200 ? "…" : ""),
    imageUrl: post.IMAGE_URL,
    sourceImage: post.SOURCE_DATA?.IMAGE_URL,
    categories: categories.slice(0, 3),
    sentiment: mapSentiment(post.SENTIMENT),
  };
}

// Map ticker symbol → keyword variants we search for in titles/descriptions.
const KEYWORD_MAP: Record<string, string[]> = {
  BTC: ["bitcoin", "btc"],
  ETH: ["ethereum", "eth", "ether"],
  SOL: ["solana", "sol "],
  XRP: ["xrp", "ripple"],
  ADA: ["cardano", "ada "],
  BNB: ["bnb", "binance coin"],
  DOGE: ["dogecoin", "doge "],
  AVAX: ["avalanche", "avax"],
};

const THEME_KEYWORDS: Record<string, string[]> = {
  Market: ["market", "rally", "surge", "drop", "price"],
  Trading: ["trading", "trade", "exchange"],
  Regulation: ["regulation", "sec", "regulator", "law", "ban", "compliance"],
  Mining: ["mining", "miner", "hashrate", "halving"],
  Technology: ["upgrade", "fork", "protocol", "blockchain", "layer 2", "rollup"],
};

function matchesFilter(item: NewsItem, filter: string): boolean {
  const haystack = `${item.title} ${item.description ?? ""} ${
    item.categories?.join(" ") ?? ""
  }`.toLowerCase();
  const keywords =
    KEYWORD_MAP[filter.toUpperCase()] ??
    THEME_KEYWORDS[filter] ??
    [filter.toLowerCase()];
  return keywords.some((kw) => haystack.includes(kw));
}

export async function getCryptoNews(
  limit = 30,
  filters?: string[]
): Promise<NewsItem[]> {
  // Fetch a wide pool (50) and filter client-side for accuracy.
  const params = new URLSearchParams({
    lang: "EN",
    limit: "50",
  });

  try {
    const res = await fetch(
      `https://data-api.cryptocompare.com/news/v1/article/list?${params}`,
      {
        next: { revalidate: 300, tags: ["news"] },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as CCDataResponse;
    if (!data.Data || data.Data.length === 0) return [];

    let mapped = data.Data.map(mapCCDataItem);

    if (filters && filters.length > 0) {
      mapped = mapped.filter((item) =>
        filters.some((f) => matchesFilter(item, f))
      );
    }

    return mapped.slice(0, limit);
  } catch {
    return FALLBACK;
  }
}

export const NEWS_COIN_CATEGORIES = [
  { code: "BTC", label: "Bitcoin" },
  { code: "ETH", label: "Ethereum" },
  { code: "SOL", label: "Solana" },
  { code: "XRP", label: "XRP" },
  { code: "ADA", label: "Cardano" },
  { code: "BNB", label: "BNB" },
  { code: "DOGE", label: "Dogecoin" },
  { code: "AVAX", label: "Avalanche" },
] as const;

export const NEWS_THEME_CATEGORIES = [
  { code: "Market", label: "Market" },
  { code: "Trading", label: "Trading" },
  { code: "Regulation", label: "Regulation" },
  { code: "Mining", label: "Mining" },
  { code: "Technology", label: "Technology" },
] as const;
