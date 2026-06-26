import { fontVariables } from "@/templates/fonts";

// Chrome-free wrapper for the in-editor preview iframe — loads the template
// font pairings (matching the published site) and nothing else.
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={fontVariables}>{children}</div>;
}
