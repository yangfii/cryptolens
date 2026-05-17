type Props = {
  points: number[];
  positive: boolean;
  width?: number;
  height?: number;
};

/**
 * Tiny inline SVG sparkline — no JS, no recharts overhead, server-renderable.
 */
export default function InlineSparkline({
  points,
  positive,
  width = 90,
  height = 28,
}: Props) {
  if (points.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="text-[10px] text-muted/40 flex items-center justify-center"
      >
        —
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const stepX = width / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = positive ? "#10b981" : "#f43f5e";
  const fill = positive ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)";
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <path d={area} fill={fill} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
