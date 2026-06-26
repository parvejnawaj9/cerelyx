import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { SessionUser } from "@/lib/auth/session";
import type { UserProfile } from "@/lib/types";

/**
 * Ensure a users/{uid} profile exists for a signed-in user. Created on first
 * sign-in with role 'user' and plan 'free' (the plan field exists now for
 * future billing — brief §17).
 */
export async function ensureUserProfile(
  user: SessionUser,
  locale = "en"
): Promise<void> {
  const ref = adminDb.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) {
    // Keep contact fields fresh without ever touching role/plan.
    await ref.set(
      {
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
      },
      { merge: true }
    );
    return;
  }
  await ref.set({
    uid: user.uid,
    email: user.email,
    displayName: user.name,
    photoURL: user.picture,
    role: "user",
    locale,
    plan: "free",
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  const createdAt = d.createdAt;
  return {
    uid,
    email: d.email ?? null,
    displayName: d.displayName ?? null,
    photoURL: d.photoURL ?? null,
    role: d.role ?? "user",
    locale: d.locale ?? "en",
    plan: d.plan ?? "free",
    createdAt:
      createdAt && typeof createdAt.toDate === "function"
        ? createdAt.toDate().toISOString()
        : new Date(0).toISOString(),
  };
}
