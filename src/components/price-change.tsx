import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

export default function PriceChange({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={cn("text-muted", className)}>—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        positive ? "text-success" : "text-danger",
        className
      )}
    >
      {formatPercent(value)}
    </span>
  );
}
