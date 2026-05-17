"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import {
  ASSETS_BY_CATEGORY,
  CATEGORIES,
  type AssetEntry,
  type MarketCategory,
} from "@/lib/markets-catalog";

type CryptoHit = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
};

type AssetHit = {
  category: Exclude<MarketCategory, "crypto">;
  entry: AssetEntry;
};

type Result = {
  type: "crypto" | "asset";
  href: string;
  primary: string; // bold label
  secondary: string;
  badge: string;
  badgeColor: string;
  thumb?: string;
};

const CATEGORY_BADGE: Record<MarketCategory, { label: string; color: string }> =
  {
    crypto: { label: "Crypto", color: "#fbbf24" },
    stocks: { label: "Stocks", color: "#10b981" },
    metals: { label: "Metals", color: "#fbbf24" },
    forex: { label: "Forex", color: "#22d3ee" },
    commodities: { label: "Commodities", color: "#a78bfa" },
  };

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cryptoHits, setCryptoHits] = useState<CryptoHit[]>([]);
  const [loadingCrypto, setLoadingCrypto] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // All non-crypto assets, in-memory for instant filtering.
  const allAssetHits = useMemo<AssetHit[]>(() => {
    const out: AssetHit[] = [];
    for (const cat of Object.keys(ASSETS_BY_CATEGORY) as Array<
      Exclude<MarketCategory, "crypto">
    >) {
      for (const entry of ASSETS_BY_CATEGORY[cat]) {
        out.push({ category: cat, entry });
      }
    }
    return out;
  }, []);

  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allAssetHits
      .filter((h) => {
        const e = h.entry;
        return (
          e.display.toLowerCase().includes(q) ||
          e.shortName.toLowerCase().includes(q) ||
          (e.yahooSymbol ?? "").toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [query, allAssetHits]);

  // Keyboard shortcut to open the palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input when the modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setCryptoHits([]);
      setActiveIndex(0);
    }
  }, [open]);

  // Debounced crypto search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setCryptoHits([]);
      return;
    }
    setLoadingCrypto(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/markets/search?q=${encodeURIComponent(q)}`,
        );
        if (!res.ok) {
          setCryptoHits([]);
          return;
        }
        const data = (await res.json()) as { crypto: CryptoHit[] };
        setCryptoHits(data.crypto ?? []);
      } catch {
        setCryptoHits([]);
      } finally {
        setLoadingCrypto(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo<Result[]>(() => {
    const out: Result[] = cryptoHits.map((c) => ({
      type: "crypto",
      href: `/markets/crypto/${c.id}`,
      primary: c.symbol.toUpperCase(),
      secondary: c.name,
      badge: CATEGORY_BADGE.crypto.label,
      badgeColor: CATEGORY_BADGE.crypto.color,
      thumb: c.thumb,
    }));
    for (const h of localResults) {
      out.push({
        type: "asset",
        href: `/markets/${h.category}/${h.entry.slug}`,
        primary: h.entry.display,
        secondary: h.entry.shortName,
        badge: CATEGORY_BADGE[h.category].label,
        badgeColor: CATEGORY_BADGE[h.category].color,
      });
    }
    return out;
  }, [cryptoHits, localResults]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results.length]);

  const navigate = useCallback(
    (idx: number) => {
      const r = results[idx];
      if (!r) return;
      setOpen(false);
      router.push(r.href);
    },
    [results, router],
  );

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(activeIndex);
    }
  }

  return (
    <>
      <CommandTrigger onOpen={() => setOpen(true)} />
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.08] flex items-center gap-3">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onListKey}
              placeholder="Search any asset — symbol, name, or pair…"
              className="flex-1 bg-transparent outline-none text-base"
              autoComplete="off"
              spellCheck={false}
            />
            {loadingCrypto && (
              <Loader2 className="w-3.5 h-3.5 text-muted animate-spin" />
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-muted">
              ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() === "" ? (
              <EmptyTip />
            ) : results.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted">
                No matches for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((r, i) => (
                <ResultRow
                  key={`${r.type}-${r.href}`}
                  result={r}
                  active={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigate(i)}
                />
              ))
            )}
          </div>

          <div className="border-t border-white/[0.08] px-4 py-2 text-[10px] text-muted flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                ↵
              </kbd>
              open
            </span>
            <span className="ml-auto">
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
          </div>
        </Modal>
      )}
    </>
  );
}

function ResultRow({
  result,
  active,
  onMouseEnter,
  onClick,
}: {
  result: Result;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {result.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.thumb}
            alt=""
            width={20}
            height={20}
            className="rounded-full shrink-0"
          />
        ) : (
          <span
            className="w-5 h-5 rounded grid place-items-center text-[9px] font-bold shrink-0"
            style={{
              background: `${result.badgeColor}22`,
              color: result.badgeColor,
              border: `1px solid ${result.badgeColor}33`,
            }}
          >
            {result.primary.slice(0, 2)}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{result.primary}</div>
          <div className="text-[11px] text-muted truncate">{result.secondary}</div>
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
        style={{
          background: `${result.badgeColor}15`,
          color: result.badgeColor,
        }}
      >
        {result.badge}
      </span>
      {active && <ArrowRight className="w-3.5 h-3.5 text-muted" />}
    </button>
  );
}

function EmptyTip() {
  return (
    <div className="px-3 py-10 text-center text-sm">
      <Search className="w-6 h-6 text-muted/40 mx-auto mb-3" />
      <div className="text-muted mb-1">Type to search across all markets</div>
      <div className="text-[11px] text-muted/70">
        Try: <span className="font-mono text-accent">BTC</span> ·{" "}
        <span className="font-mono text-accent">AAPL</span> ·{" "}
        <span className="font-mono text-accent">EUR/USD</span> ·{" "}
        <span className="font-mono text-accent">gold</span>
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-[12vh] bg-black/60 backdrop-blur-sm fade-in"
      onClick={onClose}
    >
      <div
        className="premium-card rounded-2xl w-full max-w-xl overflow-hidden border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CommandTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Search (Ctrl+K)"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors"
    >
      <Search className="w-3.5 h-3.5" />
      <span className="hidden md:inline">Search…</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1 py-0 rounded bg-white/[0.06] border border-white/[0.08] ml-1">
        ⌘K
      </kbd>
    </button>
  );
}
