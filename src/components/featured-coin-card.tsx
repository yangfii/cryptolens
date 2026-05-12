"use client";

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, Sparkles, ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import type { MarketCoin } from "@/types/crypto";
import { formatPrice, formatCompact } from "@/lib/format";
import PriceChange from "./price-change";
import Sparkline from "./sparkline";

export default function FeaturedCoinCard({
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
      className="premium-card rounded-2xl p-4 sm:p-6 fade-up block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={coin.image}
              alt={coin.name}
              width={48}
              height={48}
              className="rounded-full ring-1 ring-white/10"
              unoptimized
            />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 shadow-lg">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">{coin.name}</div>
            <div className="text-[11px] text-muted uppercase tracking-[0.15em] font-semibold mt-0.5">
              {coin.symbol}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent/80">
          <Sparkles className="w-3 h-3" />
          <span>AI Ready</span>
        </div>
      </div>

      <div className="mb-1">
        <div className="text-3xl font-bold tabular-nums tracking-tight">
          {formatPrice(coin.current_price)}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${
            positive ? "text-success" : "text-danger"
          }`}
        >
          {positive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </span>
        <span className="text-xs text-muted">24h</span>
        <span className="text-border">·</span>
        <PriceChange
          value={coin.price_change_percentage_7d_in_currency}
          className="text-sm"
        />
        <span className="text-xs text-muted">7d</span>
      </div>

      {coin.sparkline_in_7d?.price && (
        <div className="-mx-2 mb-4">
          <Sparkline data={coin.sparkline_in_7d.price} width={300} height={56} responsive />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06] text-xs">
        <div>
          <div className="text-muted text-[10px] uppercase tracking-wider font-semibold">
            Market Cap
          </div>
          <div className="font-bold tabular-nums mt-1 text-sm">
            ${formatCompact(coin.market_cap)}
          </div>
        </div>
        <div>
          <div className="text-muted text-[10px] uppercase tracking-wider font-semibold">
            24h Volume
          </div>
          <div className="font-bold tabular-nums mt-1 text-sm">
            ${formatCompact(coin.total_volume)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
        <span className="text-xs text-muted">View AI research</span>
        <ArrowUpRight className="w-4 h-4 text-accent" />
      </div>
    </Link>
  );
}
