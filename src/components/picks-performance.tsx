import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import { getRecentSnapshotsWithPerformance } from "@/lib/picks-history";
import { formatRelativeTime, formatPercent } from "@/lib/format";

export default async function PicksPerformance() {
  const { snapshots, overallStats } = await getRecentSnapshotsWithPerformance(5);

  if (snapshots.length === 0 || overallStats.totalPicks === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            AI Track Record
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How are AI picks performing?
          </h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Past picks tracked from their generation time to current price.
            Helps you evaluate whether AI recommendations are working over time.
          </p>
        </div>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="icon-tile"
              style={{ width: 36, height: 36, color: "#fbbf24" }}
            >
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-1">
            Total Picks Tracked
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {overallStats.totalPicks}
          </div>
        </div>

        <div className="stat-card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="icon-tile"
              style={{
                width: 36,
                height: 36,
                color: overallStats.avgChangePct >= 0 ? "#10b981" : "#f43f5e",
              }}
            >
              {overallStats.avgChangePct >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-1">
            Average Return
          </div>
          <div
            className={`text-2xl font-bold tabular-nums ${
              overallStats.avgChangePct >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatPercent(overallStats.avgChangePct)}
          </div>
        </div>

        <div className="stat-card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="icon-tile"
              style={{ width: 36, height: 36, color: "#22d3ee" }}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-1">
            Win Rate
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {overallStats.winRate.toFixed(0)}%
          </div>
        </div>

        <div className="stat-card-premium rounded-2xl p-5">
          {overallStats.bestPick && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="icon-tile"
                  style={{ width: 36, height: 36, color: "#10b981" }}
                >
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-1">
                Best Pick
              </div>
              <div className="text-lg font-bold tabular-nums">
                {overallStats.bestPick.symbol}{" "}
                <span className="text-success">
                  {formatPercent(overallStats.bestPick.changePct)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent snapshots */}
      <div className="space-y-4">
        {snapshots.map((snap, snapIdx) => (
          <div key={snap.id} className="premium-card rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="icon-tile text-accent"
                  style={{ width: 36, height: 36 }}
                >
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">
                    {snapIdx === 0 ? "Latest Picks" : `Snapshot #${snapshots.length - snapIdx}`}
                  </div>
                  <div className="text-xs text-muted">
                    Generated {formatRelativeTime(snap.generatedAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted">Avg: </span>
                  <span
                    className={`font-bold tabular-nums ${
                      snap.avgChangePct >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatPercent(snap.avgChangePct)}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Win rate: </span>
                  <span className="font-bold tabular-nums">
                    {snap.winRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-sm min-w-[420px]">
                <thead className="text-muted text-[10px] uppercase tracking-[0.15em] font-semibold">
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left pb-2 pr-3">Coin</th>
                    <th className="text-right pb-2 pr-3 hidden sm:table-cell">
                      Risk
                    </th>
                    <th className="text-right pb-2 pr-3">Pick Price</th>
                    <th className="text-right pb-2 pr-3">Current</th>
                    <th className="text-right pb-2">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.picks.map((p) => (
                    <tr
                      key={p.coinId}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/coin/${p.coinId}`}
                          className="flex items-center gap-2 hover:text-accent transition-colors"
                        >
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                            unoptimized
                          />
                          <span className="font-semibold text-xs">
                            {p.symbol}
                          </span>
                          <span className="text-muted text-xs hidden sm:inline">
                            {p.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 text-right hidden sm:table-cell">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                          style={{
                            color:
                              p.riskLevel === "low"
                                ? "#22d3ee"
                                : p.riskLevel === "medium"
                                ? "#fbbf24"
                                : "#f43f5e",
                          }}
                        >
                          {p.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-xs">
                        ${p.priceAtPick.toFixed(p.priceAtPick > 1 ? 2 : 4)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-xs font-semibold">
                        ${p.currentPrice.toFixed(p.currentPrice > 1 ? 2 : 4)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`tabular-nums font-bold text-xs ${
                            p.changePct >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {p.changePct >= 0 ? "+" : ""}
                          {p.changePct.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            P&amp;L is measured from the price when each pick was generated to
            the current price. Past performance doesn&apos;t predict future
            results. Tracking history is built up as more snapshots accumulate
            — early stats may have low sample size.
          </p>
        </div>
      </div>
    </section>
  );
}
