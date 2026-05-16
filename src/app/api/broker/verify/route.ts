import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { BROKERS, BROKER_COOKIE, type BrokerId } from "@/lib/brokers";

export const runtime = "nodejs";

const VERIFY_TIMEOUT_MS = 10_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Broker did not respond in time")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function verifyBinance(apiKey: string, secret: string) {
  const ts = Date.now();
  const query = `timestamp=${ts}&recvWindow=5000`;
  const sig = crypto.createHmac("sha256", secret).update(query).digest("hex");
  const res = await fetch(
    `https://api.binance.com/api/v3/account?${query}&signature=${sig}`,
    {
      method: "GET",
      headers: { "X-MBX-APIKEY": apiKey },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    let msg = `Binance returned ${res.status}`;
    try {
      const j = await res.json();
      if (j.msg) msg = `Binance: ${j.msg}`;
    } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  if (!data || typeof data.accountType !== "string") {
    throw new Error("Binance: unexpected response");
  }
}

async function verifyOkx(apiKey: string, secret: string, passphrase: string) {
  const ts = new Date().toISOString();
  const path = "/api/v5/account/balance";
  const prehash = `${ts}GET${path}`;
  const sig = crypto.createHmac("sha256", secret).update(prehash).digest("base64");
  const res = await fetch(`https://www.okx.com${path}`, {
    method: "GET",
    headers: {
      "OK-ACCESS-KEY": apiKey,
      "OK-ACCESS-SIGN": sig,
      "OK-ACCESS-TIMESTAMP": ts,
      "OK-ACCESS-PASSPHRASE": passphrase,
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!data) throw new Error(`OKX returned ${res.status}`);
  if (data.code !== "0") {
    throw new Error(`OKX: ${data.msg || `code ${data.code}`}`);
  }
}

async function verifyBybit(apiKey: string, secret: string) {
  const ts = Date.now().toString();
  const recvWindow = "5000";
  const queryString = "accountType=UNIFIED";
  const prehash = ts + apiKey + recvWindow + queryString;
  const sig = crypto.createHmac("sha256", secret).update(prehash).digest("hex");
  const res = await fetch(
    `https://api.bybit.com/v5/account/wallet-balance?${queryString}`,
    {
      method: "GET",
      headers: {
        "X-BAPI-API-KEY": apiKey,
        "X-BAPI-SIGN": sig,
        "X-BAPI-TIMESTAMP": ts,
        "X-BAPI-RECV-WINDOW": recvWindow,
        "X-BAPI-SIGN-TYPE": "2",
      },
      cache: "no-store",
    },
  );
  const data = await res.json().catch(() => null);
  if (!data) throw new Error(`Bybit returned ${res.status}`);
  if (data.retCode !== 0) {
    throw new Error(`Bybit: ${data.retMsg || `code ${data.retCode}`}`);
  }
}

function validateMtFields(creds: Record<string, string>) {
  const acct = creds.accountNumber?.trim() ?? "";
  if (!/^\d{4,12}$/.test(acct)) {
    throw new Error("Account number must be 4–12 digits");
  }
  if ((creds.investorPassword?.length ?? 0) < 4) {
    throw new Error("Investor password is too short");
  }
  if ((creds.server?.trim().length ?? 0) < 3) {
    throw new Error("Server name looks invalid");
  }
}

function validateCtraderFields(creds: Record<string, string>) {
  if (!/^\d{4,12}$/.test(creds.accountId?.trim() ?? "")) {
    throw new Error("Account ID must be 4–12 digits");
  }
  if ((creds.authToken?.length ?? 0) < 8) {
    throw new Error("Access token looks too short");
  }
}

type Body = { broker?: BrokerId; credentials?: Record<string, string> };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const brokerId = body.broker;
  const creds = body.credentials ?? {};

  if (!brokerId || !(brokerId in BROKERS)) {
    return NextResponse.json(
      { ok: false, error: "Unknown broker" },
      { status: 400 },
    );
  }
  const cfg = BROKERS[brokerId];

  for (const f of cfg.fields) {
    if (f.required && !(creds[f.key]?.trim?.())) {
      return NextResponse.json(
        { ok: false, error: `${f.label} is required` },
        { status: 400 },
      );
    }
  }

  try {
    if (brokerId === "binance") {
      await withTimeout(
        verifyBinance(creds.apiKey, creds.apiSecret),
        VERIFY_TIMEOUT_MS,
      );
    } else if (brokerId === "okx") {
      await withTimeout(
        verifyOkx(creds.apiKey, creds.apiSecret, creds.passphrase),
        VERIFY_TIMEOUT_MS,
      );
    } else if (brokerId === "bybit") {
      await withTimeout(
        verifyBybit(creds.apiKey, creds.apiSecret),
        VERIFY_TIMEOUT_MS,
      );
    } else if (brokerId === "exness" || brokerId === "cxm") {
      validateMtFields(creds);
    } else if (brokerId === "ctrader") {
      validateCtraderFields(creds);
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(BROKER_COOKIE, brokerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({
    ok: true,
    broker: brokerId,
    name: cfg.name,
    liveVerified: cfg.liveVerify,
  });
}
