import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Reveal } from "./reveal";
import { Countdown } from "./countdown";
import { MusicPlayer } from "./music-player";
import { WishForm } from "./wish-form";
import { formatDate, formatTime } from "./format";
import { storageUrl } from "@/lib/images/url";
import type {
  Site,
  SiteContent,
  SectionBlock,
  Wish,
  CountdownData,
  MusicData,
  WishesData,
  RegistryData,
  LivestreamData,
  FaqData,
  TravelData,
  DressCodeData,
  PhotosData,
} from "@/lib/types";

/**
 * Context threaded from the published page through the template into the shared
 * sections: the known guest's name (for prefill) and the approved wishes to show
 * (read server-side via the Admin SDK so it works on gated sites too).
 */
export interface RenderContext {
  guestName?: string;
  approvedWishes?: Wish[];
}

/**
 * Renders the Phase 3 "utility" sections. The identity sections (hero/story/
 * events/venue/gallery/rsvp/footer) stay bespoke per template; these are shared,
 * theme-tokenized via --site-* so each one inherits the template's palette and
 * type. Each template calls this from its `default:` case.
 */
export function SharedSection({
  block,
  content,
  site,
  ctx,
}: {
  block: SectionBlock;
  content: SiteContent;
  site: Site;
  ctx?: RenderContext;
}) {
  switch (block.type) {
    case "countdown":
      return <CountdownSection d={content.countdown} />;
    case "music":
      return <MusicSection d={content.music} />;
    case "wishes":
      return <WishesSection d={content.wishes} subdomain={site.subdomain} ctx={ctx} />;
    case "registry":
      return <RegistrySection d={content.registry} />;
    case "livestream":
      return <LivestreamSection d={content.livestream} />;
    case "faq":
      return <FaqSection d={content.faq} />;
    case "travel":
      return <TravelSection d={content.travel} />;
    case "dressCode":
      return <DressCodeSection d={content.dressCode} />;
    case "photos":
      return <PhotosSection d={content.photos} />;
    default:
      return null;
  }
}

// ---- shared chrome ---------------------------------------------------------

function Shell({ alt, children }: { alt?: boolean; children: React.ReactNode }) {
  return (
    <section
      className="px-6 py-20"
      style={alt ? { backgroundColor: "var(--site-surface)" } : undefined}
    >
      <div className="mx-auto max-w-3xl">{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title }: { eyebrow?: string; title: string }) {
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
      <h2
        className="text-3xl sm:text-4xl"
        style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
      >
        {title}
      </h2>
      <span aria-hidden className="h-px w-14" style={{ backgroundColor: "var(--site-gold)" }} />
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--site-surface)",
  border: "1px solid color-mix(in srgb, var(--site-gold) 35%, transparent)",
};

const introCls = "mx-auto max-w-xl text-center text-base leading-relaxed";
const introStyle: React.CSSProperties = { color: "var(--site-muted)" };

const pillCls =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

// ---- sections --------------------------------------------------------------

function CountdownSection({ d }: { d?: CountdownData }) {
  if (!d?.targetDate) return null;
  return (
    <Shell>
      <Reveal className="flex flex-col items-center gap-8">
        <Heading eyebrow="The big day" title={d.title || "Counting down"} />
        <Countdown targetDate={d.targetDate} passedMessage={d.passedMessage} />
      </Reveal>
    </Shell>
  );
}

function MusicSection({ d }: { d?: MusicData }) {
  const src = d?.trackUrl?.trim() || storageUrl(d?.trackPath);
  if (!src) return null;
  return <MusicPlayer src={src} title={d?.title} />;
}

