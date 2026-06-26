import { cn } from "@/lib/cn";

/**
 * Cerelyx wordmark. The mark is a small gold " touchstone" lozenge — a quiet
 * brand signature that reads as a wax seal / gemstone without being literal.
 */
export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M13 1.5 23.4 7.5v11L13 24.5 2.6 18.5v-11L13 1.5Z"
          fill="var(--color-brand)"
        />
        <path
          d="M13 6.2c3.2 0 5.6 1.4 6.6 3.6l-2.9 1.2c-.6-1.2-1.9-1.9-3.7-1.9-2.4 0-4 1.6-4 3.9s1.6 3.9 4 3.9c1.8 0 3.1-.7 3.7-1.9l2.9 1.2c-1 2.2-3.4 3.6-6.6 3.6-4.4 0-7.5-2.9-7.5-6.8S8.6 6.2 13 6.2Z"
          fill="var(--color-gold)"
        />
      </svg>
      {withText && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-ink">
          Cerelyx
        </span>
      )}
    </span>
  );
}
