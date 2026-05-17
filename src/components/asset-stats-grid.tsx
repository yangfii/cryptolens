import { formatCompact, formatPrice } from "@/lib/format";

export type StatItem = {
  label: string;
  value: string;
  hint?: string;
};

type Props = {
  items: StatItem[];
};

export default function AssetStatsGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="stat-card-premium rounded-xl px-4 py-3"
        >
          <div className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold mb-1">
            {it.label}
          </div>
          <div className="text-sm font-bold tabular-nums truncate">{it.value}</div>
          {it.hint && (
            <div className="text-[10px] text-muted mt-0.5 truncate">{it.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function moneyStat(label: string, value: number | null | undefined, currency = "USD"): StatItem {
  return {
    label,
    value: value != null ? `${formatPrice(value)} ${currency}` : "—",
  };
}

export function compactStat(label: string, value: number | null | undefined, prefix = ""): StatItem {
  return {
    label,
    value: value != null ? `${prefix}${formatCompact(value)}` : "—",
  };
}

export function percentStat(label: string, value: number | null | undefined): StatItem {
  if (value == null) return { label, value: "—" };
  const sign = value >= 0 ? "+" : "";
  return { label, value: `${sign}${value.toFixed(2)}%` };
}
