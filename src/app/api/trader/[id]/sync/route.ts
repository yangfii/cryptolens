import { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { syncAccount } from "@/lib/trader/sync";
import type { SyncSummary } from "@/types/trader";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getServerClient();

  const { data: account, error: fetchErr } = await supabase
    .from("trader_accounts")
    .select("id, metaapi_account_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });
  if (!account) return Response.json({ error: "Not found" }, { status: 404 });
  if (!account.metaapi_account_id) {
    return Response.json(
      { error: "Account is not provisioned with MetaApi yet" },
      { status: 409 }
    );
  }

  try {
    const result = await syncAccount({
      supabase,
      accountId: account.id,
      metaApiAccountId: account.metaapi_account_id,
    });

    const now = new Date().toISOString();
    await supabase
      .from("trader_accounts")
      .update({ last_synced_at: now, status: "connected", status_message: null })
      .eq("id", account.id);

    const summary: SyncSummary = {
      account_id: account.id,
      orders_added: result.orders_added,
      deals_added: result.deals_added,
      last_synced_at: now,
      account_info: result.account_info,
    };
    return Response.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    await supabase
      .from("trader_accounts")
      .update({ status: "error", status_message: message })
      .eq("id", account.id);
    return Response.json({ error: message }, { status: 502 });
  }
}
