import { TrendingUp, TrendingDown, Minus, Sparkles, ExternalLink } from "lucide-react";
import type { AssetSentiment, HeadlineSentiment, SentimentLabel } from "@/lib/asset-sentiment";

type Props = {
  sentiment: AssetSentiment;
  headlineLinks?: Record<string, { url: string; publisher?: string; when?: string }>;
};

const META: Record<
  SentimentLabel,
  { label: string; color: string; bg: string; border: string; Icon: typeof TrendingUp }
> = {
  bullish: {
    label: "Bullish",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.10)",
    border: "rgba(16, 185, 129, 0.25)",
    Icon: TrendingUp,
  },
  bearish: {
    label: "Bearish",
    color: "#f43f5e",
    bg: "rgba(244, 63, 94, 0.10)",
    border: "rgba(244, 63, 94, 0.25)",
    Icon: TrendingDown,
  },
  neutral: {
    label: "Neutral",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.10)",
    border: "rgba(148, 163, 184, 0.25)",
    Icon: Minus,
  },
};

export default function SentimentPanel({ sentiment, headlineLinks }: Props) {
  const m = META[sentiment.overall];
  const Icon = m.Icon;

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
        <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
            AI Sentiment · Claude Haiku 4.5
          </div>
          <div className="text-sm text-foreground font-bold mt-0.5">
            How is this asset shaping up right now?
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
        style={{ background: m.bg, border: `1px solid ${m.border}` }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" style={{ color: m.color }} />
          <div>
            <div className="text-lg font-bold" style={{ color: m.color }}>
              {m.label}
            </div>
            <div className="text-xs text-muted">{sentiment.summary}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
            Confidence
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: m.color }}>
            {sentiment.confidence}%
          </div>
        </div>
      </div>

      {sentiment.drivers.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-2">
            What's driving the call
          </div>
          <ul className="space-y-1.5">
            {sentiment.drivers.map((d, i) => (
              <li key={i} className="text-sm text-foreground flex gap-2">
                <span className="text-accent mt-1.5 w-1 h-1 rounded-full shrink-0 bg-accent" />
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sentiment.headlines.length > 0 && (
        <div>
          <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-2.5">
            Headline analysis
          </div>
          <div className="space-y-2">
            {sentiment.headlines.map((h) => (
              <HeadlineRow
                key={h.id}
                headline={h}
                link={headlineLinks?.[h.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeadlineRow({
  headline,
  link,
}: {
  headline: HeadlineSentiment;
  link?: { url: string; publisher?: string; when?: string };
}) {
  const m = META[headline.sentiment];
  const Icon = m.Icon;
  return (
    <div
      className="rounded-xl p-3 flex gap-3 items-start"
      style={{ background: m.bg, border: `1px solid ${m.border}` }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: m.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted leading-relaxed">{headline.reason}</div>
        {link?.url && (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-foreground hover:text-accent transition-colors inline-flex items-center gap-1 mt-1"
          >
            {link.publisher ?? "Source"}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
