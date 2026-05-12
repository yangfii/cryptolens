-- ============================================================================
-- Trader Connect schema
-- Tracks MT4 / MT5 / CXM accounts that the user has linked via MetaApi,
-- plus their historical orders and deals.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- trader_accounts
-- ---------------------------------------------------------------------------
create table if not exists public.trader_accounts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  platform            text not null check (platform in ('mt4', 'mt5')),
  broker              text not null,
  server              text not null,
  login               text not null,
  display_name        text not null,
  encrypted_password  text not null,
  metaapi_account_id  text,
  status              text not null default 'pending'
                       check (status in ('pending', 'connecting', 'connected', 'error', 'disconnected')),
  status_message      text,
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now(),
  unique (user_id, login, server, platform)
);

create index if not exists trader_accounts_user_id_idx on public.trader_accounts (user_id);

-- ---------------------------------------------------------------------------
-- mt_orders
-- ---------------------------------------------------------------------------
create table if not exists public.mt_orders (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.trader_accounts (id) on delete cascade,
  ticket        text not null,
  symbol        text not null,
  side          text not null,
  volume        numeric not null,
  open_price    numeric,
  close_price   numeric,
  stop_loss     numeric,
  take_profit   numeric,
  profit        numeric,
  commission    numeric,
  swap          numeric,
  comment       text,
  opened_at     timestamptz not null,
  closed_at     timestamptz,
  state         text not null,
  unique (account_id, ticket)
);

create index if not exists mt_orders_account_opened_idx
  on public.mt_orders (account_id, opened_at desc);

-- ---------------------------------------------------------------------------
-- mt_deals
-- ---------------------------------------------------------------------------
create table if not exists public.mt_deals (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.trader_accounts (id) on delete cascade,
  ticket          text not null,
  order_ticket    text,
  symbol          text not null,
  type            text not null,
  entry_type      text,
  volume          numeric not null default 0,
  price           numeric not null default 0,
  profit          numeric not null default 0,
  commission      numeric not null default 0,
  swap            numeric not null default 0,
  comment         text,
  executed_at     timestamptz not null,
  unique (account_id, ticket)
);

create index if not exists mt_deals_account_executed_idx
  on public.mt_deals (account_id, executed_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.trader_accounts enable row level security;
alter table public.mt_orders        enable row level security;
alter table public.mt_deals         enable row level security;

drop policy if exists "trader_accounts_owner_select" on public.trader_accounts;
create policy "trader_accounts_owner_select"
  on public.trader_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "trader_accounts_owner_insert" on public.trader_accounts;
create policy "trader_accounts_owner_insert"
  on public.trader_accounts for insert
  with check (auth.uid() = user_id);

drop policy if exists "trader_accounts_owner_update" on public.trader_accounts;
create policy "trader_accounts_owner_update"
  on public.trader_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trader_accounts_owner_delete" on public.trader_accounts;
create policy "trader_accounts_owner_delete"
  on public.trader_accounts for delete
  using (auth.uid() = user_id);

drop policy if exists "mt_orders_owner_select" on public.mt_orders;
create policy "mt_orders_owner_select"
  on public.mt_orders for select
  using (exists (
    select 1 from public.trader_accounts a
    where a.id = mt_orders.account_id and a.user_id = auth.uid()
  ));

drop policy if exists "mt_deals_owner_select" on public.mt_deals;
create policy "mt_deals_owner_select"
  on public.mt_deals for select
  using (exists (
    select 1 from public.trader_accounts a
    where a.id = mt_deals.account_id and a.user_id = auth.uid()
  ));
