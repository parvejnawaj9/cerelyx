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
import { SharedSection, type RenderContext } from "@/templates/shared/sections";
import { MapEmbed } from "@/templates/shared/map";

const displayFont: CSSProperties = { fontFamily: "var(--site-display)" };

/**
 * SIGNATURE: scattered confetti dots. Small filled circles in accent / secondary
 * / primary, sprinkled at fixed positions inside a relative container. Decorative
 * only — aria-hidden, pointer-events-none, no layout impact.
 */
function Confetti({ className = "" }: { className?: string }) {
  const dots = [
    { cx: 8, cy: 18, r: 5, fill: "var(--site-secondary)" },
    { cx: 22, cy: 64, r: 3.5, fill: "var(--site-accent)" },
    { cx: 36, cy: 30, r: 4.5, fill: "var(--site-primary)" },
    { cx: 52, cy: 78, r: 3, fill: "var(--site-secondary)" },
    { cx: 64, cy: 14, r: 5.5, fill: "var(--site-accent)" },
    { cx: 78, cy: 52, r: 4, fill: "var(--site-primary)" },
    { cx: 90, cy: 26, r: 3.5, fill: "var(--site-secondary)" },
    { cx: 16, cy: 90, r: 4, fill: "var(--site-accent)" },
    { cx: 46, cy: 50, r: 3, fill: "var(--site-primary)" },
    { cx: 84, cy: 84, r: 4.5, fill: "var(--site-secondary)" },
    { cx: 30, cy: 8, r: 3, fill: "var(--site-accent)" },
    { cx: 70, cy: 70, r: 3.5, fill: "var(--site-primary)" },
  ];
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
      ))}
    </svg>
  );
}

/** A tight confetti burst used inline as a heading flourish. */
function ConfettiBurst({ className = "" }: { className?: string }) {
  const dots = [
    { cx: 10, cy: 12, r: 3.5, fill: "var(--site-secondary)" },
    { cx: 24, cy: 6, r: 2.5, fill: "var(--site-accent)" },
    { cx: 32, cy: 20, r: 3, fill: "var(--site-primary)" },
    { cx: 18, cy: 24, r: 2, fill: "var(--site-accent)" },
    { cx: 4, cy: 22, r: 2.5, fill: "var(--site-primary)" },
  ];
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 36 30"
      fill="none"
      role="presentation"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
      ))}
    </svg>
  );
}

export function BirthdaySite({
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

/* ----------------------------- HERO ----------------------------------- */
/* Huge celebratory hero: a big rounded confetti-sprinkled banner. If a photo
   exists it sits in a thick rounded frame; otherwise a bold gradient stage. */
function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -20%, color-mix(in srgb, var(--site-accent) 30%, transparent), transparent 60%), radial-gradient(90% 80% at 100% 120%, color-mix(in srgb, var(--site-secondary) 22%, transparent), transparent 55%)",
        }}
      />
      <Confetti className="-z-10 opacity-70" />

      <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {(hero.eyebrow || true) && (
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-[0.2em] sm:text-sm"
            style={{
              backgroundColor: "var(--site-secondary)",
              color: "var(--site-surface)",
            }}
          >
            <ConfettiBurst className="h-4 w-5" />
            {hero.eyebrow || "It's a party!"}
          </span>
        )}

        <h1
          className="mt-7 text-5xl font-extrabold leading-[0.95] sm:mt-8 sm:text-7xl lg:text-8xl"
          style={{ ...displayFont, color: "var(--site-primary)" }}
        >
          {hero.titleA || "Let's celebrate!"}
        </h1>

        {hero.date && (
          <p
            className="mt-6 inline-block rounded-full px-6 py-2.5 text-base font-bold sm:text-lg"
            style={{
              backgroundColor: "var(--site-accent)",
              color: "var(--site-ink)",
            }}
          >
            {formatDate(hero.date)}
          </p>
        )}

        {hero.tagline && (
          <p
            className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--site-muted)" }}
          >
            {hero.tagline}
          </p>
        )}

        {img && (
          <div
            className="relative mt-10 aspect-[5/4] w-full max-w-xl overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]"
            style={{
              border: "10px solid var(--site-surface)",
              boxShadow:
                "0 30px 60px -28px color-mix(in srgb, var(--site-primary) 55%, transparent)",
              outline: "3px solid var(--site-accent)",
              outlineOffset: "-13px",
            }}
          >
            <Image
              src={img}
              alt={hero.titleA || "Birthday celebration"}
              fill
              sizes="(max-width: 640px) 100vw, 36rem"
              className="object-cover"
              priority
            />
          </div>
        )}
      </Reveal>
    </section>
  );
}

/* Story is not part of the birthday default sections, but the dispatch keeps it
   for content portability across templates. */
