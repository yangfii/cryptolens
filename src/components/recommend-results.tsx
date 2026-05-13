"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Activity,
  Rocket,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Eye,
  ShieldOff,
  Check,
  Globe2,
} from "lucide-react";
import { formatPrice, formatPercent, formatCompact } from "@/lib/format";
import { useLang } from "./lang-provider";

export type Recommendation = {
  coinId: string;
  action: "buy" | "watch" | "avoid";
  confidence: number;
  thesis: string;
  priceActionRead: string;
  keyCatalyst: string;
  keyRisk: string;
  entryGuidance: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  rank: number;
  change24hPct: number;
  change7dPct: number | null;
};

export type RecommendResult = {
  marketRead: string;
  recommendations: Recommendation[];
  context: {
    btcDominance: number;
    marketCapChange24h: number;
    totalMarketCap: number;
  };
  generatedAt: string;
  model: string;
};

const ACTION_STYLE: Record<
  Recommendation["action"],
  { color: string; icon: typeof Check; en: string; kh: string }
> = {
  buy: { color: "#10b981", icon: Check, en: "Buy", kh: "ទិញ" },
  watch: { color: "#fbbf24", icon: Eye, en: "Watch", kh: "តាមដាន" },
  avoid: { color: "#f43f5e", icon: ShieldOff, en: "Avoid", kh: "ជៀស​វាង" },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? "#10b981" : value >= 55 ? "#fbbf24" : "#f43f5e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export default function RecommendResults({
  result,
  onReset,
}: {
  result: RecommendResult;
  onReset: () => void;
}) {
  const { lang } = useLang();
  const L = lang === "kh" ? "kh" : "en";

  return (
    <div className="space-y-6 fade-up">
      {/* MARKET READ */}
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="icon-tile text-accent" style={{ width: 40, height: 40 }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                {L === "kh" ? "ការ​អាន​ទីផ្សារ" : "Market Read"}
                <span className="pulse-dot" />
              </div>
              <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
                {result.model}
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {L === "kh" ? "ធ្វើ​ឡើង​វិញ" : "New recommendations"}
          </button>
        </div>

        <p className="text-sm leading-relaxed mb-5">{result.marketRead}</p>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1 inline-flex items-center gap-1">
              <Globe2 className="w-3 h-3" /> {L === "kh" ? "មូលធនសរុប" : "Total MCap"}
            </div>
            <div className="font-bold tabular-nums">
              ${formatCompact(result.context.totalMarketCap)}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              {L === "kh" ? "ប្រែ​ប្រួល 24ម៉" : "24h Change"}
            </div>
            <div
              className={`font-bold tabular-nums ${
                result.context.marketCapChange24h >= 0
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {formatPercent(result.context.marketCapChange24h)}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              BTC Dom
            </div>
            <div className="font-bold tabular-nums">
              {result.context.btcDominance.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-accent" />
          {L === "kh" ? "យោបល់" : "Recommendations"}
          <span className="text-sm font-normal text-muted">
            ({result.recommendations.length})
          </span>
        </h3>

        {result.recommendations.map((r, i) => {
          const style = ACTION_STYLE[r.action];
          const ActionIcon = style.icon;
          const actionLabel = L === "kh" ? style.kh : style.en;
          return (
            <div
              key={`${r.coinId}-${i}`}
              className="premium-card rounded-2xl p-5 fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  {r.image ? (
                    <Image
                      src={r.image}
                      alt={r.name}
                      width={44}
                      height={44}
                      className="rounded-xl"
                      unoptimized
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] grid place-items-center font-black text-sm">
                      {r.symbol.slice(0, 3)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg leading-tight">{r.name}</div>
                    <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">
                      {r.symbol} · #{r.rank} · {formatPrice(r.currentPrice)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: `${style.color}15`,
                      color: style.color,
                      border: `1px solid ${style.color}40`,
                    }}
                  >
                    <ActionIcon className="w-3.5 h-3.5" />
                    {actionLabel}
                  </span>
                </div>
              </div>

              {/* Price action chips */}
              <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
                <span
                  className={`px-2 py-1 rounded-md tabular-nums font-semibold ${
                    r.change24hPct >= 0
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  24h {formatPercent(r.change24hPct)}
                </span>
                {r.change7dPct !== null && (
                  <span
                    className={`px-2 py-1 rounded-md tabular-nums font-semibold ${
                      r.change7dPct >= 0
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    7d {formatPercent(r.change7dPct)}
                  </span>
                )}
                <span className="px-2 py-1 rounded-md bg-white/[0.04] text-muted">
                  MCap ${formatCompact(r.marketCap)}
                </span>
              </div>

              {/* Confidence */}
              <div className="mb-4">
                <div className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
                  {L === "kh" ? "កម្រិត​ទំនុក​ចិត្ត" : "Confidence"}
                </div>
                <ConfidenceBar value={r.confidence} />
              </div>

              {/* Thesis */}
              <div className="mb-4">
                <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-1.5">
                  {L === "kh" ? "សេចក្ដី​សន្និដ្ឋាន" : "Thesis"}
                </div>
                <p className="text-sm leading-relaxed">{r.thesis}</p>
              </div>

              {/* Details grid */}
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted mb-1.5">
                    <Activity className="w-3 h-3" />
                    {L === "kh" ? "ភាព​នៃ​តម្លៃ" : "Price Action"}
                  </div>
                  <p className="text-xs leading-relaxed">{r.priceActionRead}</p>
                </div>
                <div className="rounded-xl p-3 bg-success/[0.05] border border-success/[0.18]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-success mb-1.5">
                    <Rocket className="w-3 h-3" />
                    {L === "kh" ? "កត្តាជំរុញ" : "Key Catalyst"}
                  </div>
                  <p className="text-xs leading-relaxed">{r.keyCatalyst}</p>
                </div>
                <div className="rounded-xl p-3 bg-danger/[0.05] border border-danger/[0.18]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-danger mb-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    {L === "kh" ? "ហានិភ័យ​សំខាន់" : "Key Risk"}
                  </div>
                  <p className="text-xs leading-relaxed">{r.keyRisk}</p>
                </div>
                <div className="rounded-xl p-3 bg-accent/[0.05] border border-accent/[0.18]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent mb-1.5">
                    <Target className="w-3 h-3" />
                    {L === "kh" ? "យុទ្ធសាស្ត្រ​ចូល" : "Entry Guidance"}
                  </div>
                  <p className="text-xs leading-relaxed">{r.entryGuidance}</p>
                </div>
              </div>

              <Link
                href={`/coin/${r.coinId}`}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent font-semibold"
              >
                {L === "kh" ? `មើល​ស្រាវ​ជ្រាវ ${r.symbol}` : `View ${r.symbol} research`}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* DISCLAIMER */}
      <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]">
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-foreground">
            {L === "kh" ? "កំណត់​ចំណាំ៖" : "Disclaimer:"}
          </strong>{" "}
          {L === "kh" ? (
            <>
              យោបល់​ទាំង​នេះ​ត្រូវ​បាន​បង្កើត​ដោយ AI ផ្អែក​លើ​ទិន្នន័យ​ទីផ្សារ​ផ្ទាល់​។ វា​
              <strong className="text-foreground">មិន​មែន​ការ​ផ្តល់​ប្រឹក្សា​ហិរញ្ញ​វត្ថុ​ទេ​</strong>
              ។ ​​ស្រាវ​ជ្រាវ​ដោយ​ខ្លួន​ឯង មុន​នឹង​វិនិយោគ​។
            </>
          ) : (
            <>
              These recommendations are AI-generated from live market data. They are{" "}
              <strong className="text-foreground">not financial advice</strong>.
              Crypto markets are highly volatile — you could lose your entire
              investment. Always verify independently and never invest more than
              you can afford to lose.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
