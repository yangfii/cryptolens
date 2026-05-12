import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sentiment } from "@/types/crypto";

const styles: Record<Sentiment, string> = {
  bullish: "bg-success/10 text-success border-success/25",
  bearish: "bg-danger/10 text-danger border-danger/25",
  neutral: "bg-white/[0.04] text-muted border-white/[0.08]",
};

const label: Record<Sentiment, string> = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
};

const Icon: Record<Sentiment, typeof TrendingUp> = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
};

export default function SentimentBadge({
  sentiment,
  className,
}: {
  sentiment?: Sentiment;
  className?: string;
}) {
  if (!sentiment) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border bg-white/[0.02] border-white/[0.06] text-muted font-semibold uppercase tracking-wider",
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-muted/50 animate-pulse" />
        Analyzing
      </span>
    );
  }
  const IconComp = Icon[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider whitespace-nowrap",
        styles[sentiment],
        className
      )}
    >
      <IconComp className="w-3 h-3" />
      {label[sentiment]}
    </span>
  );
}
