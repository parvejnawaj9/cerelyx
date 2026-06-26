import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { publishSite } from "@/lib/server/sites";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Publish a site live. Returns the checklist if required fields are missing. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const result = await publishSite(id, user.uid);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, checklist: result.checklist },
        { status: 422 }
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
