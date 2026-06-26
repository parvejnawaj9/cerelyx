import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Logo } from "@/components/ui/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" aria-label="Cerelyx dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-medium text-white"
              title={user.email ?? undefined}
              aria-hidden
            >
              {initial}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
