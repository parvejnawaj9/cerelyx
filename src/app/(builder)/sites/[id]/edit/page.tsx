import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteForEditor } from "@/lib/server/sites";
import { EditorClient } from "@/components/builder/editor-client";
import { fontVariables } from "@/templates/fonts";

export const metadata: Metadata = { title: "Edit your site" };

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const site = await getSiteForEditor(id, user.uid).catch(() => null);
  if (!site) notFound();

  // fontVariables makes the template font CSS vars available to the design
  // panel's live font previews.
  return (
    <div className={fontVariables}>
      <EditorClient site={site} />
    </div>
  );
}