function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section
      className="px-5 py-20 sm:px-6"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionTitle text={d.title || "The story"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p
              className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.intro}
            </p>
          </Reveal>
        )}
        {items.length > 0 && (
          <ol className="mt-10 flex flex-col gap-6">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li
                  className="rounded-[1.5rem] p-6"
                  style={{ backgroundColor: "var(--site-canvas)" }}
                >
                  {item.date && (
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--site-secondary)" }}
                    >
                      {item.date}
                    </p>
                  )}
                  <h3
                    className="mt-1 text-xl font-extrabold"
                    style={{ ...displayFont, color: "var(--site-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {item.body}
                  </p>
                  {item.imagePath && (
                    <div className="relative mt-4 aspect-[16/10] w-full max-w-sm overflow-hidden rounded-[1.25rem]">
                      <Image
                        src={storageUrl(item.imagePath)}
                        alt={item.title || "Story photo"}
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

/* --------------------------- SECTION TITLE ---------------------------- */
function SectionTitle({ text, kicker }: { text: string; kicker?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ConfettiBurst className="h-6 w-8" />
      {kicker && (
        <p
          className="text-xs font-extrabold uppercase tracking-[0.22em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {kicker}
        </p>
      )}
      <h2
        className="text-4xl font-extrabold sm:text-5xl"
        style={{ ...displayFont, color: "var(--site-primary)" }}
      >
        {text}
      </h2>
    </div>
  );
}

/* ----------------------------- EVENTS --------------------------------- */
/* "The plan" — a fun numbered timeline of color-pop cards. */
function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  const dotColors = [
    "var(--site-secondary)",
    "var(--site-accent)",
    "var(--site-primary)",
  ];
  // Legible number colour per badge background (accent is light → use ink).
  const dotText = [
    "var(--site-surface)",
    "var(--site-ink)",
    "var(--site-surface)",
  ];
  return (
    <section className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionTitle kicker="Here's how the day goes" text={d?.title || "The plan"} />
        </Reveal>
        <ol className="mt-12 flex flex-col gap-5">
          {events.map((ev, i) => {
            const color = dotColors[i % dotColors.length];
            const textColor = dotText[i % dotText.length];
            const when = [formatDateShort(ev.date), formatTime(ev.startTime)]
              .filter(Boolean)
              .join(" · ");
            return (
              <Reveal key={ev.id} delay={i * 0.05}>
                <li
                  className="flex items-stretch gap-4 rounded-[1.75rem] p-5 sm:gap-5 sm:p-6"
                  style={{
                    backgroundColor: "var(--site-surface)",
                    boxShadow:
                      "0 22px 44px -32px color-mix(in srgb, var(--site-ink) 70%, transparent)",
                  }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-extrabold sm:h-14 sm:w-14 sm:text-2xl"
                    style={{ backgroundColor: color, color: textColor }}
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    {ev.imagePath && (
                      <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-[1.25rem]">
                        <Image
                          src={storageUrl(ev.imagePath)}
                          alt={ev.name || "Event photo"}
                          fill
                          sizes="(max-width: 640px) 100vw, 28rem"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3
                        className="text-xl font-extrabold sm:text-2xl"
                        style={{ ...displayFont, color: "var(--site-ink)" }}
                      >
                        {ev.name}
                      </h3>
                      {when && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold sm:text-sm"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--site-accent) 28%, transparent)",
                            color: "var(--site-ink)",
                          }}
                        >
                          {when}
                          {ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}
                        </span>
                      )}
                    </div>
                    {ev.venueName && (
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        {ev.venueName}
                      </p>
                    )}
                    {ev.description && (
                      <p
                        className="mt-0.5 text-sm leading-relaxed"
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
                        className="mt-1.5 inline-flex w-fit items-center gap-1 text-sm font-extrabold"
                        style={{ color: "var(--site-secondary)" }}
                      >
                        Get directions
                      </a>
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

/* ----------------------------- VENUE ---------------------------------- */
/* Banded surface section, big rounded card with a directions pill. */
function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section
      className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <Confetti className="opacity-25" />
      <div className="relative mx-auto max-w-2xl">
        <Reveal className="flex flex-col items-center text-center">
          <SectionTitle kicker="Where the fun happens" text={d.name || "The spot"} />
          {d.address && (
            <p
              className="mt-6 max-w-md text-base leading-relaxed sm:text-lg"
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
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5 sm:text-base"
              style={{
                backgroundColor: "var(--site-primary)",
                color: "var(--site-surface)",
              }}
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

/* ----------------------------- GALLERY -------------------------------- */
/* Playful staggered grid of rounded snapshots. */
function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionTitle kicker="Captured chaos" text={d?.title || "Snapshots"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <div
                className={`relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] ${
                  i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
                style={{
                  border: "4px solid var(--site-surface)",
                  boxShadow:
                    "0 18px 36px -28px color-mix(in srgb, var(--site-ink) 70%, transparent)",
                }}
              >
                <Image
                  src={storageUrl(p)}
                  alt="Party photo"
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

/* ----------------------------- RSVP ----------------------------------- */
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
      className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <Confetti className="opacity-30" />
      <div className="relative mx-auto max-w-2xl">
        <Reveal>
          <SectionTitle kicker="Don't miss it" text="Are you in?" />
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
        <Reveal className={d?.note ? "" : "mt-8"}>
          <RsvpForm subdomain={subdomain} data={d} guestName={guestName} />
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER --------------------------------- */
function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  const line = hero?.titleA
    ? [hero.titleA, hero.date ? formatDateShort(hero.date) : ""]
        .filter(Boolean)
        .join(" · ")
    : "";
  return (
    <footer
      className="relative overflow-hidden px-5 py-16 text-center sm:px-6 sm:py-20"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <Confetti className="opacity-40" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
        <ConfettiBurst className="h-7 w-10" />
        {d?.hosts && (
          <p
            className="text-2xl font-extrabold sm:text-3xl"
            style={{ ...displayFont, color: "var(--site-canvas)" }}
          >
            {d.hosts}
          </p>
        )}
        {d?.note && (
          <p
            className="text-sm sm:text-base"
            style={{ color: "color-mix(in srgb, var(--site-canvas) 88%, transparent)" }}
          >
            {d.note}
          </p>
        )}
        {line && (
          <p
            className="mt-1 text-sm font-semibold"
            style={{ color: "color-mix(in srgb, var(--site-accent) 95%, transparent)" }}
          >
            {line}
          </p>
        )}
      </div>
    </footer>
  );
}
