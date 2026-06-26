import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  getTemplateCatalog,
  DEFAULT_TEMPLATE_ID,
} from "@/templates/catalog";
import { suggestSubdomain, validateSubdomain } from "@/lib/subdomains";
import { sanitizeUrl } from "@/lib/sanitize";
import {
  publishChecklist,
  type ChecklistItem,
  type CreateSiteInput,
  type UpdateSiteInput,
} from "@/lib/validation/site";
import type {
  Site,
  EventCategory,
  SiteContent,
  SeoConfig,
  SectionBlock,
  Theme,
  SitePrivacy,
  VerifyField,
} from "@/lib/types";

/**
 * Server-only Firestore access via the Admin SDK (brief §3, §6).
 *
 * Data model:
 *   sites/{id}                — PUBLIC doc: published snapshot + metadata.
 *   sites/{id}/editor/draft   — owner-only working copy (in-progress edits).
 *   subdomains/{sub}          — server-managed uniqueness lock + reverse lookup.
 *
 * The public site renders from sites/{id}; the editor + preview render from the
 * draft. Publishing copies the draft into the public doc, so live sites never
 * change until the host re-publishes.
 */

export class SiteError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "SUBDOMAIN_TAKEN"
      | "INVALID_SUBDOMAIN"
      | "NOT_READY",
    message: string,
    public detail?: unknown
  ) {
    super(message);
    this.name = "SiteError";
  }
}

// ---- serialization ---------------------------------------------------------

