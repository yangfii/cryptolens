"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Sparkles, Clock, Languages } from "lucide-react";
import type { NewsItem, Sentiment } from "@/types/crypto";
import { formatRelativeTime } from "@/lib/format";
import { NEWS_COIN_CATEGORIES, NEWS_THEME_CATEGORIES } from "@/lib/news";
import SentimentBadge from "./sentiment-badge";
import NewsAlerts from "./news-alerts";

type Lang = "en" | "kh";

export default function NewsList({ items: initialItems }: { items: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [loadingItems, setLoadingItems] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [sentiments, setSentiments] = useState<Record<string, Sentiment>>({});
  const [loadingAi, setLoadingAi] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<"all" | Sentiment>("all");
  const [lang, setLang] = useState<Lang>("en");
  const [translations, setTranslations] = useState<
    Record<string, { title: string; description?: string }>
  >({});
  const [translating, setTranslating] = useState(false);

  // Reload news when category changes
  useEffect(() => {
    if (category === "all") {
      setItems(initialItems);
      return;
    }
    let cancelled = false;
    setLoadingItems(true);
    fetch(`/api/news?categories=${encodeURIComponent(category)}&limit=30`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { items: NewsItem[] } | null) => {
        if (cancelled || !data) return;
        setItems(data.items);
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, initialItems]);

  // AI sentiment classification
  useEffect(() => {
    if (items.length === 0) {
      setLoadingAi(false);
      return;
    }
    let cancelled = false;
    setLoadingAi(true);

    fetch("/api/sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headlines: items.map((i) => ({ id: i.id, title: i.title })),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: { results: Array<{ id: string; sentiment: Sentiment }> } | null) => {
          if (cancelled || !data) return;
          const map: Record<string, Sentiment> = {};
          for (const r of data.results) map[r.id] = r.sentiment;
          setSentiments(map);
        }
      )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingAi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Translation
  useEffect(() => {
    if (lang !== "kh" || items.length === 0) return;
    const toTranslate = items.filter((i) => !translations[i.id]);
    if (toTranslate.length === 0) return;

    let cancelled = false;
    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "kh",
        items: toTranslate.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
        })),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          results: Array<{ id: string; title: string; description?: string }>;
        } | null) => {
          if (cancelled || !data) return;
          setTranslations((prev) => {
            const next = { ...prev };
            for (const r of data.results) {
              next[r.id] = { title: r.title, description: r.description };
            }
            return next;
          });
        }
      )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, items, translations]);

  const filtered = useMemo(() => {
    if (sentimentFilter === "all") return items;
    return items.filter((i) => sentiments[i.id] === sentimentFilter);
  }, [items, sentiments, sentimentFilter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      bullish: Object.values(sentiments).filter((s) => s === "bullish").length,
      bearish: Object.values(sentiments).filter((s) => s === "bearish").length,
      neutral: Object.values(sentiments).filter((s) => s === "neutral").length,
    }),
    [items, sentiments]
  );

  const SENTIMENT_OPTIONS: Array<{
    value: typeof sentimentFilter;
    label: string;
    color: string;
  }> = [
    { value: "all", label: "All", color: "#fbbf24" },
    { value: "bullish", label: "Bullish", color: "#10b981" },
    { value: "bearish", label: "Bearish", color: "#f43f5e" },
    { value: "neutral", label: "Neutral", color: "#7e7e95" },
  ];

  return (
    <>
      {/* Coin / theme filter */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            category === "all"
              ? "bg-accent text-accent-foreground"
              : "bg-white/[0.04] border border-white/[0.06] text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {NEWS_COIN_CATEGORIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCategory(c.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === c.code
                ? "bg-accent text-accent-foreground"
                : "bg-white/[0.04] border border-white/[0.06] text-muted hover:text-foreground"
            }`}
          >
            {c.code}
          </button>
        ))}
        <span className="w-px h-5 bg-white/[0.08] mx-1" />
        {NEWS_THEME_CATEGORIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCategory(c.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === c.code
                ? "bg-violet/15 text-violet border border-violet/30"
                : "bg-white/[0.04] border border-white/[0.06] text-muted hover:text-foreground"
            }`}
            style={
              category === c.code
                ? { color: "#a78bfa", borderColor: "rgba(167, 139, 250, 0.3)", background: "rgba(167, 139, 250, 0.15)" }
                : undefined
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Toolbar: AI status / language / alerts / sentiment filter */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {loadingAi ? (
              <>
                Analyzing sentiment{" "}
                <span className="pulse-dot" />
              </>
            ) : (
              <>Sentiment by <span className="font-mono text-accent">Haiku 4.5</span></>
            )}
          </span>
          {lang === "kh" && translating && (
            <span className="inline-flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-accent" />
              Translating…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-background-elev rounded-lg p-1 border border-white/[0.06]">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                lang === "en"
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("kh")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                lang === "kh"
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              title="Translate to Khmer with Claude Haiku 4.5"
            >
              ខ្មែរ
            </button>
          </div>

          {/* Sentiment filter */}
          <div className="flex items-center gap-1 bg-background-elev rounded-lg p-1 border border-white/[0.06]">
            {SENTIMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSentimentFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  sentimentFilter === opt.value
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: opt.color }}
                />
                {opt.label}
                <span className="text-[10px] text-muted tabular-nums">
                  {counts[opt.value]}
                </span>
              </button>
            ))}
          </div>

          <NewsAlerts items={items} />
        </div>
      </div>

      {/* News list */}
      {loadingItems ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="premium-card rounded-2xl p-5 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const translated = lang === "kh" ? translations[item.id] : undefined;
            const displayTitle = translated?.title ?? item.title;
            const displayDescription = translated?.description ?? item.description;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card rounded-2xl p-5 block group fade-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <div className="flex items-start gap-4">
                  {item.imageUrl && (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-white/[0.06] bg-background-elev hidden sm:block">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="128px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-base leading-snug group-hover:text-accent transition-colors">
                        {displayTitle}
                      </h3>
                      <SentimentBadge sentiment={sentiments[item.id]} />
                    </div>
                    {displayDescription && (
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-3">
                        {displayDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        {item.sourceImage && (
                          <Image
                            src={item.sourceImage}
                            alt={item.source}
                            width={14}
                            height={14}
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
                      {item.categories && item.categories.length > 0 && (
                        <>
                          <span className="text-border">·</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.categories.slice(0, 3).map((cat) => (
                              <span
                                key={cat}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] uppercase tracking-wider"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      <span className="ml-auto">
                        <ExternalLink className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}

          {filtered.length === 0 && (
            <div className="premium-card rounded-2xl p-12 text-center text-muted text-sm">
              {sentimentFilter !== "all"
                ? "No headlines match this sentiment filter."
                : "No news available for this category."}
            </div>
          )}
        </div>
      )}
    </>
  );
}
