"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Formatter that runs on the animated number each frame. Use for currency/compact formatting. */
  format?: (n: number) => string;
  className?: string;
};

/**
 * Count-up number animation that triggers when scrolled into view.
 * Uses requestAnimationFrame + IntersectionObserver — no dependencies.
 */
export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        const startTime = performance.now();
        const startValue = 0;
        const targetValue = value;

        function tick(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = startValue + (targetValue - startValue) * eased;
          setDisplayValue(current);
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setDisplayValue(targetValue);
          }
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = format
    ? format(displayValue)
    : displayValue.toFixed(decimals);

  return (
    <span ref={ref} className={`count-up ${className ?? ""}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
