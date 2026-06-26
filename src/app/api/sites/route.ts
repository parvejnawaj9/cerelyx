import { NextResponse, type NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { createSite } from "@/lib/server/sites";
import { createSiteSchema, zodMessage } from "@/lib/validation/site";
import { DEFAULT_TEMPLATE_ID } from "@/templates/catalog";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Create a new site (draft) and return its id + allocated subdomain. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireSessionUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const parsed = createSiteSchema.safeParse({
      title: body.title,
      eventType: body.eventType ?? "wedding",
      templateId: body.templateId ?? DEFAULT_TEMPLATE_ID,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await createSite(user.uid, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
