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
import { getChart, getNewsForSymbol, type YahooNews } from "@/lib/yahoo-finance";
import { getCoinDetail } from "@/lib/coingecko";
import { getCryptoNews } from "@/lib/news";
import { analyzeAsset, type HeadlineInput } from "@/lib/asset-sentiment";
import { formatPrice } from "@/lib/format";
import type { NewsItem } from "@/types/crypto";
import MiniChart from "@/components/mini-chart";
import SentimentPanel from "@/components/sentiment-panel";

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

type AssetView = {
  category: MarketCategory;
  categoryLabel: string;
  display: string;
  symbol: string;
  shortName: string | null;
  price: number;
  currency: string;
  changePercent24h: number;
  high52w: number | null;
  low52w: number | null;
  closes: Array<number | null>;
  headlines: HeadlineInput[];
  /** url, publisher, when for the headline ids in `headlines` */
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

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          {/* Chart */}
          <div className="premium-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
                Price · last 30 days
              </div>
              {(view.high52w || view.low52w) && (
                <div className="text-[10px] text-muted">
                  52w range:{" "}
                  <span className="font-mono text-foreground">
                    {view.low52w?.toFixed(2)} – {view.high52w?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <MiniChart closes={view.closes} positive={up} height={240} />
          </div>

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
  }).catch(() => null);

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

  const [chart, news] = await Promise.all([
    getChart(asset.yahooSymbol, "1mo"),
    getNewsForSymbol(asset.yahooSymbol, 8).catch(() => [] as YahooNews[]),
  ]);
  if (!chart) return null;

  return {
    category,
    categoryLabel: getCategory(category)!.label,
    display: asset.display,
    symbol: chart.symbol,
    shortName: asset.shortName ?? chart.shortName ?? null,
    price: chart.price,
    currency: chart.currency,
    changePercent24h: chart.changePercent,
    high52w: null,
    low52w: null,
    closes: chart.closes,
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
    const [detail, news] = await Promise.all([
      getCoinDetail(coinId),
      getCryptoNews(20, [coinId.toUpperCase()]).catch(() => [] as NewsItem[]),
    ]);
    const price = detail.market_data.current_price.usd;
    const changePercent = detail.market_data.price_change_percentage_24h;
    return {
      category: "crypto",
      categoryLabel: "Crypto",
      display: detail.symbol.toUpperCase(),
      symbol: detail.symbol.toUpperCase(),
      shortName: detail.name,
      price,
      currency: "USD",
      changePercent24h: changePercent,
      high52w: detail.market_data.ath.usd ?? null,
      low52w: detail.market_data.atl.usd ?? null,
      closes: [], // crypto detail already has a chart elsewhere
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
  } catch {
    return null;
  }
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
