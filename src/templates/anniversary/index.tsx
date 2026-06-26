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

/* --------------------------------------------------------------------------
 * Anniversary — a centred, classical keepsake. Hairline rules and a large
 * engraved numeral (the years celebrated) carry the identity through every
 * band, alternating canvas/surface for rhythm.
 * ------------------------------------------------------------------------ */

const display = (color = "var(--site-primary)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

const HAIRLINE = "color-mix(in srgb, var(--site-gold) 55%, transparent)";

/** The number of years from an eyebrow — prefers a digit next to "years"/an
 * ordinal (e.g. "25 Years" / "25th" → 25), else the first standalone integer. */
function yearsFrom(text?: string): string | null {
  if (!text) return null;
  const near =
    /(\d{1,3})\s*(?:years?|yrs?)\b/i.exec(text) ||
    /(\d{1,3})(?:st|nd|rd|th)\b/i.exec(text);
  if (near) return near[1]!;
  const m = /\b(\d{1,3})\b/.exec(text);
  return m ? m[1]! : null;
}

/** Two-letter monogram from the couple's initials. */
function monogram(a?: string, b?: string): string {
  const first = (a ?? "").trim().charAt(0).toUpperCase();
  const second = (b ?? "").trim().charAt(0).toUpperCase();
  return [first, second].filter(Boolean).join(" & ") || "—";
}

/** A short hairline rule with a centred brass lozenge — the recurring divider. */
function Rule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center gap-3 ${className ?? ""}`}
    >
      <span className="h-px w-12 sm:w-16" style={{ backgroundColor: HAIRLINE }} />
      <span
        className="h-1.5 w-1.5 rotate-45"
        style={{ backgroundColor: "var(--site-gold)" }}
      />
      <span className="h-px w-12 sm:w-16" style={{ backgroundColor: HAIRLINE }} />
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.7rem] uppercase tracking-[0.34em]"
      style={{ color: "var(--site-secondary)" }}
    >
      {children}
    </p>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl sm:text-4xl" style={display()}>
        {title}
      </h2>
      <Rule />
    </div>
  );
}

export function AnniversarySite({ site, lang, ctx }: { site: Site; lang?: string; ctx?: RenderContext }) {
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
            return <Rsvp key={s.id} d={c.rsvp} subdomain={site.subdomain} guestName={ctx?.guestName} />;
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

/* ------------------------------- Hero ----------------------------------- */

function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  const years = yearsFrom(hero.eyebrow);
  const alt = `${hero.titleA || "The couple"}${hero.titleB ? ` & ${hero.titleB}` : ""}`;

  return (
    <section className="relative isolate overflow-hidden px-6 py-20 text-center sm:py-28">
      {/* Soft engraved-plate wash behind everything. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--site-gold) 16%, transparent), transparent 60%)",
        }}
      />

      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-7">
        {hero.eyebrow && <Eyebrow>{hero.eyebrow}</Eyebrow>}

        {/* SIGNATURE: the years celebrated, struck like a medal between hairlines. */}
        <div className="flex w-full flex-col items-center gap-5">
          <span
            aria-hidden
            className="h-px w-full max-w-xs"
            style={{ backgroundColor: HAIRLINE }}
          />
          <div className="flex flex-col items-center">
            {years ? (
              <>
                <span
                  className="text-[5.5rem] leading-[0.85] sm:text-[8rem]"
                  style={display("var(--site-gold)")}
                >
                  {years}
                </span>
                <span
                  className="mt-2 text-[0.7rem] uppercase tracking-[0.42em]"
                  style={{ color: "var(--site-secondary)" }}
                >
                  Years Together
                </span>
              </>
            ) : (
              <span
                className="text-6xl sm:text-7xl"
                style={display("var(--site-gold)")}
              >
                {monogram(hero.titleA, hero.titleB)}
              </span>
            )}
          </div>
          <span
            aria-hidden
            className="h-px w-full max-w-xs"
            style={{ backgroundColor: HAIRLINE }}
          />
        </div>

        {img && (
          <div className="relative mt-1 aspect-[5/4] w-full max-w-md overflow-hidden rounded-[0.25rem]">
            <Image
              src={img}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-2.5 rounded-[0.15rem]"
              style={{ border: "1px solid color-mix(in srgb, var(--site-surface) 70%, transparent)" }}
            />
          </div>
        )}

        <h1 className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-tight sm:text-6xl" style={display()}>
            {hero.titleA || "Your Names"}
          </span>
          {hero.titleB && (
            <>
              <span
                className="my-1 text-xl italic sm:text-2xl"
                style={display("var(--site-secondary)")}
              >
                and
              </span>
              <span className="text-4xl leading-tight sm:text-6xl" style={display()}>
                {hero.titleB}
              </span>
            </>
          )}
        </h1>

        {hero.date && (
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "var(--site-ink)" }}>
            {formatDate(hero.date)}
          </p>
        )}
        {hero.tagline && (
          <p
            className="max-w-xl text-base leading-relaxed"
            style={{ color: "var(--site-muted)" }}
          >
            {hero.tagline}
          </p>
        )}
      </Reveal>
    </section>
  );
}

/* ------------------------------- Story ---------------------------------- */
/* A centred memory timeline: a single brass spine with years on alternating
   sides at desktop, stacked cleanly on mobile. */

function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section
      className="px-6 py-20 sm:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="A timeline of us" title={d.title || "Our years together"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p
              className="mx-auto mt-7 max-w-xl text-center text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.intro}
            </p>
          </Reveal>
        )}

        {items.length > 0 && (
          <ol className="relative mt-14">
            {/* The brass spine. */}
            <span
              aria-hidden
              className="absolute bottom-2 left-4 top-2 w-px sm:left-1/2 sm:-translate-x-1/2"
              style={{ backgroundColor: HAIRLINE }}
            />
            {items.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <Reveal key={item.id} delay={i * 0.05}>
                  <li
                    className={`relative pb-12 pl-12 last:pb-0 sm:w-1/2 sm:pl-0 ${
                      left ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12 sm:text-left"
                    }`}
                  >
                    {/* Node on the spine. */}
                    <span
                      className={`absolute top-1.5 h-3 w-3 rotate-45 left-[10px] sm:left-auto ${
                        left ? "sm:-right-[6px]" : "sm:-left-[6px]"
                      }`}
                      style={{
                        backgroundColor: "var(--site-gold)",
                        boxShadow: "0 0 0 4px var(--site-surface)",
                      }}
                    />
                    {item.date && (
                      <p
                        className="text-xs uppercase tracking-[0.3em]"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        {item.date}
                      </p>
                    )}
                    <h3 className="mt-1.5 text-2xl" style={display()}>
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--site-muted)" }}
                    >
                      {item.body}
                    </p>
                    {item.imagePath && (
                      <div
                        className={`relative mt-4 aspect-[16/10] w-full max-w-xs overflow-hidden rounded-[0.2rem] ${
                          left ? "sm:ml-auto" : ""
                        }`}
                        style={{ border: `1px solid ${HAIRLINE}` }}
                      >
                        <Image
                          src={storageUrl(item.imagePath)}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 18rem"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </li>
                </Reveal>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ------------------------------- Events --------------------------------- */
/* Not in default sections, but kept correct: a centred ordered list of
   classical event cards. */

function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="The evening" title={d?.title || "Order of celebration"} />
        </Reveal>
        <ol className="mx-auto mt-12 flex max-w-xl flex-col gap-4">
          {events.map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.05}>
              <li
                className="rounded-[0.25rem] px-6 py-5 text-center"
                style={{
                  backgroundColor: "var(--site-surface)",
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                {ev.imagePath && (
                  <div className="relative mx-auto mb-4 aspect-[5/3] w-full max-w-md overflow-hidden rounded-[0.2rem]">
                    <Image
                      src={storageUrl(ev.imagePath)}
                      alt={ev.name || "Event photo"}
                      fill
                      sizes="(max-width: 768px) 100vw, 28rem"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl" style={display()}>
                  {ev.name}
                </h3>
                {(ev.date || ev.startTime) && (
                  <p
                    className="mt-1 text-sm uppercase tracking-[0.18em]"
                    style={{ color: "var(--site-secondary)" }}
                  >
                    {[formatDateShort(ev.date), formatTime(ev.startTime)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {ev.venueName && (
                  <p className="mt-1 text-sm" style={{ color: "var(--site-ink)" }}>
                    {ev.venueName}
                  </p>
                )}
                {ev.description && (
                  <p
                    className="mx-auto mt-2 max-w-md text-sm leading-relaxed"
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
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]"
                    style={{ color: "var(--site-primary)" }}
                  >
                    Get directions
                  </a>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------- Gallery -------------------------------- */
/* A "gallery of years": a tidy framed grid, each plate matted like a print. */

function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section
      className="px-6 py-20 sm:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Then & now" title={d?.title || "A gallery of years"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <figure
                className="relative aspect-[4/5] overflow-hidden rounded-[0.2rem] p-2"
                style={{
                  backgroundColor: "var(--site-canvas)",
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={storageUrl(p)}
                    alt={`A memory from over the years, photo ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18rem"
                    className="object-cover"
                  />
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Venue ---------------------------------- */

function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal className="flex w-full flex-col items-center">
          <SectionHeading eyebrow="Where to find us" title={d.name || "The venue"} />
          {d.address && (
            <p
              className="mt-7 max-w-md text-base leading-relaxed"
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
              className="mt-7 inline-flex items-center gap-2 rounded-[0.25rem] px-7 py-3 text-sm font-medium uppercase tracking-[0.16em] text-white"
              style={{ backgroundColor: "var(--site-primary)" }}
            >
              Get directions
            </a>
          )}
        </Reveal>
        {d.address && (
          <Reveal className="mt-10 w-full">
            <MapEmbed query={d.address} title={`Map of ${d.name || "the venue"}`} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* -------------------------------- Rsvp ---------------------------------- */

function Rsvp({ d, subdomain, guestName }: { d?: RsvpData; subdomain: string; guestName?: string }) {
  return (
    <section
      className="px-6 py-20 sm:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading eyebrow="Join us" title="Will you celebrate with us?" />
        </Reveal>
        {d?.note && (
          <Reveal>
            <p
              className="mx-auto mb-9 mt-7 max-w-md text-center text-sm leading-relaxed"
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

/* ------------------------------- Footer --------------------------------- */

function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const line = hero
    ? [
        `${hero.titleA ?? ""}${hero.titleB ? ` & ${hero.titleB}` : ""}`.trim(),
        formatDateShort(hero.date),
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  return (
    <footer
      className="px-6 py-16 text-center"
      style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <span
          className="text-2xl"
          style={{ fontFamily: "var(--site-display)", color: "var(--site-gold)" }}
        >
          {monogram(hero?.titleA, hero?.titleB)}
        </span>
        <span aria-hidden className="h-px w-16" style={{ backgroundColor: "color-mix(in srgb, var(--site-gold) 60%, transparent)" }} />
        {d?.hosts && (
          <p className="text-lg" style={{ fontFamily: "var(--site-display)" }}>
            {d.hosts}
          </p>
        )}
        {line && <p className="text-sm opacity-80">{line}</p>}
        {d?.note && <p className="max-w-md text-sm opacity-70">{d.note}</p>}
      </div>
    </footer>
  );
}
