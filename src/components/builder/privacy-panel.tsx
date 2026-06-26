"use client";

import Link from "next/link";
import { Globe, KeyRound, UserCheck } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { SitePrivacy, VerifyField } from "@/lib/types";

const MODES: {
  value: SitePrivacy;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "open",
    label: "Open",
    description: "Anyone with the link can view. Indexed by search engines.",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "sharedCode",
    label: "Shared code",
    description: "One code for everyone. Share it once with your guests.",
    icon: <KeyRound className="h-4 w-4" />,
  },
  {
    value: "guestVerify",
    label: "Guest verification",
    description: "Guests prove they're on your list to get in.",
    icon: <UserCheck className="h-4 w-4" />,
  },
];

const VERIFY_FIELDS: { value: VerifyField; label: string }[] = [
  { value: "mobile", label: "Mobile number" },
  { value: "email", label: "Email address" },
  { value: "code", label: "Unique number" },
];

export function PrivacyPanel({
  siteId,
  privacy,
  sharedCode,
  verifyField,
  onChange,
}: {
  siteId: string;
  privacy: SitePrivacy;
  sharedCode: string;
  verifyField: VerifyField | null;
  onChange: (p: {
    privacy?: SitePrivacy;
    sharedCode?: string;
    verifyField?: VerifyField | null;
  }) => void;
}) {
  function randomCode() {
    const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++)
      s += a[Math.floor(Math.random() * a.length)];
    onChange({ sharedCode: s });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {MODES.map((m) => {
          const active = privacy === m.value;
          return (
            <button
              type="button"
              key={m.value}
              onClick={() =>
                onChange({
                  privacy: m.value,
                  // Clear fields that don't belong to the chosen mode so no
                  // inactive secret persists.
                  sharedCode: m.value === "sharedCode" ? sharedCode : "",
                  verifyField:
                    m.value === "guestVerify" ? (verifyField ?? "mobile") : null,
                })
              }
              aria-pressed={active}
              className={cn(
                "flex items-start gap-3 rounded-[var(--radius-md)] border p-4 text-left transition-all",
                active
                  ? "border-brand ring-2 ring-brand/25"
                  : "border-line hover:border-line-strong"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  active ? "bg-brand text-white" : "bg-brand-soft text-brand"
                )}
              >
                {m.icon}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-ink">{m.label}</span>
                <span className="text-xs leading-relaxed text-muted">
                  {m.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {privacy === "sharedCode" && (
        <Field
          label="Shared code"
          htmlFor="sharedCode"
          hint="Guests type this to enter. Keep it short and memorable."
        >
          <div className="flex gap-2">
            <Input
              id="sharedCode"
              value={sharedCode}
              onChange={(e) => onChange({ sharedCode: e.target.value })}
              placeholder="e.g. LOVE26"
              maxLength={40}
            />
            <button
              type="button"
              onClick={randomCode}
              className="shrink-0 rounded-[var(--radius-md)] border border-line-strong px-3 text-sm text-muted hover:text-ink"
            >
              Generate
            </button>
          </div>
        </Field>
      )}

      {privacy === "guestVerify" && (
        <div className="flex flex-col gap-3">
          <Field
            label="Guests verify with their…"
            htmlFor="verifyField"
            hint="They enter this; we check it against your guest list."
          >
            <select
              id="verifyField"
              value={verifyField ?? "mobile"}
              onChange={(e) =>
                onChange({ verifyField: e.target.value as VerifyField })
              }
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            >
              {VERIFY_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="rounded-[var(--radius-md)] bg-gold-soft/50 px-3.5 py-2.5 text-xs text-muted">
            Add guests with their {VERIFY_FIELDS.find((f) => f.value === (verifyField ?? "mobile"))?.label.toLowerCase()} on the{" "}
            <Link href={`/sites/${siteId}/guests`} className="font-medium text-brand hover:underline">
              guest list
            </Link>
            , then share personalized links (<span className="font-mono">?g=…</span>) so guests are greeted by name.
          </p>
        </div>
      )}
    </div>
  );
}
