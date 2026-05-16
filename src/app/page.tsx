import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  Activity,
  Wallet,
  Coins,
  Brain,
  Newspaper,
} from "lucide-react";
import { getGlobalData, getTopCoins } from "@/lib/coingecko";
import CoinTable from "@/components/coin-table";
import FeaturedCoinCard from "@/components/featured-coin-card";
import TickerTape from "@/components/ticker-tape";
import HeroSection from "@/components/hero-section";
import DailyPicksSection, { DailyPicksSkeleton } from "@/components/daily-picks-section";
import TrackRecordSection from "@/components/track-record-section";
import ScrollReveal from "@/components/scroll-reveal";
import { formatCompact } from "@/lib/format";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type StatProps = {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
};

function StatCard({ label, value, change, icon, iconColor }: StatProps) {
  return (
    <div className="stat-card-premium rounded-2xl p-5 fade-up">
      <div className="flex items-center justify-between mb-3">
        <div
          className="icon-tile"
          style={{ color: iconColor }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        {change !== undefined && (
          <span
            className={`text-[10px] font-bold tabular-nums px-2 py-1 rounded-md ${
              change >= 0
                ? "text-success bg-success/10 border border-success/20"
                : "text-danger bg-danger/10 border border-danger/20"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
}

async function GlobalStats() {
  const data = await getGlobalData();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Market Cap"
        value={`$${formatCompact(data.total_market_cap_usd)}`}
        change={data.market_cap_change_percentage_24h_usd}
        icon={<Wallet className="w-5 h-5" />}
        iconColor="#fbbf24"
      />
      <StatCard
        label="24h Volume"
        value={`$${formatCompact(data.total_volume_usd)}`}
        icon={<Activity className="w-5 h-5" />}
        iconColor="#22d3ee"
      />
      <StatCard
        label="BTC Dominance"
        value={`${data.market_cap_percentage_btc.toFixed(1)}%`}
        icon={<TrendingUp className="w-5 h-5" />}
        iconColor="#a78bfa"
      />
      <StatCard
        label="Active Coins"
        value={formatCompact(data.active_cryptocurrencies)}
        icon={<Coins className="w-5 h-5" />}
        iconColor="#10b981"
      />
    </div>
  );
}

async function FeaturedCoins() {
  // Use same URL as Markets table — shares Next.js fetch cache
  const coins = await getTopCoins(1, 50);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coins.slice(0, 3).map((coin, i) => (
        <FeaturedCoinCard key={coin.id} coin={coin} index={i} />
      ))}
    </div>
  );
}

async function CoinsList() {
  const coins = await getTopCoins(1, 50);
  return <CoinTable coins={coins} />;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="stat-card-premium rounded-2xl p-5 h-32 animate-pulse"
        />
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="premium-card rounded-2xl p-6 h-72 animate-pulse"
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted">
      Loading markets…
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <TickerTape />
      </Suspense>

      {/* HERO */}
      <HeroSection />

      {/* GLOBAL STATS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-6 mb-20">
        <ScrollReveal direction="up">
          <Suspense fallback={<StatsSkeleton />}>
            <GlobalStats />
          </Suspense>
        </ScrollReveal>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="section-divider mb-16" />
      </div>

      {/* AI DAILY PICKS — auto-refreshed every 12h */}
      <ScrollReveal direction="up" threshold={0.05}>
        <Suspense fallback={<DailyPicksSkeleton />}>
          <DailyPicksSection />
        </Suspense>
      </ScrollReveal>

      {/* AI TRACK RECORD — performance of past picks (gated by broker connection) */}
      <ScrollReveal direction="up" threshold={0.05}>
        <Suspense fallback={null}>
          <TrackRecordSection />
        </Suspense>
      </ScrollReveal>

      {/* FEATURED COINS */}
      <ScrollReveal direction="up" threshold={0.05}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2">
              Featured
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Top Markets, Right Now
            </h2>
            <p className="text-sm text-muted mt-2 max-w-xl">
              The three largest cryptocurrencies by market cap. Click any coin
              for live charts and AI-generated research.
            </p>
          </div>
          <Link
            href="#markets"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-accent transition-colors"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedCoins />
        </Suspense>
      </section>
      </ScrollReveal>

      {/* AI SHOWCASE */}
      <ScrollReveal direction="up" threshold={0.05}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3">
            AI Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Two models, purpose-built for traders
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            We route every request to the right Claude model — balanced and
            analytical for research, fast for headline sentiment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="premium-card rounded-2xl p-7">
            <div className="icon-tile mb-5 text-accent">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl mb-2 tracking-tight">
              Deep Research Notes
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Claude Sonnet 4.6 reviews live market data and produces balanced
              bullish/bearish breakdowns for every coin.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
              <span className="px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20 font-bold">
                Sonnet 4.6
              </span>
              <span className="text-muted">~30s · cached 30min</span>
            </div>
          </div>

          <div className="premium-card rounded-2xl p-7">
            <div className="icon-tile mb-5" style={{ color: "#22d3ee" }}>
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl mb-2 tracking-tight">
              News Sentiment
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Every headline is classified bullish, bearish, or neutral —
              scan the market mood in seconds.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
              <span className="px-2 py-1 rounded bg-cyan/10 text-cyan border border-cyan/20 font-bold" style={{ color: "#22d3ee", borderColor: "rgba(34, 211, 238, 0.2)", background: "rgba(34, 211, 238, 0.1)" }}>
                Haiku 4.5
              </span>
              <span className="text-muted">batch · 30 at once</span>
            </div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* MARKETS TABLE */}
      <ScrollReveal direction="up" threshold={0.05}>
      <section
        id="markets"
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-20"
      >
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2">
              All Markets
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Top 50 by Market Cap
            </h2>
            <p className="text-sm text-muted mt-2 flex items-center gap-2">
              <span className="pulse-dot" />
              Live · Updates every minute
            </p>
          </div>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <CoinsList />
        </Suspense>
      </section>
      </ScrollReveal>
    </>
  );
}
