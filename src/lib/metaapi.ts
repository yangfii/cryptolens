// MetaAPI client — verifies MT4/MT5 broker accounts by provisioning them
// on metaapi.cloud and reading account info. Documentation:
// https://metaapi.cloud/docs/provisioning/restApi/api/

const PROVISIONING_BASE =
  "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const CLIENT_BASE =
  "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

export type MtPlatform = "mt4" | "mt5";

export type MtCredentials = {
  platform: MtPlatform;
  login: string;
  password: string;
  server: string;
  /** Friendly name we'll store on MetaAPI side. */
  name?: string;
};

export type ProvisionedAccount = {
  id: string;
  state: string;
  connectionStatus: string;
};

export type MtAccountInfo = {
  broker: string;
  currency: string;
  server: string;
  balance: number;
  equity: number;
  leverage: number;
  marginLevel: number | null;
  name: string;
  login: number;
  platform: MtPlatform;
};

function token(): string {
  const t = process.env.METAAPI_TOKEN;
  if (!t) {
    throw new Error(
      "METAAPI_TOKEN is not set — live broker verification is unavailable.",
    );
  }
  return t;
}

async function api(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "auth-token": token(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

/**
 * Provision a new MT4/MT5 account on MetaAPI cloud. Returns the MetaAPI
 * account id (different from the broker login). The account starts in
 * DEPLOYING state and needs ~30s to reach CONNECTED.
 */
export async function provisionMtAccount(
  creds: MtCredentials,
): Promise<ProvisionedAccount> {
  const body = {
    name: creds.name ?? `sastra-${creds.login}`,
    type: "cloud-g1" as const,
    login: creds.login,
    password: creds.password,
    server: creds.server,
    platform: creds.platform,
    magic: 0,
    region: "new-york",
    application: "MetaApi",
    keywords: ["sastra-trader"],
  };

  const res = await api(PROVISIONING_BASE, "/users/current/accounts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || data?.error || `MetaAPI returned ${res.status}`;
    throw new Error(msg);
  }
  return {
    id: data.id,
    state: data.state ?? "UNDEPLOYED",
    connectionStatus: data.connectionStatus ?? "DISCONNECTED",
  };
}

export async function getAccount(id: string): Promise<ProvisionedAccount> {
  const res = await api(PROVISIONING_BASE, `/users/current/accounts/${id}`);
  if (!res.ok) {
    throw new Error(`MetaAPI getAccount returned ${res.status}`);
  }
  const data = await res.json();
  return {
    id: data._id ?? data.id,
    state: data.state,
    connectionStatus: data.connectionStatus,
  };
}

/**
 * Poll the account until connectionStatus = CONNECTED or timeout. Returns
 * true on success. Throws on broker-side failure (wrong creds, bad server).
 */
export async function waitForConnected(
  id: string,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let lastState = "";
  while (Date.now() < deadline) {
    const acc = await getAccount(id);
    lastState = `state=${acc.state}, connection=${acc.connectionStatus}`;
    if (acc.connectionStatus === "CONNECTED") return true;
    if (acc.state === "DELETING" || acc.state === "UNDEPLOY_FAILED") {
      throw new Error(
        "Broker rejected the credentials — check login, password, and server.",
      );
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(
    `Timed out waiting for broker connection (${lastState}). The server name may be wrong or the broker is slow to respond.`,
  );
}

/**
 * Read live account information (balance, equity, leverage, server, etc.).
 * Only works after the account is CONNECTED.
 */
export async function getAccountInformation(
  id: string,
): Promise<MtAccountInfo> {
  const res = await api(
    CLIENT_BASE,
    `/users/current/accounts/${id}/account-information`,
  );
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(
      data?.message || `MetaAPI account-information returned ${res.status}`,
    );
  }
  return {
    broker: data.broker,
    currency: data.currency,
    server: data.server,
    balance: data.balance,
    equity: data.equity,
    leverage: data.leverage,
    marginLevel: data.marginLevel ?? null,
    name: data.name,
    login: data.login,
    platform: data.platform as MtPlatform,
  };
}

export async function deleteAccount(id: string): Promise<void> {
  await api(PROVISIONING_BASE, `/users/current/accounts/${id}`, {
    method: "DELETE",
  });
}
