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
import {
  formatDate,
  formatDateShort,
  formatTime,
  directionsUrl,
} from "@/templates/shared/format";

/* -------------------------------------------------------------------------- */
/* Signature element: a minimal geometric monogram mark — a ring crossed by a  */
/* diagonal rule, with a small filled node. Quiet, modern, occasion-neutral.   */
/* Recurs at the hero, as a section opener, and in the footer.                 */
/* -------------------------------------------------------------------------- */

function GeoMark({
  className,
  title,
  tone = "dark",
}: {
  className?: string;
  title?: string;
  /** "dark": ring in primary (for light grounds). "light": ring in canvas (for the slate footer). */
  tone?: "dark" | "light";
}) {
  const ring = tone === "light" ? "var(--site-canvas)" : "var(--site-primary)";
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="17" stroke={ring} strokeWidth="1.5" />
      <path
        d="M11 33 L37 15"
        stroke="var(--site-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="37" cy="15" r="2.6" fill="var(--site-accent)" />
    </svg>
  );
}

/** The recurring single hairline accent rule (the second signature beat). */
function AccentRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "block",
        height: "2px",
        width: "3.25rem",
        background: "var(--site-accent)",
      }}
    />
  );
}

const display = (color = "var(--site-ink)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

const eyebrowStyle: CSSProperties = {
  color: "var(--site-secondary)",
  fontFamily: "var(--site-display)",
};

export function CustomSite({ site, lang }: { site: Site; lang?: string }) {
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

/* ----------------------------------- Hero --------------------------------- */
/* Asymmetric split: a tall typographic column on a warm canvas, with the      */
/* image (when present) as a full-height panel on the right. The geo mark sits */
/* above the title; the accent rule anchors the date.                          */

function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 8% 0%, color-mix(in srgb, var(--site-accent) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:py-28">
        <Reveal className="flex flex-col items-start gap-7">
          <div className="flex items-center gap-3">
            <GeoMark className="h-9 w-9" />
            <p
              className="text-[0.72rem] uppercase tracking-[0.32em]"
              style={eyebrowStyle}
            >
              {hero.eyebrow || "You're invited"}
            </p>
          </div>

          <h1
            className="text-balance text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"
            style={display("var(--site-primary)")}
          >
            {hero.titleA || "An Evening Together"}
            {hero.titleB && (
              <>
                <span
                  className="mx-1 align-middle text-3xl font-light sm:text-4xl"
                  style={{ color: "var(--site-accent)" }}
                >
                  {" & "}
                </span>
                <span style={display("var(--site-primary)")}>{hero.titleB}</span>
              </>
            )}
          </h1>

          {hero.date && (
            <div className="flex flex-col gap-3">
              <AccentRule />
              <p
                className="text-base sm:text-lg"
                style={{ color: "var(--site-ink)" }}
              >
                {formatDate(hero.date)}
              </p>
            </div>
          )}

          {hero.tagline && (
            <p
              className="max-w-md text-pretty text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {hero.tagline}
            </p>
          )}
        </Reveal>

        {img ? (
          <Reveal className="relative">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] sm:aspect-[3/4] lg:aspect-[4/5]"
              style={{
                boxShadow:
                  "0 30px 60px -36px color-mix(in srgb, var(--site-ink) 70%, transparent)",
              }}
            >
              <Image
                src={img}
                alt={`${hero.titleA || "Event"}${
                  hero.titleB ? ` & ${hero.titleB}` : ""
                }`}
                fill
                sizes="(max-width: 1024px) 100vw, 36rem"
                className="object-cover"
                priority
              />
            </div>
            <span
              aria-hidden
              className="absolute -bottom-3 -left-3 -z-10 h-24 w-24 rounded-[1.25rem]"
              style={{ background: "var(--site-gold)", opacity: 0.55 }}
            />
          </Reveal>
        ) : (
          <Reveal className="relative hidden lg:block">
            <div
              className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[1.25rem]"
              style={{
                backgroundColor: "var(--site-surface)",
                border:
                  "1px solid color-mix(in srgb, var(--site-gold) 40%, transparent)",
              }}
            >
              <GeoMark className="h-28 w-28 opacity-90" />
              <span
                aria-hidden
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
              >
                <AccentRule />
              </span>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Section opener ----------------------------- */

function SectionOpener({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <GeoMark className="h-7 w-7" />
        <p
          className="text-[0.7rem] uppercase tracking-[0.3em]"
          style={eyebrowStyle}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        className="text-3xl sm:text-4xl lg:text-[2.75rem]"
        style={display("var(--site-primary)")}
      >
        {title}
      </h2>
      <AccentRule />
    </div>
  );
}

/* ---------------------------------- Story --------------------------------- */
/* Optional section (not in custom defaults) — a quiet left-ruled timeline.    */

function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section
      className="px-6 py-20 lg:px-8 lg:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionOpener eyebrow="The backstory" title={d.title || "How we got here"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p
              className="mt-7 max-w-xl text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.intro}
            </p>
          </Reveal>
        )}
        {items.length > 0 && (
          <ol className="mt-12 flex flex-col">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li
                  className="grid gap-1 border-l py-6 pl-7 sm:grid-cols-[7rem_1fr] sm:gap-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--site-gold) 45%, transparent)",
                  }}
                >
                  {item.date && (
                    <p
                      className="text-xs uppercase tracking-[0.18em]"
                      style={{ color: "var(--site-accent)" }}
                    >
                      {item.date}
                    </p>
                  )}
                  <div>
                    <h3 className="text-xl" style={display()}>
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--site-muted)" }}
                    >
                      {item.body}
                    </p>
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

/* --------------------------------- Events --------------------------------- */
/* Signature rhythm: a full-width "ledger" of numbered rows separated by        */
/* hairlines — big index numerals on the left, the schedule on the right.       */

function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionOpener
            eyebrow="The schedule"
            title={d?.title || "How the evening runs"}
          />
        </Reveal>

        <ol
          className="mt-12 border-t"
          style={{
            borderColor:
              "color-mix(in srgb, var(--site-ink) 14%, transparent)",
          }}
        >
          {events.map((ev, i) => {
            const when = [formatDateShort(ev.date), formatTime(ev.startTime)]
              .filter(Boolean)
              .join(" · ");
            const endLabel = ev.endTime ? formatTime(ev.endTime) : "";
            return (
              <Reveal key={ev.id} delay={i * 0.05}>
                <li
                  className="grid items-start gap-3 border-b py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-6 sm:py-8"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--site-ink) 14%, transparent)",
                  }}
                >
                  <span
                    className="text-2xl tabular-nums sm:text-3xl"
                    style={display("var(--site-gold)")}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-xl sm:text-2xl" style={display()}>
                      {ev.name}
                    </h3>
                    {ev.venueName && (
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        {ev.venueName}
                      </p>
                    )}
                    {ev.description && (
                      <p
                        className="mt-1 max-w-2xl text-sm leading-relaxed"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {ev.description}
                      </p>
                    )}
                  </div>

                  {when && (
                    <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
                      <p
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: "var(--site-ink)" }}
                      >
                        {when}
                      </p>
                      {endLabel && (
                        <p
                          className="text-xs tabular-nums"
                          style={{ color: "var(--site-muted)" }}
                        >
                          until {endLabel}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------- Venue --------------------------------- */
/* Split band on surface: address column on the left, a framed monogram        */
/* "placecard" with the directions CTA on the right.                           */

function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section
      className="px-6 py-20 lg:px-8 lg:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal className="flex flex-col">
          <SectionOpener eyebrow="Getting there" title={d.name || "The venue"} />
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
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white outline-none transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--site-primary)" }}
            >
              Get directions
              <span aria-hidden>&rarr;</span>
            </a>
          )}
        </Reveal>

        <Reveal>
          <div
            className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[1.25rem]"
            style={{
              backgroundColor: "var(--site-canvas)",
              border:
                "1px solid color-mix(in srgb, var(--site-gold) 45%, transparent)",
            }}
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <GeoMark className="h-16 w-16" />
              {d.name && (
                <p
                  className="px-6 text-lg"
                  style={display("var(--site-primary)")}
                >
                  {d.name}
                </p>
              )}
              <AccentRule className="mx-auto" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- Gallery -------------------------------- */
