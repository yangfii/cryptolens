// ============================================================================
// Internationalization (i18n) — English / Khmer translations
// ============================================================================

export type Lang = "en" | "kh";

export type Dict = Record<string, string>;

export const translations: Record<Lang, Dict> = {
  en: {
    // Navigation
    "nav.markets": "Markets",
    "nav.news": "News",
    "nav.research": "Research",
    "nav.allocator": "Allocator",
    "nav.recommend": "Picks",

    // Hero
    "hero.badge_powered_by": "Powered by",
    "hero.badge_claude": "Claude AI",
    "hero.badge_live": "Live market data",
    "hero.title_1": "Markets,",
    "hero.title_2": "decoded —",
    "hero.title_3": "for spot traders who think.",
    "hero.subtitle":
      "Real-time prices, AI-powered fundamental analysis, and news sentiment — built for the trader who wants clarity, not noise.",
    "hero.cta_primary": "Build My Portfolio",
    "hero.cta_secondary": "Explore Markets",
    "hero.feature_no_signup": "No signup required",
    "hero.feature_real_time": "Real-time data",
    "hero.feature_ai": "AI-powered",

    // Stats
    "stats.market_cap": "Market Cap",
    "stats.volume_24h": "24h Volume",
    "stats.btc_dominance": "BTC Dominance",
    "stats.active_coins": "Active Coins",
    "stats.change_24h": "24h",

    // Daily Picks
    "picks.section_label": "AI Daily Picks",
    "picks.section_title": "Today's Best Value for Spot Traders",
    "picks.section_subtitle":
      "Curated by Claude Sonnet 4.6 with live web research. Pick your risk profile · view in English or Khmer · updates every 12 hours.",
    "picks.refreshed": "Refreshed",
    "picks.market_context": "Market Context",
    "picks.profile_all": "All",
    "picks.profile_conservative": "Conservative",
    "picks.profile_balanced": "Balanced",
    "picks.profile_aggressive": "Aggressive",
    "picks.value_thesis": "Value Thesis",
    "picks.spot_angle": "Spot Trading Angle",
    "picks.value_signals": "Value Signals",
    "picks.watch_points": "Watch Points",
    "picks.risk_low": "Low Risk",
    "picks.risk_medium": "Medium Risk",
    "picks.risk_high": "High Risk",
    "picks.full_research": "Full research",
    "picks.next_refresh": "Next refresh in",
    "picks.translating": "Translating with",
    "picks.no_picks": "No picks for this profile right now. Try a different profile.",

    // Track Record
    "track.section_label": "AI Track Record",
    "track.section_title": "How are AI picks performing?",
    "track.section_subtitle":
      "Past picks tracked from their generation time to current price. Helps you evaluate whether AI recommendations are working over time.",
    "track.total_tracked": "Total Picks Tracked",
    "track.avg_return": "Average Return",
    "track.win_rate": "Win Rate",
    "track.best_pick": "Best Pick",
    "track.latest_picks": "Latest Picks",
    "track.snapshot": "Snapshot",
    "track.generated": "Generated",
    "track.avg": "Avg",
    "track.col_coin": "Coin",
    "track.col_risk": "Risk",
    "track.col_pick_price": "Pick Price",
    "track.col_current": "Current",
    "track.col_pnl": "P&L",

    // Featured
    "featured.section_label": "Featured",
    "featured.section_title": "Top Markets, Right Now",
    "featured.section_subtitle":
      "The three largest cryptocurrencies by market cap. Click any coin for live charts and AI-generated research.",
    "featured.view_all": "View all",

    // AI Showcase
    "ai_showcase.section_label": "AI Engine",
    "ai_showcase.section_title": "Two models, purpose-built for traders",
    "ai_showcase.section_subtitle":
      "We route every request to the right Claude model — balanced and analytical for research, fast for headline sentiment.",
    "ai_showcase.deep_research_title": "Deep Research Notes",
    "ai_showcase.deep_research_desc":
      "Claude Sonnet 4.6 reviews live market data and produces balanced bullish/bearish breakdowns for every coin.",
    "ai_showcase.sentiment_title": "News Sentiment",
    "ai_showcase.sentiment_desc":
      "Every headline is classified bullish, bearish, or neutral — scan the market mood in seconds.",

    // Markets table
    "markets.section_label": "All Markets",
    "markets.section_title": "Top 50 by Market Cap",
    "markets.live_updates": "Live · Updates every minute",
    "markets.col_rank": "#",
    "markets.col_coin": "Coin",
    "markets.col_price": "Price",
    "markets.col_24h": "24h",
    "markets.col_7d": "7d",
    "markets.col_market_cap": "Market Cap",
    "markets.col_volume": "Volume (24h)",
    "markets.col_7d_trend": "7d Trend",

    // News
    "news.section_label": "AI-Curated Feed",
    "news.section_title": "Crypto News",
    "news.subtitle":
      "Latest headlines from across crypto media, automatically classified by sentiment. Updates every 5 minutes.",
    "news.filter_all": "All",
    "news.filter_bullish": "Bullish",
    "news.filter_bearish": "Bearish",
    "news.filter_neutral": "Neutral",
    "news.analyzing": "Analyzing sentiment",
    "news.classified_by": "Sentiment by",

    // Allocator
    "allocator.label": "AI Portfolio Builder",
    "allocator.title": "Allocator",
    "allocator.subtitle":
      "Enter your budget and preferences. Claude Sonnet 4.6 will analyze current market conditions and suggest how to split your investment across coins.",
    "allocator.budget": "Investment Budget",
    "allocator.risk_profile": "Risk Profile",
    "allocator.horizon": "Investment Horizon",
    "allocator.options": "Options",
    "allocator.exclude_stables": "Exclude stablecoins",
    "allocator.exclude_stables_desc":
      "Skip USDT, USDC, DAI from allocation suggestions",
    "allocator.generate": "Generate Allocation",
    "allocator.analyzing": "Analyzing market with Sonnet 4.6…",
    "allocator.disclaimer":
      "AI-generated suggestions only — not financial advice. Always do your own research and never invest more than you can afford to lose.",

    // Research
    "research.label": "AI-Powered Research",
    "research.title": "Deep Research",
    "research.subtitle":
      "Pick any coin to see live data, technical chart, and an AI-generated research note.",

    // Common
    "common.live": "Live",
    "common.loading": "Loading…",
    "common.disclaimer_short": "Not financial advice",
    "common.back_to_markets": "Back to markets",
  },
  kh: {
    // Navigation
    "nav.markets": "ទីផ្សារ",
    "nav.news": "ព័ត៌មាន",
    "nav.research": "ស្រាវជ្រាវ",
    "nav.allocator": "បែងចែក",
    "nav.recommend": "យោបល់",

    // Hero
    "hero.badge_powered_by": "ដំណើរការដោយ",
    "hero.badge_claude": "Claude AI",
    "hero.badge_live": "ទិន្នន័យទីផ្សារផ្ទាល់",
    "hero.title_1": "ទីផ្សារ",
    "hero.title_2": "បកស្រាយ​យ៉ាងច្បាស់ —",
    "hero.title_3": "សម្រាប់ Spot Traders ដែលគិត។",
    "hero.subtitle":
      "តម្លៃផ្ទាល់ · ការវិភាគ AI · sentiment ព័ត៌មាន — បង្កើតសម្រាប់ trader ដែលចង់បានភាពច្បាស់លាស់ មិនមែនការច្រឡំ។",
    "hero.cta_primary": "បង្កើត Portfolio",
    "hero.cta_secondary": "​​មើល​ទីផ្សារ",
    "hero.feature_no_signup": "មិនបាច់ចុះឈ្មោះ",
    "hero.feature_real_time": "ទិន្នន័យផ្ទាល់",
    "hero.feature_ai": "ដំណើរការដោយ AI",

    // Stats
    "stats.market_cap": "មូលធនទីផ្សារ",
    "stats.volume_24h": "បរិមាណ ២៤ម៉ោង",
    "stats.btc_dominance": "BTC Dominance",
    "stats.active_coins": "កាក់​សកម្ម",
    "stats.change_24h": "២៤ម៉ោង",

    // Daily Picks
    "picks.section_label": "AI ជម្រើស​ប្រចាំ​ថ្ងៃ",
    "picks.section_title": "កាក់ល្អៗ​ឥឡូវ​ សម្រាប់ Spot Traders",
    "picks.section_subtitle":
      "​​​​​​​​បាន​ជ្រើស​ដោយ Claude Sonnet 4.6 ​ជាមួយ​ការ​ស្រាវ​ជ្រាវ​លើ web ផ្ទាល់​។ ​​ជ្រើស risk profile · មើល​ជា EN ឬ​ ខ្មែរ · update រាល់ 12 ​​​​ម៉ោង។",
    "picks.refreshed": "បាន​ refresh",
    "picks.market_context": "ស្ថានភាព​ទីផ្សារ",
    "picks.profile_all": "ទាំងអស់",
    "picks.profile_conservative": "ប្រុងប្រយ័ត្ន",
    "picks.profile_balanced": "​មធ្យម",
    "picks.profile_aggressive": "ខ្លាំងក្លា",
    "picks.value_thesis": "សេចក្ដី​សន្និដ្ឋាន",
    "picks.spot_angle": "យុទ្ធសាស្ត្រ Spot Trading",
    "picks.value_signals": "សញ្ញាល្អ",
    "picks.watch_points": "​ត្រូវ​ប្រុង​ប្រយ័ត្ន",
    "picks.risk_low": "ហានិភ័យ​ទាប",
    "picks.risk_medium": "ហានិភ័យ​មធ្យម",
    "picks.risk_high": "ហានិភ័យ​ខ្ពស់",
    "picks.full_research": "មើល​លម្អិត",
    "picks.next_refresh": "Refresh ​បន្ទាប់​​​ក្នុង",
    "picks.translating": "កំពុង​បក​ប្រែ​ដោយ",
    "picks.no_picks": "​មិន​មាន​ជម្រើស​សម្រាប់ profile នេះ​ទេ​។​ ​សូម​សាក profile ​ផ្សេង​។",

    // Track Record
    "track.section_label": "AI Track Record",
    "track.section_title": "​​AI Picks ​​ដំណើរ​ការ​​ដូច​​ម្ដេច?",
    "track.section_subtitle":
      "​ការ​ Picks ​ពី​​មុន​ ​ត្រូវ​បាន​​​​តាមដាន​ពី​ពេល​បាន​បង្កើត ​​​​ដល់​​​​​​​​​​​​​​តម្លៃ​​បច្ចុប្បន្ន។​ ​ជួយ​​អ្នក​​​វាយ​តម្លៃ​ថា​តើ AI ​​​ដំណើរ​ការ​ល្អ​ឬ​អត់​​​​​​​។",
    "track.total_tracked": "ចំនួនកាក់សរុប",
    "track.avg_return": "ផល​ចំណេញ​មធ្យម​",
    "track.win_rate": "​​អត្រា​ឈ្នះ",
    "track.best_pick": "​ល្អ​ជាង​គេ",
    "track.latest_picks": "ជម្រើស​ចុង​ក្រោយ",
    "track.snapshot": "Snapshot",
    "track.generated": "បាន​បង្កើត",
    "track.avg": "មធ្យម",
    "track.col_coin": "កាក់",
    "track.col_risk": "​ហានិភ័យ",
    "track.col_pick_price": "តម្លៃ​ដើម",
    "track.col_current": "តម្លៃ​ឥឡូវ",
    "track.col_pnl": "​​ ​P&L",

    // Featured
    "featured.section_label": "​លេច​ធ្លោ",
    "featured.section_title": "​​​​​​​ទីផ្សារ​​​​​​​​​​​​​​​​​​​​​​​​​​​​ឈាន​មុខ​ឥឡូវ​នេះ",
    "featured.section_subtitle":
      "​​​កាក់​​​​​​​​​បី​ដែល​មាន​មូលធន​​​​​​​​ធំ​ជាង​គេ​។ ចុច​​លើ​កាក់​ណា​មួយ​​​​​​​​​​​​​​​​​​​​សម្រាប់​ chart និង​ការ​​​​​​​​​​​​​​​ស្រាវ​ជ្រាវ AI។",
    "featured.view_all": "មើល​ទាំង​អស់",

    // AI Showcase
    "ai_showcase.section_label": "AI Engine",
    "ai_showcase.section_title": "AI ​ពីរ​មុខ​សម្រាប់​ Traders",
    "ai_showcase.section_subtitle":
      "យើង​ប្រើ​ Claude ​​ដែល​​​ត្រឹម​ត្រូវ​សម្រាប់​​ការ​ងារ​នី​មួយ​ៗ — ​ស៊ីជម្រៅ​សម្រាប់​​​ស្រាវ​​ជ្រាវ, លឿន​សម្រាប់​ Sentiment ព័ត៌មាន​។",
    "ai_showcase.deep_research_title": "ការ​ស្រាវ​ជ្រាវ​ស៊ីជម្រៅ",
    "ai_showcase.deep_research_desc":
      "Claude Sonnet 4.6 ​​​មើល​​ទិន្នន័យ​ផ្ទាល់​ ហើយ​​​​បង្កើត​ការ​​​ភាគ​យល់ bullish/bearish ​ឲ្យ​​កាក់​នី​មួយ​ៗ​។",
    "ai_showcase.sentiment_title": "ការ​វិភាគ Sentiment",
    "ai_showcase.sentiment_desc":
      "​​​​​​ព័ត៌មាន​នី​មួយៗ​​ត្រូវ​បាន​​ប្រែ​ជា bullish, bearish ឬ neutral — ​មើល mood ទីផ្សារ​​ក្នុង​​​​​វិនាទី​ៗ​។",

    // Markets table
    "markets.section_label": "ទីផ្សារ​ទាំង​អស់",
    "markets.section_title": "កាក់ Top 50",
    "markets.live_updates": "ផ្ទាល់ · Update រាល់​នាទី",
    "markets.col_rank": "#",
    "markets.col_coin": "កាក់",
    "markets.col_price": "តម្លៃ",
    "markets.col_24h": "២៤ម៉ោង",
    "markets.col_7d": "៧ថ្ងៃ",
    "markets.col_market_cap": "មូលធន",
    "markets.col_volume": "បរិមាណ ២៤ម៉ោង",
    "markets.col_7d_trend": "Trend ៧​ថ្ងៃ",

    // News
    "news.section_label": "ព័ត៌មាន ដែល​​បាន​​​​​​​​ជ្រើស​ដោយ AI",
    "news.section_title": "ព័ត៌មាន Crypto",
    "news.subtitle":
      "ព័ត៌មាន​ថ្មីៗ​ពី​ប្រភព​ផ្សេង​ៗ​ ត្រូវ​​​​​បាន​​ប្រែ​​ដោយ​ sentiment ដោយ​ស្វ័យ​ប្រវត្តិ​​​។ Update រាល់ 5 ​នាទី​​។",
    "news.filter_all": "ទាំង​អស់",
    "news.filter_bullish": "Bullish",
    "news.filter_bearish": "Bearish",
    "news.filter_neutral": "មធ្យម",
    "news.analyzing": "កំពុង​វិភាគ Sentiment",
    "news.classified_by": "Sentiment ​ដោយ",

    // Allocator
    "allocator.label": "AI Portfolio Builder",
    "allocator.title": "បែង​​​​​​​​​​ចែក Portfolio",
    "allocator.subtitle":
      "​បំពេញ budget និង​ចំណូលចិត្ត។ Claude Sonnet 4.6 ​​នឹង​​វិភាគ​​​​​ទីផ្សារ ​ហើយ​​​ស្នើ​​​​​​​​​​​​​​​​​​​​ការ​បែង​ចែក​​ការ​វិនិយោគ។",
    "allocator.budget": "ទឹក​ប្រាក់​វិនិយោគ",
    "allocator.risk_profile": "Risk Profile",
    "allocator.horizon": "​​​​​​​​​​រយៈ​ពេល​វិនិយោគ",
    "allocator.options": "​ជម្រើស",
    "allocator.exclude_stables": "​មិន​​​យក Stablecoins",
    "allocator.exclude_stables_desc":
      "​​មិន​​​​​​​​យក USDT, USDC, DAI ក្នុង​​​ការ​បែង​ចែក",
    "allocator.generate": "​​​​បង្កើត​ Allocation",
    "allocator.analyzing": "កំពុង​វិភាគ​ទីផ្សារ​​ដោយ​​ Sonnet 4.6…",
    "allocator.disclaimer":
      "ការ​​ផ្តល់​យោបល់​​ដោយ AI តែ​ប៉ុណ្ណោះ​ — ​​មិនមែន​​ការ​ផ្តល់​ប្រឹក្សា​ហិរញ្ញ​វត្ថុ​​​ទេ​​​។ ​ស្រាវ​ជ្រាវ​​ដោយ​​ខ្លួន​ឯង មុន​នឹង​​​​វិនិយោគ។",

    // Research
    "research.label": "ស្រាវ​ជ្រាវ​​ដោយ AI",
    "research.title": "ស្រាវ​ជ្រាវ​ស៊ីជម្រៅ",
    "research.subtitle":
      "ជ្រើស​កាក់ណា​មួយ​ ដើម្បី​មើល​ទិន្នន័យ​ផ្ទាល់, chart និង​កំណត់​ត្រា​ស្រាវ​ជ្រាវ​​ដោយ AI។",

    // Common
    "common.live": "ផ្ទាល់",
    "common.loading": "កំពុង​ផ្ទុក…",
    "common.disclaimer_short": "​មិនមែន​ការ​ផ្តល់​ប្រឹក្សា​ហិរញ្ញ​វត្ថុ",
    "common.back_to_markets": "ត្រឡប់​ទៅ​ទីផ្សារ",
  },
};

export function getTranslation(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
