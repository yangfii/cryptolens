"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Search, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { formatPrice, formatCompact } from "@/lib/format";
import {
  ASSETS_BY_CATEGORY,
  CATEGORIES,
  type MarketCategory,
} from "@/lib/markets-catalog";
import InlineSparkline from "./inline-sparkline";

export type AssetRow = {
  href: string;
  symbol: string;
  display: string;
  shortName?: string | null;
  price: number;
  changePercent: number;
  currency: string;
  dayHigh?: number | null;
  dayLow?: number | null;
  volume?: number | null;
  sparkline?: number[];
};

type SortKey = "display" | "price" | "changePercent" | "volume";
type SortDir = "asc" | "desc";

type Props = {
  rows: AssetRow[];
  currentCategory: MarketCategory;
};

type CrossHit = {
  category: MarketCategory;
  display: string;
  shortName: string;
  href: string;
};

export default function AssetTable({ rows, currentCategory }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = rows;
    if (q) {
      result = result.filter(
        (r) =>
          r.display.toLowerCase().includes(q) ||
          (r.shortName ?? "").toLowerCase().includes(q) ||
          r.symbol.toLowerCase().includes(q),
      );
    }
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const av = pickSort(a, sortKey);
        const bv = pickSort(b, sortKey);
        if (av === null) return 1;
        if (bv === null) return -1;
        if (typeof av === "string" && typeof bv === "string") {
          return av.localeCompare(bv) * dir;
        }
        return ((av as number) - (bv as number)) * dir;
      });
    }
    return result;
  }, [rows, query, sortKey, sortDir]);

  // Cross-category matches — only computed when current category has 0 hits
  // and there's a real query. Searches the static Yahoo catalogs (crypto
  // can be reached via ⌘K).
  const crossHits = useMemo<CrossHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || filtered.length > 0) return [];
    const out: CrossHit[] = [];
    for (const catId of Object.keys(ASSETS_BY_CATEGORY) as Array<
      Exclude<MarketCategory, "crypto">
    >) {
      if (catId === currentCategory) continue;
      for (const e of ASSETS_BY_CATEGORY[catId]) {
        if (
          e.display.toLowerCase().includes(q) ||
          e.shortName.toLowerCase().includes(q) ||
          (e.yahooSymbol ?? "").toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q)
        ) {
          out.push({
            category: catId,
            display: e.display,
            shortName: e.shortName,
            href: `/markets/${catId}/${e.slug}`,
          });
        }
      }
    }
    return out.slice(0, 6);
  }, [query, filtered.length, currentCategory]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "display" ? "asc" : "desc");
    }
  }

  if (rows.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-12 text-center text-muted text-sm">
        No assets available right now. Try again in a moment.
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar: search + count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this category…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-colors"
          />
        </div>
        <div className="text-[11px] text-muted tabular-nums">
          {filtered.length} of {rows.length} assets
        </div>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted">
              <tr className="border-b border-white/[0.06]">
                <SortHeader
                  align="left"
                  active={sortKey === "display"}
                  dir={sortDir}
                  onClick={() => toggleSort("display")}
                >
                  Asset
                </SortHeader>
                <th className="text-right px-4 py-3 hidden md:table-cell font-bold">
                  5d Trend
                </th>
                <SortHeader
                  align="right"
                  active={sortKey === "price"}
                  dir={sortDir}
                  onClick={() => toggleSort("price")}
                >
                  Price
                </SortHeader>
                <SortHeader
                  align="right"
                  active={sortKey === "changePercent"}
                  dir={sortDir}
                  onClick={() => toggleSort("changePercent")}
                >
                  24h
                </SortHeader>
                <th className="text-right px-4 py-3 hidden lg:table-cell font-bold">
                  24h Range
                </th>
                <SortHeader
                  align="right"
                  active={sortKey === "volume"}
                  dir={sortDir}
                  onClick={() => toggleSort("volume")}
                  className="hidden lg:table-cell"
                >
                  Volume
                </SortHeader>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const up = row.changePercent >= 0;
                const rangePct =
                  row.dayHigh && row.dayLow && row.dayHigh > row.dayLow
                    ? ((row.price - row.dayLow) / (row.dayHigh - row.dayLow)) *
                      100
                    : null;
                return (
                  <tr
                    key={row.symbol}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link href={row.href} className="block group">
                        <div className="font-bold text-sm group-hover:text-accent transition-colors">
                          {row.display}
                        </div>
                        {row.shortName && (
                          <div className="text-[11px] text-muted truncate max-w-[200px]">
                            {row.shortName}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex justify-end">
                        <InlineSparkline
                          points={row.sparkline ?? []}
                          positive={up}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {formatPrice(row.price)}
                      {row.currency !== "USD" && (
                        <span className="text-[10px] text-muted ml-1">
                          {row.currency}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-bold text-sm ${
                        up ? "text-success" : "text-danger"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end">
                        {up ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {up ? "+" : ""}
                        {row.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {rangePct !== null && row.dayLow && row.dayHigh ? (
                        <div className="flex flex-col items-end gap-1 min-w-[140px]">
                          <div className="text-[10px] text-muted tabular-nums">
                            {formatPrice(row.dayLow)} – {formatPrice(row.dayHigh)}
                          </div>
                          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden relative">
                            <div
                              className="absolute w-1.5 h-1.5 rounded-full -mt-[1px]"
                              style={{
                                left: `calc(${Math.max(
                                  0,
                                  Math.min(100, rangePct),
                                )}% - 3px)`,
                                background: up ? "#10b981" : "#f43f5e",
                                top: "-1px",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-right text-[10px] text-muted/40">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell tabular-nums text-xs text-muted">
                      {row.volume ? formatCompact(row.volume) : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="max-w-md mx-auto text-center">
                      <div className="text-sm text-muted mb-1">
                        No assets in {CATEGORIES.find((c) => c.id === currentCategory)?.label} match
                        <span className="text-foreground font-semibold"> &ldquo;{query}&rdquo;</span>
                      </div>
                      {crossHits.length > 0 ? (
                        <>
                          <div className="text-[11px] text-muted mt-3 mb-2 uppercase tracking-wider font-semibold">
                            Found in other categories
                          </div>
                          <div className="flex flex-col gap-1.5 items-stretch">
                            {crossHits.map((h) => {
                              const cat = CATEGORIES.find(
                                (c) => c.id === h.category,
                              );
                              return (
                                <Link
                                  key={h.href}
                                  href={h.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors group"
                                >
                                  <span
                                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                                    style={{
                                      background: `${cat?.iconColor}15`,
                                      color: cat?.iconColor,
                                    }}
                                  >
                                    {cat?.label}
                                  </span>
                                  <span className="text-sm font-bold">{h.display}</span>
                                  <span className="text-[11px] text-muted truncate flex-1 text-left">
                                    {h.shortName}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-muted mt-2">
                          Try{" "}
                          <kbd className="font-mono px-1 py-0 rounded bg-white/[0.06] border border-white/[0.08] text-foreground">
                            ⌘K
                          </kbd>{" "}
                          to search across crypto and all markets.
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function pickSort(row: AssetRow, key: SortKey): number | string | null {
  switch (key) {
    case "display":
      return row.display;
    case "price":
      return row.price;
    case "changePercent":
      return row.changePercent;
    case "volume":
      return row.volume ?? null;
  }
}

function SortHeader({
  children,
  align,
  active,
  dir,
  onClick,
  className,
}: {
  children: React.ReactNode;
  align: "left" | "right";
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-bold ${
        align === "right" ? "text-right" : "text-left"
      } ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
          active ? "text-foreground" : ""
        }`}
      >
        {children}
        {active &&
          (dir === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          ))}
      </button>
    </th>
  );
}
