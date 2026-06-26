import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { SiteError } from "@/lib/server/sites";
import { sanitizeText } from "@/lib/sanitize";
import {
  normalizeMobile,
  normalizeEmail,
  normalizeCode,
  makePersonalSlug,
} from "@/lib/guests";
import type { Guest } from "@/lib/types";

/** Server-only guest-list access (Admin SDK). Owner/admin only — see rules. */

async function assertOwner(siteId: string, ownerId: string): Promise<void> {
  const snap = await adminDb.collection("sites").doc(siteId).get();
  if (!snap.exists) throw new SiteError("NOT_FOUND", "Site not found.");
  if (snap.data()!.ownerId !== ownerId) {
    throw new SiteError("FORBIDDEN", "Not your site.");
  }
}

function guestsRef(siteId: string) {
  return adminDb.collection("sites").doc(siteId).collection("guests");
}

function serialize(id: string, d: Record<string, unknown>): Guest {
  const createdAt = d.createdAt;
  return {
    id,
    name: (d.name as string) ?? "",
    mobile: (d.mobile as string) ?? "",
    email: (d.email as string) ?? "",
    uniqueCode: (d.uniqueCode as string) ?? "",
    group: (d.group as string) ?? "",
    personalSlug: (d.personalSlug as string) ?? "",
    rsvpStatus: (d.rsvpStatus as Guest["rsvpStatus"]) ?? "pending",
    partySize: (d.partySize as number) ?? undefined,
    note: (d.note as string) ?? "",
    createdAt:
      createdAt instanceof Timestamp
        ? createdAt.toDate().toISOString()
        : new Date(0).toISOString(),
  };
}

export interface GuestInput {
  name: string;
  mobile?: string;
  email?: string;
  uniqueCode?: string;
  group?: string;
  note?: string;
}

function cleanInput(input: GuestInput) {
  return {
    name: sanitizeText(input.name),
    mobile: normalizeMobile(input.mobile),
    email: normalizeEmail(input.email),
    uniqueCode: normalizeCode(input.uniqueCode),
    group: sanitizeText(input.group ?? ""),
    note: sanitizeText(input.note ?? ""),
  };
}

export async function listGuests(
  siteId: string,
  ownerId: string
): Promise<Guest[]> {
  await assertOwner(siteId, ownerId);
  const snap = await guestsRef(siteId).get();
  const guests = snap.docs.map((d) => serialize(d.id, d.data()));
  guests.sort((a, b) => a.name.localeCompare(b.name));
  return guests;
}

export async function addGuest(
  siteId: string,
  ownerId: string,
  input: GuestInput
): Promise<Guest> {
  await assertOwner(siteId, ownerId);
  const c = cleanInput(input);
  if (!c.name) throw new SiteError("NOT_READY", "A name is required.");
  const ref = await guestsRef(siteId).add({
    ...c,
    personalSlug: makePersonalSlug(c.name),
    rsvpStatus: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  return serialize(ref.id, snap.data()!);
}

export async function bulkAddGuests(
  siteId: string,
  ownerId: string,
  inputs: GuestInput[]
): Promise<Guest[]> {
  await assertOwner(siteId, ownerId);
  const valid = inputs.map(cleanInput).filter((g) => g.name);
  const created: Guest[] = [];
  const nowIso = new Date().toISOString();
  // Firestore batches cap at 500 writes.
  for (let i = 0; i < valid.length; i += 400) {
    const batch = adminDb.batch();
    for (const c of valid.slice(i, i + 400)) {
      const ref = guestsRef(siteId).doc();
      const personalSlug = makePersonalSlug(c.name);
      batch.set(ref, {
        ...c,
        personalSlug,
        rsvpStatus: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
      created.push({
        id: ref.id,
        ...c,
        personalSlug,
        rsvpStatus: "pending",
        createdAt: nowIso,
      });
    }
    await batch.commit();
  }
  return created;
}

export async function updateGuest(
  siteId: string,
  ownerId: string,
  guestId: string,
  input: GuestInput
): Promise<void> {
  await assertOwner(siteId, ownerId);
  const c = cleanInput(input);
  if (!c.name) throw new SiteError("NOT_READY", "A name is required.");
  await guestsRef(siteId).doc(guestId).set(c, { merge: true });
}

export async function deleteGuest(
  siteId: string,
  ownerId: string,
  guestId: string
): Promise<void> {
  await assertOwner(siteId, ownerId);
  await guestsRef(siteId).doc(guestId).delete();
}
