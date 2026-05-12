export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 max-w-7xl mx-auto">
        <span className="text-xl font-bold text-yellow-400 tracking-tight">CryptoLens</span>
        <div className="hidden sm:flex gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#performance" className="hover:text-white transition-colors">Performance</a>
        </div>
        <a href="#pricing" className="text-sm bg-yellow-400 text-gray-950 font-semibold px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
          Get Started
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-4 py-1.5 rounded-full mb-6">
          Gold AI &bull; MT5 EA Analytics &bull; Powered by Claude
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
          Trade Smarter with<br />
          <span className="text-yellow-400">AI-Powered Insights</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          CryptoLens combines Supabase-powered membership with real-time Gold AI signals
          and MT5 Expert Advisor performance analytics so you can trade with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#pricing" className="bg-yellow-400 text-gray-950 font-semibold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors text-base">
            Start Free Trial
          </a>
          <a href="#performance" className="border border-gray-700 text-gray-300 font-semibold px-8 py-3 rounded-full hover:border-yellow-400 hover:text-yellow-400 transition-colors text-base">
            View Live Performance
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "94.2%", label: "Win Rate (Gold AI)" },
            { value: "+312%", label: "Avg. Annual Return" },
            { value: "3,800+", label: "Active Members" },
            { value: "0.8s", label: "Signal Latency" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Win</h2>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
          From AI-generated signals to deep MT5 EA analytics, CryptoLens gives you the edge.
        </p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: "AI", title: "Gold AI Signals", desc: "Claude-powered AI analyses price action and sentiment to generate high-probability XAU/USD trade signals in real time." },
            { icon: "EA", title: "MT5 EA Performance", desc: "Connect your MetaTrader 5 account and track every Expert Advisor drawdown, profit factor, and Sharpe ratio." },
            { icon: "DB", title: "Supabase Membership", desc: "Secure, row-level-security-backed membership tiers. Upgrade, downgrade or pause at any time with no friction." },
            { icon: "AL", title: "Real-Time Alerts", desc: "Push notifications and Telegram webhooks deliver signals the instant they are generated." },
            { icon: "PA", title: "Portfolio Analytics", desc: "Aggregate P&L, equity curves and risk metrics across all your connected MT5 accounts in one dashboard." },
            { icon: "MA", title: "Multi-Asset Coverage", desc: "Gold, Bitcoin, EUR/USD, Oil and more. Our AI models are trained on each instrument unique characteristics." },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-xs mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Live EA Performance</h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">Audited, real-money results not backtests.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="py-3 pr-6 font-medium">EA Name</th>
                  <th className="py-3 pr-6 font-medium">Instrument</th>
                  <th className="py-3 pr-6 font-medium">Monthly Return</th>
                  <th className="py-3 pr-6 font-medium">Max Drawdown</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  { name: "Gold Pulse v3", instrument: "XAU/USD", ret: "+18.4%", dd: "4.2%", status: "Live" },
                  { name: "Crypto Momentum", instrument: "BTC/USD", ret: "+11.7%", dd: "7.8%", status: "Live" },
                  { name: "Forex Edge", instrument: "EUR/USD", ret: "+6.3%", dd: "2.1%", status: "Live" },
                  { name: "Oil Scalper", instrument: "WTI", ret: "+9.1%", dd: "5.5%", status: "Beta" },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 pr-6 font-medium text-white">{row.name}</td>
                    <td className="py-4 pr-6">{row.instrument}</td>
                    <td className="py-4 pr-6 text-green-400 font-semibold">{row.ret}</td>
                    <td className="py-4 pr-6 text-red-400">{row.dd}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.status === "Live" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">Start free, scale as you grow. No hidden fees.</p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { name: "Starter", price: "Free", period: "", features: ["3 AI signals / day", "1 MT5 account", "Community forum access"], cta: "Get Started", highlight: false },
            { name: "Pro", price: "$49", period: "/ mo", features: ["Unlimited signals", "5 MT5 accounts", "Real-time alerts", "Portfolio analytics", "Priority support"], cta: "Start Free Trial", highlight: true },
            { name: "Institutional", price: "$199", period: "/ mo", features: ["Everything in Pro", "Unlimited MT5 accounts", "API access", "Dedicated account manager", "Custom EA integration"], cta: "Contact Sales", highlight: false },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? "border-yellow-400 bg-yellow-400/5" : "border-gray-800 bg-gray-900"}`}>
              {plan.highlight && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full mb-4">Most Popular</span>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-400 mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-yellow-400">checkmark</span> {f}</li>
                ))}
              </ul>
              <a href="#" className={`block text-center py-3 rounded-full font-semibold text-sm transition-colors ${plan.highlight ? "bg-yellow-400 text-gray-950 hover:bg-yellow-300" : "border border-gray-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-400"}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 text-center text-gray-500 text-sm">
        <div className="mb-2 font-bold text-yellow-400 text-base">CryptoLens</div>
        <p>&copy; {new Date().getFullYear()} CryptoLens. All rights reserved.</p>
        <p className="mt-1 text-xs text-gray-600">Trading involves risk. Past performance is not indicative of future results.</p>
      </footer>
    </div>
  );
}
