import type { VerifyField } from "@/lib/types";

/**
 * Masked hints so guests know what to type, without revealing the full value
 * (brief §8). Used on the lock screen — exact for personalized links, generic
 * otherwise.
 */
export function maskMobile(m?: string): string {
  const d = (m ?? "").replace(/\D/g, "");
  if (d.length < 2) return "the number on your invitation";
  return `the number ending in ••${d.slice(-2)}`;
}

export function maskEmail(e?: string): string {
  const [user = "", domain = ""] = (e ?? "").split("@");
  if (!domain) return "the email on your invitation";
  const u = user.length <= 1 ? `${user}•` : `${user[0]}•••`;
  return `${u}@${domain}`;
}

export function maskCode(c?: string): string {
  const v = (c ?? "").trim();
  if (v.length <= 2) return "the unique number on your invitation";
  return `the number that starts with ${v.slice(0, 2)}•••`;
}

export function maskFor(field: VerifyField, value?: string): string {
  if (field === "mobile") return maskMobile(value);
  if (field === "email") return maskEmail(value);
  return maskCode(value);
}

export function genericHint(field: VerifyField): string {
  if (field === "mobile") return "the mobile number on your invitation";
  if (field === "email") return "the email address on your invitation";
  return "the unique number on your invitation";
}

export function verifyInputLabel(field: VerifyField): string {
  if (field === "mobile") return "Mobile number";
  if (field === "email") return "Email address";
  return "Unique number";
}
