import type { ThemePalette } from "@/lib/types";

/**
 * Curated palette presets the editor offers (plus each template's own default
 * and custom color pickers). PURE DATA — client-safe. Each is a full set of the
 * eight theme tokens with deliberate, premium combinations (never the AI defaults).
 */
export interface PalettePreset {
  key: string;
  name: string;
  palette: ThemePalette;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    key: "peacock",
    name: "Peacock & Gold",
    palette: { canvas: "#FBF4E6", surface: "#FFFDF7", ink: "#23150F", muted: "#7A6A57", primary: "#0E4D45", secondary: "#6E1423", accent: "#E8A33D", gold: "#C9A227" },
  },
  {
    key: "emerald-blush",
    name: "Emerald & Blush",
    palette: { canvas: "#FBF6F2", surface: "#FFFFFF", ink: "#1F2421", muted: "#6E6A64", primary: "#14624D", secondary: "#A8455C", accent: "#E0A38F", gold: "#C09356" },
  },
  {
    key: "midnight-brass",
    name: "Midnight & Brass",
    palette: { canvas: "#F4F1EA", surface: "#FFFFFF", ink: "#161A24", muted: "#565C6A", primary: "#1B2440", secondary: "#3E5C76", accent: "#C9A24B", gold: "#B8862F" },
  },
  {
    key: "sage-plum",
    name: "Sage & Plum",
    palette: { canvas: "#F6F4EE", surface: "#FFFFFF", ink: "#22201D", muted: "#64635A", primary: "#4F6047", secondary: "#5A3E5B", accent: "#C07E90", gold: "#B0935F" },
  },
  {
    key: "rose-champagne",
    name: "Rose & Champagne",
    palette: { canvas: "#FBF3F0", surface: "#FFFFFF", ink: "#33231F", muted: "#866A62", primary: "#9C4654", secondary: "#7C5C50", accent: "#E2AB93", gold: "#C49A5F" },
  },
  {
    key: "cobalt-coral",
    name: "Cobalt & Coral",
    palette: { canvas: "#FAF7F0", surface: "#FFFFFF", ink: "#1C2230", muted: "#565C6A", primary: "#2B4C9B", secondary: "#C2412B", accent: "#F2B441", gold: "#C9912F" },
  },
  {
    key: "slate-amber",
    name: "Slate & Amber",
    palette: { canvas: "#F5F5F2", surface: "#FFFFFF", ink: "#1B1D21", muted: "#54585F", primary: "#2A3340", secondary: "#456073", accent: "#DC9A33", gold: "#B98A33" },
  },
  {
    key: "lilac-mint",
    name: "Lilac & Mint",
    palette: { canvas: "#F6F5FB", surface: "#FFFFFF", ink: "#2A2733", muted: "#64616E", primary: "#5E4F88", secondary: "#2F7660", accent: "#DCA6C8", gold: "#C0A263" },
  },
];

export const PALETTE_TOKEN_LABELS: { key: keyof ThemePalette; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "gold", label: "Signature" },
  { key: "canvas", label: "Background" },
  { key: "ink", label: "Text" },
];
