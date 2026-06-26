import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { builderUrl } from "@/lib/env";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Cerelyx home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href={builderUrl("/sign-in")}
              className={buttonClasses("ghost", "sm")}
            >
              Sign in
            </Link>
            <Link
              href={builderUrl("/sign-up")}
              className={buttonClasses("primary", "sm")}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="text-sm text-muted">
              Made for life&apos;s once-in-a-lifetime moments.
            </p>
          </div>
          <p className="text-xs text-faint">
            © {2026} Cerelyx. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
