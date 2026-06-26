"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Rsvp, CustomQuestion } from "@/lib/types";
import type { RsvpSummary } from "@/lib/server/responses";

const STATUS: Record<Rsvp["rsvpStatus"], { label: string; cls: string }> = {
  yes: { label: "Coming", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  maybe: { label: "Maybe", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  no: { label: "Declined", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4 text-center">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function whenLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ResponsesView({
  siteId,
  summary,
  rsvps,
  questions,
}: {
  siteId: string;
  summary: RsvpSummary;
  rsvps: Rsvp[];
  questions: CustomQuestion[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Rsvp["rsvpStatus"]>("all");
  const qLabel = useMemo(
    () => new Map(questions.map((q) => [q.id, q.label])),
    [questions]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rsvps.filter(
      (r) =>
        (filter === "all" || r.rsvpStatus === filter) &&
        (!s || r.name.toLowerCase().includes(s))
    );
  }, [rsvps, search, filter]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <Link
        href={`/sites/${siteId}/edit`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to editor
      </Link>

      <h1 className="font-display text-3xl text-ink">RSVP responses</h1>
      <p className="mt-1 text-sm text-muted">
        A live summary of who&apos;s coming. Export to CSV/Excel arrives in a later update.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Responses" value={summary.total} />
        <Stat label="Coming" value={summary.yes} />
        <Stat label="Maybe" value={summary.maybe} />
        <Stat label="Declined" value={summary.no} />
        <Stat label="Headcount" value={summary.headcount} />
      </div>

      {summary.meals.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Meal preferences</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.meals.map((m) => (
              <span
                key={m.choice}
                className="rounded-full border border-line px-3 py-1 text-sm text-muted"
              >
                {m.choice}: <span className="font-medium text-ink">{m.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search responses by name"
            placeholder="Search by name…"
            className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "yes", "maybe", "no"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                filter === f
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:text-ink"
              )}
            >
              {f === "all" ? "All" : STATUS[f].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">
          {rsvps.length === 0
            ? "No RSVPs yet. They'll appear here the moment a guest responds."
            : "No responses match your search."}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {filtered.map((r) => {
            const answers = Object.entries(r.answers ?? {}).filter(([, v]) => v?.trim());
            return (
              <li
                key={r.id}
                className="rounded-[var(--radius-md)] border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        STATUS[r.rsvpStatus].cls
                      )}
                    >
                      {STATUS[r.rsvpStatus].label}
                    </span>
                    {r.rsvpStatus !== "no" && r.partySize > 1 && (
                      <span className="text-xs text-muted">party of {r.partySize}</span>
                    )}
                  </div>
                  {whenLabel(r.createdAt) && (
                    <span className="text-xs text-faint">{whenLabel(r.createdAt)}</span>
                  )}
                </div>
                {(r.mealChoice || r.message || answers.length > 0) && (
                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
                    {r.mealChoice && (
                      <p>
                        <span className="text-faint">Meal:</span> {r.mealChoice}
                      </p>
                    )}
                    {answers.map(([k, v]) => (
                      <p key={k}>
                        <span className="text-faint">{qLabel.get(k) ?? k}:</span> {v}
                      </p>
                    ))}
                    {r.message && <p className="italic">“{r.message}”</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
