import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteForEditor } from "@/lib/server/sites";
import { listGuests } from "@/lib/server/guests";
import { GuestList } from "@/components/builder/guest-list";

export const metadata: Metadata = { title: "Guest list" };

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const site = await getSiteForEditor(id, user.uid).catch(() => null);
  if (!site) notFound();
  const guests = await listGuests(id, user.uid);

  return (
    <GuestList
      siteId={id}
      subdomain={site.subdomain}
      verifyField={site.verifyField ?? null}
      privacy={site.privacy}
      initialGuests={guests}
    />
  );
}
