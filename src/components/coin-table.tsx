import Image from "next/image";
import Link from "next/link";
import type { MarketCoin } from "@/types/crypto";
import { formatPrice, formatCompact } from "@/lib/format";
import PriceChange from "./price-change";
import Sparkline from "./sparkline";

export default function CoinTable({ coins }: { coins: MarketCoin[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="text-muted text-[10px] uppercase tracking-[0.15em] font-semibold">
          <tr className="border-b border-border">
            <th className="px-4 py-4 text-left">#</th>
            <th className="px-4 py-4 text-left">Coin</th>
            <th className="px-4 py-4 text-right">Price</th>
            <th className="px-4 py-4 text-right hidden sm:table-cell">24h</th>
            <th className="px-4 py-4 text-right hidden md:table-cell">7d</th>
            <th className="px-4 py-4 text-right hidden lg:table-cell">Market Cap</th>
            <th className="px-4 py-4 text-right hidden lg:table-cell">Volume (24h)</th>
            <th className="px-4 py-4 text-right hidden xl:table-cell">7d Trend</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr
              key={coin.id}
              className="border-b border-border/40 last:border-0 hover:bg-card-hover transition-colors group"
            >
              <td className="px-4 py-4 text-muted tabular-nums text-xs">
                {coin.market_cap_rank}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/coin/${coin.id}`}
                  className="flex items-center gap-3 group-hover:text-accent transition-colors"
                >
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                    unoptimized
                  />
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-muted text-xs uppercase tracking-wider">
                      {coin.symbol}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4 text-right tabular-nums font-semibold">
                {formatPrice(coin.current_price)}
              </td>
              <td className="px-4 py-4 text-right hidden sm:table-cell">
                <PriceChange value={coin.price_change_percentage_24h} />
              </td>
              <td className="px-4 py-4 text-right hidden md:table-cell">
                <PriceChange
                  value={coin.price_change_percentage_7d_in_currency}
                />
              </td>
              <td className="px-4 py-4 text-right hidden lg:table-cell tabular-nums text-muted">
                ${formatCompact(coin.market_cap)}
              </td>
              <td className="px-4 py-4 text-right hidden lg:table-cell tabular-nums text-muted">
                ${formatCompact(coin.total_volume)}
              </td>
              <td className="px-4 py-4 text-right hidden xl:table-cell">
                {coin.sparkline_in_7d?.price ? (
                  <div className="flex justify-end">
                    <Sparkline data={coin.sparkline_in_7d.price} />
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
