import { z } from "zod";

export const guestInputSchema = z.object({
  name: z.string().min(1, "A name is required.").max(120),
  mobile: z.string().max(30).optional().default(""),
  email: z.string().max(160).optional().default(""),
  uniqueCode: z.string().max(60).optional().default(""),
  group: z.string().max(60).optional().default(""),
  note: z.string().max(500).optional().default(""),
});
export type GuestInputParsed = z.infer<typeof guestInputSchema>;

export const bulkGuestsSchema = z.object({
  guests: z.array(guestInputSchema).min(1).max(1000),
});

/**
 * Parse a pasted block of guests — one per line, "Name, identifier, group".
 * The identifier is detected (email / mobile / code) so any one works.
 */
export function parseBulkText(text: string): GuestInputParsed[] {
  const out: GuestInputParsed[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[,\t]/).map((p) => p.trim());
    const name = parts[0] ?? "";
    if (!name) continue;
    const guest: GuestInputParsed = {
      name,
      mobile: "",
      email: "",
      uniqueCode: "",
      group: "",
      note: "",
    };
    for (const p of parts.slice(1)) {
      if (!p) continue;
      if (/@/.test(p)) guest.email = p;
      else if (/^\+?[\d\s-]{6,}$/.test(p)) guest.mobile = p;
      else if (!guest.group) guest.group = p;
      else guest.uniqueCode = p;
    }
    out.push(guest);
  }
  return out;
}
