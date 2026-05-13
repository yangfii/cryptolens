"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MtDeal } from "@/types/trader";

type Props = {
  deals: MtDeal[];
};

export default function EquityChart({ deals }: Props) {
  const points = useMemo(() => {
    const sorted = [...deals].sort(
      (a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime()
    );
    let running = 0;
    return sorted.map((d) => {
      running += (Number(d.profit) || 0) + (Number(d.commission) || 0) + (Number(d.swap) || 0);
      return {
        t: new Date(d.executed_at).getTime(),
        equity: Math.round(running * 100) / 100,
      };
    });
  }, [deals]);

  if (points.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-6 text-center text-sm text-muted">
        No closed deals yet — equity curve will appear once trades close.
      </div>
    );
  }

  return (
    <div className="premium-card rounded-2xl p-5">
      <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3">
        Cumulative P/L
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              width={50}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,16,20,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(t) => new Date(t as number).toLocaleString()}
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Cumulative P/L",
              ]}
            />
            <Area type="monotone" dataKey="equity" stroke="#22d3ee" strokeWidth={2} fill="url(#equityFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
