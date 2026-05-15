"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ChevronDown } from "lucide-react";
import type { SnapshotPerformance } from "@/lib/picks-history";
import { formatRelativeTime, formatPercent } from "@/lib/format";

type Props = {
  snap: SnapshotPerformance;
  title: string;
  defaultExpanded?: boolean;
};

const RISK_COLOR: Record<"low" | "medium" | "high", string> = {
  low: "#22d3ee",
  medium: "#fbbf24",
  high: "#f43f5e",
};

function formatPrice(n: number) {
  return `$${n.toFixed(n > 1 ? 2 : 4)}`;
}

export default function SnapshotCard({ snap, title, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="premium-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`snap-body-${snap.id}`}
        className="snapshot-header flex items-center justify-between gap-3 flex-wrap p-4 sm:p-5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="icon-tile text-accent shrink-0"
            style={{ width: 38, height: 38 }}
          >
            <Trophy className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{title}</div>
            <div className="text-[11px] text-muted">
              {snap.picks.length} picks · {formatRelativeTime(snap.generatedAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="text-right">
              <div className="text-[9px] text-muted uppercase tracking-wider">Avg</div>
              <div
                className={`font-bold tabular-nums ${
                  snap.avgChangePct >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatPercent(snap.avgChangePct)}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[9px] text-muted uppercase tracking-wider">Win</div>
              <div className="font-bold tabular-nums">
                {snap.winRate.toFixed(0)}%
              </div>
            </div>
          </div>

          <span
            className="snapshot-pill shrink-0"
            data-open={expanded ? "true" : "false"}
          >
            {expanded ? "Hide" : "View"}
            <ChevronDown className="snapshot-pill__chevron w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {expanded && (
        <div
          id={`snap-body-${snap.id}`}
          className="snapshot-body px-4 sm:px-5 pb-5 pt-1"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {snap.picks.map((p) => {
              const positive = p.changePct >= 0;
              return (
                <Link
                  key={p.coinId}
                  href={`/coin/${p.coinId}`}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={22}
                      height={22}
                      className="rounded-full shrink-0"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate group-hover:text-accent transition-colors">
                        {p.symbol}
                      </div>
                      <div className="text-[10px] text-muted truncate">
                        {p.name}
                      </div>
                    </div>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold shrink-0"
                      style={{ color: RISK_COLOR[p.riskLevel] }}
                    >
                      {p.riskLevel}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-2 pt-1 border-t border-white/[0.04]">
                    <div className="min-w-0">
                      <div className="text-[9px] text-muted uppercase tracking-wider">
                        Pick → Now
                      </div>
                      <div className="text-[11px] tabular-nums truncate">
                        <span className="text-muted">{formatPrice(p.priceAtPick)}</span>
                        <span className="text-muted/50 mx-1">→</span>
                        <span className="font-semibold">{formatPrice(p.currentPrice)}</span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums shrink-0 ${
                        positive ? "text-success" : "text-danger"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {p.changePct.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
