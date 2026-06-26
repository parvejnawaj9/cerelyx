/**
 * Subdomain rules: reserved names, format validation, and a profanity guard.
 * Pure logic — usable in edge, server, and client.
 */

/** System/brand subdomains that must never be claimable by users. */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  // surfaces
  "app",
  "admin",
  "www",
  "api",
  // infra / system
  "mail",
  "smtp",
  "imap",
  "pop",
  "ns1",
  "ns2",
  "mx",
  "ftp",
  "cdn",
  "assets",
  "static",
  "media",
  "img",
  "image",
  "images",
  "files",
  "download",
  "downloads",
  "storage",
  "og",
  // product / brand
  "cerelyx",
  "dashboard",
  "account",
  "accounts",
  "auth",
  "login",
  "signin",
  "signup",
  "register",
  "billing",
  "pay",
  "payment",
  "payments",
  "checkout",
  "settings",
  "support",
  "help",
  "status",
  "docs",
  "blog",
  "about",
  "contact",
  "legal",
  "terms",
  "privacy",
  "security",
  "dev",
  "test",
  "staging",
  "demo",
  "preview",
  "go",
  "link",
  "links",
]);

/**
 * Minimal profanity / abuse blocklist (substring match). This is intentionally
 * small and conservative; expand via the admin-managed blocklist in later phases.
 */
const PROFANITY: readonly string[] = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nazi",
  "rape",
  "porn",
  "sex",
  "nigger",
  "faggot",
];

export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 40;
const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type SubdomainCheck =
  | { ok: true; value: string }
  | { ok: false; reason: string };

/** Validate a subdomain against format, length, reserved and profanity rules. */
export function validateSubdomain(input: string): SubdomainCheck {
  const value = input.trim().toLowerCase();

  if (value.length < SUBDOMAIN_MIN) {
    return { ok: false, reason: `Use at least ${SUBDOMAIN_MIN} characters.` };
  }
  if (value.length > SUBDOMAIN_MAX) {
    return { ok: false, reason: `Keep it under ${SUBDOMAIN_MAX} characters.` };
  }
  if (!SUBDOMAIN_RE.test(value)) {
    return {
      ok: false,
      reason:
        "Use lowercase letters, numbers and hyphens only — no spaces, and no hyphen at the start or end.",
    };
  }
  if (value.includes("--")) {
    return { ok: false, reason: "Avoid two hyphens in a row." };
  }
  if (RESERVED_SUBDOMAINS.has(value)) {
    return { ok: false, reason: "That name is reserved. Try another." };
  }
  if (isProfane(value)) {
    return { ok: false, reason: "That name isn't allowed. Try another." };
  }
  return { ok: true, value };
}

export function isReserved(value: string): boolean {
  return RESERVED_SUBDOMAINS.has(value.trim().toLowerCase());
}

export function isProfane(value: string): boolean {
  const v = value.toLowerCase();
  return PROFANITY.some((bad) => v.includes(bad));
}

/** Turn a free-text title into a suggested, valid-ish subdomain candidate. */
export function suggestSubdomain(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SUBDOMAIN_MAX);
  return base.length >= SUBDOMAIN_MIN ? base : "";
}
