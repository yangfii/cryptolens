import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import AuthForm from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign up | Sastra trader",
};

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/account");

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="premium-card rounded-2xl p-7 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="icon-tile text-accent"
            style={{ width: 40, height: 40 }}
          >
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Create an account</h1>
            <p className="text-xs text-muted mt-0.5">
              Sign up with email — takes 30 seconds.
            </p>
          </div>
        </div>

        <AuthForm mode="signup" />
      </div>

      <p className="text-[11px] text-muted text-center mt-5 leading-relaxed">
        By signing up you agree this is research tooling, not financial advice.{" "}
        <Link href="/" className="text-accent hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
