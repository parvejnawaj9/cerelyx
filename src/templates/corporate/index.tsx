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

/** Shared display-face helper — headings only. */
const display = (color = "var(--site-ink)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

/** SIGNATURE: a monospace, zero-padded index number with a bold amber rule. */
function IndexMark({ n, label }: { n: number; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-sm tabular-nums"
        style={{ color: "var(--site-accent)" }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <span aria-hidden className="h-px w-8" style={{ backgroundColor: "var(--site-accent)" }} />
      {label && (
        <span
          className="font-mono text-[0.7rem] uppercase tracking-[0.32em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function CorporateSite({ site, lang }: { site: Site; lang?: string }) {
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

/* ----------------------------------------------------------------------------
 * Hero — full-bleed split. Index "00" + amber rule, bold left-aligned title,
 * a date "spec line", and a Register cue. Optional image fills the right column.
 * ------------------------------------------------------------------------- */
function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-7 px-6 py-20 sm:px-10 sm:py-28 lg:py-36">
          <Reveal className="flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-sm tabular-nums"
                style={{ color: "var(--site-accent)" }}
              >
                00
              </span>
              <span
                aria-hidden
                className="h-px w-10"
                style={{ backgroundColor: "var(--site-accent)" }}
              />
              <span
                className="font-mono text-[0.7rem] uppercase tracking-[0.34em]"
                style={{ color: "var(--site-canvas)" }}
              >
                {hero.eyebrow || "You're invited"}
              </span>
            </div>

            <h1
              className="max-w-xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl"
              style={display("var(--site-canvas)")}
            >
              {hero.titleA || "Your Event Title"}
            </h1>
            {hero.titleB && (
              <p
                className="text-xl sm:text-2xl"
                style={display("var(--site-accent)")}
              >
                {hero.titleB}
              </p>
            )}

            {hero.tagline && (
              <p
                className="max-w-md text-base leading-relaxed"
                style={{ color: "color-mix(in srgb, var(--site-canvas) 78%, transparent)" }}
              >
                {hero.tagline}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
              {hero.date && (
                <p
                  className="font-mono text-sm tabular-nums"
                  style={{ color: "var(--site-canvas)" }}
                >
                  {formatDate(hero.date)}
                </p>
              )}
              <a
                href="#register"
                className="inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold"
                style={{ backgroundColor: "var(--site-accent)", color: "var(--site-primary)" }}
              >
                Register
                <span aria-hidden>→</span>
              </a>
            </div>
          </Reveal>
        </div>

        {img ? (
          <div className="relative min-h-[18rem] lg:min-h-full">
            <Image
              src={img}
              alt={hero.titleA || "Event"}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, color-mix(in srgb, var(--site-primary) 55%, transparent), transparent 55%)",
              }}
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="relative hidden lg:block"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--site-canvas) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--site-canvas) 8%, transparent) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          >
            <span
              className="absolute bottom-10 right-10 font-mono text-[7rem] font-bold leading-none tabular-nums opacity-15"
              style={{ color: "var(--site-canvas)" }}
            >
              26
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/* Section header used by banded sections: index mark + bold heading. */
function Banner({ n, kicker, title }: { n: number; kicker: string; title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <IndexMark n={n} label={kicker} />
      <h2 className="text-3xl font-bold sm:text-4xl" style={display()}>
        {title}
      </h2>
    </div>
  );
}

/* Story is not part of the corporate default set, but stays renderable. */
function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section className="px-6 py-20 sm:px-10" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Banner n={1} kicker="Background" title={d.title || "Background"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{ color: "var(--site-muted)" }}>
              {d.intro}
            </p>
          </Reveal>
        )}
        {items.length > 0 && (
          <ol className="mt-12 flex flex-col gap-8">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--site-secondary)" }}>
                    {item.date || ""}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold" style={display()}>
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
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

/* ----------------------------------------------------------------------------
 * Events — the AGENDA. Times on the left in monospace, sessions on the right,
 * each row prefixed by its zero-padded index. The signature, at full strength.
 * ------------------------------------------------------------------------- */
function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-24" style={{ backgroundColor: "var(--site-canvas)" }}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Banner n={1} kicker="Schedule" title={d?.title || "Agenda"} />
        </Reveal>
        <ol className="mt-12">
          {events.map((ev, i) => {
            const time = formatTime(ev.startTime);
            const end = formatTime(ev.endTime);
            return (
              <Reveal key={ev.id} delay={i * 0.05}>
                <li
                  className="grid gap-x-6 gap-y-2 py-7 sm:grid-cols-[10rem_1fr]"
                  style={{ borderTop: "1px solid color-mix(in srgb, var(--site-muted) 22%, transparent)" }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm font-medium tabular-nums" style={{ color: "var(--site-primary)" }}>
                      {time || formatDateShort(ev.date) || "—"}
                    </span>
                    {time && end && (
                      <span className="font-mono text-xs tabular-nums" style={{ color: "var(--site-muted)" }}>
                        until {end}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <span
                      className="hidden font-mono text-xs tabular-nums sm:block"
                      style={{ color: "var(--site-accent)" }}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-semibold leading-snug" style={display()}>
                        {ev.name}
                      </h3>
                      {ev.venueName && (
                        <p className="text-sm font-medium" style={{ color: "var(--site-secondary)" }}>
                          {ev.venueName}
                        </p>
                      )}
                      {ev.description && (
                        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                          {ev.description}
                        </p>
                      )}
                    </div>
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

/* ----------------------------------------------------------------------------
 * Venue — split panel on surface. Address on the left, a directions CTA, and a
 * large index-numbered marker on the right.
 * ------------------------------------------------------------------------- */
function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-24" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto max-w-5xl">
        <div
          className="grid gap-10 rounded-sm p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]"
          style={{ borderLeft: "3px solid var(--site-accent)", backgroundColor: "var(--site-canvas)" }}
        >
          <Reveal className="flex flex-col gap-5">
            <Banner n={2} kicker="Location" title={d.name || "Venue"} />
            {d.address && (
              <p className="max-w-md text-base leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {d.address}
              </p>
            )}
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold"
                style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
              >
                Get directions
                <span aria-hidden>→</span>
              </a>
            )}
          </Reveal>

          <Reveal className="hidden items-end justify-end lg:flex">
            <span
              className="font-mono text-[6rem] font-bold leading-none tabular-nums"
              style={{ color: "color-mix(in srgb, var(--site-secondary) 22%, transparent)" }}
              aria-hidden
            >
              ↗
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Gallery not in the corporate default set, but stays renderable. */
function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section className="px-6 py-20 sm:px-10" style={{ backgroundColor: "var(--site-canvas)" }}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Banner n={3} kicker="Gallery" title={d?.title || "From the floor"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
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

/* ----------------------------------------------------------------------------
 * Rsvp — framed as "Register". A bordered card on the dark slate ground so the
 * form reads as the primary action of the page.
 * ------------------------------------------------------------------------- */
function Rsvp({ d, subdomain }: { d?: RsvpData; subdomain: string }) {
  return (
    <section
      id="register"
      className="scroll-mt-8 px-6 py-20 sm:px-10 sm:py-24"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <div className="mx-auto max-w-2xl">
        <Reveal className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm tabular-nums" style={{ color: "var(--site-accent)" }}>
              03
            </span>
            <span aria-hidden className="h-px w-8" style={{ backgroundColor: "var(--site-accent)" }} />
            <span
              className="font-mono text-[0.7rem] uppercase tracking-[0.32em]"
              style={{ color: "color-mix(in srgb, var(--site-canvas) 75%, transparent)" }}
            >
              Reserve your seat
            </span>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" style={display("var(--site-canvas)")}>
            Register
          </h2>
        </Reveal>

        {d?.note && (
          <Reveal>
            <p
              className="mt-5 max-w-xl text-sm leading-relaxed"
              style={{ color: "color-mix(in srgb, var(--site-canvas) 80%, transparent)" }}
            >
              {d.note}
            </p>
          </Reveal>
        )}

        <Reveal>
          <div
            className="mt-10 rounded-sm p-6 sm:p-8"
            style={{ backgroundColor: "var(--site-canvas)", borderTop: "3px solid var(--site-accent)" }}
          >
            <RsvpForm subdomain={subdomain} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Footer — structured close on canvas. Hosts on the left, a monospace event
 * spec line on the right.
 * ------------------------------------------------------------------------- */
function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const specLine = hero?.titleA
    ? `${hero.titleA}${hero.titleB ? ` & ${hero.titleB}` : ""}${
        hero.date ? ` · ${formatDateShort(hero.date)}` : ""
      }`
    : "";
  return (
    <footer
      className="px-6 py-14 sm:px-10"
      style={{
        backgroundColor: "var(--site-canvas)",
        borderTop: "1px solid color-mix(in srgb, var(--site-muted) 24%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span aria-hidden className="h-1 w-12" style={{ backgroundColor: "var(--site-accent)" }} />
          {d?.hosts && (
            <p className="text-lg font-semibold" style={display()}>
              {d.hosts}
            </p>
          )}
          {d?.note && (
            <p className="text-sm" style={{ color: "var(--site-muted)" }}>
              {d.note}
            </p>
          )}
        </div>
        {specLine && (
          <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--site-secondary)" }}>
            {specLine}
          </p>
        )}
      </div>
    </footer>
  );
}
