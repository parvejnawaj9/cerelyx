"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Minimal guest RSVP (brief §7). Phase 1 captures the essentials — name,
 * whether they're coming, headcount, a note — and writes them to the site's
 * rsvps collection via a public route. Meal choices, custom questions and the
 * live host summary are Phase 3; this slice exists so the section is never a
 * dead button.
 */
export function RsvpForm({ subdomain }: { subdomain: string }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so screen-reader + keyboard users land on it
  // (the form they submitted has unmounted).
  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--site-surface)",
    borderColor: "color-mix(in srgb, var(--site-gold) 45%, transparent)",
    color: "var(--site-ink)",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || attending === null) {
      setError("Please tell us your name and whether you can make it.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/s/${subdomain}/rsvp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          attending: attending === "yes",
          partySize: attending === "yes" ? partySize : 0,
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not send your RSVP.");
      }
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send your RSVP.");
    }
  }

  if (state === "done") {
    return (
      <div
        ref={doneRef}
        role="status"
        tabIndex={-1}
        className="rounded-[1rem] px-6 py-8 text-center outline-none"
        style={{
          backgroundColor: "var(--site-surface)",
          border: "1px solid color-mix(in srgb, var(--site-gold) 45%, transparent)",
        }}
      >
        <p
          className="text-2xl"
          style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
        >
          Thank you!
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--site-muted)" }}>
          {attending === "yes"
            ? "We can't wait to celebrate with you."
            : "We'll miss you — thank you for letting us know."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-md flex-col gap-4 text-left"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="rsvp-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="rsvp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className="rounded-[0.6rem] border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
          style={inputStyle}
          placeholder="e.g. Meera Sharma"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Will you join us?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["yes", "Joyfully accept"],
              ["no", "Regretfully decline"],
            ] as const
          ).map(([val, label]) => (
            <button
              type="button"
              key={val}
              onClick={() => setAttending(val)}
              aria-pressed={attending === val}
              className="rounded-[0.6rem] border px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  attending === val ? "var(--site-primary)" : "var(--site-surface)",
                color: attending === val ? "#fff" : "var(--site-ink)",
                borderColor:
                  "color-mix(in srgb, var(--site-gold) 45%, transparent)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {attending === "yes" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rsvp-party" className="text-sm font-medium">
            How many of you?
          </label>
          <input
            id="rsvp-party"
            type="number"
            min={1}
            max={20}
            value={partySize}
            onChange={(e) =>
              setPartySize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
            }
            className="w-28 rounded-[0.6rem] border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rsvp-msg" className="text-sm font-medium">
          A note for the couple{" "}
          <span style={{ color: "var(--site-muted)" }}>(optional)</span>
        </label>
        <textarea
          id="rsvp-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={600}
          rows={3}
          className="rounded-[0.6rem] border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
          style={inputStyle}
          placeholder="Can't wait to see you both!"
        />
      </div>

      {error && (
        <p className="text-sm" role="alert" style={{ color: "var(--site-secondary)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-1 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--site-secondary)" }}
      >
        {state === "sending" ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
