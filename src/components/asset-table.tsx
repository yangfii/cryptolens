import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice } from "@/lib/format";

export type AssetRow = {
  href: string;
  symbol: string;
  display: string;
  shortName?: string | null;
  price: number;
  changePercent: number;
  currency: string;
};

type Props = {
  rows: AssetRow[];
};

export default function AssetTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-12 text-center text-muted text-sm">
        No assets available right now. Try again in a moment.
      </div>
    );
  }

  return (
    <div className="premium-card rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted">
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-3.5">Asset</th>
            <th className="text-right px-5 py-3.5 hidden sm:table-cell">Name</th>
            <th className="text-right px-5 py-3.5">Price</th>
            <th className="text-right px-5 py-3.5">24h</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const up = row.changePercent >= 0;
            return (
              <tr
                key={row.symbol}
                className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors fade-up ${
                  i === rows.length - 1 ? "border-b-0" : ""
                }`}
                style={{ animationDelay: `${Math.min(i * 25, 250)}ms` }}
              >
                <td className="px-5 py-4">
                  <Link
                    href={row.href}
                    className="font-bold text-sm hover:text-accent transition-colors"
                  >
                    {row.display}
                  </Link>
                </td>
                <td className="px-5 py-4 text-right text-xs text-muted hidden sm:table-cell">
                  {row.shortName ?? "—"}
                </td>
                <td className="px-5 py-4 text-right tabular-nums font-semibold">
                  {formatPrice(row.price)}
                  {row.currency !== "USD" && (
                    <span className="text-[10px] text-muted ml-1">{row.currency}</span>
                  )}
                </td>
                <td
                  className={`px-5 py-4 text-right tabular-nums font-bold text-sm ${
                    up ? "text-success" : "text-danger"
                  }`}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    {up ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {up ? "+" : ""}
                    {row.changePercent.toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
