import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { ensureUserProfile } from "@/lib/server/users";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

// Only mint a session cookie from a freshly-issued ID token (Firebase best
// practice: limits replay of a stolen token to the recent-login window).
const RECENT_LOGIN_SECONDS = 5 * 60;

/** Exchange a Firebase ID token for a session cookie + ensure a user profile. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { allowed } = rateLimit(`session:${ip}`, 10, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  let idToken: unknown;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof idToken !== "string" || idToken.length < 10) {
    return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true); // checkRevoked
  } catch {
    return NextResponse.json({ error: "Invalid ID token." }, { status: 401 });
  }

  // Reject stale logins — the ID token must come from a recent sign-in.
  if (Date.now() / 1000 - decoded.auth_time > RECENT_LOGIN_SECONDS) {
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 }
    );
  }

  const cookie = await createSessionCookie(idToken);
  const store = await cookies();
  store.set(SESSION_COOKIE, cookie, {
    ...sessionCookieOptions(),
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // Best-effort: the cookie is already set, so a transient profile-write error
  // must not fail an otherwise-valid login (it's retried on the next request).
  try {
    await ensureUserProfile({
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
      picture: (decoded.picture as string | undefined) ?? null,
    });
  } catch (e) {
    console.error("[session] ensureUserProfile failed (non-fatal):", e);
  }

  return NextResponse.json({ ok: true });
}

/** Sign out — clear the session cookie (same options so it actually clears). */
export async function DELETE() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
