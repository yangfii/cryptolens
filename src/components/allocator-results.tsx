"use client";

import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  Wallet,
  TrendingUp,
  Clock4,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/format";

export type Allocation = {
  coinId: string;
  symbol: string;
  name: string;
  percentage: number;
  amount: number;
  currentPrice: number;
  entryStrategy: "current" | "dca" | "limit";
  entryPriceUSD: number | null;
  entryNote: string;
  reasoning: string;
};

export type AllocateResult = {
  strategy: string;
  allocations: Allocation[];
  cashReserved: number;
  cashReservedPercentage: number;
  totalAllocated: number;
  riskNotes: string;
  rebalanceFreq: string;
  generatedAt: string;
  model: string;
};

const COLORS = [
  "#fbbf24", // gold
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#10b981", // green
  "#f43f5e", // pink
  "#f97316", // orange
  "#3b82f6", // blue
];

const STRATEGY_LABELS: Record<Allocation["entryStrategy"], string> = {
  current: "Buy at market",
  dca: "DCA over time",
  limit: "Wait for limit",
};

const STRATEGY_COLORS: Record<Allocation["entryStrategy"], string> = {
  current: "#10b981",
  dca: "#22d3ee",
  limit: "#fbbf24",
};

type TooltipPayload = {
  payload?: { name: string; symbol: string; percentage: number; amount: number };
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (!data) return null;
  return (
    <div className="premium-card rounded-lg p-3 text-xs">
      <div className="font-bold mb-1">
        {data.name} <span className="text-muted">({data.symbol})</span>
      </div>
      <div className="tabular-nums">
        <span className="text-accent font-semibold">{data.percentage}%</span>{" "}
        <span className="text-muted">·</span>{" "}
        <span className="font-semibold">${data.amount.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function AllocatorResults({
  result,
  budget,
  onReset,
}: {
  result: AllocateResult;
  budget: number;
  onReset: () => void;
}) {
  const chartData = [
    ...result.allocations.map((a) => ({
      name: a.name,
      symbol: a.symbol,
      percentage: a.percentage,
      amount: a.amount,
      color: COLORS[result.allocations.indexOf(a) % COLORS.length],
    })),
    ...(result.cashReservedPercentage > 0
      ? [
          {
            name: "Cash Reserve",
            symbol: "USD",
            percentage: result.cashReservedPercentage,
            amount: result.cashReserved,
            color: "#3a3a52",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 fade-up">
      {/* STRATEGY OVERVIEW */}
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                AI Allocation Strategy
                <span className="pulse-dot" />
              </div>
              <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
                {result.model}
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New allocation
          </button>
        </div>

        <p className="text-sm leading-relaxed mb-5">{result.strategy}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              Budget
            </div>
            <div className="font-bold tabular-nums">
              ${budget.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              Allocated
            </div>
            <div className="font-bold tabular-nums text-success">
              ${result.totalAllocated.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              Cash Reserve
            </div>
            <div className="font-bold tabular-nums text-muted">
              ${result.cashReserved.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              Rebalance
            </div>
            <div className="font-bold capitalize">{result.rebalanceFreq}</div>
          </div>
        </div>
      </div>

      {/* PIE CHART */}
      <div className="premium-card rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent" />
          Portfolio Breakdown
        </h3>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-center">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="percentage"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.symbol}
                      fill={entry.color}
                      stroke="#0f0f17"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {chartData.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ background: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">
                      {item.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-bold text-sm tabular-nums">
                    {item.percentage}%
                  </div>
                  <div className="text-[10px] text-muted tabular-nums">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALLOCATIONS DETAIL */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-accent" />
          Allocation Details
        </h3>
        {result.allocations.map((a, i) => (
          <div
            key={a.coinId}
            className="premium-card rounded-2xl p-5 fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl grid place-items-center font-black text-sm"
                  style={{
                    background: COLORS[i % COLORS.length] + "20",
                    color: COLORS[i % COLORS.length],
                    border: `1px solid ${COLORS[i % COLORS.length]}40`,
                  }}
                >
                  {a.symbol.slice(0, 3)}
                </span>
                <div>
                  <div className="font-bold text-lg leading-tight">{a.name}</div>
                  <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
                    {a.symbol} · ${formatPrice(a.currentPrice).replace("$", "")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">{a.percentage}%</div>
                <div className="text-sm text-muted tabular-nums">
                  ${a.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Entry strategy */}
            <div
              className="rounded-xl p-4 mb-3 border"
              style={{
                background: STRATEGY_COLORS[a.entryStrategy] + "08",
                borderColor: STRATEGY_COLORS[a.entryStrategy] + "30",
              }}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock4
                    className="w-3.5 h-3.5"
                    style={{ color: STRATEGY_COLORS[a.entryStrategy] }}
                  />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: STRATEGY_COLORS[a.entryStrategy] }}
                  >
                    Entry: {STRATEGY_LABELS[a.entryStrategy]}
                  </span>
                </div>
                {a.entryStrategy === "limit" && a.entryPriceUSD && (
                  <span className="text-sm font-bold tabular-nums">
                    Limit @ ${a.entryPriceUSD.toLocaleString()}
                  </span>
                )}
                {a.entryStrategy === "current" && (
                  <span className="text-sm font-bold tabular-nums">
                    Market @ {formatPrice(a.currentPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{a.entryNote}</p>
            </div>

            {/* Reasoning */}
            <div className="text-sm text-muted leading-relaxed mb-3">
              {a.reasoning}
            </div>

            <Link
              href={`/coin/${a.coinId}`}
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent font-semibold"
            >
              View {a.symbol} research
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* RISK NOTES */}
      <div className="premium-card rounded-2xl p-6 border border-danger/15">
        <div className="flex items-start gap-3">
          <div
            className="icon-tile shrink-0"
            style={{ width: 36, height: 36, color: "#f43f5e" }}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">Risk Considerations</h3>
            <p className="text-sm text-muted leading-relaxed">
              {result.riskNotes}
            </p>
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]">
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-foreground">Disclaimer:</strong> This
          allocation is an AI-generated suggestion based on current market data
          and your selected preferences. It is{" "}
          <strong className="text-foreground">not financial advice</strong>.
          Cryptocurrency markets are highly volatile — you could lose your
          entire investment. Always do your own research, verify recommendations
          independently, and never invest more than you can afford to lose. Past
          performance does not predict future results.
        </p>
      </div>
    </div>
  );
}
