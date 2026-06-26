import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPublishedSiteBySubdomain } from "@/lib/server/sites";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";
import { SiteRenderer } from "@/templates/registry";
import { siteUrl } from "@/lib/env";
import type { Site, SiteContent } from "@/lib/types";
import { hasAccess, resolveGuestForHint } from "@/lib/server/access";
import { getApprovedWishes, resolveGuestNameBySlug } from "@/lib/server/responses";
import { maskFor, genericHint } from "@/lib/masking";
import { ClaimPage } from "./claim";
import { LockScreen } from "./lock-screen";

type Params = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function displayTitle(site: Site): string {
  const hero = (site.content?.[site.defaultLanguage] as SiteContent | undefined)?.hero;
  if (hero?.titleA) {
    return hero.titleB ? `${hero.titleA} & ${hero.titleB}` : hero.titleA;
  }
  return site.title;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await getPublishedSiteBySubdomain(subdomain);

  if (!site) {
    return { title: "Claim this site", robots: { index: false, follow: false } };
  }

  const c = (site.content?.[site.defaultLanguage] ?? {}) as SiteContent;
  const title = site.seo?.title || displayTitle(site);

  if (site.privacy !== "open") {
    // The lock screen is indexable & content-free; the gated content is noindex
    // (and crawlers never hold the access cookie, so they only ever see the lock).
    const granted = await hasAccess(site.id);
    return {
      title,
      description: "You're invited — enter to see the details.",
      robots: granted ? { index: false, follow: false } : undefined,
      alternates: { canonical: siteUrl(subdomain) },
    };
  }

  const description =
    site.seo?.description || c.hero?.tagline || "You're invited — see all the details.";
  return {
    title,
    description,
    alternates: { canonical: siteUrl(subdomain) },
    openGraph: { title, description, url: siteUrl(subdomain), type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublishedSitePage({ params, searchParams }: Params) {
  const { subdomain } = await params;
  const site = await getPublishedSiteBySubdomain(subdomain);
  if (!site) return <ClaimPage subdomain={subdomain} />;

  // ---- access gate for private sites (brief §8) ----
  if (site.privacy !== "open") {
    const granted = await hasAccess(site.id);
    if (!granted) {
      let greeting: string | undefined;
      let hint = "";
      if (site.privacy === "guestVerify" && site.verifyField) {
        const sp = await searchParams;
        const g = typeof sp.g === "string" ? sp.g : undefined;
        if (g) {
          // Throttle the hint-resolution path so it can't be used as an
          // unbounded guest-membership/identifier oracle.
          const { allowed } = rateLimit(
            `hint:${clientIp(await headers())}:${subdomain}`,
            30,
            10 * 60 * 1000
          );
          if (allowed) {
            const resolved = await resolveGuestForHint(
              site.id,
              g,
              site.verifyField
            );
            if (resolved) {
              greeting = resolved.name;
              hint = maskFor(site.verifyField, resolved.value);
            }
          }
        }
        if (!hint) hint = genericHint(site.verifyField);
      }
      return (
        <LockScreen
          subdomain={subdomain}
          title={displayTitle(site)}
          theme={site.theme}
          privacy={site.privacy}
          verifyField={site.verifyField ?? null}
          greeting={greeting}
          hint={hint}
        />
      );
    }
  }

  // ---- content (open, or private + granted) ----
  const c = (site.content?.[site.defaultLanguage] ?? {}) as SiteContent;
  const hero = c.hero;

  // Prefill a known guest (personalized ?g= link) and load approved wishes when
  // a wishes section is on the page — both server-side so gated sites work too.
  const sp = await searchParams;
  const g = typeof sp.g === "string" ? sp.g : undefined;
  const guestName = g ? await resolveGuestNameBySlug(site.id, g) : undefined;
  const hasWishes = (site.sections ?? []).some(
    (s) => s.type === "wishes" && s.visible
  );
  const approvedWishes = hasWishes ? await getApprovedWishes(site.id) : undefined;
  const jsonLd =
    site.privacy === "open" && hero?.date
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: displayTitle(site),
          startDate: hero.date,
          eventStatus: "https://schema.org/EventScheduled",
          location: c.venue?.name
            ? {
                "@type": "Place",
                name: c.venue.name,
                address: c.venue.address ?? undefined,
              }
            : undefined,
          url: siteUrl(subdomain),
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <SiteRenderer site={site} ctx={{ guestName, approvedWishes }} />
    </>
  );
}
