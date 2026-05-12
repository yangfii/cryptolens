import { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAccountInformation } from "@/lib/trader/metaapi";
import type { HistoryResponse } from "@/types/trader";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 1000);

  const supabase = await getServerClient();

  const { data: account, error: accountErr } = await supabase
    .from("trader_accounts")
    .select(
      "id, user_id, platform, broker, server, login, display_name, metaapi_account_id, status, status_message, last_synced_at, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (accountErr) return Response.json({ error: accountErr.message }, { status: 500 });
  if (!account) return Response.json({ error: "Not found" }, { status: 404 });

  const [ordersRes, dealsRes, infoRes] = await Promise.all([
    supabase
      .from("mt_orders")
      .select("*")
      .eq("account_id", id)
      .order("opened_at", { ascending: false })
      .limit(limit),
    supabase
      .from("mt_deals")
      .select("*")
      .eq("account_id", id)
      .order("executed_at", { ascending: false })
      .limit(limit),
    account.metaapi_account_id
      ? getAccountInformation(account.metaapi_account_id).catch(() => null)
      : Promise.resolve(null),
  ]);

  if (ordersRes.error) return Response.json({ error: ordersRes.error.message }, { status: 500 });
  if (dealsRes.error) return Response.json({ error: dealsRes.error.message }, { status: 500 });

  const response: HistoryResponse = {
    account,
    account_info: infoRes,
    orders: ordersRes.data ?? [],
    deals: dealsRes.data ?? [],
  };
  return Response.json(response);
}
