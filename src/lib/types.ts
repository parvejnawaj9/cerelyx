/**
 * Cerelyx domain types — the full Section 3 data model.
 *
 * Timestamps are represented as ISO strings in the *serialized* shapes used
 * throughout the UI (Firestore Timestamps are converted at the read boundary in
 * src/lib/server/sites.ts). Write paths use server FieldValue/Timestamp directly.
 */

export type Locale = string; // 'en' | 'bn' | 'hi' | ... (open for expansion)
export type UserRole = "user" | "admin";
export type Plan = "free"; // billing tiers added later
export type SiteStatus = "draft" | "published";
export type SitePrivacy = "open" | "sharedCode" | "guestVerify";

/** Field guests verify against when privacy === 'guestVerify'. */
export type VerifyField = "mobile" | "email" | "code";

/** Event categories (brief §4). Phase 1 ships 'wedding'; the rest are reserved. */
export const EVENT_CATEGORIES = [
  // weddings & related
  "wedding",
  "engagement",
  "reception",
  "roka",
  "mehndi",
  "sangeet",
  "haldi",
  "tilak",
  "nikah",
  "walima",
  "anniversary",
  "vow-renewal",
  // family & milestones
  "birthday",
  "baby-shower",
  "godh-bharai",
  "naming-ceremony",
  "mundan",
  "housewarming",
  "retirement",
  "graduation",
  "farewell",
  // religious & cultural
  "puja",
  "upanayanam",
  "bratabandha",
  "christening",
  "bar-bat-mitzvah",
  "festival",
  // social & professional
  "reunion",
  "corporate",
  "product-launch",
  "award-night",
  "fundraiser",
  "memorial",
  // generic
  "custom",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Section kinds a template page can be composed of. */
export const SECTION_TYPES = [
  "hero",
  "story",
  "events",
  "gallery",
  "venue",
  "countdown",
  "rsvp",
  "registry",
  "wishes",
  "travel",
  "dressCode",
  "livestream",
  "faq",
  "footer",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export interface SectionBlock {
  id: string;
  type: SectionType;
  visible: boolean;
  order: number;
  /** Layout-only options (not language content). */
  options?: Record<string, unknown>;
}

// ---- theming --------------------------------------------------------------

export interface ThemePalette {
  canvas: string; // page background
  surface: string; // panels / cards
  ink: string; // primary text
  muted: string; // secondary text
  primary: string; // main brand color
  secondary: string; // supporting brand color
  accent: string; // call-to-action / highlight
  gold: string; // metallic / signature accent
}

export interface ThemeFonts {
  /** CSS family name exposed by next/font for the display face. */
  display: string;
  /** CSS family name exposed by next/font for the body face. */
  body: string;
}

export interface Theme {
  palette: ThemePalette;
  fonts: ThemeFonts;
}

// ---- per-section, per-language content -------------------------------------
//
// Content is keyed by SECTION TYPE (one block per type per site) so that
// reordering, show/hide, and switching templates all preserve content: any
// template with a `hero`/`story`/`venue` reuses the same data. The whole map is
// also keyed by language code (Site.content[lang]) so multi-language stays a
// first-class concern.

export interface StoryItem {
  id: string;
  title: string;
  date?: string; // ISO date or free text ("2021")
  body: string;
}

export interface EventItem {
  id: string;
  name: string; // "Haldi", "Mehndi", "Reception", or an agenda slot
  date?: string; // ISO date
  startTime?: string; // "16:00"
  endTime?: string;
  venueName?: string;
  address?: string;
  description?: string;
}

export interface HeroData {
  eyebrow?: string; // "Together with their families", "You're invited", …
  titleA: string; // main name / event title
  titleB?: string; // second name (couples) — optional
  tagline?: string;
  date?: string; // main event ISO date
  imagePath?: string; // hero photo (Storage path)
}

export interface StoryData {
  title?: string;
  intro?: string;
  items: StoryItem[];
}

export interface EventsData {
  title?: string;
  items: EventItem[];
}

export interface VenueData {
  name?: string;
  address?: string;
  mapUrl?: string;
}

export interface GalleryData {
  title?: string;
  imagePaths: string[];
}

export interface RsvpData {
  note?: string;
}

export interface FooterData {
  hosts?: string;
  note?: string;
}

/** Maps an editable section type to its content shape. */
export interface SectionDataMap {
  hero: HeroData;
  story: StoryData;
  events: EventsData;
  venue: VenueData;
  gallery: GalleryData;
  rsvp: RsvpData;
  footer: FooterData;
  // Phase 3 section types (countdown, registry, wishes, faq, travel, dressCode,
  // livestream) are added here as they ship.
}

export type EditableSectionType = keyof SectionDataMap;

/** All section content for one language. One block per section type. */
export type SiteContent = {
  [K in keyof SectionDataMap]?: SectionDataMap[K];
};

// ---- SEO -------------------------------------------------------------------

export interface SeoConfig {
  title?: string;
  description?: string;
  ogImagePath?: string;
}

// ---- documents -------------------------------------------------------------

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
  locale: Locale;
  plan: Plan;
  createdAt: string;
}

export interface Site {
  id: string;
  ownerId: string;
  subdomain: string;
  eventType: EventCategory;
  title: string;
  templateId: string;
  theme: Theme;
  sections: SectionBlock[];
  invitationCanvas?: unknown | null; // free-drag layout JSON (Phase 4)
  privacy: SitePrivacy;
  sharedCode?: string | null;
  verifyField?: VerifyField | null;
  languages: Locale[];
  defaultLanguage: Locale;
  content: Record<Locale, SiteContent>;
  status: SiteStatus;
  seo: SeoConfig;
  driveGalleryUrl?: string | null;
  storageBytesUsed?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface Guest {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  uniqueCode?: string;
  group?: string;
  personalSlug?: string;
  rsvpStatus?: "pending" | "yes" | "no" | "maybe";
  partySize?: number;
  note?: string;
  createdAt: string;
}

export interface Rsvp {
  id: string;
  guestId?: string | null;
  name: string;
  attending: boolean;
  partySize: number;
  mealChoice?: string;
  answers?: Record<string, string>;
  message?: string;
  rsvpStatus: "yes" | "no" | "maybe";
  createdAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

export interface TemplateMeta {
  id: string;
  name: string;
  category: EventCategory;
  style: string; // "royal-indian", "modern-editorial", ...
  previewImage?: string;
  defaultTheme: Theme;
  defaultSections: SectionBlock[];
}

/** Server-managed uniqueness lock + reverse lookup for subdomains. */
export interface SubdomainDoc {
  subdomain: string;
  siteId: string;
  ownerId: string;
  status: SiteStatus;
}

export interface AdminLog {
  id: string;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  detail?: string;
  createdAt: string;
}
