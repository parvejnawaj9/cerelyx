import { z } from "zod";
import { validateSubdomain } from "@/lib/subdomains";
import {
  EVENT_CATEGORIES,
  SECTION_TYPES,
  type Site,
  type SiteContent,
} from "@/lib/types";

/** A date string is acceptable if it's an ISO date or otherwise parseable. */
export function isValidDateString(s?: string): boolean {
  if (!s) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isNaN(Date.parse(s));
}

/**
 * Zod schemas for site create / autosave, plus the publish checklist.
 * Server route handlers validate every write against these (brief §6, §15).
 */

export const subdomainSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => validateSubdomain(s).ok, {
    message: "That subdomain isn't available.",
  });

export const createSiteSchema = z.object({
  title: z.string().min(1, "Give your event a name.").max(120),
  eventType: z.enum(EVENT_CATEGORIES),
  templateId: z.string().min(1).max(60),
});
export type CreateSiteInput = z.infer<typeof createSiteSchema>;

/** A safe outbound link: empty, or an http(s) URL (blocks javascript:/data:). */
const httpUrl = z
  .string()
  .max(1000)
  .refine((s) => !s || /^https?:\/\//i.test(s), {
    message: "Use a full link starting with http:// or https://",
  });

const storyItemSchema = z.object({
  id: z.string().max(64),
  title: z.string().max(160).optional().default(""),
  date: z.string().max(40).optional(),
  body: z.string().max(4000).optional().default(""),
  imagePath: z.string().max(500).optional(),
});

const eventItemSchema = z.object({
  id: z.string().max(64),
  name: z.string().max(120).optional().default(""),
  date: z.string().max(40).optional(),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  venueName: z.string().max(200).optional(),
  address: z.string().max(400).optional(),
  mapUrl: z.string().max(1000).optional(),
  description: z.string().max(1000).optional(),
  imagePath: z.string().max(500).optional(),
});

// ---- per-section content schemas ------------------------------------------
const heroSchema = z.object({
  eyebrow: z.string().max(120).optional(),
  titleA: z.string().max(120).optional().default(""),
  titleB: z.string().max(120).optional(),
  tagline: z.string().max(240).optional(),
  date: z
    .string()
    .max(40)
    .optional()
    .refine((s) => !s || isValidDateString(s), { message: "Enter a valid date." }),
  imagePath: z.string().max(500).optional(),
});

const storySchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(2000).optional(),
  items: z.array(storyItemSchema).max(20).optional().default([]),
});

const eventsSchema = z.object({
  title: z.string().max(160).optional(),
  items: z.array(eventItemSchema).max(30).optional().default([]),
});

const venueSchema = z.object({
  name: z.string().max(200).optional(),
  address: z.string().max(400).optional(),
  mapUrl: z.string().max(1000).optional(),
});

const gallerySchema = z.object({
  title: z.string().max(160).optional(),
  imagePaths: z.array(z.string().max(500)).max(40).optional().default([]),
});

const customQuestionSchema = z.object({
  id: z.string().max(64),
  label: z.string().max(160).optional().default(""),
  type: z.enum(["text", "select"]).default("text"),
  options: z.array(z.string().max(120)).max(12).optional(),
  required: z.boolean().optional(),
});

const rsvpDataSchema = z.object({
  note: z.string().max(1000).optional(),
  mealChoices: z.array(z.string().max(120)).max(12).optional(),
  customQuestions: z.array(customQuestionSchema).max(8).optional(),
});

const footerSchema = z.object({
  hosts: z.string().max(300).optional(),
  note: z.string().max(500).optional(),
});

// ---- Phase 3 per-section content schemas ----------------------------------

const countdownSchema = z.object({
  title: z.string().max(160).optional(),
  targetDate: z
    .string()
    .max(40)
    .optional()
    .refine((s) => !s || isValidDateString(s), { message: "Enter a valid date." }),
  passedMessage: z.string().max(240).optional(),
});

const musicSchema = z.object({
  title: z.string().max(160).optional(),
  trackPath: z.string().max(500).optional(),
  trackUrl: httpUrl.optional(),
});

const wishesSchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(1000).optional(),
  autoApprove: z.boolean().optional(),
});

const registryItemSchema = z.object({
  id: z.string().max(64),
  title: z.string().max(200).optional().default(""),
  note: z.string().max(600).optional(),
  url: httpUrl.optional(),
  imagePath: z.string().max(500).optional(),
});

const registrySchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(1000).optional(),
  items: z.array(registryItemSchema).max(30).optional().default([]),
});

const livestreamSchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(1000).optional(),
  url: httpUrl.optional(),
  startsAt: z
    .string()
    .max(40)
    .optional()
    .refine((s) => !s || isValidDateString(s), { message: "Enter a valid date." }),
});

const faqItemSchema = z.object({
  id: z.string().max(64),
  q: z.string().max(300).optional().default(""),
  a: z.string().max(2000).optional().default(""),
});

const faqSchema = z.object({
  title: z.string().max(160).optional(),
  items: z.array(faqItemSchema).max(30).optional().default([]),
});

const travelItemSchema = z.object({
  id: z.string().max(64),
  title: z.string().max(200).optional().default(""),
  body: z.string().max(2000).optional().default(""),
  url: httpUrl.optional(),
});

const travelSchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(1000).optional(),
  items: z.array(travelItemSchema).max(20).optional().default([]),
});

const dressCodeSchema = z.object({
  title: z.string().max(160).optional(),
  note: z.string().max(1000).optional(),
  swatches: z
    .array(z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/))
    .max(8)
    .optional(),
});

const photosSchema = z.object({
  title: z.string().max(160).optional(),
  intro: z.string().max(1000).optional(),
  driveGalleryUrl: httpUrl.optional(),
});

/** All content for one language, one block per section type. */
export const siteContentSchema = z.object({
  hero: heroSchema.optional(),
  story: storySchema.optional(),
  events: eventsSchema.optional(),
  venue: venueSchema.optional(),
  gallery: gallerySchema.optional(),
  rsvp: rsvpDataSchema.optional(),
  footer: footerSchema.optional(),
  countdown: countdownSchema.optional(),
  music: musicSchema.optional(),
  wishes: wishesSchema.optional(),
  registry: registrySchema.optional(),
  livestream: livestreamSchema.optional(),
  faq: faqSchema.optional(),
  travel: travelSchema.optional(),
  dressCode: dressCodeSchema.optional(),
  photos: photosSchema.optional(),
});

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex colour.");
const fontVar = z
  .string()
  .regex(/^var\(--font-[a-z0-9-]+-(display|body)\)$/, "Unknown font.");

const themeSchema = z.object({
  palette: z.object({
    canvas: hex,
    surface: hex,
    ink: hex,
    muted: hex,
    primary: hex,
    secondary: hex,
    accent: hex,
    gold: hex,
  }),
  fonts: z.object({ display: fontVar, body: fontVar }),
});

const sectionSchema = z.object({
  id: z.string().max(64),
  type: z.enum(SECTION_TYPES),
  visible: z.boolean(),
  order: z.number().int().min(0).max(100),
  options: z.record(z.string(), z.unknown()).optional(),
});

/** Autosave / edit patch. Every field optional; only provided fields update. */
export const updateSiteSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  subdomain: subdomainSchema.optional(),
  templateId: z.string().max(60).optional(),
  // Phase 2: the three access modes are unlocked and enforced server-side.
  privacy: z.enum(["open", "sharedCode", "guestVerify"]).optional(),
  sharedCode: z.string().max(40).nullable().optional(),
  verifyField: z.enum(["mobile", "email", "code"]).nullable().optional(),
  theme: themeSchema.optional(),
  sections: z.array(sectionSchema).max(40).optional(),
  content: z.record(z.string(), siteContentSchema).optional(),
  seo: z
    .object({
      title: z.string().max(160).optional(),
      description: z.string().max(320).optional(),
      ogImagePath: z.string().max(500).optional(),
    })
    .optional(),
  driveGalleryUrl: z.string().max(1000).nullable().optional(),
});
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

// ---- publish checklist -----------------------------------------------------

export interface ChecklistItem {
  field: string;
  label: string;
  ok: boolean;
}

/**
 * Validate that a site has everything required to go live. Returns a per-item
 * checklist so the UI can show exactly what's missing (brief §6).
 */
export function publishChecklist(
  site: Site,
  ctx?: { hasGuests?: boolean }
): ChecklistItem[] {
  const lang = site.defaultLanguage ?? "en";
  const c: SiteContent = site.content?.[lang] ?? {};
  const hero = c.hero ?? ({} as NonNullable<SiteContent["hero"]>);
  const hasVenue = Boolean(c.venue?.name || c.venue?.address);
  const hasEvent = Boolean(c.events?.items?.some((e) => e.name?.trim()));

  const items: ChecklistItem[] = [
    {
      field: "subdomain",
      label: "A valid web address (subdomain)",
      ok: Boolean(site.subdomain) && validateSubdomain(site.subdomain).ok,
    },
    {
      field: "title",
      label: "A name or title for your event",
      ok: Boolean(hero.titleA?.trim()),
    },
    {
      field: "date",
      label: "A valid event date",
      ok: isValidDateString(hero.date),
    },
    {
      field: "venueOrEvent",
      label: "A venue or at least one event in the schedule",
      ok: hasVenue || hasEvent,
    },
  ];

  // Access-mode requirements.
  if (site.privacy === "sharedCode") {
    items.push({
      field: "sharedCode",
      label: "A shared access code (at least 3 characters)",
      ok: Boolean(site.sharedCode && site.sharedCode.trim().length >= 3),
    });
  } else if (site.privacy === "guestVerify") {
    items.push({
      field: "verifyField",
      label: "A guest verification method",
      ok: Boolean(site.verifyField),
    });
    // Only enforce the guest-count requirement when we actually know it
    // (passed by the server at publish time) — otherwise don't block.
    items.push({
      field: "guests",
      label: "At least one guest on your list",
      ok: ctx?.hasGuests !== false,
    });
  }

  return items;
}

export function isReadyToPublish(site: Site): boolean {
  return publishChecklist(site).every((i) => i.ok);
}

/** Compact a zod error into a readable message for API responses. */
export function zodMessage(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "value"}: ${i.message}`)
    .join("; ");
}
