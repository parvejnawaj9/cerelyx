import { NextResponse, type NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isSubdomainAvailable } from "@/lib/server/sites";
import { validateSubdomain } from "@/lib/subdomains";
import { errorResponse } from "@/lib/server/api";

export const runtime = "nodejs";

/** Live availability + format check for a candidate subdomain. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireSessionUser();
    const value = req.nextUrl.searchParams.get("value") ?? "";

    const check = validateSubdomain(value);
    if (!check.ok) {
      return NextResponse.json({ available: false, reason: check.reason });
    }
    const available = await isSubdomainAvailable(check.value, id);
    return NextResponse.json({
      available,
      reason: available ? undefined : "That web address is taken.",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
