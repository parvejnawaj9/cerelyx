import { NextResponse, type NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { updateDraft } from "@/lib/server/sites";
import { updateSiteSchema, zodMessage } from "@/lib/validation/site";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Autosave / edit: apply a validated patch to the working draft. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const body = await req.json().catch(() => null);

    const parsed = updateSiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await updateDraft(id, user.uid, parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
