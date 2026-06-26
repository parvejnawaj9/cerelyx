"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Copy,
  Check,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { siteUrl } from "@/lib/env";
import { parseBulkText } from "@/lib/validation/guest";
import type { Guest, SitePrivacy, VerifyField } from "@/lib/types";

type Mode = { kind: "none" } | { kind: "add" } | { kind: "edit"; guest: Guest } | { kind: "bulk" };

export function GuestList({
  siteId,
  subdomain,
  verifyField,
  privacy,
  initialGuests,
}: {
  siteId: string;
  subdomain: string;
  verifyField: VerifyField | null;
  privacy: SitePrivacy;
  initialGuests: Guest[];
}) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [mode, setMode] = useState<Mode>({ kind: "none" });

  const groups = useMemo(
    () => Array.from(new Set(guests.map((g) => g.group).filter(Boolean))).sort(),
    [guests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (group && g.group !== group) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.mobile ?? "").includes(q) ||
        (g.email ?? "").toLowerCase().includes(q) ||
        (g.uniqueCode ?? "").toLowerCase().includes(q)
      );
    });
  }, [guests, search, group]);

  async function removeGuest(g: Guest) {
    setGuests((prev) => prev.filter((x) => x.id !== g.id));
    await fetch(`/api/sites/${siteId}/guests/${g.id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <Link
        href={`/sites/${siteId}/edit`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to editor
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Guest list</h1>
          <p className="mt-1 text-sm text-muted">
            {guests.length} {guests.length === 1 ? "guest" : "guests"}
            {privacy === "guestVerify" && verifyField && (
              <>
                {" "}
                · verifying by{" "}
                <span className="font-medium text-ink">
                  {verifyField === "mobile"
                    ? "mobile number"
                    : verifyField === "email"
                      ? "email"
                      : "unique number"}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode({ kind: "bulk" })}>
            <Upload className="h-4 w-4" />
            Bulk add
          </Button>
          <Button size="sm" onClick={() => setMode({ kind: "add" })}>
            <Plus className="h-4 w-4" />
            Add guest
          </Button>
        </div>
      </div>

      {(mode.kind === "add" || mode.kind === "edit") && (
        <GuestForm
          siteId={siteId}
          guest={mode.kind === "edit" ? mode.guest : undefined}
          onClose={() => setMode({ kind: "none" })}
          onSaved={(g, isEdit) =>
            setGuests((prev) =>
              isEdit ? prev.map((x) => (x.id === g.id ? g : x)) : [...prev, g]
            )
          }
        />
      )}
      {mode.kind === "bulk" && (
        <BulkPanel
          siteId={siteId}
          onClose={() => setMode({ kind: "none" })}
          onAdded={(gs) => setGuests((prev) => [...prev, ...gs])}
        />
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or contact…"
            className="pl-9"
          />
        </div>
        {groups.length > 0 && (
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      {guests.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-xl)] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <p className="font-display text-xl text-ink">No guests yet</p>
          <p className="mt-1 text-sm text-muted">
            Add guests to share personalized links and verify who can see your site.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Contact</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Group</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((g) => (
                <tr key={g.id} className="bg-canvas">
                  <td className="px-4 py-3 font-medium text-ink">{g.name}</td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    {g.mobile || g.email || g.uniqueCode || "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {g.group ? (
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">
                        {g.group}
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CopyLink url={siteUrl(subdomain, `/?g=${g.personalSlug}`)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 text-muted">
                      <button
                        onClick={() => setMode({ kind: "edit", guest: g })}
                        aria-label={`Edit ${g.name}`}
                        className="rounded p-1.5 hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeGuest(g)}
                        aria-label={`Remove ${g.name}`}
                        className="rounded p-1.5 hover:text-rose"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GuestForm({
  siteId,
  guest,
  onClose,
  onSaved,
}: {
  siteId: string;
  guest?: Guest;
  onClose: () => void;
  onSaved: (g: Guest, isEdit: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: guest?.name ?? "",
    mobile: guest?.mobile ?? "",
    email: guest?.email ?? "",
    uniqueCode: guest?.uniqueCode ?? "",
    group: guest?.group ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  async function save() {
    if (!form.name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const isEdit = Boolean(guest);
      const res = await fetch(
        isEdit
          ? `/api/sites/${siteId}/guests/${guest!.id}`
          : `/api/sites/${siteId}/guests`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't save.");
      const saved: Guest = isEdit
        ? { ...guest!, ...form }
        : (data.guest as Guest);
      onSaved(saved, isEdit);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save.");
      setBusy(false);
    }
  }

  return (
    <Panel title={guest ? "Edit guest" : "Add a guest"} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor="g-name">
          <Input
            id="g-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Meera Sharma"
            autoFocus
          />
        </Field>
        <Field label="Group" htmlFor="g-group" hint="e.g. Family, Friends, Office.">
          <Input
            id="g-group"
            value={form.group}
            onChange={(e) => set({ group: e.target.value })}
            placeholder="Family"
          />
        </Field>
        <Field label="Mobile" htmlFor="g-mobile">
          <Input
            id="g-mobile"
            value={form.mobile}
            onChange={(e) => set({ mobile: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </Field>
        <Field label="Email" htmlFor="g-email">
          <Input
            id="g-email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="meera@example.com"
          />
        </Field>
        <Field label="Unique number" htmlFor="g-code" hint="Any code from their invite.">
          <Input
            id="g-code"
            value={form.uniqueCode}
            onChange={(e) => set({ uniqueCode: e.target.value })}
            placeholder="INV-204"
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save guest"}
        </Button>
      </div>
    </Panel>
  );
}

function BulkPanel({
  siteId,
  onClose,
  onAdded,
}: {
  siteId: string;
  onClose: () => void;
  onAdded: (gs: Guest[]) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = parseBulkText(text);

  async function submit() {
    if (parsed.length === 0) {
      setError("Add at least one guest (one per line).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/guests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guests: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't add guests.");
      onAdded(data.guests as Guest[]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add guests.");
      setBusy(false);
    }
  }

  return (
    <Panel title="Bulk add guests" onClose={onClose}>
      <p className="mb-2 text-sm text-muted">
        One guest per line: <span className="font-mono text-xs">Name, contact, group</span>.
        The contact can be a mobile, email or unique number.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"Meera Sharma, meera@example.com, Family\nRohan Gupta, +91 98765 43210, Friends"}
        className="font-mono text-xs"
      />
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-faint">
          {parsed.length} {parsed.length === 1 ? "guest" : "guests"} detected
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={busy || parsed.length === 0}>
            {busy ? "Adding…" : `Add ${parsed.length || ""}`.trim()}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded p-1 text-muted hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
