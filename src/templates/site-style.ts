import type { CSSProperties } from "react";
import type { Theme } from "@/lib/types";

/** Map a theme into the --site-* CSS variables every template (+ the lock screen)
 * consume, plus base background/text/font so a wrapper is self-contained. */
export function siteCssVars(theme: Theme): CSSProperties {
  const p = theme.palette;
  return {
    ["--site-canvas"]: p.canvas,
    ["--site-surface"]: p.surface,
    ["--site-ink"]: p.ink,
    ["--site-muted"]: p.muted,
    ["--site-primary"]: p.primary,
    ["--site-secondary"]: p.secondary,
    ["--site-accent"]: p.accent,
    ["--site-gold"]: p.gold,
    ["--site-display"]: theme.fonts.display,
    ["--site-body"]: theme.fonts.body,
    backgroundColor: p.canvas,
    color: p.ink,
    fontFamily: theme.fonts.body,
  } as CSSProperties;
}
