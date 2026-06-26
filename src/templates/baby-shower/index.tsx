import type { CSSProperties } from "react";
import Image from "next/image";
import type {
  Site,
  SiteContent,
  HeroData,
  StoryData,
  EventsData,
  VenueData,
  GalleryData,
  RsvpData,
  FooterData,
} from "@/lib/types";
import { siteCssVars } from "@/templates/site-style";
import { storageUrl } from "@/lib/images/url";
import { Reveal } from "@/templates/shared/reveal";
import { RsvpForm } from "@/templates/shared/rsvp-form";
import { formatDate, formatDateShort, formatTime, directionsUrl } from "@/templates/shared/format";
import { SharedSection, type RenderContext } from "@/templates/shared/sections";
import { MapEmbed } from "@/templates/shared/map";

/* ---------------------------------------------------------------------------
 * Layout concept: "a soft sky"
 *
 * The whole site sits under one calm arch. The SIGNATURE element is a layered
 * cloud + arch motif (inline SVG, blush/mint tints) that floats behind the hero
 * and recurs as a quiet rounded-arch crown on section headings and cards. The
 * rhythm alternates a full-bleed arched hero, a tender split note, an offset
 * timeline of gentle events, a centred venue card and a banded RSVP — nothing
 * is a generic centred stack.
 * ------------------------------------------------------------------------- */

const displayStyle = (color = "var(--site-primary)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

/** Signature: a soft layered cloud, drawn from overlapping rounded blobs. */
function Cloud({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 96"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 84c-18 0-32-12-32-29 0-15 12-26 27-27 3-17 18-28 35-28 14 0 26 7 33 18 5-3 11-5 17-5 16 0 29 12 31 27 13 2 23 12 23 26 0 17-15 28-33 28H40Z"
        fill="color-mix(in srgb, var(--site-accent) 22%, var(--site-surface))"
      />
    </svg>
  );
}

/** A tiny rounded arch crown that recurs above headings and cards. */
function ArchCrown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 28"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 26V20C8 9.5 31.3 1 60 1s52 8.5 52 19v6"
        stroke="color-mix(in srgb, var(--site-secondary) 60%, transparent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="6" r="3.5" fill="var(--site-accent)" />
    </svg>
  );
}

