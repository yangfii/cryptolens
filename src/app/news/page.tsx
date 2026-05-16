import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { getCryptoNews } from "@/lib/news";
import NewsList from "@/components/news-list";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crypto News with AI Sentiment | Sastra trader",
  description:
    "Latest crypto news headlines, automatically classified as bullish, bearish, or neutral by Claude AI.",
};

async function NewsContent() {
  const items = await getCryptoNews(30);
  return <NewsList items={items} />;
}

export default function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-tile text-accent" style={{ width: 44, height: 44 }}>
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              AI-Curated Feed
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Crypto News
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Latest headlines from across crypto media, automatically classified
          by sentiment. Scan the market mood in seconds — filter by bullish,
          bearish, or neutral to focus where it matters. Updates every 5
          minutes.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="premium-card rounded-2xl p-5 h-28 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <NewsContent />
      </Suspense>
    </div>
  );
}
