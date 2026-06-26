/**
 * Centralized, typed access to environment configuration.
 * Only NEXT_PUBLIC_* values are safe to read in client/edge code; server-only
 * values are read in src/lib/firebase/admin.ts.
 */

/** Root domain incl. port in dev, e.g. "lvh.me:3000" or "cerelyx.online". */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "lvh.me:3000";

/** Hostname portion of the root domain, without the port. */
export const ROOT_HOST = ROOT_DOMAIN.split(":")[0] ?? "lvh.me";

/** When true, SDKs talk to the local Firebase Emulator Suite. */
export const USE_EMULATORS =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1";

/** Public Firebase web config (safe to expose). */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "demo-cerelyx.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-cerelyx",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-cerelyx.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:000000000000:web:0000000000000000000000",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? undefined,
} as const;

/** Default protocol for building absolute URLs to other surfaces. */
export const PROTOCOL =
  ROOT_HOST === "lvh.me" || ROOT_HOST === "localhost" ? "http" : "https";

/** Absolute URL to the builder surface (app.<root>). */
export function builderUrl(path = "/"): string {
  return `${PROTOCOL}://app.${ROOT_DOMAIN}${path}`;
}

/** Absolute URL to the admin surface (admin.<root>). */
export function adminUrl(path = "/"): string {
  return `${PROTOCOL}://admin.${ROOT_DOMAIN}${path}`;
}

/** Absolute URL to the apex/marketing surface. */
export function marketingUrl(path = "/"): string {
  return `${PROTOCOL}://${ROOT_DOMAIN}${path}`;
}

/** Absolute URL to a published guest site on its subdomain. */
export function siteUrl(subdomain: string, path = "/"): string {
  return `${PROTOCOL}://${subdomain}.${ROOT_DOMAIN}${path}`;
}
