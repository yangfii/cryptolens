import Image from "next/image";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import { getCryptoNews } from "@/lib/news";
import { formatRelativeTime } from "@/lib/format";

export const revalidate = 300;

type Props = {
  symbol: string;
  limit?: number;
};

export default async function CoinNews({ symbol, limit = 6 }: Props) {
  const items = await getCryptoNews(limit, [symbol]);

  if (items.length === 0 || items[0].id === "fallback-1") {
    return (
      <div className="premium-card rounded-2xl p-6 text-center text-muted text-sm">
        No recent news for {symbol.toUpperCase()}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="premium-card rounded-xl p-4 block group"
        >
          <div className="flex items-start gap-3">
            {item.imageUrl && (
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-white/[0.06] bg-background-elev hidden sm:block">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors mb-1.5 line-clamp-2">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  {item.sourceImage && (
                    <Image
                      src={item.sourceImage}
                      alt={item.source}
                      width={12}
                      height={12}
                      className="rounded-sm"
                      unoptimized
                    />
                  )}
                  <span className="font-semibold">{item.source}</span>
                </span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(item.published_at)}
                </span>
                <span className="ml-auto">
                  <ExternalLink className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export function CoinNewsSection({ symbol }: { symbol: string }) {
  return (
    <section className="mb-6">
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-accent" />
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-0.5">
              Latest News
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {symbol.toUpperCase()} Headlines
            </h2>
          </div>
        </div>
        <a
          href={`/news`}
          className="text-xs text-muted hover:text-accent transition-colors font-semibold"
        >
          View all news →
        </a>
      </div>
      <CoinNews symbol={symbol} />
    </section>
  );
}
