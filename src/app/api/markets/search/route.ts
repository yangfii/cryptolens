import { NextRequest, NextResponse } from "next/server";
import { searchCoins } from "@/lib/coingecko";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ crypto: [] });
  }
  try {
    const coins = await searchCoins(q);
    const ranked = coins
      .filter((c) => c.market_cap_rank != null && c.market_cap_rank <= 300)
      .slice(0, 5);
    return NextResponse.json({ crypto: ranked });
  } catch {
    return NextResponse.json({ crypto: [] });
  }
}
