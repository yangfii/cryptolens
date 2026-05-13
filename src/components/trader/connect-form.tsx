"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plug, Lock, ServerCog } from "lucide-react";
import type { ConnectRequest, Platform, TraderAccount } from "@/types/trader";

type Props = {
  onConnected: (account: TraderAccount) => void;
};

const PLATFORMS: { value: Platform; label: string; desc: string }[] = [
  { value: "mt5", label: "MetaTrader 5", desc: "MT5 / latest brokers" },
  { value: "mt4", label: "MetaTrader 4", desc: "MT4 / legacy brokers" },
];

export default function ConnectForm({ onConnected }: Props) {
  const [platform, setPlatform] = useState<Platform>("mt5");
  const [broker, setBroker] = useState("CXM");
  const [server, setServer] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload: ConnectRequest = {
      platform,
      broker: broker.trim(),
      server: server.trim(),
      login: login.trim(),
      password,
      display_name: displayName.trim() || `${broker.trim()} ${login.trim()}`,
    };

    try {
      const res = await fetch("/api/trader/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Failed (${res.status})`);
      onConnected(data.account as TraderAccount);
      setLogin("");
      setPassword("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card rounded-2xl p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3">
          <Plug className="w-3.5 h-3.5" />
          Platform
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLATFORMS.map((p) => {
            const selected = platform === p.value;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-accent/40 bg-accent/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="font-bold text-sm">{p.label}</div>
                <div className="text-xs text-muted mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Broker"
          value={broker}
          onChange={setBroker}
          placeholder="CXM / Exness / IC Markets"
          required
        />
        <Field
          label="Server"
          value={server}
          onChange={setServer}
          placeholder="CXM-Live"
          required
          icon={ServerCog}
        />
        <Field
          label="Account login"
          value={login}
          onChange={setLogin}
          placeholder="123456"
          required
        />
        <Field
          label="Investor password"
          value={password}
          onChange={setPassword}
          placeholder="read-only password"
          type="password"
          required
          icon={Lock}
        />
        <div className="sm:col-span-2">
          <Field
            label="Display name (optional)"
            value={displayName}
            onChange={setDisplayName}
            placeholder="My main MT5"
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs text-amber-300/90 leading-relaxed">
        <strong className="text-amber-300">Use your investor (read-only) password.</strong>{" "}
        It can view balances and history but cannot place trades. We encrypt it with AES-256-GCM before
        storing it.
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/[0.06] p-3 text-xs text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !server || !login || !password || !broker}
        className="w-full btn-primary py-3 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting to broker…
          </>
        ) : (
          <>
            <Plug className="w-4 h-4" />
            Connect account
          </>
        )}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

function Field({ label, value, onChange, placeholder, type = "text", required, icon: Icon }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 text-[11px] text-muted font-semibold uppercase tracking-wider mb-1.5">
        {Icon ? <Icon className="w-3 h-3" /> : null}
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={type === "password" ? "new-password" : "off"}
        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50 text-sm"
      />
    </label>
  );
}
