"use client";

import { useEffect, useState } from "react";
import { parseLocal } from "./format";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diffParts(target: number, now: number): Parts {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Live countdown to the host's target. Computes on the client only (so SSR and
 * client agree — no hydration flash) and ticks once a second. Degrades to the
 * "passed" message once the target is reached.
 */
export function Countdown({
  targetDate,
  passedMessage,
}: {
  targetDate: string;
  passedMessage?: string;
}) {
  // Parse with the app's local-date helper so a date-only target resolves to
  // local midnight (matching formatDate/formatTime) rather than UTC.
  const target = parseLocal(targetDate)?.getTime() ?? NaN;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    // Fill the first value on the next frame (not synchronously in the effect)
    // so SSR and the initial client render agree, then tick every second.
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [target]);

  if (Number.isNaN(target)) return null;

  // Before mount we render zeros (stable markup); the client fills them in.
  const parts = now === null ? null : diffParts(target, now);
  const passed = now !== null && target <= now;

  if (passed) {
    return (
      <p
        className="text-center text-2xl sm:text-3xl"
        style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
      >
        {passedMessage || "The day is finally here!"}
      </p>
    );
  }

  const cells: [string, number | null][] = [
    ["Days", parts?.days ?? null],
    ["Hours", parts?.hours ?? null],
    ["Minutes", parts?.minutes ?? null],
    ["Seconds", parts?.seconds ?? null],
  ];

  return (
    <div
      className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-4"
      role="timer"
      aria-label="Time remaining until the event"
    >
      {cells.map(([label, val]) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1 rounded-[0.9rem] px-2 py-4"
          style={{
            backgroundColor: "var(--site-surface)",
            border: "1px solid color-mix(in srgb, var(--site-gold) 40%, transparent)",
          }}
        >
          <span
            className="tabular-nums text-3xl sm:text-4xl"
            style={{ fontFamily: "var(--site-display)", color: "var(--site-primary)" }}
          >
            {val === null ? "—" : String(val).padStart(2, "0")}
          </span>
          <span
            className="text-[0.62rem] uppercase tracking-[0.2em]"
            style={{ color: "var(--site-secondary)" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
