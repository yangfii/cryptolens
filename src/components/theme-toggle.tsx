"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";

const OPTIONS: Array<{
  value: Theme;
  icon: typeof Sun;
  label: string;
}> = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="inline-flex items-center gap-0.5 bg-background-elev rounded-lg p-0.5 border border-white/[0.06]">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            aria-label={opt.label}
            aria-pressed={selected}
            title={opt.label}
            className={`p-1.5 rounded-md transition-colors ${
              selected
                ? "bg-white/[0.06] text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
