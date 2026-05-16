import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Check your email | Sastra trader",
};

export default function CheckEmailPage() {
  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="premium-card rounded-2xl p-7 sm:p-8 text-center">
        <div
          className="icon-tile text-accent mx-auto mb-5"
          style={{ width: 48, height: 48 }}
        >
          <Mail className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">
          Check your email
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          We sent a confirmation link to your inbox. Click it to verify your
          email and finish signing up.
        </p>
        <p className="text-xs text-muted mt-6">
          Didn&apos;t receive it? Check spam, or{" "}
          <Link href="/signup" className="text-accent hover:underline">
            try a different email
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
