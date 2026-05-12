"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import type { MouseEvent } from "react";
import type { MarketCoin } from "@/types/crypto";
import { formatPrice, formatCompact } from "@/lib/format";

export default function ResearchCard({
  coin,
  index,
}: {
  coin: MarketCoin;
  index: number;
}) {
  const positive = coin.price_change_percentage_24h >= 0;

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  }

  return (
    <Link
      href={`/coin/${coin.id}`}
      onMouseMove={handleMouseMove}
      className="premium-card rounded-2xl p-5 block fade-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image
            src={coin.image}
            alt={coin.name}
            width={40}
            height={40}
            className="rounded-full ring-1 ring-white/10"
            unoptimized
          />
          <div>
            <div className="font-bold text-base leading-tight">{coin.name}</div>
            <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mt-0.5">
              {coin.symbol}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-white/[0.04] border border-white/[0.06] text-muted rounded-md px-2 py-1">
          #{coin.market_cap_rank}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold tabular-nums tracking-tight">
          {formatPrice(coin.current_price)}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
            positive ? "text-success" : "text-danger"
          }`}
        >
          {positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </span>
      </div>

      <div className="text-xs text-muted mb-4">
        Market cap{" "}
        <span className="font-semibold text-foreground tabular-nums">
          ${formatCompact(coin.market_cap)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
          <Sparkles className="w-3 h-3" />
          AI Research
        </span>
        <ArrowUpRight className="w-4 h-4 text-muted" />
      </div>
    </Link>
  );
}
