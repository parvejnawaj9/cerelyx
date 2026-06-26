import type { CSSProperties } from "react";
import Image from "next/image";
import type {
  Site,
  SiteContent,
  Theme,
  HeroData,
  StoryData,
  EventsData,
  VenueData,
  GalleryData,
  RsvpData,
  FooterData,
} from "@/lib/types";
import { storageUrl } from "@/lib/images/url";
import { Reveal } from "./reveal";
import { RsvpForm } from "./rsvp-form";
import { CornerFiligree, DividerOrnament, LotusMark } from "./motifs";
import { formatDate, formatDateShort, formatTime, directionsUrl } from "./format";

/** Map the theme into the --site-* CSS variables the sections consume. */
function siteStyle(theme: Theme): CSSProperties {
  const p = theme.palette;
  return {
    ["--site-canvas"]: p.canvas,
    ["--site-surface"]: p.surface,
    ["--site-ink"]: p.ink,
    ["--site-muted"]: p.muted,
    ["--site-primary"]: p.primary,
    ["--site-secondary"]: p.secondary,
    ["--site-accent"]: p.accent,
    ["--site-gold"]: p.gold,
    ["--site-display"]: theme.fonts.display,
    ["--site-body"]: theme.fonts.body,
    backgroundColor: p.canvas,
    color: p.ink,
    fontFamily: theme.fonts.body,
  } as CSSProperties;
}

const display = (color = "var(--site-primary)"): CSSProperties => ({
  fontFamily: "var(--site-display)",
  color,
});

