"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "./lang-provider";
import HeroAiPreview from "./hero-ai-preview";
import AnimatedTitle from "./animated-title";

export default function HeroSection() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden">
      <div className="aurora">
        <div className="aurora-3" />
      </div>
      <div className="grid-overlay" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-medium mb-7">
              <span className="pulse-dot" />
              <span className="text-muted">{t("hero.badge_powered_by")}</span>
              <span className="text-brand-gradient font-bold">
                {t("hero.badge_claude")}
              </span>
              <span className="text-muted">·</span>
              <span className="text-foreground">{t("hero.badge_live")}</span>
            </div>

            <AnimatedTitle
              className="text-[2rem] sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] sm:leading-[1.05]"
              lines={[
                { text: t("hero.title_1") },
                { text: t("hero.title_2"), className: "text-brand-gradient" },
                { text: t("hero.title_3"), className: "text-brand-gradient" },
              ]}
              stagger={100}
              initialDelay={150}
            />
            <p className="mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <Link
                href="/allocator"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl"
              >
                <Sparkles className="w-4 h-4" />
                {t("hero.cta_primary")}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="#markets"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl"
              >
                {t("hero.cta_secondary")}
              </Link>
            </div>

            <div className="mt-8 sm:mt-10 flex items-center gap-x-5 gap-y-2 text-xs text-muted flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {t("hero.feature_no_signup")}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#22d3ee" }}
                />
                {t("hero.feature_real_time")}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#a78bfa" }}
                />
                {t("hero.feature_ai")}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroAiPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
