import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteForEditor } from "@/lib/server/sites";
import { listWishes } from "@/lib/server/responses";
import { WishesModeration } from "@/components/builder/wishes-moderation";

export const metadata: Metadata = { title: "Wishes" };

export default async function WishesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const site = await getSiteForEditor(id, user.uid).catch(() => null);
  if (!site) notFound();

  const wishes = await listWishes(id);

  return <WishesModeration siteId={id} initialWishes={wishes} />;
}
