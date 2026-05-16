"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";

const NEXT: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const LABEL = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = ICON[theme];
  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT[theme])}
      aria-label={`Theme: ${LABEL[theme]} (click to cycle)`}
      title={`Theme: ${LABEL[theme]}`}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] border border-white/[0.06] bg-background-elev transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
