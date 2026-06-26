import { NextResponse, type NextRequest } from "next/server";
import { getPublishedSiteBySubdomain } from "@/lib/server/sites";
import { verifyAccess, grantAccess } from "@/lib/server/access";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";
import { validateSubdomain } from "@/lib/subdomains";

export const runtime = "nodejs";

/** Verify a guest's code/identifier for a private site and set the access cookie. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  if (!validateSubdomain(subdomain).ok) {
    return NextResponse.json({ error: "Unknown site." }, { status: 404 });
  }

  const ip = clientIp(req.headers);
  // Per-IP and a site-wide cap (best-effort; durable store is a hardening item)
  // to blunt guest-list enumeration via spoofed X-Forwarded-For.
  const perIp = rateLimit(`access:${ip}:${subdomain}`, 12, 10 * 60 * 1000);
  const perSite = rateLimit(`access-site:${subdomain}`, 120, 10 * 60 * 1000);
  if (!perIp.allowed || !perSite.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  const site = await getPublishedSiteBySubdomain(subdomain);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }
  if (site.privacy === "open") {
    return NextResponse.json({ ok: true });
  }

  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    identifier?: string;
  };
  const result = await verifyAccess(site, {
    code: body.code,
    identifier: body.identifier,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Access denied." },
      { status: 401 }
    );
  }

  await grantAccess(site.id);
  return NextResponse.json({ ok: true });
}
