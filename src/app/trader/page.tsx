"use client";

import { useCallback, useEffect, useState } from "react";
import { LineChart, Plug2 } from "lucide-react";
import useSWR from "swr";
import ConnectForm from "@/components/trader/connect-form";
import AccountList from "@/components/trader/account-list";
import AccountSummary from "@/components/trader/account-summary";
import HistoryTable from "@/components/trader/history-table";
import EquityChart from "@/components/trader/equity-chart";
import type { HistoryResponse, TraderAccount } from "@/types/trader";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

export default function TraderPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: accountsData,
    mutate: refreshAccounts,
    isLoading: accountsLoading,
  } = useSWR<{ accounts: TraderAccount[] }>("/api/trader/accounts", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const accounts = accountsData?.accounts ?? [];

  // Auto-select the first account when the list loads.
  useEffect(() => {
    if (!selectedId && accounts.length > 0) setSelectedId(accounts[0].id);
    if (selectedId && !accounts.some((a) => a.id === selectedId)) {
      setSelectedId(accounts[0]?.id ?? null);
    }
  }, [accounts, selectedId]);

  const { data: history, mutate: refreshHistory } = useSWR<HistoryResponse>(
    selectedId ? `/api/trader/${selectedId}/history` : null,
    fetcher
  );

  const onConnected = useCallback(
    (account: TraderAccount) => {
      refreshAccounts();
      setSelectedId(account.id);
    },
    [refreshAccounts]
  );

  const onAccountsChanged = useCallback(() => {
    refreshAccounts();
    refreshHistory();
  }, [refreshAccounts, refreshHistory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-tile text-accent" style={{ width: 44, height: 44 }}>
            <Plug2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              Trader Connect
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your Live Trading Accounts
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Link your MT4 / MT5 / CXM accounts with a read-only investor password.
          We securely pull your balance, equity, and full buy / sell order history into one dashboard.
        </p>
      </header>

      <div className="grid lg:grid-cols-[360px,1fr] gap-6">
        <div className="space-y-4">
          <ConnectForm onConnected={onConnected} />
          <div>
            <div className="flex items-center gap-2 text-[11px] text-muted font-bold uppercase tracking-[0.15em] mb-2 px-1">
              <LineChart className="w-3 h-3" />
              Connected accounts
            </div>
            {accountsLoading ? (
              <div className="premium-card rounded-2xl p-6 text-center text-sm text-muted">
                Loading…
              </div>
            ) : (
              <AccountList
                accounts={accounts}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChanged={onAccountsChanged}
              />
            )}
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          {history?.account ? (
            <>
              <AccountSummary account={history.account} info={history.account_info} />
              <EquityChart deals={history.deals} />
              <HistoryTable orders={history.orders} />
            </>
          ) : selectedId ? (
            <div className="premium-card rounded-2xl p-10 text-center text-sm text-muted">
              Loading account data…
            </div>
          ) : (
            <div className="premium-card rounded-2xl p-10 text-center text-sm text-muted">
              Connect an account to see balance, equity, and trade history here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