/** A small twinkling star/dot used as a gentle separator. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2c.6 4.7 2.7 6.8 7.4 7.4-4.7.6-6.8 2.7-7.4 7.4-.6-4.7-2.7-6.8-7.4-7.4C9.3 8.8 11.4 6.7 12 2Z"
        fill="var(--site-accent)"
      />
    </svg>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ArchCrown className="h-6 w-28" />
      {eyebrow && (
        <p
          className="text-[0.7rem] font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl" style={displayStyle()}>
        {title}
      </h2>
    </div>
  );
}

export function BabyShowerSite({
  site,
  lang,
  ctx,
}: {
  site: Site;
  lang?: string;
  ctx?: RenderContext;
}) {
  const locale = lang ?? site.defaultLanguage ?? "en";
  const c: SiteContent =
    site.content?.[locale] ??
    site.content?.[site.defaultLanguage] ??
    Object.values(site.content ?? {})[0] ??
    {};

  const sections = [...(site.sections ?? [])]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={siteCssVars(site.theme)} className="min-h-dvh">
      {sections.map((s) => {
        switch (s.type) {
          case "hero":
            return <Hero key={s.id} d={c.hero} />;
          case "story":
            return <Story key={s.id} d={c.story} />;
          case "events":
            return <Events key={s.id} d={c.events} />;
          case "venue":
            return <Venue key={s.id} d={c.venue} />;
          case "gallery":
            return <Gallery key={s.id} d={c.gallery} />;
          case "rsvp":
            return (
              <Rsvp
                key={s.id}
                d={c.rsvp}
                subdomain={site.subdomain}
                guestName={ctx?.guestName}
              />
            );
          case "footer":
            return <Footer key={s.id} d={c.footer} hero={c.hero} />;
          default:
            return (
              <SharedSection key={s.id} block={s} content={c} site={site} ctx={ctx} />
            );
        }
      })}
    </div>
  );
}

/* --- Hero: a full-bleed arch under a floating cloud (signature) ----------- */
function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  return (
    <section className="relative isolate overflow-hidden px-6 pb-24 pt-20 sm:pb-28 sm:pt-24">
      {/* soft sky wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -20%, color-mix(in srgb, var(--site-accent) 18%, transparent), transparent 60%), radial-gradient(90% 60% at 85% 110%, color-mix(in srgb, var(--site-secondary) 14%, transparent), transparent 55%)",
        }}
      />
      {/* signature floating clouds */}
      <Cloud className="pointer-events-none absolute -left-10 top-10 -z-10 h-24 w-56 opacity-90 sm:left-6 sm:h-28 sm:w-64" />
      <Cloud className="pointer-events-none absolute -right-12 top-28 -z-10 h-20 w-48 opacity-70 sm:right-8 sm:h-24 sm:w-56" />

      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
        <p
          className="text-[0.72rem] font-medium uppercase tracking-[0.34em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {hero.eyebrow || "A little one is on the way"}
        </p>

        {img && (
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-t-[12rem] rounded-b-[2.5rem]"
            style={{
              aspectRatio: "4 / 5",
              border: "6px solid var(--site-surface)",
              boxShadow:
                "0 30px 60px -34px color-mix(in srgb, var(--site-primary) 60%, transparent)",
            }}
          >
            <Image
              src={img}
              alt={`${hero.titleA}${hero.titleB ? ` & ${hero.titleB}` : ""}`}
              fill
              sizes="(max-width: 640px) 100vw, 24rem"
              className="object-cover"
            />
          </div>
        )}

        <h1 className="flex flex-col items-center gap-1">
          <span className="text-5xl leading-tight sm:text-7xl" style={displayStyle()}>
            {hero.titleA || "Baby Name"}
          </span>
          {hero.titleB && (
            <>
              <span
                className="my-1 text-2xl sm:text-3xl"
                style={displayStyle("var(--site-accent)")}
              >
                &amp;
              </span>
              <span className="text-5xl leading-tight sm:text-7xl" style={displayStyle()}>
                {hero.titleB}
              </span>
            </>
          )}
        </h1>

        <div className="flex items-center gap-3" aria-hidden>
          <span
            className="h-px w-10"
            style={{ backgroundColor: "color-mix(in srgb, var(--site-accent) 70%, transparent)" }}
          />
          <Sparkle className="h-4 w-4" />
          <span
            className="h-px w-10"
            style={{ backgroundColor: "color-mix(in srgb, var(--site-accent) 70%, transparent)" }}
          />
        </div>

        {hero.date && (
          <p className="text-base sm:text-lg" style={{ color: "var(--site-ink)" }}>
            {formatDate(hero.date)}
          </p>
        )}
        {hero.tagline && (
          <p
            className="max-w-md text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--site-muted)" }}
          >
            {hero.tagline}
          </p>
        )}
      </Reveal>
    </section>
  );
}

