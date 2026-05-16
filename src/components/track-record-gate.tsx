"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Lock,
  Shield,
  Loader2,
  X,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";
import { BROKER_LIST, BROKERS, type BrokerId } from "@/lib/brokers";

export default function TrackRecordGate() {
  const [open, setOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
      <div className="mb-6">
        <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" />
          AI Track Record
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          How are AI picks performing?
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Past picks tracked from their generation time to current price. Helps
          you evaluate whether AI recommendations are working over time.
        </p>
      </div>

      <div className="premium-card rounded-2xl p-6 sm:p-10">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="icon-tile mb-5" style={{ width: 56, height: 56, color: "#fbbf24" }}>
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Connect a broker to view AI Track Record
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Track Record is reserved for connected accounts. Link your broker
            with an API key or read-only credentials — we use it only to verify
            your account.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            <Shield className="w-4 h-4" />
            Connect Broker
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="mt-7 w-full">
            <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-3">
              Supported Brokers
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {BROKER_LIST.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: b.color }}
                  />
                  <span className="text-xs font-semibold">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 text-[11px] text-muted leading-relaxed">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Credentials are sent over HTTPS and used only to verify your
              account. We never store API secrets or place trades.
            </span>
          </div>
        </div>
      </div>

      {open && <ConnectModal onClose={() => setOpen(false)} />}
    </section>
  );
}

function ConnectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<BrokerId | null>(null);
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, submitting]);

  const cfg = selected ? BROKERS[selected] : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/broker/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker: selected, credentials: creds }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Verification failed");
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="premium-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="icon-tile" style={{ width: 36, height: 36, color: "#fbbf24" }}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {cfg ? `Connect ${cfg.name}` : "Choose your broker"}
              </div>
              <div className="text-[11px] text-muted">
                {cfg ? "Enter credentials to verify" : "Pick where you trade"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white/[0.06] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className="icon-tile mb-4"
                style={{ width: 48, height: 48, color: "#10b981" }}
              >
                <Check className="w-5 h-5" />
              </div>
              <div className="font-bold mb-1">Connected!</div>
              <div className="text-xs text-muted">Unlocking Track Record…</div>
            </div>
          ) : !cfg ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BROKER_LIST.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelected(b.id);
                    setCreds({});
                    setError(null);
                  }}
                  className="text-left flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-colors"
                >
                  <span
                    className="w-9 h-9 rounded-lg grid place-items-center text-[11px] font-bold shrink-0"
                    style={{
                      background: `${b.color}22`,
                      color: b.color,
                      border: `1px solid ${b.color}33`,
                    }}
                  >
                    {b.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{b.name}</span>
                    <span className="block text-[11px] text-muted leading-snug mt-0.5">
                      {b.blurb}
                    </span>
                    <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      {b.category === "crypto" ? "Crypto Exchange" : "CFD / Forex"}
                      {b.liveVerify ? " · Live verify" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setError(null);
                }}
                className="text-[11px] text-muted hover:text-foreground transition-colors"
              >
                ← Choose different broker
              </button>

              {cfg.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                    {f.label}
                    {f.required && <span className="text-danger ml-1">*</span>}
                  </span>
                  <input
                    type={f.type}
                    autoComplete="off"
                    spellCheck={false}
                    value={creds[f.key] ?? ""}
                    onChange={(e) =>
                      setCreds((c) => ({ ...c, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    required={f.required}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:bg-white/[0.05] focus:border-accent/40 focus:outline-none text-sm font-mono transition-colors disabled:opacity-50"
                  />
                  {f.hint && (
                    <span className="block text-[10px] text-muted mt-1">
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20">
                  <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <span className="text-xs text-danger">{error}</span>
                </div>
              )}

              <div className="flex items-start gap-2 text-[10px] text-muted leading-relaxed pt-1">
                <Shield className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  {cfg.liveVerify
                    ? `We'll call ${cfg.name} to verify these credentials. Use read-only API keys.`
                    : "We verify the format only — credentials stay in your session."}
                  {cfg.helpUrl && (
                    <>
                      {" "}
                      <a
                        href={cfg.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Where do I find these?
                      </a>
                    </>
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Verify & Unlock
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
