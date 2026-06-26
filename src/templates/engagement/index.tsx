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

/* --------------------------------------------------------------------------
 * Engagement — a modern editorial spread. Everything hangs off a left margin
 * and a single refined vertical rule, the way a magazine sets a feature.
 * SIGNATURE: an oversized date numeral (the day she said yes) struck big as a
 * headline in the hero, echoed as small gold markers throughout. Rhythm is
 * varied on purpose — full-bleed split hero, an indented timeline, a clean
 * editorial events list (no cards), banded canvas/surface alternation.
 * ------------------------------------------------------------------------ */

const HAIRLINE = "color-mix(in srgb, var(--site-gold) 50%, transparent)";

const display = (color = "var(--site-ink)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

/** Day-of-month numeral for the signature, e.g. "2026-09-19" → "19". */
function dayNumeral(value?: string): string | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (m) return String(Number(m[3]));
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : String(d.getDate());
}

/** Month + year strap to sit beneath the big numeral. */
function monthYear(value?: string): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Small uppercase editorial label. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[0.7rem] uppercase tracking-[0.34em]"
      style={{ color: "var(--site-primary)" }}
    >
      {children}
    </span>
  );
}

/** A left-aligned section header: kicker + serif title, no centering. */
function SectionHead({
  index,
  kicker,
  title,
}: {
  index: string;
  kicker: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-5">
      <span
        aria-hidden
        className="text-sm tabular-nums"
        style={{ ...display("var(--site-gold)"), fontStyle: "italic" }}
      >
        {index}
      </span>
      <div className="flex flex-col gap-3">
        <Kicker>{kicker}</Kicker>
        <h2 className="text-3xl leading-[1.05] sm:text-4xl md:text-5xl" style={display()}>
          {title}
        </h2>
      </div>
    </div>
  );
}

