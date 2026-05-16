"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

type Props = {
  brokerName: string;
  brokerColor: string;
};

export default function ConnectedBadge({ brokerName, brokerColor }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/broker/disconnect", { method: "POST" });
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2 text-[11px]">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold uppercase tracking-wider"
        style={{
          background: `${brokerColor}1f`,
          color: brokerColor,
          borderColor: `${brokerColor}33`,
        }}
      >
        <Check className="w-3 h-3" />
        Connected · {brokerName}
      </span>
      <button
        type="button"
        onClick={disconnect}
        disabled={busy}
        className="text-muted hover:text-foreground transition-colors disabled:opacity-50 inline-flex items-center gap-1"
      >
        {busy && <Loader2 className="w-3 h-3 animate-spin" />}
        Disconnect
      </button>
    </div>
  );
}
