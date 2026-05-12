"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Trash2, Loader2, Clock } from "lucide-react";
import type { TraderAccount } from "@/types/trader";

type Props = {
  accounts: TraderAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
};

const STATUS_BADGE: Record<TraderAccount["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "text-muted bg-white/[0.05]" },
  connecting: { label: "Connecting", cls: "text-amber-300 bg-amber-500/10" },
  connected: { label: "Connected", cls: "text-emerald-300 bg-emerald-500/10" },
  error: { label: "Error", cls: "text-danger bg-danger/10" },
  disconnected: { label: "Disconnected", cls: "text-muted bg-white/[0.05]" },
};

function relativeTime(iso: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AccountList({ accounts, selectedId, onSelect, onChanged }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function syncAccount(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/trader/${id}/sync`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Sync failed (${res.status})`);
      }
      onChanged();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm("Disconnect this account? Cached history will be deleted.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/trader/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Delete failed (${res.status})`);
      }
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-6 text-center text-sm text-muted">
        No accounts connected yet. Add one above to start tracking trades.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((a) => {
        const badge = STATUS_BADGE[a.status];
        const isSelected = a.id === selectedId;
        const Icon = a.status === "connected" ? CheckCircle2 : AlertCircle;
        return (
          <div
            key={a.id}
            className={`premium-card rounded-2xl p-4 cursor-pointer transition-colors ${
              isSelected ? "ring-1 ring-accent/40" : "hover:bg-white/[0.02]"
            }`}
            onClick={() => onSelect(a.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 mt-0.5 ${
                  a.status === "connected" ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">{a.display_name}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-muted">{a.platform}</span>
                </div>
                <div className="text-xs text-muted mt-1">
                  {a.broker} · {a.server} · #{a.login}
                </div>
                <div className="text-[11px] text-muted mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last sync {relativeTime(a.last_synced_at)}
                </div>
                {a.status === "error" && a.status_message && (
                  <div className="text-[11px] text-danger mt-1 line-clamp-2">{a.status_message}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    syncAccount(a.id);
                  }}
                  disabled={busyId === a.id || a.status !== "connected"}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-white/[0.06] disabled:opacity-30"
                  title="Sync trades"
                >
                  {busyId === a.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAccount(a.id);
                  }}
                  disabled={busyId === a.id}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-danger hover:bg-danger/10 disabled:opacity-30"
                  title="Disconnect"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
