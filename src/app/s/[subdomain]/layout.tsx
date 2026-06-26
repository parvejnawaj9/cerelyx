import { fontVariables } from "@/templates/fonts";

// Loads all curated template font pairings once (next/font self-hosts them; the
// browser only fetches glyphs for the families a site actually renders).
export default function PublishedSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={fontVariables}>{children}</div>;
}
