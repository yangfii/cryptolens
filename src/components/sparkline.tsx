export default function Sparkline({
  data,
  width = 120,
  height = 36,
  responsive = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  responsive?: boolean;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg
      width={responsive ? "100%" : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={responsive ? "none" : "xMidYMid meet"}
      aria-hidden="true"
      className={responsive ? "block" : undefined}
    >
      <path
        d={path}
        fill="none"
        strokeWidth="1.5"
        className={up ? "sparkline-up" : "sparkline-down"}
      />
    </svg>
  );
}
