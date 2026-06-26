import type { TemplateMeta, SiteContent } from "@/lib/types";
import {
  royalIndianTheme,
  royalIndianSections,
  royalIndianDefaultContent,
} from "./royal-indian/theme";
import {
  engagementTheme,
  engagementSections,
  engagementDefaultContent,
} from "./engagement/theme";
import {
  birthdayTheme,
  birthdaySections,
  birthdayDefaultContent,
} from "./birthday/theme";
import {
  babyShowerTheme,
  babyShowerSections,
  babyShowerDefaultContent,
} from "./baby-shower/theme";
import {
  anniversaryTheme,
  anniversarySections,
  anniversaryDefaultContent,
} from "./anniversary/theme";
import {
  corporateTheme,
  corporateSections,
  corporateDefaultContent,
} from "./corporate/theme";
import {
  customTheme,
  customSections,
  customDefaultContent,
} from "./custom/theme";

/**
 * Template catalog — PURE DATA (no React). Safe to import from server routes,
 * the editor and the gallery. React renderers live in registry.tsx.
 */
export interface TemplateCatalogEntry extends TemplateMeta {
  description: string;
  defaultContent: SiteContent;
}

export const TEMPLATES: Record<string, TemplateCatalogEntry> = {
  "royal-indian": {
    id: "royal-indian",
    name: "Royal Indian",
    category: "wedding",
    style: "royal-indian",
    description:
      "Jewel tones, marigold warmth and gold-foil ornament — a regal invitation for traditional celebrations.",
    previewImage: "/templates/royal-indian/preview.svg",
    defaultTheme: royalIndianTheme,
    defaultSections: royalIndianSections,
    defaultContent: royalIndianDefaultContent,
  },
  engagement: {
    id: "engagement",
    name: "Editorial",
    category: "engagement",
    style: "modern-editorial",
    description:
      "A magazine-style invite with an oversized date and quiet, confident type — made for the moment you said yes.",
    previewImage: "/templates/engagement/preview.svg",
    defaultTheme: engagementTheme,
    defaultSections: engagementSections,
    defaultContent: engagementDefaultContent,
  },
  birthday: {
    id: "birthday",
    name: "Confetti",
    category: "birthday",
    style: "playful",
    description:
      "Bold, bright and full of confetti — a high-energy design for birthdays of every age.",
    previewImage: "/templates/birthday/preview.svg",
    defaultTheme: birthdayTheme,
    defaultSections: birthdaySections,
    defaultContent: birthdayDefaultContent,
  },
  "baby-shower": {
    id: "baby-shower",
    name: "Little One",
    category: "baby-shower",
    style: "soft",
    description:
      "Soft clouds, gentle colour and rounded type to welcome a little one on the way.",
    previewImage: "/templates/baby-shower/preview.svg",
    defaultTheme: babyShowerTheme,
    defaultSections: babyShowerSections,
    defaultContent: babyShowerDefaultContent,
  },
  anniversary: {
    id: "anniversary",
    name: "Keepsake",
    category: "anniversary",
    style: "classic",
    description:
      "A timeless keepsake with engraved numerals and elegant hairline rules for milestone anniversaries.",
    previewImage: "/templates/anniversary/preview.svg",
    defaultTheme: anniversaryTheme,
    defaultSections: anniversarySections,
    defaultContent: anniversaryDefaultContent,
  },
  corporate: {
    id: "corporate",
    name: "Summit",
    category: "corporate",
    style: "professional",
    description:
      "Clean, structured and confident — for conferences, product launches and summits.",
    previewImage: "/templates/corporate/preview.svg",
    defaultTheme: corporateTheme,
    defaultSections: corporateSections,
    defaultContent: corporateDefaultContent,
  },
  custom: {
    id: "custom",
    name: "Clean Slate",
    category: "custom",
    style: "modern",
    description:
      "A versatile, modern design that suits any occasion — start here and make it yours.",
    previewImage: "/templates/custom/preview.svg",
    defaultTheme: customTheme,
    defaultSections: customSections,
    defaultContent: customDefaultContent,
  },
};

export const DEFAULT_TEMPLATE_ID = "royal-indian";

export function getTemplateCatalog(
  id: string
): TemplateCatalogEntry | undefined {
  return TEMPLATES[id];
}

export function listTemplates(): TemplateCatalogEntry[] {
  return Object.values(TEMPLATES);
}
