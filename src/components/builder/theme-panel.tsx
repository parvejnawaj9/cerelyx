"use client";

import type { Theme, ThemePalette } from "@/lib/types";
import { PALETTE_PRESETS, PALETTE_TOKEN_LABELS } from "@/templates/palettes";
import {
  FONT_PAIRINGS,
  fontPairingKeyFromVar,
  themeFontsFor,
} from "@/templates/font-data";
import { cn } from "@/lib/cn";

function samePalette(a: ThemePalette, b: ThemePalette): boolean {
  return (Object.keys(a) as (keyof ThemePalette)[]).every((k) => a[k] === b[k]);
}

export function ThemePanel({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (t: Theme) => void;
}) {
  const fontKey = fontPairingKeyFromVar(theme.fonts.display);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          Colour palette
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PALETTE_PRESETS.map((p) => {
            const active = samePalette(theme.palette, p.palette);
            return (
              <button
                type="button"
                key={p.key}
                onClick={() => onChange({ ...theme, palette: p.palette })}
                className={cn(
                  "flex flex-col gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-all",
                  active
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-line hover:border-line-strong"
                )}
              >
                <div className="flex gap-1">
                  {[p.palette.primary, p.palette.secondary, p.palette.accent, p.palette.gold].map(
                    (c, i) => (
                      <span
                        key={i}
                        className="h-5 flex-1 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
                <span className="text-xs font-medium text-ink">{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          Fine-tune colours
        </h3>
        <div className="flex flex-col divide-y divide-line rounded-[var(--radius-md)] border border-line">
          {PALETTE_TOKEN_LABELS.map(({ key, label }) => (
            <ColorRow
              key={key}
              label={label}
              value={theme.palette[key]}
              onChange={(hex) =>
                onChange({
                  ...theme,
                  palette: { ...theme.palette, [key]: hex },
                })
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          Typography
        </h3>
        <div className="flex flex-col gap-2">
          {FONT_PAIRINGS.map((fp) => {
            const active = fp.key === fontKey;
            return (
              <button
                type="button"
                key={fp.key}
                onClick={() => onChange({ ...theme, fonts: themeFontsFor(fp.key) })}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-all",
                  active
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-line hover:border-line-strong"
                )}
              >
                <span className="flex flex-col">
                  <span
                    className="text-xl leading-none text-ink"
                    style={{ fontFamily: fp.display }}
                  >
                    Aa
                  </span>
                  <span
                    className="mt-1 text-xs text-muted"
                    style={{ fontFamily: fp.body }}
                  >
                    {fp.mood}
                  </span>
                </span>
                <span className="text-xs text-faint">{fp.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label} hex`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 py-1 text-right font-mono text-xs"
        />
        <input
          type="color"
          aria-label={`${label} colour`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-[var(--radius-sm)] border border-line-strong bg-surface p-0.5"
        />
      </div>
    </div>
  );
}
