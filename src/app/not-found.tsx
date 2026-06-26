import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-16 text-center">
      <Logo />
      <div className="mt-10 flex max-w-md flex-col items-center gap-4">
        <p className="font-display text-6xl text-gold">404</p>
        <h1 className="font-display text-2xl text-ink">
          We couldn&apos;t find that page
        </h1>
        <p className="text-muted">
          The link may be broken, or the page may have moved.
        </p>
        <Link href="/" className={buttonClasses("primary", "md")}>
          Go home
        </Link>
      </div>
    </main>
  );
}
