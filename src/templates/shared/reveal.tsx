import { cn } from "@/lib/cn";

/**
 * Restrained CSS-only entrance (see globals.css .cerelyx-reveal). Server
 * component — zero client JS, SEO/no-JS safe (content visible by default; only
 * hidden+animated when motion is allowed). Shared by all templates.
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
