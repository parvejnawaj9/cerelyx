import { USE_EMULATORS, firebaseClientConfig } from "@/lib/env";

/**
 * Build a public download URL for a Storage object path. Works on server + client.
 * Storage rules grant public read on site images, so the `?alt=media` URL needs
 * no token. Points at the Storage emulator in dev and the real bucket in prod.
 */
export function storageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already a URL
  const bucket = firebaseClientConfig.storageBucket;
  const base = USE_EMULATORS
    ? "http://127.0.0.1:9199"
    : "https://firebasestorage.googleapis.com";
  return `${base}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
