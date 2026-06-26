import type {
  EditableSectionType,
  SectionDataMap,
  SectionBlock,
} from "@/lib/types";

/**
 * The library of editable sections — drives the editor's "add section" menu,
 * per-section defaults, and which section types the templates render in Phase 2.
 * Section block `id` is the section type, so there is one block per type and
 * content maps cleanly across templates when switching designs.
 */
export interface SectionMeta {
  type: EditableSectionType;
  label: string;
  description: string;
  /** Required sections can't be removed (only the others can be added/removed). */
  required?: boolean;
}

export const SECTION_LIBRARY: Record<EditableSectionType, SectionMeta> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Names, date and a headline — the first thing guests see.",
    required: true,
  },
  story: {
    type: "story",
    label: "Our story",
    description: "Your journey, told as a short timeline.",
  },
  events: {
    type: "events",
    label: "Schedule",
    description: "Your events, ceremonies or agenda.",
  },
  venue: {
    type: "venue",
    label: "Venue",
    description: "Where it's happening, with directions.",
  },
  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "A handful of favourite photos.",
  },
  rsvp: {
    type: "rsvp",
    label: "RSVP",
    description: "Let guests tell you they're coming.",
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "A warm sign-off.",
    required: true,
  },
};

export const EDITABLE_SECTION_TYPES = Object.keys(
  SECTION_LIBRARY
) as EditableSectionType[];

export function isRequiredSection(type: EditableSectionType): boolean {
  return Boolean(SECTION_LIBRARY[type]?.required);
}

const SECTION_DEFAULTS: { [K in EditableSectionType]: () => SectionDataMap[K] } = {
  hero: () => ({ titleA: "" }),
  story: () => ({ items: [] }),
  events: () => ({ items: [] }),
  venue: () => ({}),
  gallery: () => ({ imagePaths: [] }),
  rsvp: () => ({}),
  footer: () => ({}),
};

/** Empty content for a freshly-added section. */
export function defaultSectionData<K extends EditableSectionType>(
  type: K
): SectionDataMap[K] {
  return SECTION_DEFAULTS[type]();
}

export function makeSectionBlock(
  type: EditableSectionType,
  order: number
): SectionBlock {
  return { id: type, type, visible: true, order };
}

/** Short, stable-ish id for repeatable items (story/event entries). */
export function genItemId(prefix = "i"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rnd}`;
}
