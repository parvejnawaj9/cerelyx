import { ROOT_HOST } from "./env";

/**
 * Host parsing for multi-tenant routing. Pure string logic — safe in the edge
 * middleware runtime (no Node APIs).
 *
 * Production note: Firebase App Hosting sits behind a proxy, so the real
 * requested host arrives in `X-Forwarded-Host`. We always prefer it over `Host`.
 */

/** Read the effective request host, preferring X-Forwarded-Host. */
export function getHost(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-host");
  const raw = forwarded ?? headers.get("host") ?? "";
  // X-Forwarded-Host can be a comma-separated list with multiple proxies in the
  // path; the first value is the original client-requested host.
  const first = raw.split(",")[0] ?? "";
  return first.toLowerCase().trim();
}

/** Strip a trailing :port from a host string. */
export function stripPort(host: string): string {
  return host.split(":")[0] ?? host;
}

/**
 * Resolve the subdomain label for a host relative to the configured root.
 * Returns:
 *   - null            → apex or www (marketing surface)
 *   - "app" | "admin" → reserved surfaces
 *   - "<label>"       → a tenant/site subdomain
 */
export function getSubdomain(host: string): string | null {
  const h = stripPort(host);
  const root = ROOT_HOST;

  // Bare apex, www, or plain localhost → marketing.
  if (h === root || h === `www.${root}` || h === "localhost" || h === "") {
    return null;
  }

  // "<something>.<root>" → take the left-most label.
  if (h.endsWith(`.${root}`)) {
    const prefix = h.slice(0, h.length - root.length - 1);
    const label = prefix.split(".")[0] ?? "";
    if (label === "" || label === "www") return null;
    return label;
  }

  // "<label>.localhost" convenience for browsers that resolve it.
  if (h.endsWith(".localhost")) {
    const label = h.slice(0, h.length - ".localhost".length).split(".")[0] ?? "";
    return label === "" || label === "www" ? null : label;
  }

  // Unknown host (custom domain, preview URL, etc.) → treat as marketing.
  return null;
}

export type SurfaceKind = "marketing" | "builder" | "admin" | "site";

/** Classify a host into one of the app surfaces. */
export function classifyHost(
  host: string
): { kind: SurfaceKind; subdomain: string | null } {
  const sub = getSubdomain(host);
  if (sub === null) return { kind: "marketing", subdomain: null };
  if (sub === "app") return { kind: "builder", subdomain: null };
  if (sub === "admin") return { kind: "admin", subdomain: null };
  return { kind: "site", subdomain: sub };
}
