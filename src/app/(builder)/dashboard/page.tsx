import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ArrowUpRight, Pencil } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { listSitesByOwner } from "@/lib/server/sites";
import { buttonClasses } from "@/components/ui/button";
import { siteUrl } from "@/lib/env";
import type { Site } from "@/lib/types";

export const metadata: Metadata = { title: "Your events" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  const sites = user ? await listSitesByOwner(user.uid) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Your events
          </h1>
          <p className="text-muted">
            Create, edit and publish your celebration sites.
          </p>
        </div>
        {sites.length > 0 && (
          <Link href="/templates" className={buttonClasses("primary", "md")}>
            <Plus className="h-4 w-4" />
            New event site
          </Link>
        )}
      </div>

      {sites.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <div className="rule-gold w-16" />
      <div className="flex max-w-sm flex-col gap-2">
        <h2 className="font-display text-2xl text-ink">
          Let&apos;s make your first site
        </h2>
        <p className="text-sm text-muted">
          Pick a design, add your details, and publish a beautiful page for your
          celebration.
        </p>
      </div>
      <Link href="/templates" className={buttonClasses("primary", "lg")}>
        <Plus className="h-4 w-4" />
        Create your first site
      </Link>
    </div>
  );
}

function SiteCard({ site }: { site: Site }) {
  const p = site.theme?.palette;
  const isLive = site.status === "published";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div
        className="relative flex h-28 items-end p-4"
        style={{
          background: p
            ? `linear-gradient(135deg, ${p.primary}, ${p.secondary})`
            : "var(--color-brand)",
        }}
      >
        <span
          className="rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
          style={{
            backgroundColor: isLive
              ? "rgba(255,255,255,0.92)"
              : "rgba(0,0,0,0.35)",
            color: isLive ? "#14624d" : "#fff",
          }}
        >
          {isLive ? "● Live" : "Draft"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="truncate text-lg font-medium text-ink">{site.title}</h3>
        <p className="truncate text-sm text-muted">
          {siteUrl(site.subdomain).replace(/^https?:\/\//, "")}
        </p>
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <Link
          href={`/sites/${site.id}/edit`}
          className={buttonClasses("secondary", "sm", "flex-1")}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
        {isLive && (
          <a
            href={siteUrl(site.subdomain)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("ghost", "sm")}
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
