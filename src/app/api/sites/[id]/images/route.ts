import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireSessionUser } from "@/lib/auth/session";
import { compressForUpload, probeFormat } from "@/lib/images/pipeline";
import { genItemId } from "@/lib/sections";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

const PER_FILE_MAX = 15 * 1024 * 1024; // 15 MB raw upload cap
const QUOTA_BYTES = 50 * 1024 * 1024; // 50 MB per site (free plan)

/** Upload + compress a host photo to Storage; returns its object path. */
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
    const site = snap.data()!;
    if (site.ownerId !== user.uid) {
      return NextResponse.json({ error: "Not your site." }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload an image." }, { status: 415 });
    }
    if (file.size > PER_FILE_MAX) {
      return NextResponse.json(
        { error: "That image is too large (max 15 MB)." },
        { status: 413 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Validate the ACTUAL decoded format (don't trust the client MIME); reject
    // SVG and anything non-raster.
    const ALLOWED = new Set(["jpeg", "jpg", "png", "webp", "avif", "gif"]);
    const fmt = await probeFormat(input);
    if (!fmt || !ALLOWED.has(fmt)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, WebP, AVIF or GIF image." },
        { status: 415 }
      );
    }

    const { buffer, contentType } = await compressForUpload(input);

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
          { error: "You've reached your photo storage limit. Remove a few first." },
          { status: 413 }
        );
      }
      throw e;
    }

    const path = `sites/${id}/images/${genItemId("img")}.webp`;
    try {
      await adminStorage
        .bucket()
        .file(path)
        .save(buffer, {
          contentType,
          metadata: { cacheControl: "public, max-age=31536000, immutable" },
        });
    } catch (e) {
      // Roll the reserved quota back if the upload itself failed.
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
