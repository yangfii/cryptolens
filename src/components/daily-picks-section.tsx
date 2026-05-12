import { Sparkles } from "lucide-react";
import { getDailyPicks } from "@/lib/daily-picks";
import DailyPicksClient from "./daily-picks-client";

export default async function DailyPicksSection() {
  const data = await getDailyPicks();

  if (data.picks.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Daily Picks
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Today&apos;s Best Value for Spot Traders
            </h2>
          </div>
        </div>
        <div className="premium-card rounded-2xl p-8 text-center">
          <div className="text-sm text-muted">{data.marketContext}</div>
        </div>
      </section>
    );
  }

  return (
    <DailyPicksClient
      picks={data.picks}
      marketContext={data.marketContext}
      generatedAt={data.generatedAt}
      nextRefreshAt={data.nextRefreshAt}
      model={data.model}
      searchesUsed={data.searchesUsed}
    />
  );
}

export function DailyPicksSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
      <div className="mb-7">
        <div className="h-4 w-32 bg-card animate-pulse rounded mb-2" />
        <div className="h-8 w-96 bg-card animate-pulse rounded mb-2" />
        <div className="h-4 w-2/3 bg-card animate-pulse rounded" />
      </div>
      <div className="premium-card rounded-2xl p-5 mb-6 h-20 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="premium-card rounded-2xl p-6 h-80 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
