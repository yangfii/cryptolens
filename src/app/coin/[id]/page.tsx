import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ArrowUp,
  ArrowDown,
  Layers,
  Globe,
} from "lucide-react";
import { getCoinDetail } from "@/lib/coingecko";
import { formatPrice, formatCompact } from "@/lib/format";
import PriceChange from "@/components/price-change";
import TradingViewChart from "@/components/tv-chart";
import AiSummary from "@/components/ai-summary";
import { CoinNewsSection } from "@/components/coin-news";

export const revalidate = 120;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const coin = await getCoinDetail(id);
    return {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) — Price, Charts, AI Analysis | Sastra trader`,
      description: `Live ${coin.name} price, market data, technical chart, and AI-powered spot trading analysis.`,
    };
  } catch {
    return { title: "Coin not found | Sastra trader" };
  }
}

function StatBox({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="stat-card-premium rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: iconColor }}>{icon}</span>
        <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
          {label}
        </div>
      </div>
      <div className="text-base font-bold tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
}

export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let coin;
  try {
    coin = await getCoinDetail(id);
  } catch {
    notFound();
  }

  const md = coin.market_data;
  const price = md.current_price.usd;
  const positive24h = md.price_change_percentage_24h >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to markets
      </Link>

      {/* HEADER */}
      <header className="premium-card rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="relative">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={72}
              height={72}
              className="rounded-full ring-2 ring-white/10"
              unoptimized
            />
            <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-accent text-accent-foreground rounded-full px-2 py-0.5 shadow-lg">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {coin.name}
              </h1>
              <span className="text-muted uppercase font-semibold tracking-[0.15em] text-sm">
                {coin.symbol}
              </span>
              {coin.categories?.[0] && (
                <span className="text-[10px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-muted uppercase tracking-wider font-semibold">
                  {coin.categories[0]}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
                {formatPrice(price)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-lg font-bold tabular-nums px-3 py-1 rounded-lg ${
                  positive24h
                    ? "text-success bg-success/10 border border-success/20"
                    : "text-danger bg-danger/10 border border-danger/20"
                }`}
              >
                {positive24h ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(md.price_change_percentage_24h).toFixed(2)}%
              </span>
              <span className="text-xs text-muted">24h change</span>
            </div>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatBox
          label="Market Cap"
          value={`$${formatCompact(md.market_cap.usd)}`}
          icon={<Wallet className="w-3.5 h-3.5" />}
          iconColor="#fbbf24"
        />
        <StatBox
          label="24h Volume"
          value={`$${formatCompact(md.total_volume.usd)}`}
          icon={<Activity className="w-3.5 h-3.5" />}
          iconColor="#22d3ee"
        />
        <StatBox
          label="24h High"
          value={formatPrice(md.high_24h.usd)}
          icon={<ArrowUp className="w-3.5 h-3.5" />}
          iconColor="#10b981"
        />
        <StatBox
          label="24h Low"
          value={formatPrice(md.low_24h.usd)}
          icon={<ArrowDown className="w-3.5 h-3.5" />}
          iconColor="#f43f5e"
        />
        <StatBox
          label="All-time High"
          value={formatPrice(md.ath.usd)}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          iconColor="#fbbf24"
        />
        <StatBox
          label="All-time Low"
          value={formatPrice(md.atl.usd)}
          icon={<TrendingDown className="w-3.5 h-3.5" />}
          iconColor="#a78bfa"
        />
      </section>

      {/* CHART — BIG */}
      <section className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-1">
              Technical Analysis
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Price Chart</h2>
          </div>
          <div className="text-xs text-muted">Powered by TradingView</div>
        </div>
        <TradingViewChart symbol={coin.symbol} height={700} />
      </section>

      {/* AI RESEARCH */}
      <section className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-1">
              AI Engine
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Research</h2>
          </div>
          <div className="text-xs text-muted font-mono">Sonnet 4.6 · cached 30min</div>
        </div>
        <Suspense
          fallback={
            <div className="premium-card rounded-2xl p-6 text-muted text-sm">
              Loading AI analysis…
            </div>
          }
        >
          <AiSummary coinId={coin.id} />
        </Suspense>
      </section>

      {/* COIN NEWS */}
      <Suspense
        fallback={
          <div className="premium-card rounded-2xl p-6 text-muted text-sm mb-6">
            Loading {coin.symbol.toUpperCase()} news…
          </div>
        }
      >
        <CoinNewsSection symbol={coin.symbol} />
      </Suspense>

      {/* PERFORMANCE & SUPPLY */}
      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-tile text-accent" style={{ width: 36, height: 36 }}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Performance</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
              <span className="text-muted">24 hours</span>
              <PriceChange value={md.price_change_percentage_24h} className="text-base" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
              <span className="text-muted">7 days</span>
              <PriceChange value={md.price_change_percentage_7d} className="text-base" />
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted">30 days</span>
              <PriceChange value={md.price_change_percentage_30d} className="text-base" />
            </div>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-tile" style={{ width: 36, height: 36, color: "#a78bfa" }}>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Supply</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
              <span className="text-muted">Circulating</span>
              <span className="tabular-nums font-semibold">
                {formatCompact(md.circulating_supply)} {coin.symbol.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
              <span className="text-muted">Total</span>
              <span className="tabular-nums font-semibold">
                {md.total_supply ? `${formatCompact(md.total_supply)} ${coin.symbol.toUpperCase()}` : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted">Max</span>
              <span className="tabular-nums font-semibold">
                {md.max_supply ? `${formatCompact(md.max_supply)} ${coin.symbol.toUpperCase()}` : "∞ Unlimited"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      {coin.description?.en && (
        <section className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-tile" style={{ width: 36, height: 36, color: "#22d3ee" }}>
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">About {coin.name}</h3>
          </div>
          <div
            className="text-sm text-muted leading-relaxed [&_a]:text-accent [&_a]:hover:underline"
            dangerouslySetInnerHTML={{
              __html:
                coin.description.en.split(". ").slice(0, 4).join(". ") + ".",
            }}
          />
        </section>
      )}
    </div>
  );
}
