import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { unpublishSite } from "@/lib/server/sites";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Take a published site back to draft (live URL shows the lock/claim state). */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    await unpublishSite(id, user.uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
