import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { SiteError } from "@/lib/server/sites";
import type { Rsvp, Wish } from "@/lib/types";

async function assertOwner(siteId: string, ownerId: string): Promise<void> {
  const snap = await adminDb.collection("sites").doc(siteId).get();
  if (!snap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
  if (snap.data()!.ownerId !== ownerId) {
    throw new SiteError("FORBIDDEN", "Not your site.");
  }
}

/**
 * Server-side (Admin SDK) reads for the host's RSVP summary + wishes moderation
 * and for the published page's approved-wishes render. Guests never read these
 * collections directly — rules deny client reads of the lists.
 */

function isoOf(v: unknown): string {
  const ts = v as { toDate?: () => Date } | undefined;
  if (ts?.toDate) return ts.toDate().toISOString();
  return "";
}

export async function listRsvps(siteId: string): Promise<Rsvp[]> {
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("rsvps")
    .orderBy("createdAt", "desc")
    .limit(2000)
    .get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      guestId: (x.guestId as string) ?? null,
      name: (x.name as string) ?? "",
      attending: Boolean(x.attending),
      partySize: Number(x.partySize ?? 0),
      mealChoice: (x.mealChoice as string) ?? undefined,
      answers: (x.answers as Record<string, string>) ?? undefined,
      message: (x.message as string) ?? undefined,
      rsvpStatus: (x.rsvpStatus as Rsvp["rsvpStatus"]) ?? "yes",
      createdAt: isoOf(x.createdAt),
    };
  });
}

export interface RsvpSummary {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  /** Total people coming (sum of party sizes for "yes"). */
  headcount: number;
  meals: { choice: string; count: number }[];
}

export function summarizeRsvps(rsvps: Rsvp[]): RsvpSummary {
  const s: RsvpSummary = {
    total: rsvps.length,
    yes: 0,
    no: 0,
    maybe: 0,
    headcount: 0,
    meals: [],
  };
  const meals = new Map<string, number>();
  for (const r of rsvps) {
    if (r.rsvpStatus === "yes") {
      s.yes++;
      s.headcount += Math.max(1, r.partySize || 1);
    } else if (r.rsvpStatus === "maybe") {
      s.maybe++;
    } else {
      s.no++;
    }
    // Count meals only for confirmed "yes" so meal totals stay consistent with
    // headcount (which also counts "yes" only).
    if (r.mealChoice && r.rsvpStatus === "yes") {
      meals.set(r.mealChoice, (meals.get(r.mealChoice) ?? 0) + Math.max(1, r.partySize || 1));
    }
  }
  s.meals = [...meals.entries()]
    .map(([choice, count]) => ({ choice, count }))
    .sort((a, b) => b.count - a.count);
  return s;
}

/** All wishes (any approval state) for the host moderation view, newest first. */
export async function listWishes(siteId: string): Promise<Wish[]> {
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("wishes")
    .orderBy("createdAt", "desc")
    .limit(1000)
    .get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      name: (x.name as string) ?? "",
      message: (x.message as string) ?? "",
      approved: Boolean(x.approved),
      createdAt: isoOf(x.createdAt),
    };
  });
}

/**
 * Approved wishes for the public page. No orderBy (avoids a composite index) —
 * we sort newest-first in memory.
 */
export async function getApprovedWishes(siteId: string): Promise<Wish[]> {
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("wishes")
    .where("approved", "==", true)
    .limit(200)
    .get();
  return snap.docs
    .map((d) => {
      const x = d.data();
      return {
        id: d.id,
        name: (x.name as string) ?? "",
        message: (x.message as string) ?? "",
        approved: true,
        createdAt: isoOf(x.createdAt),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Resolve a guest's display name from a personalized-link slug (for prefill). */
export async function resolveGuestNameBySlug(
  siteId: string,
  slug: string
): Promise<string | undefined> {
  const snap = await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("guests")
    .where("personalSlug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return undefined;
  return (snap.docs[0]!.data().name as string) || undefined;
}

// ---- host moderation -------------------------------------------------------

/** Approve or hide a wish (owner only). */
export async function setWishApproved(
  siteId: string,
  ownerId: string,
  wishId: string,
  approved: boolean
): Promise<void> {
  await assertOwner(siteId, ownerId);
  await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("wishes")
    .doc(wishId)
    .update({ approved });
}

/** Permanently delete a wish (owner only). */
export async function deleteWish(
  siteId: string,
  ownerId: string,
  wishId: string
): Promise<void> {
  await assertOwner(siteId, ownerId);
  await adminDb
    .collection("sites")
    .doc(siteId)
    .collection("wishes")
    .doc(wishId)
    .delete();
}
