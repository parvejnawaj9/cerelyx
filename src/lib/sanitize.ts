import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitization helpers for user-supplied content (brief §15).
 * isomorphic-dompurify works in both the browser and Node.
 */

/** Strip ALL markup — for single-line / plain-text fields (names, titles). */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/** Allow a small, safe set of formatting tags — for story bodies / wishes. */
export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
  });
}

/** Validate + normalize an external URL (maps, registry, livestream, drive). */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (trimmed === "") return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // not a valid absolute URL
  }
  return "";
}
