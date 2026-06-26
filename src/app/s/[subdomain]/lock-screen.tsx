"use client";

import { useState } from "react";
import { siteCssVars } from "@/templates/site-style";
import { verifyInputLabel } from "@/lib/masking";
import type { Theme, SitePrivacy, VerifyField } from "@/lib/types";

export function LockScreen({
  subdomain,
  title,
  theme,
  privacy,
  verifyField,
  greeting,
  hint,
}: {
  subdomain: string;
  title: string;
  theme: Theme;
  privacy: SitePrivacy;
  verifyField: VerifyField | null;
  greeting?: string;
  hint: string;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCode = privacy === "sharedCode";
  const field: VerifyField = verifyField ?? "mobile";
  const inputType = isCode
    ? "text"
    : field === "email"
      ? "email"
      : field === "mobile"
        ? "tel"
        : "text";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Please fill this in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/s/${subdomain}/access`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          isCode ? { code: value } : { identifier: value }
        ),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "That didn't work. Please try again.");
      setBusy(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main
      style={siteCssVars(theme)}
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <p
          className="text-[0.72rem] uppercase tracking-[0.34em]"
          style={{ color: "var(--site-secondary)" }}
        >
          You&apos;re invited
        </p>
        <h1
          className="text-4xl leading-tight"
          style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
        >
          {title}
        </h1>
        <div
          className="h-px w-16"
          style={{ backgroundColor: "var(--site-gold)" }}
        />

        {greeting && (
          <p className="text-lg" style={{ fontFamily: "var(--site-display)" }}>
            Welcome, {greeting}
          </p>
        )}

        <form onSubmit={submit} className="flex w-full flex-col gap-3">
          <label
            htmlFor="lock-access"
            className="text-left text-sm"
            style={{ color: "var(--site-muted)" }}
          >
            {isCode
              ? "Enter the code from your invitation"
              : `Enter ${hint}`}
          </label>
          <input
            id="lock-access"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type={inputType}
            autoFocus
            aria-label={isCode ? "Invitation code" : verifyInputLabel(field)}
            placeholder={isCode ? "Code" : verifyInputLabel(field)}
            className="rounded-[0.7rem] border px-4 py-3 text-center text-base outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--site-surface)",
              borderColor: "color-mix(in srgb, var(--site-gold) 45%, transparent)",
              color: "var(--site-ink)",
            }}
          />
          {error && (
            <p className="text-sm" role="alert" style={{ color: "var(--site-secondary)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--site-primary)" }}
          >
            {busy ? "Checking…" : "View invitation"}
          </button>
        </form>

        <p className="text-xs" style={{ color: "var(--site-muted)" }}>
          Having trouble? Reach out to your host.
        </p>
      </div>
    </main>
  );
}
