import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteForEditor } from "@/lib/server/sites";
import { listRsvps, summarizeRsvps } from "@/lib/server/responses";
import { ResponsesView } from "@/components/builder/responses-view";

export const metadata: Metadata = { title: "RSVP responses" };

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const site = await getSiteForEditor(id, user.uid).catch(() => null);
  if (!site) notFound();

  const rsvps = await listRsvps(id);
  const summary = summarizeRsvps(rsvps);
  const lang = site.defaultLanguage || "en";
  const questions = site.content?.[lang]?.rsvp?.customQuestions ?? [];

  return (
    <ResponsesView
      siteId={id}
      summary={summary}
      rsvps={rsvps}
      questions={questions}
    />
  );
}
