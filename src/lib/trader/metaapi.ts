// Thin REST wrapper around MetaApi.cloud — used to:
//   1. provision an MT4/MT5 account using user-supplied credentials
//   2. pull history orders + deals for that account
//   3. read live account information (balance, equity, etc.)
//
// Docs: https://metaapi.cloud/docs/client/restApi/

import type { AccountInfo, Platform } from "@/types/trader";

const REGION = process.env.METAAPI_REGION ?? "new-york";

function provisioningBase() {
  return `https://mt-provisioning-api-v1.${REGION}.agiliumtrade.ai`;
}

function clientBase() {
  return `https://mt-client-api-v1.${REGION}.agiliumtrade.ai`;
}

function token() {
  const t = process.env.METAAPI_TOKEN;
  if (!t) {
    throw new Error(
      "METAAPI_TOKEN is not set. Create a free account at https://metaapi.cloud and copy the token."
    );
  }
  return t;
}

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "auth-token": token(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MetaApi ${res.status}: ${body.slice(0, 400)}`);
  }
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Account provisioning
// ---------------------------------------------------------------------------

type ProvisionInput = {
  login: string;
  password: string;
  server: string;
  platform: Platform;
  name: string;
};

type ProvisionedAccount = { id: string; state: string };

export async function provisionAccount(input: ProvisionInput): Promise<ProvisionedAccount> {
  return call<ProvisionedAccount>(`${provisioningBase()}/users/current/accounts`, {
    method: "POST",
    body: JSON.stringify({
      login: input.login,
      password: input.password,
      server: input.server,
      platform: input.platform,
      name: input.name,
      magic: 0,
      type: "cloud",
      region: REGION,
      // "investor" connection — read-only access; cannot place trades.
      // Falls back to "master" if broker rejects the investor flag.
      keywords: ["investor"],
    }),
  });
}

export async function deployAccount(id: string): Promise<void> {
  await call(`${provisioningBase()}/users/current/accounts/${id}/deploy`, { method: "POST" });
}

export async function deleteAccount(id: string): Promise<void> {
  await call(`${provisioningBase()}/users/current/accounts/${id}`, { method: "DELETE" });
}

type AccountStateResponse = { state: string; connectionStatus?: string };

export async function getAccountState(id: string): Promise<AccountStateResponse> {
  return call<AccountStateResponse>(`${provisioningBase()}/users/current/accounts/${id}`);
}

// ---------------------------------------------------------------------------
// Trading data
// ---------------------------------------------------------------------------

type RawAccountInformation = {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel?: number;
  currency: string;
  leverage?: number;
  profit?: number;
};

export async function getAccountInformation(id: string): Promise<AccountInfo> {
  const raw = await call<RawAccountInformation>(
    `${clientBase()}/users/current/accounts/${id}/account-information`
  );
  return {
    balance: raw.balance,
    equity: raw.equity,
    margin: raw.margin,
    free_margin: raw.freeMargin,
    margin_level: raw.marginLevel ?? null,
    currency: raw.currency,
    leverage: raw.leverage ?? null,
    profit: raw.profit ?? 0,
  };
}

export type RawHistoryOrder = {
  id: string;
  type: string;
  state: string;
  symbol: string;
  magic?: number;
  time: string;
  doneTime?: string;
  volume?: number;
  currentVolume?: number;
  openPrice?: number;
  currentPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  profit?: number;
};

export type RawHistoryDeal = {
  id: string;
  orderId?: string;
  type: string;
  entryType?: string;
  symbol: string;
  time: string;
  volume?: number;
  price?: number;
  commission?: number;
  swap?: number;
  profit?: number;
  comment?: string;
};

function iso(d: Date): string {
  return d.toISOString();
}

export async function getHistoryOrders(
  id: string,
  from: Date,
  to: Date
): Promise<RawHistoryOrder[]> {
  const data = await call<{ historyOrders: RawHistoryOrder[] }>(
    `${clientBase()}/users/current/accounts/${id}/history-orders/time/${iso(from)}/${iso(to)}`
  );
  return data.historyOrders ?? [];
}

export async function getHistoryDeals(
  id: string,
  from: Date,
  to: Date
): Promise<RawHistoryDeal[]> {
  const data = await call<{ deals: RawHistoryDeal[] }>(
    `${clientBase()}/users/current/accounts/${id}/history-deals/time/${iso(from)}/${iso(to)}`
  );
  return data.deals ?? [];
}
