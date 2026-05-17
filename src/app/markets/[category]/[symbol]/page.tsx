import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  findAsset,
  getCategory,
  type MarketCategory,
} from "@/lib/markets-catalog";
import {
  getChart,
  getCandles,
  getNewsForSymbol,
  type YahooNews,
} from "@/lib/yahoo-finance";
import {
  getCoinDetail,
  getCoinOhlc,
} from "@/lib/coingecko";
import { getCryptoNews } from "@/lib/news";
import { analyzeAsset, type HeadlineInput } from "@/lib/asset-sentiment";
import { formatPrice } from "@/lib/format";
import type { NewsItem } from "@/types/crypto";
import AssetTradingChart from "@/components/asset-trading-chart";
import type { Candle } from "@/components/trading-chart";
import SentimentPanel from "@/components/sentiment-panel";
import AssetStatsGrid, {
  type StatItem,
  compactStat,
  moneyStat,
  percentStat,
} from "@/components/asset-stats-grid";
import PerformanceRow from "@/components/performance-row";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Params = { category: string; symbol: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} | ${category} | Sastra trader`,
  };
}

type PerformanceBucket = { label: string; value: number | null };

type AssetView = {
  category: MarketCategory;
  categoryLabel: string;
  /** URL slug used by the candles API (e.g. "bitcoin", "aapl"). */
  slug: string;
  display: string;
  symbol: string;
  shortName: string | null;
  price: number;
  currency: string;
  changePercent24h: number;
  high52w: number | null;
  low52w: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  candles: Candle[];
  stats: StatItem[];
  performance: PerformanceBucket[];
  headlines: HeadlineInput[];
  headlineLinks: Record<string, { url: string; publisher?: string; when?: string }>;
};

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, symbol } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const view = await loadAsset(cat.id, symbol);
  if (!view) notFound();

  const up = view.changePercent24h >= 0;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/markets/${view.category}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {view.categoryLabel}
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2">
            {view.categoryLabel}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {view.display}
          </h1>
          {view.shortName && (
            <p className="text-sm text-muted mt-1">{view.shortName}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
            {formatPrice(view.price)}
            <span className="text-base text-muted ml-2">{view.currency}</span>
          </div>
          <div
            className={`text-sm font-bold tabular-nums inline-flex items-center gap-1 mt-1 ${
              up ? "text-success" : "text-danger"
            }`}
          >
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {up ? "+" : ""}
            {view.changePercent24h.toFixed(2)}% · 24h
          </div>
        </div>
      </header>

      {/* Stats grid */}
      <div className="mb-5">
        <AssetStatsGrid items={view.stats} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          {/* Chart */}
          <div className="premium-card rounded-2xl p-5">
            <AssetTradingChart
              category={view.category}
              symbol={view.slug}
              initialCandles={view.candles}
              initialRange="1mo"
            />
            {(view.high52w || view.low52w) && (
              <div className="text-[10px] text-muted text-right mt-2">
                52w range:{" "}
                <span className="font-mono text-foreground">
                  {view.low52w != null ? formatPrice(view.low52w) : "—"} – {view.high52w != null ? formatPrice(view.high52w) : "—"}
                </span>
              </div>
            )}
          </div>

          {/* Performance breakdown */}
          <PerformanceRow buckets={view.performance} />

          {/* Sentiment */}
          <Suspense
            fallback={
              <div className="premium-card rounded-2xl p-6">
                <div className="text-xs text-muted">AI analysis loading…</div>
              </div>
            }
          >
            <SentimentSection view={view} />
          </Suspense>
        </div>

        {/* News column */}
        <div>
          <div className="premium-card rounded-2xl p-5">
            <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-3">
              Recent headlines
            </div>
            {view.headlines.length === 0 ? (
              <div className="text-xs text-muted py-6 text-center">
                No recent headlines for {view.display}.
              </div>
            ) : (
              <ul className="space-y-3">
                {view.headlines.slice(0, 8).map((h) => {
                  const link = view.headlineLinks[h.id];
                  return (
                    <li key={h.id}>
                      <a
                        href={link?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="text-sm font-semibold leading-snug group-hover:text-accent transition-colors">
                          {h.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                          {link?.publisher && (
                            <span className="font-semibold">{link.publisher}</span>
                          )}
                          {link?.when && (
                            <>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {link.when}
                              </span>
                            </>
                          )}
                          <ExternalLink className="w-2.5 h-2.5 ml-auto group-hover:text-accent transition-colors" />
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

async function SentimentSection({ view }: { view: AssetView }) {
  const sentiment = await analyzeAsset({
    symbol: view.symbol,
    displayName: view.display,
    category: view.categoryLabel,
    price: view.price,
    currency: view.currency,
    changePercent24h: view.changePercent24h,
    high52w: view.high52w,
    low52w: view.low52w,
    headlines: view.headlines,
  });

  if (!sentiment) {
    return (
      <div className="premium-card rounded-2xl p-6">
        <div className="text-xs text-muted">
          AI analysis is unavailable for this asset right now.
        </div>
      </div>
    );
  }

  return <SentimentPanel sentiment={sentiment} headlineLinks={view.headlineLinks} />;
}

async function loadAsset(
  category: MarketCategory,
  slug: string,
): Promise<AssetView | null> {
  if (category === "crypto") {
    return loadCrypto(slug);
  }
  const asset = findAsset(category, slug);
  if (!asset?.yahooSymbol) return null;

  const [chart, longChart, candles, news] = await Promise.all([
    getChart(asset.yahooSymbol, "1mo"),
    getChart(asset.yahooSymbol, "1y"),
    getCandles(asset.yahooSymbol, "1mo").catch(() => [] as Candle[]),
    getNewsForSymbol(asset.yahooSymbol, 8).catch(() => [] as YahooNews[]),
  ]);
  if (!chart) return null;

  const performance = computePerformanceFromCloses(
    longChart?.closes ?? [],
    chart.price,
  );
  // Slot the 24h figure in
  performance[0].value = chart.changePercent;

  const stats: StatItem[] = [
    moneyStat("Price", chart.price, chart.currency),
    {
      label: "24h Range",
      value:
        chart.dayLow != null && chart.dayHigh != null
          ? `${formatPrice(chart.dayLow)} – ${formatPrice(chart.dayHigh)}`
          : "—",
    },
    {
      label: "52w Range",
      value:
        chart.fiftyTwoWeekLow != null && chart.fiftyTwoWeekHigh != null
          ? `${formatPrice(chart.fiftyTwoWeekLow)} – ${formatPrice(chart.fiftyTwoWeekHigh)}`
          : "—",
    },
    compactStat("Volume", chart.volume),
    { label: "Exchange", value: chart.exchange ?? "—" },
    { label: "Currency", value: chart.currency },
  ];

  return {
    category,
    categoryLabel: getCategory(category)!.label,
    slug: asset.slug,
    display: asset.display,
    symbol: chart.symbol,
    shortName: asset.shortName ?? chart.shortName ?? null,
    price: chart.price,
    currency: chart.currency,
    changePercent24h: chart.changePercent,
    high52w: chart.fiftyTwoWeekHigh,
    low52w: chart.fiftyTwoWeekLow,
    dayHigh: chart.dayHigh,
    dayLow: chart.dayLow,
    candles,
    stats,
    performance,
    headlines: news.map((n) => ({
      id: n.uuid,
      title: n.title,
      publisher: n.publisher,
    })),
    headlineLinks: Object.fromEntries(
      news.map((n) => [
        n.uuid,
        {
          url: n.link,
          publisher: n.publisher,
          when: formatYahooDate(n.providerPublishTime),
        },
      ]),
    ),
  };
}

async function loadCrypto(coinId: string): Promise<AssetView | null> {
  try {
    const [detail, ohlc, news] = await Promise.all([
      getCoinDetail(coinId),
      getCoinOhlc(coinId, 30).catch(() => [] as Array<[number, number, number, number, number]>),
      getCryptoNews(20, [coinId.toUpperCase()]).catch(() => [] as NewsItem[]),
    ]);
    const md = detail.market_data;
    const price = md.current_price.usd;
    const changePercent = md.price_change_percentage_24h;
    const candles: Candle[] = ohlc.map(([t, o, h, l, c]) => ({
      time: Math.floor(t / 1000),
      open: o,
      high: h,
      low: l,
      close: c,
      volume: 0,
    }));

    const performance: PerformanceBucket[] = [
      { label: "24h", value: changePercent ?? null },
      { label: "7d", value: md.price_change_percentage_7d ?? null },
      { label: "30d", value: md.price_change_percentage_30d ?? null },
      { label: "90d", value: null }, // not in CG basic
      { label: "1y", value: null },
    ];

    const stats: StatItem[] = [
      moneyStat("Market Cap", md.market_cap.usd),
      compactStat("24h Volume", md.total_volume.usd, "$"),
      compactStat("Circulating", md.circulating_supply),
      compactStat("Max Supply", md.max_supply),
      moneyStat("ATH", md.ath.usd),
      moneyStat("ATL", md.atl.usd),
    ];

    return {
      category: "crypto",
      categoryLabel: "Crypto",
      slug: coinId,
      display: detail.symbol.toUpperCase(),
      symbol: detail.symbol.toUpperCase(),
      shortName: detail.name,
      price,
      currency: "USD",
      changePercent24h: changePercent,
      high52w: md.ath.usd ?? null,
      low52w: md.atl.usd ?? null,
      dayHigh: md.high_24h.usd ?? null,
      dayLow: md.low_24h.usd ?? null,
      candles,
      stats,
      performance,
      headlines: news.slice(0, 8).map((n) => ({
        id: n.id,
        title: n.title,
        publisher: n.source,
      })),
      headlineLinks: Object.fromEntries(
        news.slice(0, 8).map((n) => [
          n.id,
          {
            url: n.url,
            publisher: n.source,
            when: formatRelative(n.published_at),
          },
        ]),
      ),
    };
  } catch (err) {
    console.error("[asset-detail] loadCrypto failed:", err);
    return null;
  }
}

function computePerformanceFromCloses(
  closes: Array<number | null>,
  current: number,
): PerformanceBucket[] {
  // The 1y chart we fetch has roughly 252 trading days (stocks) or 365
  // (crypto/forex). Sample points by relative position.
  const filtered = closes.filter((c): c is number => typeof c === "number");
  const len = filtered.length;
  function at(daysBack: number): number | null {
    if (len === 0) return null;
    // For Yahoo 1y daily, len ≈ 252. Map daysBack to an index from the end.
    const fraction = Math.min(1, daysBack / 365);
    const idx = Math.max(0, Math.floor(len - 1 - fraction * (len - 1)));
    const past = filtered[idx];
    if (!past || past <= 0) return null;
    return ((current - past) / past) * 100;
  }
  return [
    { label: "24h", value: at(1) },
    { label: "7d", value: at(7) },
    { label: "30d", value: at(30) },
    { label: "90d", value: at(90) },
    { label: "1y", value: at(365) },
  ];
}

function formatYahooDate(unixSec: number): string {
  return formatRelative(new Date(unixSec * 1000).toISOString());
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
