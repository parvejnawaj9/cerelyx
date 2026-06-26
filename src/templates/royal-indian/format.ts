/**
 * Date/time formatting for the template. Date-only strings (YYYY-MM-DD) are
 * parsed as LOCAL dates to avoid the off-by-one-day timezone shift that
 * `new Date("2026-12-06")` (UTC midnight) causes between server and client.
 */

function parseLocal(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(value?: string): string {
  if (!value) return "";
  const d = parseLocal(value);
  if (!d) return value;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(value?: string): string {
  if (!value) return "";
  const d = parseLocal(value);
  if (!d) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value?: string): string {
  if (!value) return "";
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return value;
  let h = Number(m[1]);
  const min = m[2];
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return min === "00" ? `${h} ${period}` : `${h}:${min} ${period}`;
}

/** Build a Google Maps directions link from a map URL or a plain address. */
export function directionsUrl(mapUrl?: string, address?: string): string {
  if (mapUrl && /^https?:\/\//i.test(mapUrl)) return mapUrl;
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  }
  return "";
}
