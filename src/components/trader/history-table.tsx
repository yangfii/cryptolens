"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { MtOrder, MtOrderSide } from "@/types/trader";

type Props = {
  orders: MtOrder[];
};

type Filter = "all" | "buy" | "sell" | "open" | "closed";

const SIDE_LABEL: Record<MtOrderSide, string> = {
  buy: "Buy",
  sell: "Sell",
  buy_limit: "Buy Limit",
  sell_limit: "Sell Limit",
  buy_stop: "Buy Stop",
  sell_stop: "Sell Stop",
};

function isBuy(side: MtOrderSide) {
  return side === "buy" || side === "buy_limit" || side === "buy_stop";
}

function fmt(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function HistoryTable({ orders }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      switch (filter) {
        case "buy":
          return isBuy(o.side);
        case "sell":
          return !isBuy(o.side);
        case "open":
          return !o.closed_at;
        case "closed":
          return Boolean(o.closed_at);
        default:
          return true;
      }
    });
  }, [orders, filter]);

  const totalProfit = useMemo(
    () => filtered.reduce((sum, o) => sum + (Number(o.profit) || 0), 0),
    [filtered]
  );

  return (
    <div className="premium-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-white/[0.06]">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
          Order history ({filtered.length})
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(["all", "buy", "sell", "open", "closed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                filter === f
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted">
          No orders match this filter.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted font-semibold border-b border-white/[0.04]">
                  <th className="text-left px-4 py-2.5">Time</th>
                  <th className="text-left px-4 py-2.5">Symbol</th>
                  <th className="text-left px-4 py-2.5">Side</th>
                  <th className="text-right px-4 py-2.5">Volume</th>
                  <th className="text-right px-4 py-2.5">Open</th>
                  <th className="text-right px-4 py-2.5">Close</th>
                  <th className="text-right px-4 py-2.5">P/L</th>
                  <th className="text-left px-4 py-2.5">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const buy = isBuy(o.side);
                  const profit = Number(o.profit);
                  const profitClass =
                    profit > 0 ? "text-emerald-400" : profit < 0 ? "text-danger" : "text-muted";
                  return (
                    <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">
                        {new Date(o.opened_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2.5 font-semibold">{o.symbol}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            buy ? "text-emerald-300 bg-emerald-500/10" : "text-danger bg-danger/10"
                          }`}
                        >
                          {buy ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {SIDE_LABEL[o.side]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmt(o.volume)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                        {fmt(o.open_price, 5)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                        {o.closed_at ? fmt(o.close_price, 5) : "—"}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${profitClass}`}>
                        {fmt(o.profit)}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] font-mono text-muted">{o.ticket}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-end gap-3 text-xs">
            <span className="text-muted uppercase tracking-wider">Total P/L</span>
            <span
              className={`tabular-nums font-bold ${
                totalProfit > 0 ? "text-emerald-400" : totalProfit < 0 ? "text-danger" : "text-muted"
              }`}
            >
              {fmt(totalProfit)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
