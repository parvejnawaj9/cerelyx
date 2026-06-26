import { cn } from "@/lib/cn";

/**
 * Restrained entrance animation. Implemented in CSS (see globals.css) so it
 * needs no client JS, is SEO/no-JS safe (content is visible by default and only
 * hidden+animated when motion is allowed), and honors prefers-reduced-motion
 * (brief §12.5, §13). This is a server component — zero JS on the guest page.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("cerelyx-reveal", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
