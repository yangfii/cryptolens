export type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { small: string; large: string };
  market_cap_rank: number;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    high_24h: Record<string, number>;
    low_24h: Record<string, number>;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    ath: Record<string, number>;
    atl: Record<string, number>;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url?: string;
    twitter_screen_name?: string;
  };
  categories: string[];
};

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  description?: string;
  imageUrl?: string;
  sourceImage?: string;
  categories?: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
};

export type Sentiment = "bullish" | "bearish" | "neutral";
