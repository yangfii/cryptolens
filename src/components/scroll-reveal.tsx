"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale" | "blur" | "fade";

type Props = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  /** Trigger when this much of the element is visible. Default 0.15 (15%). */
  rootMargin?: string;
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className,
  threshold = 0.15,
  once = true,
  rootMargin = "0px 0px -50px 0px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't supported, just show
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal",
        `scroll-reveal-${direction}`,
        visible && "is-visible",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Wrap a list of children with staggered scroll-reveal.
 * Each child gets a delay step apart (default 80ms).
 */
export function ScrollRevealStagger({
  children,
  direction = "up",
  step = 80,
  initialDelay = 0,
  className,
}: {
  children: ReactNode[];
  direction?: Direction;
  step?: number;
  initialDelay?: number;
  className?: string;
}) {
  return (
    <>
      {children.map((child, i) => (
        <ScrollReveal
          key={i}
          direction={direction}
          delay={initialDelay + i * step}
          className={className}
        >
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}
