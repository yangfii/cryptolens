import { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { deleteAccount as deleteMetaApiAccount } from "@/lib/trader/metaapi";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getServerClient();

  const { data: account, error: fetchErr } = await supabase
    .from("trader_accounts")
    .select("id, metaapi_account_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });
  if (!account) return Response.json({ error: "Not found" }, { status: 404 });

  if (account.metaapi_account_id) {
    try {
      await deleteMetaApiAccount(account.metaapi_account_id);
    } catch {
      // Best-effort: continue even if MetaApi cleanup fails so the user can remove a broken row.
    }
  }

  const { error: delErr } = await supabase.from("trader_accounts").delete().eq("id", id);
  if (delErr) return Response.json({ error: delErr.message }, { status: 500 });
  return Response.json({ ok: true });
}
