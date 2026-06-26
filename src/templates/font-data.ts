/**
 * Curated display + body font pairings (PURE DATA — client-safe). The CSS
 * variables are produced by src/templates/fonts.ts (next/font) and applied once
 * on the published + preview layouts. A theme's `fonts` references one pairing's
 * vars, and the editor's font control offers this list.
 */
export interface FontPairing {
  key: string;
  name: string;
  display: string; // CSS var, e.g. "var(--font-regal-display)"
  body: string;
  mood: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  { key: "regal", name: "Marcellus · Spectral", display: "var(--font-regal-display)", body: "var(--font-regal-body)", mood: "Regal, classical" },
  { key: "romantic", name: "Cormorant · Jost", display: "var(--font-romantic-display)", body: "var(--font-romantic-body)", mood: "Editorial, romantic" },
  { key: "modern", name: "Sora · Manrope", display: "var(--font-modern-display)", body: "var(--font-modern-body)", mood: "Modern, clean" },
  { key: "playful", name: "Baloo · Nunito", display: "var(--font-playful-display)", body: "var(--font-playful-body)", mood: "Playful, rounded" },
  { key: "soft", name: "Quicksand · Nunito Sans", display: "var(--font-soft-display)", body: "var(--font-soft-body)", mood: "Soft, gentle" },
  { key: "classic", name: "Playfair · Lato", display: "var(--font-classic-display)", body: "var(--font-classic-body)", mood: "Timeless, elegant" },
  { key: "corporate", name: "Space Grotesk · IBM Plex", display: "var(--font-corporate-display)", body: "var(--font-corporate-body)", mood: "Confident, professional" },
];

export function fontPairing(key: string): FontPairing {
  return FONT_PAIRINGS.find((p) => p.key === key) ?? FONT_PAIRINGS[0]!;
}

/** Theme.fonts for a pairing key. */
export function themeFontsFor(key: string): { display: string; body: string } {
  const p = fontPairing(key);
  return { display: p.display, body: p.body };
}

/** Best-effort: find the pairing key a theme's fonts reference. */
export function fontPairingKeyFromVar(displayVar?: string): string {
  const m = /--font-([a-z]+)-display/.exec(displayVar ?? "");
  return m && FONT_PAIRINGS.some((p) => p.key === m[1]) ? m[1]! : "regal";
}
