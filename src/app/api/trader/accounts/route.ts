import { getServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ accounts: [] });

  const { data, error } = await supabase
    .from("trader_accounts")
    .select(
      "id, user_id, platform, broker, server, login, display_name, metaapi_account_id, status, status_message, last_synced_at, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ accounts: data });
}
