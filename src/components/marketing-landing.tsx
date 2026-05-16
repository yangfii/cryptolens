import Link from "next/link";
import {
  Brain,
  Trophy,
  PieChart,
  Newspaper,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  LogIn,
  Lock,
} from "lucide-react";
import HeroSection from "./hero-section";

type Feature = {
  Icon: typeof Brain;
  title: string;
  description: string;
  color: string;
};

const FEATURES: Feature[] = [
  {
    Icon: Brain,
    title: "AI Deep Research",
    description:
      "Claude Sonnet 4.6 produces balanced bullish/bearish breakdowns for every top coin — refreshed every 30 minutes.",
    color: "#fbbf24",
  },
  {
    Icon: Trophy,
    title: "AI Daily Picks",
    description:
      "8 hand-curated picks every 12 hours with value thesis, spot angle, and watch points. Pick your risk profile.",
    color: "#10b981",
  },
  {
    Icon: PieChart,
    title: "Portfolio Allocator",
    description:
      "AI-built portfolios for Conservative, Balanced, or Aggressive risk tolerance — based on live market data.",
    color: "#a78bfa",
  },
  {
    Icon: Newspaper,
    title: "News Sentiment",
    description:
      "Every headline classified bullish, bearish, or neutral by Claude Haiku 4.5 — scan market mood in seconds.",
    color: "#22d3ee",
  },
  {
    Icon: TrendingUp,
    title: "Live Markets",
    description:
      "Real-time prices and 24h changes for the top 50 cryptocurrencies — updated every minute.",
    color: "#f43f5e",
  },
  {
    Icon: Activity,
    title: "Trader Connect",
    description:
      "Link your MT4 / MT5 / CXM account to track AI Picks performance against your real trading history.",
    color: "#22d3ee",
  },
];

export default function MarketingLanding() {
  return (
    <>
      <HeroSection mode="guest" />

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 mb-20 sm:mb-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] mb-3 inline-flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Members Only
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Everything inside, after you sign up
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Free account. No credit card. Unlocks the full markets research
            suite — AI picks, deep research, portfolio allocator, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, description, color }) => (
            <div
              key={title}
              className="premium-card rounded-2xl p-6 relative overflow-hidden group"
            >
              <div
                className="icon-tile mb-4"
                style={{ color }}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="premium-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="aurora absolute inset-0 opacity-40" aria-hidden="true">
            <div className="aurora-3" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Ready to{" "}
              <span className="text-brand-gradient">decode the markets?</span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-7 leading-relaxed">
              Sign up in 30 seconds. Get instant access to AI picks, deep
              research, news sentiment, and the portfolio allocator.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl"
              >
                <Sparkles className="w-4 h-4" />
                Create free account
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/login"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                I already have an account
              </Link>
            </div>
            <p className="text-[11px] text-muted mt-6">
              Free forever · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
