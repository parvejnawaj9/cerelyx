import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { setWishApproved, deleteWish } from "@/lib/server/responses";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

const patchSchema = z.object({ approved: z.boolean() });

/** Approve / hide a wish (owner only). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { id, wishId } = await params;
    const user = await requireSessionUser();
    const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await setWishApproved(id, user.uid, wishId, parsed.data.approved);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Delete a wish (owner only). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { id, wishId } = await params;
    const user = await requireSessionUser();
    await deleteWish(id, user.uid, wishId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
