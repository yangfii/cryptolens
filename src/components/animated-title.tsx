"use client";

import { useEffect, useState, type ReactNode } from "react";

type Line = {
  text: string;
  className?: string;
};

type Props = {
  lines: Line[];
  /** Delay between each word in ms. Default 90ms. */
  stagger?: number;
  /** Initial delay before first word. Default 100ms. */
  initialDelay?: number;
  className?: string;
};

/**
 * Animated hero title where words appear with staggered fade-up + blur-removal.
 * Each line can have its own className (e.g., for gradient styling) — the class
 * is applied to EACH word so that `background-clip: text` works correctly
 * (it doesn't inherit through inline-block descendants).
 */
export default function AnimatedTitle({
  lines,
  stagger = 90,
  initialDelay = 100,
  className,
}: Props) {
  const textKey = lines.map((l) => l.text).join("|");
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    setMountKey((k) => k + 1);
  }, [textKey]);

  let wordIndex = 0;

  return (
    <h1 className={className} key={mountKey}>
      {lines.map((line, lineIdx) => {
        const words = line.text.split(/\s+/).filter(Boolean);
        const renderedWords: ReactNode[] = words.map((word, wIdx) => {
          const delay = initialDelay + wordIndex * stagger;
          wordIndex++;
          const wordClass = line.className
            ? `hero-word ${line.className}`
            : "hero-word";
          return (
            <span
              key={`${lineIdx}-${wIdx}`}
              className={wordClass}
              style={{ animationDelay: `${delay}ms` }}
            >
              {word}
              {wIdx < words.length - 1 ? " " : ""}
            </span>
          );
        });

        return (
          <span key={lineIdx}>
            {renderedWords}
            {lineIdx < lines.length - 1 && <br />}
          </span>
        );
      })}
    </h1>
  );
}
