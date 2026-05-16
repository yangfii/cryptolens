import { Search, Brain } from "lucide-react";
import { getTopCoins } from "@/lib/coingecko";
import ResearchCard from "@/components/research-card";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Deep Research | Sastra trader",
  description:
    "AI-powered deep research reports on top cryptocurrencies for spot traders.",
};

export default async function ResearchPage() {
  let coins;
  try {
    coins = await getTopCoins(1, 30);
  } catch {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="premium-card rounded-2xl p-12 text-center text-muted">
          Unable to load coins right now. Please try again in a moment.
        </div>
      </div>
    );
  }

  // Split into market cap tiers for visual grouping
  const top10 = coins.slice(0, 10);
  const rest = coins.slice(10, 30);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-tile text-accent" style={{ width: 44, height: 44 }}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              AI-Powered Research
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Deep Research
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Pick any coin to see live market data, technical chart, and an
          AI-generated research note. Each report is produced by{" "}
          <span className="text-accent font-mono">Claude Sonnet 4.6</span> with
          bullish points, bearish points, and a spot trading observation.
        </p>
      </header>

      {/* Top 10 — Featured tier */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-1">
              Tier 1
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Top 10 by Market Cap</h2>
          </div>
          <span className="text-xs text-muted">Largest, most liquid markets</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {top10.map((coin, i) => (
            <ResearchCard key={coin.id} coin={coin} index={i} />
          ))}
        </div>
      </section>

      {/* Next 20 — Mid-cap tier */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "#a78bfa" }}>
              Tier 2
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Rank 11–30</h2>
          </div>
          <span className="text-xs text-muted">Higher volatility · More opportunity</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {rest.map((coin, i) => (
            <ResearchCard key={coin.id} coin={coin} index={i + 10} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 premium-card rounded-2xl p-8 text-center">
        <div className="icon-tile text-accent mx-auto mb-4" style={{ width: 48, height: 48 }}>
          <Search className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold mb-2">Looking for a specific coin?</h3>
        <p className="text-sm text-muted max-w-md mx-auto">
          Browse the full top 50 on the{" "}
          <a href="/" className="text-accent hover:underline font-semibold">
            Markets page
          </a>{" "}
          — click any coin to open its research page.
        </p>
      </section>
    </div>
  );
}
