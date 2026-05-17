import Link from "next/link";
import { CATEGORIES, type MarketCategory } from "@/lib/markets-catalog";

type Props = {
  active: MarketCategory;
};

export default function MarketsCategoryTabs({ active }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <Link
            key={cat.id}
            href={`/markets/${cat.id}`}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                : "bg-white/[0.03] border border-white/[0.06] text-muted hover:text-foreground hover:bg-white/[0.06]"
            }`}
          >
            <span aria-hidden>{cat.emoji}</span>
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
