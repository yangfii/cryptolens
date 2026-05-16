import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HeaderAuthSlot() {
  // If Supabase isn't configured yet, show signed-out state without crashing.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
        title={user.email ?? "Account"}
      >
        <User className="w-3.5 h-3.5" />
        Account
      </Link>
    );
  }

  return (
    <Link
      href="/signup"
      className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ml-1"
    >
      <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
      Get started
    </Link>
  );
}
