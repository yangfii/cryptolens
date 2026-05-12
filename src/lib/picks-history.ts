import fs from "fs/promises";
import path from "path";
import { getTopCoins } from "@/lib/coingecko";

// ============================================================================
// File-based snapshot storage for AI Daily Picks performance tracking.
// In production, replace with Supabase or another persistent DB.
// ============================================================================

const HISTORY_FILE = path.join(process.cwd(), "data", "picks-history.json");
const MAX_SNAPSHOTS = 60;

export type PickSnapshot = {
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  priceAtPick: number;
  category: string;
  riskLevel: "low" | "medium" | "high";
};

export type HistorySnapshot = {
  id: string;
  generatedAt: string;
  picks: PickSnapshot[];
};

export type PickPerformance = PickSnapshot & {
  currentPrice: number;
  changePct: number;
};

export type SnapshotPerformance = {
  id: string;
  generatedAt: string;
  picks: PickPerformance[];
  avgChangePct: number;
  winRate: number;
};

async function readHistory(): Promise<{ snapshots: HistorySnapshot[] }> {
  try {
    const data = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { snapshots: [] };
  }
}

async function writeHistory(data: { snapshots: HistorySnapshot[] }) {
  await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
  await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
}

export async function recordSnapshot(picks: PickSnapshot[]): Promise<void> {
  if (picks.length === 0) return;
  const data = await readHistory();
  const snapshot: HistorySnapshot = {
    id: `snap_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    picks,
  };
  data.snapshots.push(snapshot);
  if (data.snapshots.length > MAX_SNAPSHOTS) {
    data.snapshots = data.snapshots.slice(-MAX_SNAPSHOTS);
  }
  await writeHistory(data);
}

export async function getHistory(): Promise<HistorySnapshot[]> {
  const data = await readHistory();
  return data.snapshots ?? [];
}

export async function getRecentSnapshotsWithPerformance(
  limit = 5
): Promise<{
  snapshots: SnapshotPerformance[];
  overallStats: {
    totalPicks: number;
    avgChangePct: number;
    winRate: number;
    bestPick: PickPerformance | null;
    worstPick: PickPerformance | null;
  };
}> {
  const snapshots = await getHistory();
  if (snapshots.length === 0) {
    return {
      snapshots: [],
      overallStats: {
        totalPicks: 0,
        avgChangePct: 0,
        winRate: 0,
        bestPick: null,
        worstPick: null,
      },
    };
  }

  // Get current prices for all unique coins
  let livePrices: Record<string, number> = {};
  try {
    const coins = await getTopCoins(1, 50);
    livePrices = Object.fromEntries(coins.map((c) => [c.id, c.current_price]));
  } catch {
    // If CoinGecko fails, return empty performance
    return {
      snapshots: [],
      overallStats: {
        totalPicks: 0,
        avgChangePct: 0,
        winRate: 0,
        bestPick: null,
        worstPick: null,
      },
    };
  }

  const recent = snapshots.slice(-limit).reverse();

  const perfSnapshots: SnapshotPerformance[] = recent.map((snap) => {
    const picks: PickPerformance[] = snap.picks.map((p) => {
      const currentPrice = livePrices[p.coinId] ?? p.priceAtPick;
      const changePct = ((currentPrice - p.priceAtPick) / p.priceAtPick) * 100;
      return { ...p, currentPrice, changePct };
    });
    const avgChangePct =
      picks.reduce((sum, p) => sum + p.changePct, 0) / picks.length;
    const winRate =
      (picks.filter((p) => p.changePct > 0).length / picks.length) * 100;
    return {
      id: snap.id,
      generatedAt: snap.generatedAt,
      picks,
      avgChangePct,
      winRate,
    };
  });

  // Overall stats across all snapshots
  const allPicks = perfSnapshots.flatMap((s) => s.picks);
  let bestPick: PickPerformance | null = null;
  let worstPick: PickPerformance | null = null;
  let totalChange = 0;
  let wins = 0;
  for (const p of allPicks) {
    totalChange += p.changePct;
    if (p.changePct > 0) wins++;
    if (!bestPick || p.changePct > bestPick.changePct) bestPick = p;
    if (!worstPick || p.changePct < worstPick.changePct) worstPick = p;
  }
  const overallStats = {
    totalPicks: allPicks.length,
    avgChangePct: allPicks.length > 0 ? totalChange / allPicks.length : 0,
    winRate: allPicks.length > 0 ? (wins / allPicks.length) * 100 : 0,
    bestPick,
    worstPick,
  };

  return { snapshots: perfSnapshots, overallStats };
}
