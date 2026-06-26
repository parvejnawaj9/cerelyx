/**
 * Hand-authored gold ornaments — the Royal Indian template's signature element
 * (brief §12.1). They inherit the theme's gold via `var(--site-gold)` so they
 * re-tint when the host recolours the template.
 */

export function DividerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 22"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden
      width="240"
      height="22"
    >
      <g stroke="var(--site-gold)" strokeWidth="1.1">
        <path d="M6 11h78" />
        <path d="M234 11h-78" />
        <path d="M84 11c6-5 10-5 16 0-6 5-10 5-16 0Z" fill="var(--site-accent)" />
        <path d="M156 11c-6-5-10-5-16 0 6 5 10 5 16 0Z" fill="var(--site-accent)" />
      </g>
      <g fill="var(--site-gold)">
        <circle cx="120" cy="11" r="3.2" />
        <circle cx="100" cy="11" r="1.6" />
        <circle cx="140" cy="11" r="1.6" />
      </g>
      <path
        d="M120 2c2.6 2.8 4 5.4 4 9s-1.4 6.2-4 9c-2.6-2.8-4-5.4-4-9s1.4-6.2 4-9Z"
        fill="none"
        stroke="var(--site-gold)"
        strokeWidth="0.9"
      />
    </svg>
  );
}

export function CornerFiligree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden
      width="120"
      height="120"
    >
      <g stroke="var(--site-gold)" strokeWidth="1.1" strokeLinecap="round">
        <path d="M10 10v36" />
        <path d="M10 10h36" />
        <path d="M10 28c14 0 24 8 24 24" />
        <path d="M28 10c0 14 8 24 24 24" />
        <path d="M10 52c22 0 40 18 40 40" opacity="0.55" />
      </g>
      <circle cx="10" cy="10" r="3" fill="var(--site-gold)" />
      <path
        d="M34 34c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5Z"
        fill="var(--site-accent)"
        stroke="var(--site-gold)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden
      width="48"
      height="36"
    >
      <g stroke="var(--site-gold)" strokeWidth="1.1" fill="none">
        <path d="M24 33c-9 0-17-5-21-13 6 1 11 4 14 9" />
        <path d="M24 33c9 0 17-5 21-13-6 1-11 4-14 9" />
        <path d="M24 33c-4-5-6-11-6-18 0-5 2-9 6-12 4 3 6 7 6 12 0 7-2 13-6 18Z" />
      </g>
      <path
        d="M24 9c2 2 3 4 3 7s-1 6-3 9c-2-3-3-6-3-9s1-5 3-7Z"
        fill="var(--site-accent)"
      />
    </svg>
  );
}