function WishesSection({
  d,
  subdomain,
  ctx,
}: {
  d?: WishesData;
  subdomain: string;
  ctx?: RenderContext;
}) {
  const wishes = ctx?.approvedWishes ?? [];
  return (
    <Shell alt>
      <Reveal className="flex flex-col items-center gap-5">
        <Heading eyebrow="Guestbook" title={d?.title || "Leave us a wish"} />
        {d?.intro && (
          <p className={introCls} style={introStyle}>
            {d.intro}
          </p>
        )}
      </Reveal>
      {wishes.length > 0 && (
        <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          {wishes.map((w) => (
            <li key={w.id} className="rounded-[1rem] p-5" style={cardStyle}>
              <p className="text-base leading-relaxed" style={{ color: "var(--site-ink)" }}>
                &ldquo;{w.message}&rdquo;
              </p>
              <p
                className="mt-3 text-sm"
                style={{ color: "var(--site-secondary)", fontFamily: "var(--site-display)" }}
              >
                &mdash; {w.name}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <WishForm
          subdomain={subdomain}
          guestName={ctx?.guestName}
          autoApprove={d?.autoApprove}
        />
      </div>
    </Shell>
  );
}

function RegistrySection({ d }: { d?: RegistryData }) {
  const items = (d?.items ?? []).filter(
    (i) => i.title?.trim() || i.url || i.imagePath
  );
  if (items.length === 0 && !d?.intro) return null;
  return (
    <Shell>
      <Reveal className="flex flex-col items-center gap-5">
        <Heading eyebrow="With love" title={d?.title || "Gift registry"} />
        {d?.intro && (
          <p className={introCls} style={introStyle}>
            {d.intro}
          </p>
        )}
      </Reveal>
      {items.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <article
              key={it.id}
              className="flex flex-col overflow-hidden rounded-[1rem]"
              style={cardStyle}
            >
              {it.imagePath && (
                <div className="relative aspect-[16/10]">
                  <Image
                    src={storageUrl(it.imagePath)}
                    alt={it.title || "Gift"}
                    fill
                    sizes="(max-width: 640px) 100vw, 20rem"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3
                  className="text-xl"
                  style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
                >
                  {it.title}
                </h3>
                {it.note && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                    {it.note}
                  </p>
                )}
                {it.url && (
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium"
                    style={{ color: "var(--site-primary)" }}
                  >
                    View gift <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}

function LivestreamSection({ d }: { d?: LivestreamData }) {
  if (!d?.url) return null;
  const when = d.startsAt
    ? [formatDate(d.startsAt), formatTime(d.startsAt.split("T")[1]?.slice(0, 5))]
        .filter(Boolean)
        .join(" · ")
    : "";
  return (
    <Shell alt>
      <Reveal className="flex flex-col items-center gap-5 text-center">
        <Heading eyebrow="Online" title={d.title || "Watch live"} />
        {d.intro && (
          <p className={introCls} style={introStyle}>
            {d.intro}
          </p>
        )}
        {when && (
          <p className="text-sm" style={{ color: "var(--site-secondary)" }}>
            {when}
          </p>
        )}
        <a href={d.url} target="_blank" rel="noopener noreferrer" className={pillCls} style={{ backgroundColor: "var(--site-primary)" }}>
          Join the live stream
        </a>
      </Reveal>
    </Shell>
  );
}

function FaqSection({ d }: { d?: FaqData }) {
  const items = (d?.items ?? []).filter((i) => i.q?.trim());
  if (items.length === 0) return null;
  return (
    <Shell>
      <Reveal>
        <Heading eyebrow="Questions" title={d?.title || "Good to know"} />
      </Reveal>
      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
        {items.map((it) => (
          <details key={it.id} className="group rounded-[0.9rem] p-5" style={cardStyle}>
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium"
              style={{ color: "var(--site-ink)" }}
            >
              {it.q}
              <span
                aria-hidden
                className="text-xl leading-none transition-transform group-open:rotate-45"
                style={{ color: "var(--site-primary)" }}
              >
                +
              </span>
            </summary>
            {it.a && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {it.a}
              </p>
            )}
          </details>
        ))}
      </div>
    </Shell>
  );
}

function TravelSection({ d }: { d?: TravelData }) {
  const items = (d?.items ?? []).filter((i) => i.title?.trim() || i.body?.trim());
  if (items.length === 0 && !d?.intro) return null;
  return (
    <Shell alt>
      <Reveal className="flex flex-col items-center gap-5">
        <Heading eyebrow="Getting there" title={d?.title || "Travel & stay"} />
        {d?.intro && (
          <p className={introCls} style={introStyle}>
            {d.intro}
          </p>
        )}
      </Reveal>
      {items.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <article
              key={it.id}
              className="flex flex-col gap-2 rounded-[1rem] p-5"
              style={cardStyle}
            >
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
              >
                {it.title}
              </h3>
              {it.body && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                  {it.body}
                </p>
              )}
              {it.url && (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium"
                  style={{ color: "var(--site-primary)" }}
                >
                  More info <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}

function DressCodeSection({ d }: { d?: DressCodeData }) {
  const swatches = (d?.swatches ?? []).filter(Boolean);
  if (!d?.note && swatches.length === 0) return null;
  return (
    <Shell>
      <Reveal className="flex flex-col items-center gap-6 text-center">
        <Heading eyebrow="Dress code" title={d?.title || "What to wear"} />
        {d?.note && (
          <p className={introCls} style={introStyle}>
            {d.note}
          </p>
        )}
        {swatches.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {swatches.map((c, i) => (
              <span
                key={i}
                role="img"
                aria-label={`Suggested colour ${c}`}
                title={c}
                className="h-10 w-10 rounded-full"
                style={{
                  backgroundColor: c,
                  border: "1px solid color-mix(in srgb, var(--site-ink) 15%, transparent)",
                }}
              />
            ))}
          </div>
        )}
      </Reveal>
    </Shell>
  );
}

function PhotosSection({ d }: { d?: PhotosData }) {
  const url = d?.driveGalleryUrl?.trim();
  if (!url) return null;
  return (
    <Shell alt>
      <Reveal className="flex flex-col items-center gap-5 text-center">
        <Heading eyebrow="Photos" title={d?.title || "Share your photos"} />
        {d?.intro && (
          <p className={introCls} style={introStyle}>
            {d.intro}
          </p>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className={pillCls} style={{ backgroundColor: "var(--site-primary)" }}>
          View &amp; add photos
        </a>
      </Reveal>
    </Shell>
  );
}
