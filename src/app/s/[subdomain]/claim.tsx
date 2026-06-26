import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { builderUrl, marketingUrl, siteUrl } from "@/lib/env";
import { isReserved } from "@/lib/subdomains";

/** Shown when a subdomain has no published site (brief §2). */
export function ClaimPage({ subdomain }: { subdomain: string }) {
  const reserved = isReserved(subdomain);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-16 text-center">
      <Link href={marketingUrl("/")} className="mb-10">
        <Logo />
      </Link>

      <div className="flex max-w-md flex-col items-center gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
          {siteUrl(subdomain).replace(/^https?:\/\//, "")}
        </span>

        {reserved ? (
          <>
            <h1 className="font-display text-3xl text-ink">
              This address is reserved
            </h1>
            <p className="text-muted">
              <span className="font-medium text-ink">{subdomain}</span> can&apos;t be
              claimed. Pick a name that&apos;s all yours instead.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-ink">
              This site doesn&apos;t exist yet
            </h1>
            <p className="text-muted">
              The address{" "}
              <span className="font-medium text-ink">{subdomain}</span> is
              available. Make it the home for your celebration in minutes.
            </p>
          </>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href={builderUrl("/sign-up")}
            className={buttonClasses("primary", "lg")}
          >
            {reserved ? "Create your site" : `Claim ${subdomain}`}
          </Link>
          <Link href={marketingUrl("/")} className={buttonClasses("secondary", "lg")}>
            See how it works
          </Link>
        </div>
      </div>
    </main>
  );
}
