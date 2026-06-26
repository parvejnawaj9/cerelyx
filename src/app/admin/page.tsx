import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/server/users";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { builderUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Reserved for the Phase 4 admin dashboard. Gated by auth + role today so the
// surface and access check exist; full moderation tooling lands later.
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const profile = await getUserProfile(user.uid);
  const isAdmin = profile?.role === "admin";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-16 text-center">
      <Logo />
      <div className="mt-10 flex max-w-md flex-col items-center gap-4">
        <h1 className="font-display text-3xl text-ink">Admin console</h1>
        {isAdmin ? (
          <p className="text-muted">
            Moderation, analytics and site management arrive in Phase 4. Your
            admin access is recognised.
          </p>
        ) : (
          <p className="text-muted">
            This area is restricted to Cerelyx administrators.
          </p>
        )}
        <Link href={builderUrl("/dashboard")} className={buttonClasses("secondary", "md")}>
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
