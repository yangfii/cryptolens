// Curated catalog of assets exposed in /markets, grouped by category.
// Crypto is handled by CoinGecko elsewhere; the other four categories
// use Yahoo Finance symbols.

export type MarketCategory = "crypto" | "stocks" | "metals" | "forex" | "commodities";

export type CategoryMeta = {
  id: MarketCategory;
  label: string;
  description: string;
  emoji: string;
  iconColor: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "crypto",
    label: "Crypto",
    description: "Top 50 cryptocurrencies by market cap.",
    emoji: "₿",
    iconColor: "#fbbf24",
  },
  {
    id: "stocks",
    label: "Stocks",
    description: "Large-cap US equities — tech, finance, consumer.",
    emoji: "📈",
    iconColor: "#10b981",
  },
  {
    id: "metals",
    label: "Metals",
    description: "Gold, silver, platinum, palladium.",
    emoji: "🥇",
    iconColor: "#fbbf24",
  },
  {
    id: "forex",
    label: "Forex",
    description: "Major and minor currency pairs.",
    emoji: "💱",
    iconColor: "#22d3ee",
  },
  {
    id: "commodities",
    label: "Commodities",
    description: "Energy, agriculture, industrial metals.",
    emoji: "🛢️",
    iconColor: "#a78bfa",
  },
];

export type AssetEntry = {
  /** Stable slug used in URLs (lowercased, no special chars). */
  slug: string;
  /** Yahoo Finance symbol (only used for non-crypto). */
  yahooSymbol?: string;
  /** CoinGecko coin id (only used for crypto). */
  coinId?: string;
  display: string;
  shortName: string;
};

export const STOCKS: AssetEntry[] = [
  { slug: "aapl", yahooSymbol: "AAPL", display: "AAPL", shortName: "Apple Inc." },
  { slug: "msft", yahooSymbol: "MSFT", display: "MSFT", shortName: "Microsoft" },
  { slug: "nvda", yahooSymbol: "NVDA", display: "NVDA", shortName: "NVIDIA" },
  { slug: "googl", yahooSymbol: "GOOGL", display: "GOOGL", shortName: "Alphabet" },
  { slug: "amzn", yahooSymbol: "AMZN", display: "AMZN", shortName: "Amazon" },
  { slug: "meta", yahooSymbol: "META", display: "META", shortName: "Meta Platforms" },
  { slug: "tsla", yahooSymbol: "TSLA", display: "TSLA", shortName: "Tesla" },
  { slug: "amd", yahooSymbol: "AMD", display: "AMD", shortName: "Advanced Micro Devices" },
  { slug: "nflx", yahooSymbol: "NFLX", display: "NFLX", shortName: "Netflix" },
  { slug: "crm", yahooSymbol: "CRM", display: "CRM", shortName: "Salesforce" },
  { slug: "adbe", yahooSymbol: "ADBE", display: "ADBE", shortName: "Adobe" },
  { slug: "orcl", yahooSymbol: "ORCL", display: "ORCL", shortName: "Oracle" },
  { slug: "intc", yahooSymbol: "INTC", display: "INTC", shortName: "Intel" },
  { slug: "uber", yahooSymbol: "UBER", display: "UBER", shortName: "Uber Technologies" },
  { slug: "shop", yahooSymbol: "SHOP", display: "SHOP", shortName: "Shopify" },
  { slug: "brk-b", yahooSymbol: "BRK-B", display: "BRK.B", shortName: "Berkshire Hathaway" },
  { slug: "jpm", yahooSymbol: "JPM", display: "JPM", shortName: "JPMorgan Chase" },
  { slug: "bac", yahooSymbol: "BAC", display: "BAC", shortName: "Bank of America" },
  { slug: "v", yahooSymbol: "V", display: "V", shortName: "Visa" },
  { slug: "ma", yahooSymbol: "MA", display: "MA", shortName: "Mastercard" },
  { slug: "wmt", yahooSymbol: "WMT", display: "WMT", shortName: "Walmart" },
  { slug: "cost", yahooSymbol: "COST", display: "COST", shortName: "Costco" },
  { slug: "ko", yahooSymbol: "KO", display: "KO", shortName: "Coca-Cola" },
  { slug: "pep", yahooSymbol: "PEP", display: "PEP", shortName: "PepsiCo" },
  { slug: "mcd", yahooSymbol: "MCD", display: "MCD", shortName: "McDonald's" },
  { slug: "nke", yahooSymbol: "NKE", display: "NKE", shortName: "Nike" },
  { slug: "dis", yahooSymbol: "DIS", display: "DIS", shortName: "Walt Disney" },
];

