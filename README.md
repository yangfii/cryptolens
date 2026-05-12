# CryptoLens

AI-powered crypto research platform for spot traders. Live prices, deep
research, and news sentiment analysis using Claude AI.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** for styling
- **Anthropic Claude** — Haiku 4.5 (fast/cheap), Sonnet 4.6 (deep analysis)
- **CoinGecko API** for live market data
- **TradingView Widget** for charts
- **CryptoPanic** for news headlines

## Features (MVP)

- Top 50 market overview with global stats
- Coin detail pages with TradingView chart + AI research note
- News feed with AI sentiment classification (bullish/bearish/neutral)
- Streaming AI chat for crypto Q&A
- Deep research index page

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add at minimum your `ANTHROPIC_API_KEY`. The site
will run without keys but AI features will show an error state.

### 3. Run dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 4. Production build

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes (for AI) | Powers AI summary, sentiment, and chat |
| `COINGECKO_API_KEY` | No | Higher rate limits for market data |
| `CRYPTOPANIC_API_TOKEN` | No (for news) | Live news headlines |
| `NEXT_PUBLIC_SUPABASE_URL` | Future | Auth + watchlists |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future | Auth + watchlists |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing — top 50 markets
│   ├── coin/[id]/page.tsx    # Coin detail with chart + AI
│   ├── news/page.tsx         # News + AI sentiment
│   ├── chat/page.tsx         # AI chat
│   ├── research/page.tsx     # Research index
│   └── api/
│       ├── ai-summary/       # Sonnet 4.6 — research note
│       ├── sentiment/        # Haiku 4.5 — headline sentiment
│       └── chat/             # Haiku 4.5 — streaming chat
├── components/               # UI components
├── lib/
│   ├── coingecko.ts          # Market data client
│   ├── anthropic.ts          # Claude client + model IDs
│   ├── news.ts               # CryptoPanic client
│   ├── format.ts             # Number/date formatting
│   └── utils.ts              # cn() helper
└── types/
    └── crypto.ts             # Shared types
```

## AI Model Strategy

| Tier | Model | Used for | Cost (per 1M tok) |
|------|-------|----------|-------------------|
| Fast | Claude Haiku 4.5 | Chat, news sentiment | ~$1 / $5 |
| Smart | Claude Sonnet 4.6 | Coin research notes | ~$3 / $15 |
| Premium | Claude Opus 4.7 | Future paid tier | ~$15 / $75 |

Responses are cached for 30 minutes via `Cache-Control: s-maxage=1800`.

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set the environment variables in your Vercel project settings.

## Disclaimer

This software is for research and educational purposes only. It does **not**
constitute financial advice. Always do your own research before making trading
decisions.
