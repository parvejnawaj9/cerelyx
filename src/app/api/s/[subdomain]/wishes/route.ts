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

const wishSchema = z.object({
  name: z.string().min(1).max(120),
  message: z.string().min(1).max(1000),
});

/** Public guestbook submission for a published site (brief §7). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  if (!validateSubdomain(subdomain).ok) {
    return NextResponse.json({ error: "Unknown site." }, { status: 404 });
  }

  // Per-IP and a site-wide cap (best-effort). The site-wide cap bounds total
  // submissions even if X-Forwarded-For is spoofed to rotate the per-IP bucket.
  const ip = clientIp(req.headers);
  const perIp = rateLimit(`wish:${ip}:${subdomain}`, 5, 10 * 60 * 1000);
  const perSite = rateLimit(`wish-site:${subdomain}`, 300, 10 * 60 * 1000);
  if (!perIp.allowed || !perSite.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please try again shortly." },
      { status: 429 }
    );
  }

  const site = await getPublishedSiteBySubdomain(subdomain);
  if (!site) {
    return NextResponse.json(
      { error: "This site isn't accepting wishes." },
      { status: 404 }
    );
  }

  // Private sites: only guests who already passed the access gate may post.
  if (site.privacy !== "open") {
    const granted = await hasAccess(site.id);
    if (!granted) {
      return NextResponse.json(
        { error: "Please verify to leave a wish." },
        { status: 403 }
      );
    }
  }

  const parsed = wishSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please add your name and a message." },
      { status: 400 }
    );
  }

  // New wishes are hidden until the host approves, unless auto-approve is on.
  const autoApprove = Boolean(
    site.content?.[site.defaultLanguage]?.wishes?.autoApprove
  );

  const { name, message } = parsed.data;
  await adminDb
    .collection("sites")
    .doc(site.id)
    .collection("wishes")
    .add({
      name: sanitizeText(name),
      message: sanitizeText(message),
      approved: autoApprove,
      createdAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ ok: true });
}
