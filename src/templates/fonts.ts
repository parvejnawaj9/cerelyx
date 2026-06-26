/**
 * next/font loaders for every curated pairing (see font-data.ts). Server-only
 * (imported by the published + preview layouts). `fontVariables` is the combined
 * className applied once on a wrapper so all pairing CSS vars are available; the
 * browser only downloads glyphs for the families a site actually renders.
 */
import {
  Marcellus,
  Spectral,
  Cormorant_Garamond,
  Jost,
  Sora,
  Manrope,
  Baloo_2,
  Nunito,
  Quicksand,
  Nunito_Sans,
  Playfair_Display,
  Lato,
  Space_Grotesk,
  IBM_Plex_Sans,
} from "next/font/google";

const regalDisplay = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-regal-display", display: "swap" });
const regalBody = Spectral({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-regal-body", display: "swap" });

const romanticDisplay = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-romantic-display", display: "swap" });
const romanticBody = Jost({ subsets: ["latin"], variable: "--font-romantic-body", display: "swap" });

const modernDisplay = Sora({ subsets: ["latin"], variable: "--font-modern-display", display: "swap" });
const modernBody = Manrope({ subsets: ["latin"], variable: "--font-modern-body", display: "swap" });

const playfulDisplay = Baloo_2({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-playful-display", display: "swap" });
const playfulBody = Nunito({ subsets: ["latin"], variable: "--font-playful-body", display: "swap" });

const softDisplay = Quicksand({ subsets: ["latin"], variable: "--font-soft-display", display: "swap" });
const softBody = Nunito_Sans({ subsets: ["latin"], variable: "--font-soft-body", display: "swap" });

const classicDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-classic-display", display: "swap" });
const classicBody = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-classic-body", display: "swap" });

const corporateDisplay = Space_Grotesk({ subsets: ["latin"], variable: "--font-corporate-display", display: "swap" });
const corporateBody = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-corporate-body", display: "swap" });

export const fontVariables = [
  regalDisplay,
  regalBody,
  romanticDisplay,
  romanticBody,
  modernDisplay,
  modernBody,
  playfulDisplay,
  playfulBody,
  softDisplay,
  softBody,
  classicDisplay,
  classicBody,
  corporateDisplay,
  corporateBody,
]
  .map((f) => f.variable)
  .join(" ");
