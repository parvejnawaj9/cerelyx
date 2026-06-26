import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Decorative brand panel (desktop only). */}
      <aside className="relative hidden overflow-hidden bg-brand-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-gold) 0, transparent 38%), radial-gradient(circle at 85% 75%, #2c8a6f 0, transparent 42%)",
          }}
        />
        <Link href="/" className="relative">
          <span className="inline-flex items-center gap-2.5 text-white">
            <Logo withText={false} />
            <span className="font-display text-[1.35rem] tracking-tight">
              Cerelyx
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="font-display text-3xl leading-snug text-white">
            “We sent one link. Everyone knew where to be, what to wear, and
            replied in a tap.”
          </p>
          <div className="mt-6 h-px w-24 bg-gold" />
          <p className="mt-4 text-sm text-white/70">
            For weddings, naming days, anniversaries — every once-in-a-lifetime
            moment.
          </p>
        </div>

        <p className="relative text-xs text-white/45">
          © Cerelyx — beautiful websites for life&apos;s milestones.
        </p>
      </aside>

      {/* Form area. */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
