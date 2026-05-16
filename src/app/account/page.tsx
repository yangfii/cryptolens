import { redirect } from "next/navigation";
import { User, LogOut, Mail, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export const metadata = {
  title: "Account | Sastra trader",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const joined = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="icon-tile text-accent"
          style={{ width: 44, height: 44 }}
        >
          <User className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
          <p className="text-sm text-muted mt-0.5">
            Manage your Sastra trader profile.
          </p>
        </div>
      </div>

      <div className="premium-card rounded-2xl p-6 space-y-5">
        <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email ?? "—"} />
        <Row
          icon={<Calendar className="w-4 h-4" />}
          label="Joined"
          value={joined}
        />

        <form action={signOut} className="pt-4 border-t border-white/[0.06]">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] text-muted uppercase tracking-[0.15em] font-semibold mb-0.5">
          {label}
        </div>
        <div className="text-sm font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}