export const METALS: AssetEntry[] = [
  { slug: "gold", yahooSymbol: "GC=F", display: "Gold", shortName: "Gold Futures" },
  { slug: "silver", yahooSymbol: "SI=F", display: "Silver", shortName: "Silver Futures" },
  { slug: "platinum", yahooSymbol: "PL=F", display: "Platinum", shortName: "Platinum Futures" },
  { slug: "palladium", yahooSymbol: "PA=F", display: "Palladium", shortName: "Palladium Futures" },
  { slug: "copper", yahooSymbol: "HG=F", display: "Copper", shortName: "Copper Futures" },
];

export const FOREX: AssetEntry[] = [
  { slug: "eurusd", yahooSymbol: "EURUSD=X", display: "EUR/USD", shortName: "Euro / US Dollar" },
  { slug: "gbpusd", yahooSymbol: "GBPUSD=X", display: "GBP/USD", shortName: "British Pound / US Dollar" },
  { slug: "usdjpy", yahooSymbol: "USDJPY=X", display: "USD/JPY", shortName: "US Dollar / Japanese Yen" },
  { slug: "audusd", yahooSymbol: "AUDUSD=X", display: "AUD/USD", shortName: "Australian Dollar / US Dollar" },
  { slug: "usdcad", yahooSymbol: "USDCAD=X", display: "USD/CAD", shortName: "US Dollar / Canadian Dollar" },
  { slug: "usdchf", yahooSymbol: "USDCHF=X", display: "USD/CHF", shortName: "US Dollar / Swiss Franc" },
  { slug: "nzdusd", yahooSymbol: "NZDUSD=X", display: "NZD/USD", shortName: "New Zealand Dollar / US Dollar" },
  { slug: "eurjpy", yahooSymbol: "EURJPY=X", display: "EUR/JPY", shortName: "Euro / Japanese Yen" },
  { slug: "gbpjpy", yahooSymbol: "GBPJPY=X", display: "GBP/JPY", shortName: "British Pound / Japanese Yen" },
  { slug: "eurgbp", yahooSymbol: "EURGBP=X", display: "EUR/GBP", shortName: "Euro / British Pound" },
  { slug: "eurchf", yahooSymbol: "EURCHF=X", display: "EUR/CHF", shortName: "Euro / Swiss Franc" },
  { slug: "audjpy", yahooSymbol: "AUDJPY=X", display: "AUD/JPY", shortName: "Australian Dollar / Japanese Yen" },
  { slug: "usdsgd", yahooSymbol: "SGD=X", display: "USD/SGD", shortName: "US Dollar / Singapore Dollar" },
  { slug: "usdhkd", yahooSymbol: "HKD=X", display: "USD/HKD", shortName: "US Dollar / Hong Kong Dollar" },
  { slug: "usdcnh", yahooSymbol: "CNH=X", display: "USD/CNH", shortName: "US Dollar / Chinese Yuan Offshore" },
  { slug: "usdmxn", yahooSymbol: "MXN=X", display: "USD/MXN", shortName: "US Dollar / Mexican Peso" },
  { slug: "usdinr", yahooSymbol: "INR=X", display: "USD/INR", shortName: "US Dollar / Indian Rupee" },
  { slug: "usdthb", yahooSymbol: "THB=X", display: "USD/THB", shortName: "US Dollar / Thai Baht" },
];

export const COMMODITIES: AssetEntry[] = [
  { slug: "crude", yahooSymbol: "CL=F", display: "Crude Oil (WTI)", shortName: "Crude Oil Futures" },
  { slug: "brent", yahooSymbol: "BZ=F", display: "Brent Crude", shortName: "Brent Crude Oil" },
  { slug: "natgas", yahooSymbol: "NG=F", display: "Natural Gas", shortName: "Natural Gas Futures" },
  { slug: "wheat", yahooSymbol: "ZW=F", display: "Wheat", shortName: "Wheat Futures" },
  { slug: "corn", yahooSymbol: "ZC=F", display: "Corn", shortName: "Corn Futures" },
  { slug: "soybean", yahooSymbol: "ZS=F", display: "Soybean", shortName: "Soybean Futures" },
  { slug: "sugar", yahooSymbol: "SB=F", display: "Sugar", shortName: "Sugar Futures" },
  { slug: "cocoa", yahooSymbol: "CC=F", display: "Cocoa", shortName: "Cocoa Futures" },
];

export const ASSETS_BY_CATEGORY: Record<
  Exclude<MarketCategory, "crypto">,
  AssetEntry[]
> = {
  stocks: STOCKS,
  metals: METALS,
  forex: FOREX,
  commodities: COMMODITIES,
};

export function findAsset(
  category: MarketCategory,
  slug: string,
): AssetEntry | null {
  if (category === "crypto") return null; // crypto handled via CoinGecko
  return ASSETS_BY_CATEGORY[category]?.find((a) => a.slug === slug) ?? null;
}

export function getCategory(id: string): CategoryMeta | null {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}