/* --- Story: a tender split note on surface, photo of words ---------------- */
function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section className="px-6 py-20" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16">
        <Reveal className="lg:sticky lg:top-16">
          <div className="flex flex-col items-start gap-4 text-left">
            <ArchCrown className="h-6 w-28" />
            <p
              className="text-[0.7rem] font-medium uppercase tracking-[0.32em]"
              style={{ color: "var(--site-secondary)" }}
            >
              From the heart
            </p>
            <h2 className="text-3xl sm:text-4xl" style={displayStyle()}>
              {d.title || "A note from us"}
            </h2>
            {d.intro && (
              <p
                className="max-w-md text-base leading-relaxed"
                style={{ color: "var(--site-muted)" }}
              >
                {d.intro}
              </p>
            )}
          </div>
        </Reveal>

        {items.length > 0 && (
          <ol className="flex flex-col gap-5">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li
                  className="rounded-[1.75rem] p-6 sm:p-7"
                  style={{
                    backgroundColor: "var(--site-canvas)",
                    boxShadow:
                      "0 20px 44px -34px color-mix(in srgb, var(--site-primary) 70%, transparent)",
                  }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-xl sm:text-2xl" style={displayStyle()}>
                      {item.title}
                    </h3>
                    {item.date && (
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--site-secondary) 16%, transparent)",
                          color: "var(--site-secondary)",
                        }}
                      >
                        {item.date}
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-3 text-sm leading-relaxed sm:text-base"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {item.body}
                  </p>
                  {item.imagePath && (
                    <div
                      className="relative mt-4 aspect-[16/10] w-full max-w-sm overflow-hidden rounded-[1.25rem]"
                      style={{ border: "4px solid var(--site-surface)" }}
                    >
                      <Image
                        src={storageUrl(item.imagePath)}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 24rem"
                        className="object-cover"
                      />
                    </div>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* --- Events: a gentle offset timeline of the day's flow ------------------- */
function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="The plan" title={d?.title || "How we'll celebrate"} />
        </Reveal>
        <ol className="relative mt-14 flex flex-col gap-8 pl-10 sm:pl-14">
          {/* the soft guide line */}
          <span
            aria-hidden
            className="absolute left-[0.6rem] top-2 h-[calc(100%-1rem)] w-[3px] rounded-full sm:left-[1.1rem]"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in srgb, var(--site-accent) 80%, transparent), color-mix(in srgb, var(--site-secondary) 60%, transparent))",
            }}
          />
          {events.map((ev, i) => {
            const when = [formatDateShort(ev.date), formatTime(ev.startTime)]
              .filter(Boolean)
              .join(" · ");
            const till = formatTime(ev.endTime);
            return (
              <Reveal key={ev.id} delay={i * 0.05}>
                <li className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[2.15rem] top-1.5 h-4 w-4 rounded-full ring-4 sm:-left-[3.15rem]"
                    style={{
                      backgroundColor: "var(--site-accent)",
                      ["--tw-ring-color" as string]: "var(--site-canvas)",
                    }}
                  />
                  <article
                    className="rounded-[1.75rem] p-6 sm:p-7"
                    style={{
                      backgroundColor: "var(--site-surface)",
                      boxShadow:
                        "0 22px 48px -36px color-mix(in srgb, var(--site-primary) 70%, transparent)",
                    }}
                  >
                    {ev.imagePath && (
                      <div
                        className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-[1.25rem]"
                        style={{ border: "4px solid var(--site-canvas)" }}
                      >
                        <Image
                          src={storageUrl(ev.imagePath)}
                          alt={ev.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 36rem"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-xl sm:text-2xl" style={displayStyle()}>
                        {ev.name}
                      </h3>
                      {when && (
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--site-secondary)" }}
                        >
                          {when}
                          {till ? ` – ${till}` : ""}
                        </p>
                      )}
                    </div>
                    {ev.venueName && (
                      <p className="mt-1 text-sm" style={{ color: "var(--site-ink)" }}>
                        {ev.venueName}
                      </p>
                    )}
                    {ev.description && (
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {ev.description}
                      </p>
                    )}
                    {directionsUrl(ev.mapUrl, ev.address) && (
                      <a
                        href={directionsUrl(ev.mapUrl, ev.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ color: "var(--site-primary)" }}
                      >
                        Get directions →
                      </a>
                    )}
                  </article>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* --- Venue: a centred arch-topped card ------------------------------------ */
function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section className="px-6 py-20" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto max-w-xl">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-t-[8rem] rounded-b-[2rem] px-8 py-12 text-center"
            style={{
              backgroundColor: "var(--site-canvas)",
              boxShadow:
                "0 30px 60px -40px color-mix(in srgb, var(--site-primary) 70%, transparent)",
            }}
          >
            <Cloud className="pointer-events-none absolute -right-8 -top-4 h-16 w-40 opacity-80" />
            <div className="relative flex flex-col items-center gap-4">
              <ArchCrown className="h-6 w-28" />
              <p
                className="text-[0.7rem] font-medium uppercase tracking-[0.32em]"
                style={{ color: "var(--site-secondary)" }}
              >
                Where to find us
              </p>
              <h2 className="text-3xl sm:text-4xl" style={displayStyle()}>
                {d.name || "The venue"}
              </h2>
              {d.address && (
                <p
                  className="max-w-sm text-sm leading-relaxed sm:text-base"
                  style={{ color: "var(--site-muted)" }}
                >
                  {d.address}
                </p>
              )}
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--site-primary)" }}
                >
                  Get directions
                </a>
              )}
              {d.address && (
                <div className="mt-6 w-full text-left">
                  <MapEmbed
                    query={d.address}
                    title={`Map of ${d.name || "the venue"}`}
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Gallery: a soft rounded mosaic --------------------------------------- */
function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading eyebrow="Sweet moments" title={d?.title || "A few favourites"} />
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <div
                className="relative aspect-square overflow-hidden rounded-[1.5rem]"
                style={{
                  border: "5px solid var(--site-surface)",
                  boxShadow:
                    "0 18px 40px -32px color-mix(in srgb, var(--site-primary) 70%, transparent)",
                }}
              >
                <Image
                  src={storageUrl(p)}
                  alt="A favourite moment"
                  fill
                  sizes="(max-width: 640px) 50vw, 14rem"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- RSVP: a calm banded invitation --------------------------------------- */
function Rsvp({
  d,
  subdomain,
  guestName,
}: {
  d?: RsvpData;
  subdomain: string;
  guestName?: string;
}) {
  return (
    <section
      className="relative isolate overflow-hidden px-6 py-20"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--site-accent) 14%, var(--site-canvas)), var(--site-canvas))",
      }}
    >
      <Cloud className="pointer-events-none absolute -left-8 top-6 -z-10 h-20 w-48 opacity-70" />
      <Cloud className="pointer-events-none absolute -right-8 bottom-6 -z-10 h-16 w-40 opacity-60" />
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading eyebrow="Join us" title="Will you celebrate with us?" />
        </Reveal>
        {d?.note && (
          <Reveal>
            <p
              className="mx-auto mb-8 mt-6 max-w-md text-center text-sm leading-relaxed sm:text-base"
              style={{ color: "var(--site-muted)" }}
            >
              {d.note}
            </p>
          </Reveal>
        )}
        <Reveal>
          <RsvpForm subdomain={subdomain} data={d} guestName={guestName} />
        </Reveal>
      </div>
    </section>
  );
}

/* --- Footer: a soft sign-off under a final cloud -------------------------- */
function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const line = hero?.titleA
    ? `${hero.titleA}${hero.titleB ? ` & ${hero.titleB}` : ""}${
        hero.date ? ` · ${formatDateShort(hero.date)}` : ""
      }`
    : "";
  return (
    <footer
      className="relative isolate overflow-hidden px-6 py-16 text-center"
      style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
    >
      <Cloud className="pointer-events-none absolute left-1/2 top-0 -z-10 h-16 w-48 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
        <Sparkle className="h-5 w-5" />
        {d?.hosts && (
          <p className="text-lg sm:text-xl" style={{ fontFamily: "var(--site-display)" }}>
            {d.hosts}
          </p>
        )}
        {line && <p className="text-sm opacity-80">{line}</p>}
        {d?.note && <p className="mt-1 text-xs opacity-60">{d.note}</p>}
      </div>
    </footer>
  );
}
