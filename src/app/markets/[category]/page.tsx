import { notFound } from "next/navigation";
import { TrendingUp } from "lucide-react";
import {
  CATEGORIES,
  getCategory,
  ASSETS_BY_CATEGORY,
  type MarketCategory,
} from "@/lib/markets-catalog";
import { getQuotes } from "@/lib/yahoo-finance";
import { getTopCoins } from "@/lib/coingecko";
import MarketsCategoryTabs from "@/components/markets-category-tabs";
import AssetTable, { type AssetRow } from "@/components/asset-table";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  return {
    title: cat
      ? `${cat.label} Markets | Sastra trader`
      : "Markets | Sastra trader",
  };
}

export default async function MarketsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const rows: AssetRow[] = await loadRows(cat.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Markets Research
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {cat.label}
        </h1>
        <p className="text-sm text-muted max-w-2xl">{cat.description}</p>
      </header>

      <div className="mb-6">
        <MarketsCategoryTabs active={cat.id} />
      </div>

      <AssetTable rows={rows} />

      <p className="text-[11px] text-muted text-center mt-6">
        Prices update every minute · Click any asset for live chart, AI
        sentiment, and headline analysis.
      </p>
    </main>
  );
}

async function loadRows(category: MarketCategory): Promise<AssetRow[]> {
  if (category === "crypto") {
    const coins = await getTopCoins(1, 50);
    return coins.map((c) => ({
      href: `/markets/crypto/${c.id}`,
      symbol: c.symbol.toUpperCase(),
      display: c.symbol.toUpperCase(),
      shortName: c.name,
      price: c.current_price,
      changePercent: c.price_change_percentage_24h ?? 0,
      currency: "USD",
      volume: c.total_volume,
      sparkline: c.sparkline_in_7d?.price ?? [],
    }));
  }

  const assets = ASSETS_BY_CATEGORY[category];
  const symbols = assets.map((a) => a.yahooSymbol!).filter(Boolean);
  const quotes = await getQuotes(symbols);
  const quoteBySymbol = new Map(quotes.map((q) => [q.symbol, q]));

  const out: AssetRow[] = [];
  for (const a of assets) {
    const q = quoteBySymbol.get(a.yahooSymbol!);
    if (!q) continue;
    out.push({
      href: `/markets/${category}/${a.slug}`,
      symbol: q.symbol,
      display: a.display,
      shortName: a.shortName,
      price: q.price,
      changePercent: q.changePercent,
      currency: q.currency,
      dayHigh: q.dayHigh,
      dayLow: q.dayLow,
      volume: q.volume,
      sparkline: q.sparkline,
    });
  }
  return out;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}
