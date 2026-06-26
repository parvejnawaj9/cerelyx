"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, EyeOff, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Wish } from "@/lib/types";

function whenLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function WishesModeration({
  siteId,
  initialWishes,
}: {
  siteId: string;
  initialWishes: Wish[];
}) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const pending = wishes.filter((w) => !w.approved).length;
  const filtered = wishes.filter((w) =>
    filter === "all" ? true : filter === "pending" ? !w.approved : w.approved
  );

  async function setApproved(w: Wish, approved: boolean) {
    setBusy(w.id);
    const prev = wishes;
    setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, approved } : x)));
    const res = await fetch(`/api/sites/${siteId}/wishes/${w.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) setWishes(prev);
    setBusy(null);
  }

  async function remove(w: Wish) {
    setBusy(w.id);
    const prev = wishes;
    setWishes((ws) => ws.filter((x) => x.id !== w.id));
    setConfirmId(null);
    const res = await fetch(`/api/sites/${siteId}/wishes/${w.id}`, { method: "DELETE" });
    if (!res.ok) setWishes(prev);
    setBusy(null);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href={`/sites/${siteId}/edit`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to editor
      </Link>

      <h1 className="font-display text-3xl text-ink">Wishes</h1>
      <p className="mt-1 text-sm text-muted">
        {pending > 0
          ? `${pending} ${pending === 1 ? "wish is" : "wishes are"} waiting for your approval.`
          : "All caught up — no wishes waiting."}{" "}
        Only approved wishes appear on your site.
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm capitalize transition-colors",
              filter === f
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:text-ink"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">
          {wishes.length === 0
            ? "No wishes yet. They'll show up here as guests leave them."
            : "Nothing here under this filter."}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {filtered.map((w) => (
            <li
              key={w.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-ink">{w.message}</p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    — {w.name}
                    {whenLabel(w.createdAt) && (
                      <span className="ml-2 text-xs font-normal text-faint">
                        {whenLabel(w.createdAt)}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                    w.approved
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  {w.approved ? "Shown" : "Pending"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {w.approved ? (
                  <button
                    onClick={() => setApproved(w, false)}
                    disabled={busy === w.id}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink disabled:opacity-50"
                  >
                    {busy === w.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    Hide
                  </button>
                ) : (
                  <button
                    onClick={() => setApproved(w, true)}
                    disabled={busy === w.id}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-brand px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === w.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </button>
                )}

                {confirmId === w.id ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Delete?</span>
                    <button
                      onClick={() => remove(w)}
                      className="font-medium text-rose hover:underline"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-muted hover:text-ink"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(w.id)}
                    disabled={busy === w.id}
                    aria-label="Delete wish"
                    className="ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-muted transition-colors hover:text-rose disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
