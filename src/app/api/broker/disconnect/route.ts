import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BROKER_COOKIE, MT_ACCOUNT_COOKIE } from "@/lib/brokers";
import { deleteAccount } from "@/lib/metaapi";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const mtAccountId = cookieStore.get(MT_ACCOUNT_COOKIE)?.value;
  if (mtAccountId) {
    // Free up the MetaAPI account so we stop being billed for it.
    deleteAccount(mtAccountId).catch(() => {});
  }
  cookieStore.delete(BROKER_COOKIE);
  cookieStore.delete(MT_ACCOUNT_COOKIE);
  return NextResponse.json({ ok: true });
}
