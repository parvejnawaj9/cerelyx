import Link from "next/link";
import { Sparkles, Globe, MailCheck, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { builderUrl, siteUrl } from "@/lib/env";

const exampleUrl = siteUrl("aarav-priya");

export default function MarketingHome() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[36rem] w-[36rem] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--color-gold-soft) 0, transparent 60%)",
          }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Wedding &amp; event websites
            </span>
            <h1 className="max-w-xl font-display text-[2.6rem] leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Your celebration deserves more than a group chat.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              Create a stunning website for your wedding or any life event, share
              it on your own address, and collect RSVPs — all in a few minutes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={builderUrl("/sign-up")}
                className={buttonClasses("primary", "lg")}
              >
                Create your site
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={exampleUrl}
                className={buttonClasses("secondary", "lg")}
              >
                See a live example
              </Link>
            </div>
            <p className="text-xs text-faint">
              Free to start · No credit card · Your own subdomain
            </p>
          </div>

          {/* Invitation card preview — a taste of the Royal Indian template. */}
          <div className="relative mx-auto w-full max-w-sm">
            <InvitationPreview />
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-2xl font-display text-3xl text-ink sm:text-4xl">
            Everything your guests need, in one place.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Designs that don't look templated"
              body="Hand-crafted themes with real character — recolour and restyle them to match your celebration."
            />
            <Feature
              icon={<Globe className="h-5 w-5" />}
              title="Your own web address"
              body="Publish to yourname.cerelyx.online in one tap. Share it once; it works everywhere."
            />
            <Feature
              icon={<MailCheck className="h-5 w-5" />}
              title="RSVPs without the spreadsheets"
              body="Guests reply in seconds and you watch responses roll in — no more chasing."
            />
          </div>
        </div>
      </section>

      {/* ---- Steps ---- */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium uppercase tracking-[0.16em] text-gold">
            Live in three steps
          </span>
          <div className="rule-gold w-24" />
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <Step n="1" title="Pick a design" body="Choose a theme made for your kind of event." />
          <Step n="2" title="Fill in the details" body="Names, dates, your story and the schedule — guided all the way." />
          <Step n="3" title="Publish" body="Go live on your subdomain and share with everyone." />
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[var(--radius-2xl)] bg-brand-ink px-8 py-14 text-center sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 30%, var(--color-gold) 0, transparent 35%), radial-gradient(circle at 85% 70%, #2c8a6f 0, transparent 40%)",
            }}
          />
          <h2 className="relative font-display text-3xl text-white sm:text-4xl">
            Ready to make something beautiful?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/70">
            It&apos;s free to start. No credit card, no fuss.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href={builderUrl("/sign-up")}
              className={buttonClasses("gold", "lg")}
            >
              Create your site
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-line bg-canvas p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        {icon}
      </span>
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-4xl text-gold">{n}</span>
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

/** A small, static invitation card in the Royal Indian palette. */
function InvitationPreview() {
  return (
    <div
      className="rotate-[1.5deg] rounded-[1.25rem] p-[3px] shadow-[0_30px_70px_-30px_rgba(28,26,23,0.55)]"
      style={{
        background:
          "linear-gradient(140deg, #C9A227, #8a6f1e 45%, #C9A227 80%)",
      }}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-[1.1rem] px-8 py-12 text-center"
        style={{ background: "#FBF4E6", color: "#23150F" }}
      >
        <p
          className="text-[0.7rem] uppercase tracking-[0.32em]"
          style={{ color: "#6E1423" }}
        >
          Together with their families
        </p>
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-4xl"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#0E4D45" }}
          >
            Aarav
          </span>
          <span
            className="text-base italic"
            style={{ color: "#E8A33D", fontFamily: "var(--font-fraunces), serif" }}
          >
            &amp;
          </span>
          <span
            className="text-4xl"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#0E4D45" }}
          >
            Priya
          </span>
        </div>
        <DividerOrnament />
        <p className="text-sm" style={{ color: "#7A6A57" }}>
          Saturday, 6 December 2026
          <br />
          Taj Falaknuma Palace, Hyderabad
        </p>
      </div>
    </div>
  );
}

function DividerOrnament() {
  return (
    <svg width="120" height="14" viewBox="0 0 120 14" fill="none" aria-hidden>
      <path d="M2 7h44" stroke="#C9A227" strokeWidth="1" />
      <path d="M118 7H74" stroke="#C9A227" strokeWidth="1" />
      <path
        d="M60 1.5c2.5 2.2 4.2 3.9 4.2 5.5S62.5 10.3 60 12.5C57.5 10.3 55.8 8.6 55.8 7S57.5 3.7 60 1.5Z"
        fill="#E8A33D"
        stroke="#C9A227"
        strokeWidth="0.8"
      />
      <circle cx="49" cy="7" r="1.6" fill="#C9A227" />
      <circle cx="71" cy="7" r="1.6" fill="#C9A227" />
    </svg>
  );
}
