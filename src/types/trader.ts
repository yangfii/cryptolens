// ============================================================================
// Trader Connect — Types
// ============================================================================

export type Platform = "mt4" | "mt5";

export type AccountStatus = "pending" | "connecting" | "connected" | "error" | "disconnected";

export type TraderAccount = {
  id: string;
  user_id: string;
  platform: Platform;
  broker: string;
  server: string;
  login: string;
  display_name: string;
  metaapi_account_id: string | null;
  status: AccountStatus;
  status_message: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export type AccountInfo = {
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number | null;
  currency: string;
  leverage: number | null;
  profit: number;
};

export type MtOrderSide = "buy" | "sell" | "buy_limit" | "sell_limit" | "buy_stop" | "sell_stop";

export type MtOrder = {
  id: string;
  account_id: string;
  ticket: string;
  symbol: string;
  side: MtOrderSide;
  volume: number;
  open_price: number | null;
  close_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  profit: number | null;
  commission: number | null;
  swap: number | null;
  comment: string | null;
  opened_at: string;
  closed_at: string | null;
  state: string;
};

export type MtDeal = {
  id: string;
  account_id: string;
  ticket: string;
  order_ticket: string | null;
  symbol: string;
  type: string;
  entry_type: string | null;
  volume: number;
  price: number;
  profit: number;
  commission: number;
  swap: number;
  comment: string | null;
  executed_at: string;
};

export type ConnectRequest = {
  platform: Platform;
  broker: string;
  server: string;
  login: string;
  password: string;
  display_name: string;
};

export type SyncSummary = {
  account_id: string;
  orders_added: number;
  deals_added: number;
  last_synced_at: string;
  account_info: AccountInfo | null;
};

export type HistoryResponse = {
  account: TraderAccount;
  account_info: AccountInfo | null;
  orders: MtOrder[];
  deals: MtDeal[];
};
