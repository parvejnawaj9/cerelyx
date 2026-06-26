import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { ROOT_HOST } from "@/lib/env";

/**
 * Server-side session handling. The client signs in with the Firebase JS SDK,
 * then posts its ID token to /api/auth/session which mints a Firebase session
 * cookie here. Server components read it to know the current user.
 *
 * Cookie name "__session" is intentional: it is the only cookie name Firebase
 * Hosting / App Hosting forwards through its CDN.
 */
export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

/**
 * Cookie options shared by set + clear so they stay in sync. The cookie is
 * scoped to `.<root>` so the one wildcard backend has a single session across
 * app./admin./apex/site subdomains (host-only on plain localhost where a Domain
 * attribute is awkward).
 */
export function sessionCookieOptions() {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  if (ROOT_HOST && ROOT_HOST !== "localhost") {
    return { ...base, domain: `.${ROOT_HOST}` };
  }
  return base;
}

export interface SessionUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/** Mint a session cookie from a freshly-issued Firebase ID token. */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

/** Read + verify the current session. Returns null when signed out/expired. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
      picture: (decoded.picture as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

/** Require a signed-in user or throw — for use in route handlers. */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
