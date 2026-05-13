"use client";

import type { AccountInfo, TraderAccount } from "@/types/trader";
import { Wallet, TrendingUp, Activity, Scale } from "lucide-react";

type Props = {
  account: TraderAccount;
  info: AccountInfo | null;
};

function fmt(n: number | null | undefined, fractionDigits = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export default function AccountSummary({ account, info }: Props) {
  const currency = info?.currency ?? "";
  const profitClass =
    info && info.profit > 0 ? "text-emerald-400" : info && info.profit < 0 ? "text-danger" : "text-muted";

  return (
    <div className="premium-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
            {account.platform.toUpperCase()} · {account.broker}
          </div>
          <div className="text-lg font-bold mt-0.5">{account.display_name}</div>
          <div className="text-xs text-muted">
            {account.server} · #{account.login}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Wallet} label="Balance" value={fmt(info?.balance)} suffix={currency} />
        <Stat icon={Scale} label="Equity" value={fmt(info?.equity)} suffix={currency} />
        <Stat
          icon={TrendingUp}
          label="Floating P/L"
          value={fmt(info?.profit)}
          suffix={currency}
          valueClass={profitClass}
        />
        <Stat icon={Activity} label="Margin level" value={info?.margin_level ? `${fmt(info.margin_level)}%` : "—"} />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  suffix,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted font-semibold">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${valueClass ?? ""}`}>
        {value}
        {suffix ? <span className="ml-1 text-xs text-muted font-normal">{suffix}</span> : null}
      </div>
    </div>
  );
}
