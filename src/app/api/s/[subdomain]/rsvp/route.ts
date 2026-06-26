import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedSiteBySubdomain } from "@/lib/server/sites";
import { hasAccess } from "@/lib/server/access";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";
import { validateSubdomain } from "@/lib/subdomains";

export const runtime = "nodejs";

const rsvpSchema = z.object({
  name: z.string().min(1).max(120),
  attending: z.boolean(),
  partySize: z.number().int().min(0).max(20).default(1),
  message: z.string().max(600).optional().default(""),
});

/** Public RSVP submission for a published site. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  if (!validateSubdomain(subdomain).ok) {
    return NextResponse.json({ error: "Unknown site." }, { status: 404 });
  }

  // Rate limit per IP + site.
  const ip = clientIp(req.headers);
  const { allowed } = rateLimit(`rsvp:${ip}:${subdomain}`, 6, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429 }
    );
  }

  const site = await getPublishedSiteBySubdomain(subdomain);
  if (!site) {
    return NextResponse.json(
      { error: "This site isn't accepting RSVPs." },
      { status: 404 }
    );
  }

  // Private sites: only guests who already passed the access gate may RSVP.
  if (site.privacy !== "open") {
    const granted = await hasAccess(site.id);
    if (!granted) {
      return NextResponse.json(
        { error: "Please verify to RSVP." },
        { status: 403 }
      );
    }
  }

  const parsed = rsvpSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 }
    );
  }

  const { name, attending, partySize, message } = parsed.data;
  await adminDb
    .collection("sites")
    .doc(site.id)
    .collection("rsvps")
    .add({
      name: sanitizeText(name),
      attending,
      partySize: attending ? Math.max(1, partySize) : 0,
      message: sanitizeText(message),
      rsvpStatus: attending ? "yes" : "no",
      createdAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ ok: true });
}
