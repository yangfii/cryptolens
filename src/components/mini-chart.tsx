"use client";

import {
  AreaChart,
  Area,
  YAxis,
  ResponsiveContainer,
} from "recharts";

type Props = {
  closes: Array<number | null>;
  positive: boolean;
  height?: number;
};

export default function MiniChart({ closes, positive, height = 220 }: Props) {
  const data = closes
    .map((c, i) => ({ i, c }))
    .filter((p): p is { i: number; c: number } => typeof p.c === "number");

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  const color = positive ? "#10b981" : "#f43f5e";
  const id = `chart-grad-${positive ? "up" : "down"}`;

  const values = data.map((d) => d.c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.05 || 1;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min - pad, max + pad]} hide />
          <Area
            type="monotone"
            dataKey="c"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
