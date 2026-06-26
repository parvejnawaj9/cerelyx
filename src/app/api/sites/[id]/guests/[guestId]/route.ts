import { NextResponse, type NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { updateGuest, deleteGuest } from "@/lib/server/guests";
import { guestInputSchema } from "@/lib/validation/guest";
import { zodMessage } from "@/lib/validation/site";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const { id, guestId } = await params;
    const user = await requireSessionUser();
    const parsed = guestInputSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
    }
    await updateGuest(id, user.uid, guestId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const { id, guestId } = await params;
    const user = await requireSessionUser();
    await deleteGuest(id, user.uid, guestId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
