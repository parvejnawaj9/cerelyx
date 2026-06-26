"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Guestbook submission (brief §7). Posts to the public, gated, rate-limited
 * wishes route. New wishes wait for host approval unless the host enabled
 * auto-approve — the confirmation copy reflects which.
 */
export function WishForm({
  subdomain,
  guestName,
  autoApprove,
}: {
  subdomain: string;
  guestName?: string;
  autoApprove?: boolean;
}) {
  const [name, setName] = useState(guestName ?? "");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--site-surface)",
    borderColor: "color-mix(in srgb, var(--site-gold) 45%, transparent)",
    color: "var(--site-ink)",
  };
  const inputCls =
    "rounded-[0.6rem] border px-3.5 py-2.5 text-sm outline-none focus:ring-2";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a message.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/s/${subdomain}/wishes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not send your wish.");
      }
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send your wish.");
    }
  }

  if (state === "done") {
    return (
      <div
        ref={doneRef}
        role="status"
        tabIndex={-1}
        className="mx-auto max-w-md rounded-[1rem] px-6 py-7 text-center outline-none"
        style={{
          backgroundColor: "var(--site-surface)",
          border: "1px solid color-mix(in srgb, var(--site-gold) 45%, transparent)",
        }}
      >
        <p
          className="text-xl"
          style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
        >
          Thank you for the kind words!
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--site-muted)" }}>
          {autoApprove
            ? "Your wish is now on the page."
            : "Your wish has been sent to the hosts and will appear once approved."}
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
        <label htmlFor="wish-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="wish-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. Meera Sharma"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wish-msg" className="text-sm font-medium">
          Your message
        </label>
        <textarea
          id="wish-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={1000}
          rows={4}
          className={inputCls}
          style={inputStyle}
          placeholder="Wishing you a lifetime of love and laughter…"
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
        style={{ backgroundColor: "var(--site-primary)" }}
      >
        {state === "sending" ? "Sending…" : "Leave a wish"}
      </button>
    </form>
  );
}
