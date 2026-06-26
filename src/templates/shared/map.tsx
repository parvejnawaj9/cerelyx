/**
 * A keyless Google Maps embed. Uses the address/place text as the query so no
 * API key is needed. Renders nothing when there's no location to show.
 */
export function MapEmbed({ query, title }: { query?: string; title?: string }) {
  const q = (query ?? "").trim();
  if (!q) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  return (
    <div
      className="overflow-hidden rounded-[1rem]"
      style={{ border: "1px solid color-mix(in srgb, var(--site-gold) 40%, transparent)" }}
    >
      <iframe
        title={title || `Map showing ${q}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full sm:h-80"
        style={{ border: 0 }}
      />
    </div>
  );
}
