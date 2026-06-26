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
    description: "Let guests tell you they're coming — with meal & custom questions.",
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    description: "A live countdown to the big day.",
  },
  photos: {
    type: "photos",
    label: "Photo sharing",
    description: "A button to your shared Google Drive album.",
  },
  music: {
    type: "music",
    label: "Music",
    description: "A song that plays softly in the background (muted until tapped).",
  },
  wishes: {
    type: "wishes",
    label: "Wishes",
    description: "A guestbook — guests leave a message, you approve them.",
  },
  registry: {
    type: "registry",
    label: "Gift registry",
    description: "Share a registry or wish list of gifts.",
  },
  livestream: {
    type: "livestream",
    label: "Live stream",
    description: "A clear link for guests joining online.",
  },
  travel: {
    type: "travel",
    label: "Travel & stay",
    description: "Hotels, transport and tips for out-of-town guests.",
  },
  dressCode: {
    type: "dressCode",
    label: "Dress code",
    description: "Tell guests what to wear, with optional colour swatches.",
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Answer the questions guests always ask.",
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
  countdown: () => ({}),
  music: () => ({}),
  wishes: () => ({}),
  registry: () => ({ items: [] }),
  livestream: () => ({}),
  faq: () => ({ items: [] }),
  travel: () => ({ items: [] }),
  dressCode: () => ({}),
  photos: () => ({}),
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
