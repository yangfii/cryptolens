"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, X, Plus, Check } from "lucide-react";
import type { NewsItem } from "@/types/crypto";

const STORAGE_KEY = "cryptolens:news-alerts";
const SEEN_KEY = "cryptolens:news-seen";

type AlertState = {
  enabled: boolean;
  keywords: string[];
  permission: NotificationPermission | "unsupported";
};

function loadKeywords(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveKeywords(keywords: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
}

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  // Keep last 500 ids to bound storage
  const arr = Array.from(seen).slice(-500);
  localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

export default function NewsAlerts({ items }: { items: NewsItem[] }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AlertState>({
    enabled: false,
    keywords: [],
    permission: "default",
  });
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setState({
      enabled: true,
      keywords: loadKeywords(),
      permission:
        typeof Notification !== "undefined"
          ? Notification.permission
          : "unsupported",
    });
  }, []);

  // Check for matching news whenever items or keywords change.
  useEffect(() => {
    if (state.keywords.length === 0 || items.length === 0) return;
    if (state.permission !== "granted") return;

    const seen = loadSeen();
    const matches: NewsItem[] = [];
    for (const item of items) {
      if (seen.has(item.id)) continue;
      const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase();
      const matched = state.keywords.some((kw) =>
        haystack.includes(kw.toLowerCase())
      );
      if (matched) matches.push(item);
      seen.add(item.id);
    }
    saveSeen(seen);

    // Fire one notification per match (capped at 3 to avoid spam)
    for (const m of matches.slice(0, 3)) {
      try {
        new Notification(`🔔 Sastra trader Alert`, {
          body: m.title,
          icon: m.imageUrl || "/favicon.ico",
          tag: m.id,
        });
      } catch {
        // ignore
      }
    }
  }, [items, state.keywords, state.permission]);

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setState((s) => ({ ...s, permission: result }));
  }

  function addKeyword() {
    const kw = draft.trim();
    if (!kw) return;
    if (state.keywords.includes(kw)) {
      setDraft("");
      return;
    }
    const next = [...state.keywords, kw];
    saveKeywords(next);
    setState((s) => ({ ...s, keywords: next }));
    setDraft("");
  }

  function removeKeyword(kw: string) {
    const next = state.keywords.filter((k) => k !== kw);
    saveKeywords(next);
    setState((s) => ({ ...s, keywords: next }));
  }

  const hasAlerts = state.keywords.length > 0;
  const isActive = hasAlerts && state.permission === "granted";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
          isActive
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-white/[0.08] bg-white/[0.04] text-muted hover:text-foreground"
        }`}
      >
        {isActive ? (
          <BellRing className="w-3.5 h-3.5" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        Alerts
        {hasAlerts && (
          <span className="text-[10px] tabular-nums bg-white/10 px-1.5 py-0.5 rounded">
            {state.keywords.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] premium-card rounded-xl p-4 z-40 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-sm">News Alerts</div>
                <div className="text-[10px] text-muted">
                  Get notified when keywords appear in headlines
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {state.permission === "unsupported" ? (
              <div className="text-xs text-muted bg-white/[0.04] rounded-lg p-3">
                Browser notifications not supported.
              </div>
            ) : state.permission !== "granted" ? (
              <button
                onClick={requestPermission}
                className="w-full btn-primary py-2 rounded-lg text-xs mb-3"
              >
                Enable browser notifications
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-success font-semibold mb-3 px-2 py-1 rounded bg-success/10 border border-success/20 w-fit">
                <Check className="w-3 h-3" />
                NOTIFICATIONS ENABLED
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="e.g. ETF, halving, Solana…"
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50"
              />
              <button
                onClick={addKeyword}
                disabled={!draft.trim()}
                className="px-3 py-2 rounded-lg bg-accent text-accent-foreground disabled:opacity-40 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {state.keywords.length === 0 ? (
              <div className="text-xs text-muted text-center py-3">
                No alerts set. Add a keyword above.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {state.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs"
                  >
                    {kw}
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-muted">
              Alerts fire only while this site is open. Matches are case-insensitive.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
