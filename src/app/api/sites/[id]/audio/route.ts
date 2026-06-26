import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireSessionUser } from "@/lib/auth/session";
import { genItemId } from "@/lib/sections";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

const PER_FILE_MAX = 12 * 1024 * 1024; // 12 MB raw upload cap
const QUOTA_BYTES = 50 * 1024 * 1024; // 50 MB per site (shared with photos)

const EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
};

/** Upload a background-music track to Storage; returns its object path. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();

    const siteRef = adminDb.collection("sites").doc(id);
    const snap = await siteRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }
    if (snap.data()!.ownerId !== user.uid) {
      return NextResponse.json({ error: "Not your site." }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No audio provided." }, { status: 400 });
    }
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Please upload an audio file." }, { status: 415 });
    }
    if (file.size > PER_FILE_MAX) {
      return NextResponse.json(
        { error: "That track is too large (max 12 MB)." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Reserve quota atomically (avoids a TOCTOU race across concurrent uploads).
    try {
      await adminDb.runTransaction(async (t) => {
        const s = await t.get(siteRef);
        const used = (s.data()?.storageBytesUsed as number) ?? 0;
        if (used + buffer.length > QUOTA_BYTES) throw new Error("QUOTA");
        t.update(siteRef, {
          storageBytesUsed: FieldValue.increment(buffer.length),
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "QUOTA") {
        return NextResponse.json(
          { error: "You've reached your storage limit. Remove a few photos first." },
          { status: 413 }
        );
      }
      throw e;
    }

    const ext = EXT[file.type] ?? "mp3";
    const contentType = file.type;
    const path = `sites/${id}/audio/${genItemId("aud")}.${ext}`;
    try {
      await adminStorage
        .bucket()
        .file(path)
        .save(buffer, {
          contentType,
          metadata: { cacheControl: "public, max-age=31536000, immutable" },
        });
    } catch (e) {
      await siteRef
        .update({ storageBytesUsed: FieldValue.increment(-buffer.length) })
        .catch(() => {});
      throw e;
    }

    return NextResponse.json({ path });
  } catch (err) {
    return errorResponse(err);
  }
}
