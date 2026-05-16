"use client";

import { useLang } from "./lang-provider";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const isEn = lang === "en";
  return (
    <button
      type="button"
      onClick={() => setLang(isEn ? "kh" : "en")}
      aria-label={isEn ? "Switch to Khmer" : "Switch to English"}
      title={isEn ? "ភាសាខ្មែរ" : "English"}
      className="inline-flex items-center justify-center min-w-9 h-9 px-2.5 rounded-lg text-[11px] font-bold text-muted hover:text-foreground hover:bg-[var(--hover-bg)] border border-white/[0.06] bg-background-elev transition-colors tracking-wider"
    >
      {isEn ? "EN" : "ខ្មែរ"}
    </button>
  );
}
