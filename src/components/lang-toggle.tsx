"use client";

import { Languages } from "lucide-react";
import { useLang } from "./lang-provider";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-0.5 bg-background-elev rounded-lg p-0.5 border border-white/[0.06] mr-1">
      <Languages className="w-3 h-3 text-muted ml-1.5" />
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
          lang === "en"
            ? "bg-white/[0.06] text-foreground"
            : "text-muted hover:text-foreground"
        }`}
        aria-label="English"
      >
        EN
      </button>
      <button
        onClick={() => setLang("kh")}
        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
          lang === "kh"
            ? "bg-white/[0.06] text-foreground"
            : "text-muted hover:text-foreground"
        }`}
        aria-label="ភាសាខ្មែរ"
      >
        ខ្មែរ
      </button>
    </div>
  );
}
