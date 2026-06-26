/**
 * Best-effort in-memory rate limiter (brief §15). Per-instance only — it resets
 * on redeploy/scale and isn't shared across instances. A durable limiter
 * (Firestore counter / Redis) is a later hardening step; this stops casual abuse.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): { allowed: boolean; retryAfterMs: number } {
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    const retryAfterMs = hits[0]! + windowMs - now;
    buckets.set(key, hits);
    return { allowed: false, retryAfterMs };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterMs: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
