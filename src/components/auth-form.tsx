"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
import { signUp, signIn, type AuthState } from "@/lib/auth-actions";

const initialState: AuthState = { error: null };

type Props = {
  mode: "signup" | "signin";
};

export default function AuthForm({ mode }: Props) {
  const action = mode === "signup" ? signUp : signIn;
  const [state, formAction, pending] = useActionState(action, initialState);

  const submitLabel = mode === "signup" ? "Create account" : "Sign in";
  const altHref = mode === "signup" ? "/login" : "/signup";
  const altLabel =
    mode === "signup" ? "Already have an account?" : "Don't have an account?";
  const altCta = mode === "signup" ? "Sign in" : "Sign up";

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-[11px] text-muted uppercase tracking-[0.15em] font-semibold mb-2 block">
          Email
        </span>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-[11px] text-muted uppercase tracking-[0.15em] font-semibold mb-2 block">
          Password
        </span>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </label>

      {state.error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2.5">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? "Please wait…" : submitLabel}
      </button>

      <p className="text-xs text-muted text-center pt-2">
        {altLabel}{" "}
        <Link href={altHref} className="text-accent hover:underline font-semibold">
          {altCta}
        </Link>
      </p>
    </form>
  );
}
