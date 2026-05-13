import { NextRequest } from "next/server";
import { z } from "zod";
import { getOrCreateAnonUser, getServerClient } from "@/lib/supabase/server";
import { encryptSecret } from "@/lib/trader/crypto";
import { provisionAccount, deployAccount } from "@/lib/trader/metaapi";
import type { ConnectRequest } from "@/types/trader";

export const runtime = "nodejs";

const schema = z.object({
  platform: z.enum(["mt4", "mt5"]),
  broker: z.string().min(1).max(80),
  server: z.string().min(1).max(120),
  login: z.string().min(1).max(40),
  password: z.string().min(1).max(200),
  display_name: z.string().min(1).max(80),
}) satisfies z.ZodType<ConnectRequest>;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const body = parsed.data;

  const user = await getOrCreateAnonUser();
  const supabase = await getServerClient();

  // Insert pending row first so the UI can show progress and we have an id to update.
  const { data: inserted, error: insertErr } = await supabase
    .from("trader_accounts")
    .insert({
      user_id: user.id,
      platform: body.platform,
      broker: body.broker,
      server: body.server,
      login: body.login,
      display_name: body.display_name,
      encrypted_password: encryptSecret(body.password),
      status: "connecting",
    })
    .select("*")
    .single();

  if (insertErr || !inserted) {
    if (insertErr?.code === "23505") {
      return Response.json(
        { error: "This account is already connected." },
        { status: 409 }
      );
    }
    return Response.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  try {
    const provisioned = await provisionAccount({
      login: body.login,
      password: body.password,
      server: body.server,
      platform: body.platform,
      name: body.display_name,
    });
    await deployAccount(provisioned.id);

    const { data: updated } = await supabase
      .from("trader_accounts")
      .update({
        metaapi_account_id: provisioned.id,
        status: "connected",
        status_message: null,
      })
      .eq("id", inserted.id)
      .select("*")
      .single();

    return Response.json({ account: updated ?? inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    await supabase
      .from("trader_accounts")
      .update({ status: "error", status_message: message })
      .eq("id", inserted.id);
    return Response.json({ error: message }, { status: 502 });
  }
}
