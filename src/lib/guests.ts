/** Pure guest helpers (normalization + slugs) — usable on server and client. */

export function normalizeMobile(s?: string): string {
  return (s ?? "").replace(/\D/g, "");
}

export function normalizeEmail(s?: string): string {
  return (s ?? "").trim().toLowerCase();
}

export function normalizeCode(s?: string): string {
  return (s ?? "").trim();
}

import type { VerifyField } from "@/lib/types";

/** Normalize the value a guest verifies with, by field type. */
export function normalizeIdentifier(field: VerifyField, value: string): string {
  if (field === "mobile") return normalizeMobile(value);
  if (field === "email") return normalizeEmail(value);
  return normalizeCode(value);
}

export function slugifyName(name: string): string {
  const base = (name || "guest")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 28);
  return base || "guest";
}

export function shortToken(len = 4): string {
  const a = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  const rnd =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? Array.from(crypto.getRandomValues(new Uint8Array(len)))
      : Array.from({ length: len }, () => Math.floor(Math.random() * 256));
  for (let i = 0; i < len; i++) s += a[rnd[i]! % a.length];
  return s;
}

export function makePersonalSlug(name: string): string {
  // 8 random chars (32^8 ≈ 1.1e12) makes the suffix infeasible to brute-force.
  return `${slugifyName(name)}-${shortToken(8)}`;
}