function toIso(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  // Firestore-like { _seconds }
  if (typeof value === "object" && "toDate" in (value as object)) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

interface EditableFields {
  templateId: string;
  title: string;
  theme: Theme;
  sections: SectionBlock[];
  content: Record<string, SiteContent>;
  seo: SeoConfig;
  privacy: SitePrivacy;
  sharedCode: string | null;
  verifyField: VerifyField | null;
  driveGalleryUrl: string | null;
}

function readEditable(data: Record<string, unknown>): EditableFields {
  return {
    templateId: (data.templateId as string) ?? DEFAULT_TEMPLATE_ID,
    title: (data.title as string) ?? "Untitled event",
    theme: data.theme as Theme,
    sections: (data.sections as SectionBlock[]) ?? [],
    content: (data.content as Record<string, SiteContent>) ?? {},
    seo: (data.seo as SeoConfig) ?? {},
    privacy: (data.privacy as SitePrivacy) ?? "open",
    sharedCode: (data.sharedCode as string | null) ?? null,
    verifyField: (data.verifyField as VerifyField | null) ?? null,
    driveGalleryUrl: (data.driveGalleryUrl as string | null) ?? null,
  };
}

function buildSite(
  id: string,
  meta: Record<string, unknown>,
  editable: EditableFields
): Site {
  return {
    id,
    ownerId: meta.ownerId as string,
    subdomain: meta.subdomain as string,
    eventType: (meta.eventType as EventCategory) ?? "custom",
    templateId: editable.templateId,
    status: (meta.status as Site["status"]) ?? "draft",
    languages: (meta.languages as string[]) ?? ["en"],
    defaultLanguage: (meta.defaultLanguage as string) ?? "en",
    title: editable.title,
    theme: editable.theme,
    sections: editable.sections,
    content: editable.content,
    seo: editable.seo,
    privacy: editable.privacy,
    sharedCode: editable.sharedCode,
    verifyField: editable.verifyField,
    driveGalleryUrl: editable.driveGalleryUrl,
    invitationCanvas: (meta.invitationCanvas as unknown) ?? null,
    storageBytesUsed: (meta.storageBytesUsed as number) ?? 0,
    createdAt: toIso(meta.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIso(meta.updatedAt) ?? new Date(0).toISOString(),
    publishedAt: toIso(meta.publishedAt) ?? null,
  };
}

// ---- reads -----------------------------------------------------------------

/** Public/published view of a site (used by the live renderer). */
export async function getSiteById(id: string): Promise<Site | null> {
  const snap = await adminDb.collection("sites").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return buildSite(id, data, readEditable(data));
}

/** Editor/preview view: metadata from the public doc + the working draft. */
export async function getSiteForEditor(
  id: string,
  ownerId: string
): Promise<Site | null> {
  const siteRef = adminDb.collection("sites").doc(id);
  const [siteSnap, draftSnap] = await Promise.all([
    siteRef.get(),
    siteRef.collection("editor").doc("draft").get(),
  ]);
  if (!siteSnap.exists) return null;
  const meta = siteSnap.data()!;
  if (meta.ownerId !== ownerId) throw new SiteError("FORBIDDEN", "Not your site.");
  const draft = draftSnap.exists ? draftSnap.data()! : meta;
  const site = buildSite(id, meta, readEditable(draft));
  // Surface the draft's save time for the "Saved" indicator.
  site.updatedAt = toIso(draft.updatedAt) ?? site.updatedAt;
  return site;
}

/** Resolve a published site by subdomain (live guest render). */
export async function getPublishedSiteBySubdomain(
  subdomain: string
): Promise<Site | null> {
  const subSnap = await adminDb
    .collection("subdomains")
    .doc(subdomain)
    .get();
  if (!subSnap.exists) return null;
  const siteId = subSnap.data()!.siteId as string;
  const site = await getSiteById(siteId);
  if (!site || site.status !== "published") return null;
  return site;
}

/** All sites owned by a user, newest activity first (dashboard). */
export async function listSitesByOwner(ownerId: string): Promise<Site[]> {
  const snap = await adminDb
    .collection("sites")
    .where("ownerId", "==", ownerId)
    .get();
  const sites = snap.docs.map((d) =>
    buildSite(d.id, d.data(), readEditable(d.data()))
  );
  sites.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return sites;
}

// ---- subdomain helpers -----------------------------------------------------

export async function isSubdomainAvailable(
  subdomain: string,
  exceptSiteId?: string
): Promise<boolean> {
  const check = validateSubdomain(subdomain);
  if (!check.ok) return false;
  const snap = await adminDb
    .collection("subdomains")
    .doc(check.value)
    .get();
  if (!snap.exists) return true;
  return snap.data()!.siteId === exceptSiteId;
}

async function findFreeSubdomain(base: string): Promise<string> {
  const seed = suggestSubdomain(base) || "celebration";
  const candidates = [
    seed,
    `${seed}-wedding`,
    `${seed}-${Math.floor(100 + Math.random() * 900)}`,
  ];
  for (const c of candidates) {
    if (validateSubdomain(c).ok && (await isSubdomainAvailable(c))) return c;
  }
  // Last resort: random suffix loop.
  for (let i = 0; i < 8; i++) {
    const c = `${seed}-${Math.floor(1000 + Math.random() * 9000)}`.slice(0, 40);
    if (validateSubdomain(c).ok && (await isSubdomainAvailable(c))) return c;
  }
  throw new SiteError("SUBDOMAIN_TAKEN", "Could not allocate a web address.");
}

// ---- writes ----------------------------------------------------------------

/** Create a new site (public doc + draft + reserved subdomain) atomically. */
export async function createSite(
  ownerId: string,
  input: CreateSiteInput
): Promise<{ id: string; subdomain: string }> {
  const template =
    getTemplateCatalog(input.templateId) ??
    getTemplateCatalog(DEFAULT_TEMPLATE_ID)!;

  const subdomain = await findFreeSubdomain(input.title);
  const siteRef = adminDb.collection("sites").doc();
  const id = siteRef.id;

  const content: Record<string, SiteContent> = {
    en: { ...template.defaultContent },
  };
  const editable: Record<string, unknown> = {
    templateId: template.id,
    title: input.title,
    theme: template.defaultTheme,
    sections: template.defaultSections,
    content,
    // Leave SEO empty so <title>/description track the live content (couple
    // names + tagline) until the host customizes them in the Phase 5 SEO editor.
    seo: {},
    privacy: "open",
    sharedCode: null,
    verifyField: null,
    driveGalleryUrl: null,
  };

  await adminDb.runTransaction(async (t) => {
    const subRef = adminDb.collection("subdomains").doc(subdomain);
    const subSnap = await t.get(subRef);
    if (subSnap.exists) {
      throw new SiteError("SUBDOMAIN_TAKEN", "Web address just got taken.");
    }
    t.set(siteRef, {
      ownerId,
      subdomain,
      eventType: input.eventType,
      templateId: template.id,
      status: "draft",
      languages: ["en"],
      defaultLanguage: "en",
      invitationCanvas: null,
      storageBytesUsed: 0,
      ...editable,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });
    t.set(siteRef.collection("editor").doc("draft"), {
      ...editable,
      updatedAt: FieldValue.serverTimestamp(),
    });
    t.set(subRef, { subdomain, siteId: id, ownerId, status: "draft" });
  });

  return { id, subdomain };
}

async function assertOwner(
  siteId: string,
  ownerId: string
): Promise<Record<string, unknown>> {
  const snap = await adminDb.collection("sites").doc(siteId).get();
  if (!snap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
  const data = snap.data()!;
  if (data.ownerId !== ownerId) throw new SiteError("FORBIDDEN", "Not your site.");
  return data;
}

/** Apply a validated edit patch to the working draft (autosave). */
export async function updateDraft(
  siteId: string,
  ownerId: string,
  patch: UpdateSiteInput
): Promise<{ updatedAt: string }> {
  await assertOwner(siteId, ownerId);

  // Subdomain changes go through the atomic path, not the draft.
  const { subdomain, ...draftPatch } = patch;
  if (subdomain) {
    await changeSubdomain(siteId, ownerId, subdomain);
  }

  const draftRef = adminDb
    .collection("sites")
    .doc(siteId)
    .collection("editor")
    .doc("draft");

  const now = Timestamp.now();

  // Build a dotted-path update so each per-language content map is REPLACED
  // wholesale — a field cleared/removed from the payload is actually deleted,
  // not merge-preserved, so the published snapshot can't carry stale data.
  const updates: Record<string, unknown> = { updatedAt: now };
  for (const [key, value] of Object.entries(draftPatch)) {
    if (key === "content" && value && typeof value === "object") {
      for (const [lang, langContent] of Object.entries(
        value as Record<string, unknown>
      )) {
        updates[`content.${lang}`] = langContent;
      }
    } else if (key === "driveGalleryUrl") {
      updates.driveGalleryUrl = value ? sanitizeUrl(value) || null : null;
    } else {
      updates[key] = value;
    }
  }
  await draftRef.update(updates);
  return { updatedAt: now.toDate().toISOString() };
}

/** Atomically move a site's subdomain reservation. */
export async function changeSubdomain(
  siteId: string,
  ownerId: string,
  rawSubdomain: string
): Promise<void> {
  const check = validateSubdomain(rawSubdomain);
  if (!check.ok) {
    throw new SiteError("INVALID_SUBDOMAIN", check.reason);
  }
  const newSub = check.value;

  await adminDb.runTransaction(async (t) => {
    const siteRef = adminDb.collection("sites").doc(siteId);
    const newRef = adminDb.collection("subdomains").doc(newSub);
    const siteSnap = await t.get(siteRef);
    if (!siteSnap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
    const site = siteSnap.data()!;
    if (site.ownerId !== ownerId) {
      throw new SiteError("FORBIDDEN", "Not your site.");
    }
    const oldSub = site.subdomain as string | undefined;
    if (oldSub === newSub) return;
    // The web address is locked once a site has been published (brief §2 —
    // immutable after first publish; the one-time change UI is a Phase 2 item).
    if (site.status === "published" || site.publishedAt) {
      throw new SiteError(
        "FORBIDDEN",
        "Your web address can't be changed after publishing."
      );
    }

    const newSnap = await t.get(newRef);
    if (newSnap.exists && newSnap.data()!.siteId !== siteId) {
      throw new SiteError("SUBDOMAIN_TAKEN", "That web address is taken.");
    }

    t.set(newRef, {
      subdomain: newSub,
      siteId,
      ownerId,
      status: site.status ?? "draft",
    });
    if (oldSub) {
      t.delete(adminDb.collection("subdomains").doc(oldSub));
    }
    t.update(siteRef, {
      subdomain: newSub,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Publish: validate readiness, copy the draft into the public doc, flip status.
 * Returns the checklist when the site isn't ready (nothing is published).
 */
export async function publishSite(
  siteId: string,
  ownerId: string
): Promise<
  | { ok: true; subdomain: string }
  | { ok: false; checklist: ChecklistItem[] }
> {
  const siteRef = adminDb.collection("sites").doc(siteId);
  const draftRef = siteRef.collection("editor").doc("draft");

  // One transaction: read the draft + site + subdomain doc, validate the
  // snapshot, then atomically copy draft → public doc and stamp the reservation.
  // This serializes publish against concurrent autosaves and subdomain changes,
  // so the exact bytes that pass the checklist are the bytes that go live.
  return adminDb.runTransaction(async (t) => {
    const siteSnap = await t.get(siteRef);
    if (!siteSnap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
    const meta = siteSnap.data()!;
    if (meta.ownerId !== ownerId) {
      throw new SiteError("FORBIDDEN", "Not your site.");
    }
    const draftSnap = await t.get(draftRef);
    const draftData = draftSnap.exists ? draftSnap.data()! : meta;

    const editable = readEditable(draftData);
    const candidate = buildSite(siteId, meta, editable);
    // Guest-verify sites need at least one guest or nobody can ever get in.
    let hasGuests: boolean | undefined;
    if (editable.privacy === "guestVerify") {
      const gSnap = await t.get(siteRef.collection("guests").limit(1));
      hasGuests = !gSnap.empty;
    }
    const checklist = publishChecklist(candidate, { hasGuests });
    if (!checklist.every((i) => i.ok)) {
      return { ok: false as const, checklist };
    }

    const subRef = adminDb.collection("subdomains").doc(candidate.subdomain);
    const subSnap = await t.get(subRef);
    const alreadyPublished = Boolean(meta.publishedAt);

    t.update(siteRef, {
      templateId: editable.templateId,
      title: editable.title,
      theme: editable.theme,
      sections: editable.sections,
      content: editable.content,
      seo: editable.seo,
      privacy: editable.privacy,
      // Never carry an inactive secret onto a now-open (world-readable) doc.
      sharedCode: editable.privacy === "sharedCode" ? editable.sharedCode : null,
      verifyField:
        editable.privacy === "guestVerify" ? editable.verifyField : null,
      driveGalleryUrl: editable.driveGalleryUrl,
      status: "published",
      updatedAt: FieldValue.serverTimestamp(),
      ...(alreadyPublished ? {} : { publishedAt: FieldValue.serverTimestamp() }),
    });

    // Keep the reverse-lookup consistent: update if it still points here,
    // otherwise (re)create it pointing at this site.
    if (subSnap.exists && subSnap.data()!.siteId === siteId) {
      t.update(subRef, { status: "published" });
    } else {
      t.set(subRef, {
        subdomain: candidate.subdomain,
        siteId,
        ownerId,
        status: "published",
      });
    }

    return { ok: true as const, subdomain: candidate.subdomain };
  });
}

/** Revert a published site to draft (unpublish) — keeps the subdomain reserved. */
export async function unpublishSite(
  siteId: string,
  ownerId: string
): Promise<void> {
  const siteRef = adminDb.collection("sites").doc(siteId);
  await adminDb.runTransaction(async (t) => {
    const siteSnap = await t.get(siteRef);
    if (!siteSnap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
    const site = siteSnap.data()!;
    if (site.ownerId !== ownerId) {
      throw new SiteError("FORBIDDEN", "Not your site.");
    }
    const subRef = adminDb.collection("subdomains").doc(site.subdomain);
    const subSnap = await t.get(subRef);
    t.update(siteRef, {
      status: "draft",
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (subSnap.exists && subSnap.data()!.siteId === siteId) {
      t.update(subRef, { status: "draft" });
    }
  });
}
