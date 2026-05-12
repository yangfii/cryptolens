// Pulls history orders + deals from MetaApi and upserts into Supabase.
// Returns counts of new rows so the UI can show "X new trades".

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAccountInformation,
  getHistoryDeals,
  getHistoryOrders,
  type RawHistoryDeal,
  type RawHistoryOrder,
} from "./metaapi";
import type { AccountInfo, MtOrderSide } from "@/types/trader";

const DEFAULT_LOOKBACK_DAYS = 180;

function sideFromRawOrder(raw: RawHistoryOrder): MtOrderSide {
  // MetaApi returns types like ORDER_TYPE_BUY, ORDER_TYPE_SELL, ORDER_TYPE_BUY_LIMIT, etc.
  switch (raw.type) {
    case "ORDER_TYPE_BUY":
      return "buy";
    case "ORDER_TYPE_SELL":
      return "sell";
    case "ORDER_TYPE_BUY_LIMIT":
      return "buy_limit";
    case "ORDER_TYPE_SELL_LIMIT":
      return "sell_limit";
    case "ORDER_TYPE_BUY_STOP":
      return "buy_stop";
    case "ORDER_TYPE_SELL_STOP":
      return "sell_stop";
    default:
      return "buy";
  }
}

type SyncResult = {
  orders_added: number;
  deals_added: number;
  account_info: AccountInfo | null;
};

export async function syncAccount(opts: {
  supabase: SupabaseClient;
  accountId: string;
  metaApiAccountId: string;
  lookbackDays?: number;
}): Promise<SyncResult> {
  const { supabase, accountId, metaApiAccountId } = opts;
  const lookback = opts.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;

  const to = new Date();
  const from = new Date(to.getTime() - lookback * 24 * 60 * 60 * 1000);

  const [rawOrders, rawDeals, accountInfo] = await Promise.all([
    getHistoryOrders(metaApiAccountId, from, to),
    getHistoryDeals(metaApiAccountId, from, to),
    getAccountInformation(metaApiAccountId).catch(() => null),
  ]);

  const orderRows = rawOrders.map((o) => ({
    account_id: accountId,
    ticket: o.id,
    symbol: o.symbol,
    side: sideFromRawOrder(o),
    volume: o.volume ?? o.currentVolume ?? 0,
    open_price: o.openPrice ?? null,
    close_price: o.currentPrice ?? null,
    stop_loss: o.stopLoss ?? null,
    take_profit: o.takeProfit ?? null,
    profit: o.profit ?? null,
    commission: null,
    swap: null,
    comment: o.comment ?? null,
    opened_at: o.time,
    closed_at: o.doneTime ?? null,
    state: o.state,
  }));

  const dealRows = rawDeals.map((d) => ({
    account_id: accountId,
    ticket: d.id,
    order_ticket: d.orderId ?? null,
    symbol: d.symbol,
    type: d.type,
    entry_type: d.entryType ?? null,
    volume: d.volume ?? 0,
    price: d.price ?? 0,
    profit: d.profit ?? 0,
    commission: d.commission ?? 0,
    swap: d.swap ?? 0,
    comment: d.comment ?? null,
    executed_at: d.time,
  }));

  let orders_added = 0;
  let deals_added = 0;

  if (orderRows.length > 0) {
    const { error, count } = await supabase
      .from("mt_orders")
      .upsert(orderRows, { onConflict: "account_id,ticket", count: "exact", ignoreDuplicates: false });
    if (error) throw new Error(`mt_orders upsert: ${error.message}`);
    orders_added = count ?? orderRows.length;
  }

  if (dealRows.length > 0) {
    const { error, count } = await supabase
      .from("mt_deals")
      .upsert(dealRows, { onConflict: "account_id,ticket", count: "exact", ignoreDuplicates: false });
    if (error) throw new Error(`mt_deals upsert: ${error.message}`);
    deals_added = count ?? dealRows.length;
  }

  return { orders_added, deals_added, account_info: accountInfo };
}