/* Optional section — an offset two-up / three-up grid.                        */

function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section className="px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionOpener eyebrow="Moments" title={d?.title || "A few favourites"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <div
                className={`relative overflow-hidden rounded-[0.9rem] ${
                  i % 5 === 0 ? "aspect-[4/5]" : "aspect-square"
                }`}
                style={{
                  border:
                    "1px solid color-mix(in srgb, var(--site-gold) 40%, transparent)",
                }}
              >
                <Image
                  src={storageUrl(p)}
                  alt="Event photo"
                  fill
                  sizes="(max-width: 640px) 50vw, 16rem"
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

/* ---------------------------------- Rsvp ---------------------------------- */
/* Centered band on canvas with a framed form card on surface.                 */

function Rsvp({ d, subdomain }: { d?: RsvpData; subdomain: string }) {
  return (
    <section className="px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-xl">
        <Reveal className="flex flex-col items-center text-center">
          <GeoMark className="h-9 w-9" />
          <p
            className="mt-4 text-[0.7rem] uppercase tracking-[0.3em]"
            style={eyebrowStyle}
          >
            Will you join us?
          </p>
          <h2
            className="mt-3 text-3xl sm:text-4xl"
            style={display("var(--site-primary)")}
          >
            Let us know
          </h2>
          <AccentRule className="mx-auto mt-5" />
          {d?.note && (
            <p
              className="mx-auto mt-6 max-w-md text-sm leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.note}
            </p>
          )}
        </Reveal>

        <Reveal>
          <div
            className="mt-10 rounded-[1.25rem] p-6 sm:p-8"
            style={{
              backgroundColor: "var(--site-surface)",
              border:
                "1px solid color-mix(in srgb, var(--site-gold) 40%, transparent)",
              boxShadow:
                "0 26px 56px -40px color-mix(in srgb, var(--site-ink) 65%, transparent)",
            }}
          >
            <RsvpForm subdomain={subdomain} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- Footer --------------------------------- */
/* Slate band — the mark, the hosts, and the event signature line.             */

function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const signature = hero
    ? [
        `${hero.titleA ?? ""}${hero.titleB ? ` & ${hero.titleB}` : ""}`.trim(),
        formatDateShort(hero.date),
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <footer
      className="px-6 py-16 lg:px-8"
      style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
        <span
          className="rounded-full p-2"
          style={{
            border:
              "1px solid color-mix(in srgb, var(--site-canvas) 30%, transparent)",
          }}
        >
          <GeoMark className="h-7 w-7" tone="light" title="Event mark" />
        </span>

        {d?.hosts && (
          <p className="text-lg" style={{ fontFamily: "var(--site-display)" }}>
            {d.hosts}
          </p>
        )}

        {signature && <p className="text-sm opacity-80">{signature}</p>}

        {d?.note && <p className="text-xs opacity-60">{d.note}</p>}
      </div>
    </footer>
  );
}