export function RoyalIndianSite({ site, lang }: { site: Site; lang?: string }) {
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
    <div style={siteStyle(site.theme)} className="min-h-dvh">
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

function Hero({ d }: { d?: HeroData }) {
  const hero = d ?? { titleA: "" };
  const img = storageUrl(hero.imagePath);
  return (
    <section className="relative isolate overflow-hidden px-6 py-24 text-center sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, color-mix(in srgb, var(--site-accent) 22%, transparent), transparent 55%), radial-gradient(circle at 0% 100%, color-mix(in srgb, var(--site-primary) 14%, transparent), transparent 45%)",
        }}
      />
      <CornerFiligree className="pointer-events-none absolute left-3 top-3 hidden h-24 w-24 opacity-80 sm:block" />
      <CornerFiligree className="pointer-events-none absolute right-3 top-3 hidden h-24 w-24 -scale-x-100 opacity-80 sm:block" />

      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6">
        <p
          className="text-[0.72rem] uppercase tracking-[0.34em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {hero.eyebrow || "Together with their families"}
        </p>

        {img && (
          <div
            className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1rem] p-[3px]"
            style={{ background: "var(--site-gold)" }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.85rem]">
              <Image
                src={img}
                alt={`${hero.titleA}${hero.titleB ? ` & ${hero.titleB}` : ""}`}
                fill
                sizes="(max-width: 640px) 100vw, 24rem"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <h1 className="flex flex-col items-center gap-2">
          <span className="text-5xl leading-none sm:text-7xl" style={display()}>
            {hero.titleA || "Your Name"}
          </span>
          {hero.titleB && (
            <>
              <span
                className="text-2xl italic sm:text-3xl"
                style={display("var(--site-secondary)")}
              >
                &amp;
              </span>
              <span className="text-5xl leading-none sm:text-7xl" style={display()}>
                {hero.titleB}
              </span>
            </>
          )}
        </h1>

        <DividerOrnament className="h-5 w-auto" />

        {hero.date && (
          <p className="text-base sm:text-lg" style={{ color: "var(--site-ink)" }}>
            {formatDate(hero.date)}
          </p>
        )}
        {hero.tagline && (
          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: "var(--site-muted)" }}
          >
            {hero.tagline}
          </p>
        )}
      </Reveal>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {eyebrow && (
        <p
          className="text-[0.7rem] uppercase tracking-[0.3em]"
          style={{ color: "var(--site-secondary)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl" style={display()}>
        {title}
      </h2>
      <DividerOrnament className="h-4 w-auto" />
    </div>
  );
}

function Story({ d }: { d?: StoryData }) {
  if (!d) return null;
  const items = d.items ?? [];
  if (!d.title && !d.intro && items.length === 0) return null;
  return (
    <section className="px-6 py-20" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading eyebrow="Our story" title={d.title || "How we got here"} />
        </Reveal>
        {d.intro && (
          <Reveal>
            <p
              className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.intro}
            </p>
          </Reveal>
        )}
        {items.length > 0 && (
          <ol className="mt-12 flex flex-col gap-8">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <li className="relative pl-8">
                  <span
                    className="absolute left-0 top-1.5 h-3 w-3 rounded-full"
                    style={{ backgroundColor: "var(--site-accent)" }}
                  />
                  <span
                    className="absolute left-[5px] top-5 h-[calc(100%-0.5rem)] w-px"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--site-gold) 45%, transparent)",
                    }}
                  />
                  {item.date && (
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: "var(--site-secondary)" }}
                    >
                      {item.date}
                    </p>
                  )}
                  <h3 className="mt-1 text-xl" style={display()}>
                    {item.title}
                  </h3>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {item.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Events({ d }: { d?: EventsData }) {
  const events = d?.items ?? [];
  if (events.length === 0) return null;
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading
            eyebrow="The celebrations"
            title={d?.title || "The celebrations"}
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {events.map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.05}>
              <article
                className="flex h-full flex-col gap-2 rounded-[1rem] p-6"
                style={{
                  backgroundColor: "var(--site-surface)",
                  borderTop: "3px solid var(--site-gold)",
                  boxShadow:
                    "0 18px 40px -28px color-mix(in srgb, var(--site-ink) 60%, transparent)",
                }}
              >
                <div className="flex items-center gap-2">
                  <LotusMark className="h-5 w-auto" />
                  <h3 className="text-xl" style={display()}>
                    {ev.name}
                  </h3>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--site-ink)" }}>
                  {[formatDateShort(ev.date), formatTime(ev.startTime)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {ev.venueName && (
                  <p className="text-sm" style={{ color: "var(--site-secondary)" }}>
                    {ev.venueName}
                  </p>
                )}
                {ev.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {ev.description}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Venue({ d }: { d?: VenueData }) {
  if (!d || (!d.name && !d.address)) return null;
  const href = directionsUrl(d.mapUrl, d.address);
  return (
    <section className="px-6 py-20" style={{ backgroundColor: "var(--site-surface)" }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal className="flex flex-col items-center">
          <SectionHeading eyebrow="Where" title={d.name || "The venue"} />
          {d.address && (
            <p
              className="mt-6 max-w-md text-base leading-relaxed"
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
              className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--site-primary)" }}
            >
              Get directions
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Gallery({ d }: { d?: GalleryData }) {
  const paths = (d?.imagePaths ?? []).filter(Boolean);
  if (paths.length === 0) return null;
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading eyebrow="Moments" title={d?.title || "A few favourites"} />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {paths.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.05}>
              <div
                className="relative aspect-square overflow-hidden rounded-[0.75rem]"
                style={{ border: "2px solid var(--site-gold)" }}
              >
                <Image
                  src={storageUrl(p)}
                  alt="Event photo"
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

function Rsvp({ d, subdomain }: { d?: RsvpData; subdomain: string }) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading eyebrow="Répondez s'il vous plaît" title="Will you join us?" />
        </Reveal>
        {d?.note && (
          <Reveal>
            <p
              className="mx-auto mb-8 mt-6 max-w-md text-center text-sm leading-relaxed"
              style={{ color: "var(--site-muted)" }}
            >
              {d.note}
            </p>
          </Reveal>
        )}
        <Reveal>
          <RsvpForm subdomain={subdomain} />
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ d, hero }: { d?: FooterData; hero?: HeroData }) {
  return (
    <footer
      className="px-6 py-16 text-center"
      style={{ backgroundColor: "var(--site-primary)", color: "var(--site-canvas)" }}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <LotusMark className="h-7 w-auto" />
        {d?.hosts && (
          <p className="text-lg" style={{ fontFamily: "var(--site-display)" }}>
            {d.hosts}
          </p>
        )}
        {hero?.titleA && (
          <p className="text-sm opacity-80">
            {hero.titleA}
            {hero.titleB ? ` & ${hero.titleB}` : ""}
            {hero.date ? ` · ${formatDateShort(hero.date)}` : ""}
          </p>
        )}
      </div>
    </footer>
  );
}
