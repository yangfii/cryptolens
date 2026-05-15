import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import { getRecentSnapshotsWithPerformance } from "@/lib/picks-history";
import { formatPercent } from "@/lib/format";
import SnapshotCard from "./snapshot-card";

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
      <div className="space-y-3">
        {snapshots.map((snap, snapIdx) => (
          <SnapshotCard
            key={snap.id}
            snap={snap}
            title={snapIdx === 0 ? "Latest Picks" : `Snapshot #${snapshots.length - snapIdx}`}
            defaultExpanded={snapIdx === 0}
          />
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
