import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";
import AuthForm from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in | Sastra trader",
};

const ERROR_MESSAGES: Record<string, string> = {
  "auth-callback-failed":
    "That confirmation link is invalid or has already been used. Please sign in below.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/account");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="premium-card rounded-2xl p-7 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="icon-tile text-accent"
            style={{ width: 40, height: 40 }}
          >
            <LogIn className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-xs text-muted mt-0.5">
              Sign in to your account.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3.5 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AuthForm mode="signin" />
      </div>

      <p className="text-[11px] text-muted text-center mt-5">
        <Link href="/" className="text-accent hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
