import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BROKER_COOKIE } from "@/lib/brokers";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(BROKER_COOKIE);
  return NextResponse.json({ ok: true });
}
