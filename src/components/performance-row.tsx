type Bucket = { label: string; value: number | null };

type Props = {
  buckets: Bucket[];
};

/** Horizontal performance scoreboard for 1d / 7d / 30d / 90d / 1y returns. */
export default function PerformanceRow({ buckets }: Props) {
  return (
    <div className="premium-card rounded-2xl p-5">
      <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-bold mb-3">
        Performance
      </div>
      <div className="grid grid-cols-5 gap-2">
        {buckets.map((b) => {
          const v = b.value;
          const up = v != null && v >= 0;
          const color =
            v == null ? "#7e7e95" : up ? "#10b981" : "#f43f5e";
          return (
            <div
              key={b.label}
              className="rounded-lg px-2 py-2.5 text-center"
              style={{
                background: v == null ? "rgba(126,126,149,0.05)" : up ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)",
                border: `1px solid ${v == null ? "rgba(126,126,149,0.15)" : up ? "rgba(16,185,129,0.18)" : "rgba(244,63,94,0.18)"}`,
              }}
            >
              <div className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                {b.label}
              </div>
              <div
                className="text-sm font-bold tabular-nums mt-1"
                style={{ color }}
              >
                {v == null ? "—" : `${up ? "+" : ""}${v.toFixed(2)}%`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
