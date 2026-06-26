import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Custom" — the versatile, occasion-agnostic flagship.
 *
 * Identity: clean modern editorial that works for any gathering — a launch, a
 * milestone birthday, a reunion, a fundraiser. Warm paper canvas, crisp white
 * surface, slate ink. The signature is a minimal geometric mark (an inline SVG
 * monogram) paired with a single hairline accent rule that recurs through the
 * page. Neutral but premium: nothing here screams "wedding template", so a host
 * can drop in any title and it reads intentional. Modern pairing (Sora · Manrope)
 * keeps the type confident and quiet.
 */
export const customTheme: Theme = {
  palette: {
    canvas: "#F6F4EF", // warm paper
    surface: "#FFFFFF", // crisp panel
    ink: "#211F1C", // near-black slate
    muted: "#6A645B", // warm grey secondary
    primary: "#2F3A44", // slate
    secondary: "#6B5E52", // taupe
    accent: "#B98A4B", // amber
    gold: "#C0A263", // soft gold (signature rule)
  },
  // Sora (display) + Manrope (body), loaded via src/templates/fonts.ts.
  fonts: themeFontsFor("modern"),
};

/** Default, ordered sections for a flexible custom-event site. */
export const customSections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "events", type: "events", visible: true, order: 1 },
  { id: "venue", type: "venue", visible: true, order: 2 },
  { id: "rsvp", type: "rsvp", visible: true, order: 3 },
  { id: "footer", type: "footer", visible: true, order: 4 },
];

/**
 * Warm, specific, human placeholder copy (brief §12.3) — never lorem. Written
 * for a generic "you're invited" gathering so a new host sees a finished, real
 * feeling page that they can repoint at any occasion.
 */
export const customDefaultContent: SiteContent = {
  hero: {
    eyebrow: "You're invited",
    titleA: "An Evening Together",
    tagline:
      "We're marking the moment with the people who made it matter — good food, a few words, and the rest of the night to ourselves.",
    date: "2026-09-19",
  },
  events: {
    title: "How the evening runs",
    items: [
      {
        id: "e1",
        name: "Arrivals & welcome drinks",
        date: "2026-09-19",
        startTime: "18:00",
        endTime: "18:45",
        venueName: "The Conservatory",
        description:
          "Come early, grab a drink, and find your name on the board. No rush — we start properly once everyone's in.",
      },
      {
        id: "e2",
        name: "A few words & the toast",
        date: "2026-09-19",
        startTime: "19:00",
        endTime: "19:30",
        venueName: "The Long Room",
        description:
          "Short and heartfelt, we promise. Then a glass raised to everyone who showed up.",
      },
      {
        id: "e3",
        name: "Dinner, served family-style",
        date: "2026-09-19",
        startTime: "19:45",
        endTime: "21:30",
        venueName: "The Long Room",
        description:
          "Shared plates down the centre of the table — tell us in your RSVP if anything's off the menu for you.",
      },
      {
        id: "e4",
        name: "Music & the late table",
        date: "2026-09-19",
        startTime: "21:30",
        venueName: "The Courtyard",
        description:
          "Coffee, something sweet, and a playlist that gets better as the night goes on. Stay as long as you like.",
      },
    ],
  },
  venue: {
    name: "The Brick House",
    address: "42 Wharf Lane, Shoreditch, London EC2A 3LT, United Kingdom",
    mapUrl: "https://maps.google.com/?q=Shoreditch+London",
  },
  rsvp: {
    note:
      "Let us know by 5 September so we can sort the seating and let the kitchen know numbers. A note about dietary needs is always welcome.",
  },
  footer: {
    hosts: "Hosted with thanks — we hope you can make it.",
    note: "Made with Cerelyx.",
  },
};