export function EngagementSite({ site, lang }: { site: Site; lang?: string }) {
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
            return <Rsvp key={s.id} d={c.rsvp} subdomain={site.subdomain} />;
          case "footer":
            return <Footer key={s.id} d={c.footer} hero={c.hero} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

/* ------------------------------- Hero ----------------------------------- */
/* A full-bleed editorial split: type column on the left, photo plate on the
   right at desktop. The oversized date numeral is the signature. */

function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  const day = dayNumeral(hero.date);
  const strap = monthYear(hero.date);
  const alt = `${hero.titleA || "The couple"}${hero.titleB ? ` and ${hero.titleB}` : ""}`;

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-20 lg:px-16">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Type column. */}
        <Reveal className="flex min-w-0 flex-col justify-center">
          {hero.eyebrow && (
            <p
              className="mb-7 text-xs uppercase tracking-[0.42em]"
              style={{ color: "var(--site-primary)" }}
            >
              {hero.eyebrow}
            </p>
          )}

          <h1 className="flex flex-col">
            <span className="text-5xl leading-[0.95] sm:text-7xl lg:text-8xl" style={display()}>
              {hero.titleA || "Your Name"}
            </span>
            {hero.titleB && (
              <span className="mt-1 flex items-baseline gap-4">
                <span
                  className="text-2xl italic sm:text-4xl"
                  style={display("var(--site-primary)")}
                >
                  &amp;
                </span>
                <span className="text-5xl leading-[0.95] sm:text-7xl lg:text-8xl" style={display()}>
                  {hero.titleB}
                </span>
              </span>
            )}
          </h1>

          {hero.tagline && (
            <p
              className="mt-8 max-w-md text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--site-muted)" }}
            >
              {hero.tagline}
            </p>
          )}

          {hero.date && (
            <p
              className="mt-7 text-xs uppercase tracking-[0.28em]"
              style={{ color: "var(--site-secondary)" }}
            >
              {formatDate(hero.date)}
            </p>
          )}
        </Reveal>

        {/* Photo plate / signature column. */}
        <Reveal
          delay={0.08}
          className="relative flex min-h-[22rem] items-stretch lg:min-h-[34rem]"
        >
          {img ? (
            <figure className="relative w-full overflow-hidden">
              <div className="relative h-full min-h-[22rem] w-full lg:min-h-[34rem]">
                <Image
                  src={img}
                  alt={alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              </div>
              {/* SIGNATURE: the day numeral, struck over the lower corner. */}
              {day && (
                <figcaption
                  className="pointer-events-none absolute bottom-0 left-0 flex items-end gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--site-ink) 62%, transparent), transparent)",
                  }}
                >
                  <span
                    className="text-7xl leading-[0.8] sm:text-8xl"
                    style={{ ...display("var(--site-canvas)"), fontStyle: "italic" }}
                  >
                    {day}
                  </span>
                  {strap && (
                    <span
                      className="pb-2 text-[0.7rem] uppercase tracking-[0.3em]"
                      style={{ color: "var(--site-canvas)" }}
                    >
                      {strap}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          ) : (
            /* No photo: the signature date carries the column on its own. */
            <div
              className="flex w-full flex-col justify-end p-2"
              style={{ borderLeft: `1px solid ${HAIRLINE}` }}
            >
              {day ? (
                <div className="pl-6 sm:pl-10">
                  <span
                    className="block text-[7rem] leading-[0.78] sm:text-[11rem]"
                    style={{ ...display("var(--site-primary)"), fontStyle: "italic" }}
                  >
                    {day}
                  </span>
                  {strap && (
                    <span
                      className="mt-3 block text-sm uppercase tracking-[0.34em]"
                      style={{ color: "var(--site-secondary)" }}
                    >
                      {strap}
                    </span>
                  )}
                </div>
              ) : (
                <span
                  className="pl-6 text-5xl italic sm:pl-10 sm:text-7xl"
                  style={display("var(--site-primary)")}
                >
                  Save the date
                </span>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- Story ---------------------------------- */
/* An elegant indented timeline: a single hairline rule runs down a left
   gutter; each chapter hangs off it with a gold marker and a date eyebrow. */

function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section
      className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHead index="01" kicker="Our story" title={d.title || "How we got here"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p
              className="mt-7 max-w-xl pl-10 text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.intro}
            </p>
          </Reveal>
        )}

        {items.length > 0 && (
          <ol className="relative mt-14 pl-10">
            {/* The threaded rule. */}
            <span
              aria-hidden
              className="absolute bottom-3 left-[3px] top-2 w-px"
              style={{ backgroundColor: HAIRLINE }}
            />
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li className="relative pb-12 last:pb-0">
                  {/* Marker on the rule. */}
                  <span
                    aria-hidden
                    className="absolute -left-10 top-2 h-[7px] w-[7px] rotate-45"
                    style={{
                      backgroundColor: "var(--site-gold)",
                      boxShadow: "0 0 0 4px var(--site-surface)",
                    }}
                  />
                  <div className="grid gap-x-10 gap-y-2 md:grid-cols-[10rem_1fr] md:items-baseline">
                    {item.date && (
                      <p
                        className="text-xs uppercase tracking-[0.26em] md:text-right"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        {item.date}
                      </p>
                    )}
                    <div className={item.date ? "" : "md:col-start-2"}>
                      <h3 className="text-2xl sm:text-3xl" style={display("var(--site-primary)")}>
                        {item.title}
                      </h3>
                      <p
                        className="mt-3 max-w-xl text-base leading-relaxed"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ------------------------------- Events --------------------------------- */
/* A clean editorial list — NOT cards. Each entry is a row divided by hairlines,
   time on the left, the program on the right, like a printed running order. */

function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHead index="02" kicker="The evening" title={d?.title || "The celebration"} />
        </Reveal>

        <ol className="mt-12" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          {events.map((ev, i) => {
            const when = [formatDateShort(ev.date), formatTime(ev.startTime)]
              .filter(Boolean)
              .join(" · ");
            const endsAt = formatTime(ev.endTime);
            return (
              <Reveal key={ev.id} delay={i * 0.05}>
                <li
                  className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[13rem_1fr]"
                  style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                >
                  <div className="flex flex-col gap-1">
                    {when && (
                      <p
                        className="text-sm uppercase tracking-[0.18em]"
                        style={{ color: "var(--site-primary)" }}
                      >
                        {when}
                      </p>
                    )}
                    {endsAt && (
                      <p className="text-xs" style={{ color: "var(--site-muted)" }}>
                        until {endsAt}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-2xl sm:text-3xl" style={display()}>
                      {ev.name}
                    </h3>
                    {(ev.venueName || ev.address) && (
                      <p
                        className="mt-1.5 text-sm"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        {[ev.venueName, ev.address].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    {ev.description && (
                      <p
                        className="mt-3 max-w-xl text-base leading-relaxed"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {ev.description}
                      </p>
                    )}
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------- Gallery -------------------------------- */
/* Not a default section here, but kept correct: an editorial mosaic where the
   first frame runs tall, the rest tile beside it. */

function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section
      className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHead index="03" kicker="In pictures" title={d?.title || "Us, lately"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <figure
                className={`relative overflow-hidden ${
                  i === 0 ? "aspect-square sm:aspect-[4/5]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={storageUrl(p)}
                  alt={`A photo of the couple, number ${i + 1}`}
                  fill
                  sizes={
                    i === 0
                      ? "(max-width: 640px) 100vw, 40vw"
                      : "(max-width: 640px) 50vw, 22vw"
                  }
                  className="object-cover"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Venue ---------------------------------- */
/* A split band: the place set large on the left, the address and a quiet text
   link to directions on the right. */

function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHead index="03" kicker="Where" title={d.name || "The venue"} />
        </Reveal>
        <div className="mt-10 grid gap-8 pl-10 md:grid-cols-[1fr_auto] md:items-end">
          {d.address && (
            <p
              className="max-w-md text-lg leading-relaxed"
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
              className="group inline-flex items-center gap-3 self-start text-sm uppercase tracking-[0.22em] md:self-end"
              style={{ color: "var(--site-primary)" }}
            >
              <span
                className="border-b pb-1"
                style={{ borderColor: "color-mix(in srgb, var(--site-primary) 45%, transparent)" }}
              >
                Get directions
              </span>
              <span aria-hidden>&rarr;</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Rsvp ---------------------------------- */
/* A surface band: a left-aligned editorial intro across from the form. */

function Rsvp({ d, subdomain }: { d?: RsvpData; subdomain: string }) {
  return (
    <section
      className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
        <Reveal className="flex flex-col">
          <SectionHead index="04" kicker="Join us" title="Will you celebrate with us?" />
          {d?.note && (
            <p
              className="mt-7 max-w-md pl-10 text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.note}
            </p>
          )}
        </Reveal>
        <Reveal delay={0.06} className="md:pt-4">
          <RsvpForm subdomain={subdomain} />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- Footer --------------------------------- */

function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const names = hero
    ? `${hero.titleA ?? ""}${hero.titleB ? ` & ${hero.titleB}` : ""}`.trim()
    : "";
  const line = [names, formatDateShort(hero?.date)].filter(Boolean).join(" · ");
  return (
    <footer
      className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
      style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            {names && (
              <span
                className="text-4xl italic sm:text-5xl"
                style={{ fontFamily: "var(--site-display)", color: "var(--site-canvas)" }}
              >
                {names}
              </span>
            )}
            {d?.hosts && <p className="text-base opacity-90">{d.hosts}</p>}
          </div>
          <div className="flex flex-col gap-2 md:items-end md:text-right">
            {line && (
              <p
                className="text-xs uppercase tracking-[0.28em]"
                style={{ color: "var(--site-accent)" }}
              >
                {line}
              </p>
            )}
            {d?.note && <p className="max-w-xs text-sm opacity-75">{d.note}</p>}
          </div>
        </div>
        <span
          aria-hidden
          className="mt-10 block h-px w-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--site-gold) 55%, transparent)" }}
        />
      </div>
    </footer>
  );
}
