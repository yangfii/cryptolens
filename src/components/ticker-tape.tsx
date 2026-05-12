import { getTopCoins } from "@/lib/coingecko";
import { formatPrice } from "@/lib/format";

export default async function TickerTape() {
  let coins;
  try {
    // Use same URL as homepage table to share Next.js fetch cache
    coins = (await getTopCoins(1, 50)).slice(0, 20);
  } catch {
    return null;
  }

  const items = [...coins, ...coins];

  return (
    <div className="border-b border-border bg-background-elev overflow-hidden ticker-mask py-2">
      <div className="ticker-track">
        {items.map((coin, i) => {
          const positive = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={`${coin.id}-${i}`}
              className="flex items-center gap-2 px-5 text-xs whitespace-nowrap"
            >
              <span className="text-muted uppercase font-semibold">
                {coin.symbol}
              </span>
              <span className="font-medium tabular-nums">
                {formatPrice(coin.current_price)}
              </span>
              <span
                className={`tabular-nums font-semibold ${
                  positive ? "text-success" : "text-danger"
                }`}
              >
                {positive ? "▲" : "▼"}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </span>
              <span className="text-border">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
