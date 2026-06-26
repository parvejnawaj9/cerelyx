import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteForEditor } from "@/lib/server/sites";
import { SiteRenderer } from "@/templates/registry";

// Renders the working DRAFT for the editor's live-preview iframe. Owner-only.
export default async function SitePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const site = await getSiteForEditor(id, user.uid).catch(() => null);
  if (!site) notFound();

  return <SiteRenderer site={site} />;
}
