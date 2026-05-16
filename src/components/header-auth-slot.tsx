import Link from "next/link";
import { User } from "lucide-react";
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
    <div className="flex items-center gap-1">
      <Link
        href="/login"
        className="px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="px-3 py-2 rounded-lg text-sm font-semibold text-foreground bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
      >
        Sign up
      </Link>
    </div>
  );
}
