"use client";

import Link from "next/link";
import { Sparkles, PieChart } from "lucide-react";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import ThemeToggle from "./theme-toggle";
import AnimatedLogo from "./animated-logo";

export default function Header() {
  const { t } = useLang();
  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="logo-link flex items-center gap-2.5 font-bold text-lg group">
          <AnimatedLogo size={36} className="text-base" />
          <span className="tracking-tight">
            Crypto<span className="text-brand-gradient">Lens</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium hidden sm:inline-flex"
          >
            {t("nav.markets")}
          </Link>
          <Link
            href="/news"
            className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium hidden sm:inline-flex"
          >
            {t("nav.news")}
          </Link>
          <Link
            href="/allocator"
            aria-label={t("nav.allocator")}
            className="px-2 sm:px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium inline-flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("nav.allocator")}</span>
          </Link>
          <Link
            href="/research"
            className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium hidden lg:inline-flex"
          >
            {t("nav.research")}
          </Link>
          <ThemeToggle />
          <LangToggle />
          <Link
            href="/chat"
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">{t("nav.chat")}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
