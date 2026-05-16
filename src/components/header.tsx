"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, PieChart, Menu, X } from "lucide-react";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import ThemeToggle from "./theme-toggle";
import AnimatedLogo from "./animated-logo";

type Props = {
  authSlot?: ReactNode;
  isAuthenticated?: boolean;
};

export default function Header({ authSlot, isAuthenticated = false }: Props = {}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={close}
          className="logo-link flex items-center gap-2.5 font-bold text-lg group"
        >
          <AnimatedLogo size={36} className="text-base" />
          <span className="tracking-tight">
            Sastra <span className="text-brand-gradient">trader</span>
          </span>
        </Link>

        {/* Desktop nav (lg+) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {isAuthenticated && (
            <>
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium inline-flex"
              >
                {t("nav.markets")}
              </Link>
              <Link
                href="/news"
                className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium inline-flex"
              >
                {t("nav.news")}
              </Link>
              <Link
                href="/allocator"
                className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium inline-flex items-center gap-1.5"
              >
                <PieChart className="w-3.5 h-3.5" />
                {t("nav.allocator")}
              </Link>
              <Link
                href="/research"
                className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors font-medium inline-flex"
              >
                {t("nav.research")}
              </Link>
            </>
          )}
          <ThemeToggle />
          <LangToggle />
          {authSlot}
          {isAuthenticated && (
            <Link
              href="/recommend"
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
              {t("nav.recommend")}
            </Link>
          )}
        </nav>

        {/* Mobile actions (<lg) */}
        <div className="lg:hidden flex items-center gap-1.5">
          {isAuthenticated && (
            <Link
              href="/recommend"
              onClick={close}
              aria-label={t("nav.recommend")}
              className="btn-primary inline-flex items-center justify-center w-10 h-10 rounded-lg"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-foreground bg-background-elev border border-white/[0.06] hover:bg-[var(--hover-bg)] transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30"
            onClick={close}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="lg:hidden relative z-40 border-t border-white/[0.06] bg-background-elev/95 backdrop-blur"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
              {isAuthenticated && (
                <>
                  <Link
                    href="/"
                    onClick={close}
                    className="block px-3 py-3 rounded-lg text-sm font-semibold hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    {t("nav.markets")}
                  </Link>
                  <Link
                    href="/news"
                    onClick={close}
                    className="block px-3 py-3 rounded-lg text-sm font-semibold hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    {t("nav.news")}
                  </Link>
                  <Link
                    href="/allocator"
                    onClick={close}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-semibold hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <PieChart className="w-4 h-4" />
                    {t("nav.allocator")}
                  </Link>
                  <Link
                    href="/research"
                    onClick={close}
                    className="block px-3 py-3 rounded-lg text-sm font-semibold hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    {t("nav.research")}
                  </Link>
                </>
              )}
              {authSlot && (
                <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
                  {authSlot}
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
                <ThemeToggle />
                <LangToggle />
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
