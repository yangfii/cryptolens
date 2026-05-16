export type BrokerId =
  | "binance"
  | "okx"
  | "bybit"
  | "exness"
  | "cxm"
  | "ctrader";

export type BrokerField = {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
  required: boolean;
  hint?: string;
};

export type Broker = {
  id: BrokerId;
  name: string;
  category: "crypto" | "cfd";
  color: string;
  blurb: string;
  fields: BrokerField[];
  liveVerify: boolean;
  helpUrl?: string;
};

export const BROKERS: Record<BrokerId, Broker> = {
  binance: {
    id: "binance",
    name: "Binance",
    category: "crypto",
    color: "#f0b90b",
    blurb: "Largest crypto exchange. Read-only API key works.",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "text",
        required: true,
        placeholder: "64-char API key",
      },
      {
        key: "apiSecret",
        label: "Secret Key",
        type: "password",
        required: true,
        placeholder: "Secret key",
      },
    ],
    liveVerify: true,
    helpUrl: "https://www.binance.com/en/my/settings/api-management",
  },
  okx: {
    id: "okx",
    name: "OKX",
    category: "crypto",
    color: "#ffffff",
    blurb: "Top-5 crypto exchange. Needs passphrase too.",
    fields: [
      { key: "apiKey", label: "API Key", type: "text", required: true },
      { key: "apiSecret", label: "Secret Key", type: "password", required: true },
      {
        key: "passphrase",
        label: "Passphrase",
        type: "password",
        required: true,
        hint: "The passphrase you set when creating the API key",
      },
    ],
    liveVerify: true,
    helpUrl: "https://www.okx.com/account/my-api",
  },
  bybit: {
    id: "bybit",
    name: "Bybit",
    category: "crypto",
    color: "#f7a600",
    blurb: "Derivatives-focused crypto exchange.",
    fields: [
      { key: "apiKey", label: "API Key", type: "text", required: true },
      { key: "apiSecret", label: "Secret Key", type: "password", required: true },
    ],
    liveVerify: true,
    helpUrl: "https://www.bybit.com/app/user/api-management",
  },
  exness: {
    id: "exness",
    name: "Exness",
    category: "cfd",
    color: "#fdd534",
    blurb: "MT4 / MT5 forex & CFD broker.",
    fields: [
      {
        key: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "MT4 / MT5 account #",
      },
      {
        key: "investorPassword",
        label: "Investor Password",
        type: "password",
        required: true,
        hint: "Read-only password — never your main password",
      },
      {
        key: "server",
        label: "Server",
        type: "text",
        required: true,
        placeholder: "e.g. Exness-MT5Real8",
      },
    ],
    liveVerify: false,
  },
  cxm: {
    id: "cxm",
    name: "CXM Direct",
    category: "cfd",
    color: "#1a73e8",
    blurb: "MT4 / MT5 multi-asset broker.",
    fields: [
      {
        key: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
      },
      {
        key: "investorPassword",
        label: "Investor Password",
        type: "password",
        required: true,
        hint: "Read-only password",
      },
      {
        key: "server",
        label: "Server",
        type: "text",
        required: true,
        placeholder: "e.g. CXMDirect-Live",
      },
    ],
    liveVerify: false,
  },
  ctrader: {
    id: "ctrader",
    name: "cTrader",
    category: "cfd",
    color: "#22d3ee",
    blurb: "cTrader Open API — works with any cTrader broker.",
    fields: [
      {
        key: "accountId",
        label: "Account ID",
        type: "text",
        required: true,
        placeholder: "Numeric account ID",
      },
      {
        key: "authToken",
        label: "Access Token",
        type: "password",
        required: true,
        hint: "From cTrader Open API console",
      },
    ],
    liveVerify: false,
  },
};

export const BROKER_LIST: Broker[] = Object.values(BROKERS);

export const BROKER_COOKIE = "tr_broker";
