import crypto from "node:crypto";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { normalizeIdentifier } from "@/lib/guests";
import type { Site, VerifyField } from "@/lib/types";

/**
 * Server-side guest access for private sites (brief §8). Access is proven by an
 * httpOnly, host-scoped cookie holding an HMAC-signed `exp` token — so it can't
 * be forged and can't leak to another site (different host). The guest list is
 * never sent to the client; all checks run here with the Admin SDK.
 *
 * `verifyAccess` dispatches per privacy mode, so OTP/WhatsApp can be added as a
 * new mode later without touching the gate or the lock screen.
 */

const IS_PROD = process.env.NODE_ENV === "production";
const HAS_REAL_SECRET = Boolean(process.env.ACCESS_TOKEN_SECRET);
const SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-access-secret-local-only";

// Fail closed at RUNTIME (not at build — the secret is injected by Secret
// Manager only at runtime): never sign/verify with the dev fallback in prod.
function secretOrThrow(): string {
  if (IS_PROD && !HAS_REAL_SECRET) {
    throw new Error(
      "ACCESS_TOKEN_SECRET must be set in production (guest-access cookies)."
    );
  }
  return SECRET;
}

const COOKIE_PREFIX = "__cerelyx_access_";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const cookieName = (siteId: string) => `${COOKIE_PREFIX}${siteId}`;

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function sign(siteId: string, exp: number): string {
  const mac = crypto
    .createHmac("sha256", secretOrThrow())
    .update(`${siteId}.${exp}`)
    .digest("base64url");
  return `${exp}.${mac}`;
}

function tokenValid(siteId: string, token: string): boolean {
  if (IS_PROD && !HAS_REAL_SECRET) return false; // fail closed
  const [expStr, mac] = token.split(".");
  const exp = Number(expStr);
  if (!exp || Date.now() > exp || !mac) return false;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${siteId}.${exp}`)
    .digest("base64url");
  return timingSafeEqual(mac, expected);
}

/** True if the caller already holds a valid access cookie for this site. */
export async function hasAccess(siteId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(cookieName(siteId))?.value;
  return Boolean(token && tokenValid(siteId, token));
}

/** Mint + set the access cookie for this site (host-scoped). */
export async function grantAccess(siteId: string): Promise<void> {
  const token = sign(siteId, Date.now() + TTL_MS);
  const store = await cookies();
  store.set(cookieName(siteId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

const fieldKey = (field: VerifyField) =>
  field === "mobile" ? "mobile" : field === "email" ? "email" : "uniqueCode";

/** Match a typed identifier against the (server-only) guest list. */
export async function matchGuest(
  siteId: string,
  field: VerifyField,
  value: string
): Promise<boolean> {
  const norm = normalizeIdentifier(field, value);
  if (!norm) return false;
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("guests")
    .where(fieldKey(field), "==", norm)
    .limit(1)
    .get();
  return !snap.empty;
}

/** Resolve a guest's masked-hint value for the site's verify field. */
export async function resolveGuestForHint(
  siteId: string,
  slug: string,
  field: VerifyField
): Promise<{ name: string; value: string } | null> {
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("guests")
    .where("personalSlug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0]!.data();
  return {
    name: (d.name as string) ?? "",
    value: (d[fieldKey(field)] as string) ?? "",
  };
}

export type VerifyResult = { ok: boolean; error?: string };

/** Dispatch verification by the site's privacy mode. Server-only. */
export async function verifyAccess(
  site: Site,
  body: { code?: string; identifier?: string }
): Promise<VerifyResult> {
  if (site.privacy === "open") return { ok: true };

  if (site.privacy === "sharedCode") {
    const expected = (site.sharedCode ?? "").trim();
    const got = (body.code ?? "").trim();
    if (expected && timingSafeEqual(got, expected)) return { ok: true };
    return { ok: false, error: "That code isn't right. Check your invitation." };
  }

  if (site.privacy === "guestVerify") {
    const field = site.verifyField;
    if (!field) return { ok: false, error: "This site isn't ready yet." };
    const ok = await matchGuest(site.id, field, body.identifier ?? "");
    return ok
      ? { ok: true }
      : { ok: false, error: "We couldn't find you on the guest list." };
  }

  return { ok: false, error: "Unsupported access mode." };
}
