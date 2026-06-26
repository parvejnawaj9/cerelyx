import { NextResponse, type NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { addGuest, bulkAddGuests } from "@/lib/server/guests";
import { guestInputSchema, bulkGuestsSchema } from "@/lib/validation/guest";
import { zodMessage } from "@/lib/validation/site";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Add one guest, or many via { guests: [...] }. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (Array.isArray(body.guests)) {
      const parsed = bulkGuestsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
      }
      const guests = await bulkAddGuests(id, user.uid, parsed.data.guests);
      return NextResponse.json({ guests }, { status: 201 });
    }

    const parsed = guestInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
    }
    const guest = await addGuest(id, user.uid, parsed.data);
    return NextResponse.json({ guest }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
