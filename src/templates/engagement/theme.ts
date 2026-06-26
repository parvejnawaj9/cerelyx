import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Engagement" — a modern editorial, romantic-minimal template: a high-end
 * magazine spread for the night she said yes.
 *
 * Identity: an asymmetric, left-aligned layout drawn in deep rose, warm taupe
 * and blush over a soft warm-white canvas. Generous whitespace, a refined thin
 * vertical rule that threads the page, and ONE signature — an oversized date
 * numeral set like a feature headline. Story reads as an elegant column-aligned
 * timeline; events are a clean editorial list, not cards. Restrained, intimate,
 * and unmistakably bespoke.
 */
export const engagementTheme: Theme = {
  palette: {
    canvas: "#FBF7F3", // warm paper white
    surface: "#FFFFFF", // pressed card
    ink: "#2A2320", // soft espresso
    muted: "#6F6359", // warm stone (AA: 5.5:1 on canvas)
    primary: "#9C4654", // deep rose
    secondary: "#7C5C50", // warm taupe
    accent: "#E2AB93", // blush
    gold: "#C49A5F", // muted gold (hairlines + numerals)
  },
  // Cormorant (display) + Jost (body) — editorial, romantic.
  fonts: themeFontsFor("romantic"),
};

/** Default, ordered sections for an engagement announcement site. */
export const engagementSections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "story", type: "story", visible: true, order: 1 },
  { id: "events", type: "events", visible: true, order: 2 },
  { id: "venue", type: "venue", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

/**
 * Warm, specific, human placeholder copy — never lorem. Reads as a real
 * engagement celebration so a new host instantly feels the finished spread.
 */
export const engagementDefaultContent: SiteContent = {
  hero: {
    eyebrow: "She said yes",
    titleA: "Olivia",
    titleB: "Daniel",
    tagline:
      "After six years, a hundred shared playlists, and one very nervous walk along the harbour — we're engaged. Come celebrate over drinks and a long, lovely dinner.",
    date: "2026-09-19",
  },
  story: {
    title: "How we got here",
    intro:
      "A few of the moments that quietly added up to forever — told the way we'd tell it over a glass of wine.",
    items: [
      {
        id: "s1",
        title: "A wrong train, a right person",
        date: "Spring 2020",
        body: "We met on the 8:14 to nowhere in particular — both convinced we were on the correct platform, both gloriously wrong. Daniel offered half his umbrella; Olivia offered directions neither of us needed.",
      },
      {
        id: "s2",
        title: "The flat with the crooked window",
        date: "Autumn 2022",
        body: "Two suitcases, one bookshelf we built upside down, and a kitchen barely big enough to dance in. We danced in it anyway, most evenings, badly.",
      },
      {
        id: "s3",
        title: "The harbour, at dusk",
        date: "May 2026",
        body: "He'd planned a speech and forgot every word of it. She said yes before he reached the question. The ring was warm from his pocket and slightly too big — perfect, in other words.",
      },
    ],
  },
  events: {
    title: "The celebration",
    items: [
      {
        id: "e1",
        name: "Welcome drinks",
        date: "2026-09-19",
        startTime: "18:00",
        endTime: "19:30",
        venueName: "The Glasshouse Bar",
        address: "12 Quay Street, Bristol, BS1 5JE",
        description: "Sparkling on arrival on the terrace — find us under the string lights.",
      },
      {
        id: "e2",
        name: "Dinner & toasts",
        date: "2026-09-19",
        startTime: "19:30",
        endTime: "22:00",
        venueName: "The Conservatory Room",
        address: "12 Quay Street, Bristol, BS1 5JE",
        description: "A long shared table, a short speech (we promise), and far too many desserts.",
      },
      {
        id: "e3",
        name: "Late dancing",
        date: "2026-09-19",
        startTime: "22:00",
        venueName: "The Glasshouse Bar",
        description: "The playlist that started it all, turned up. Comfortable shoes encouraged.",
      },
    ],
  },
  venue: {
    name: "The Glasshouse",
    address: "12 Quay Street, Bristol, BS1 5JE, United Kingdom",
    mapUrl: "https://maps.google.com/?q=12+Quay+Street+Bristol",
  },
  rsvp: {
    note: "An intimate evening, so seats are few — kindly let us know by 22 August. Dietary notes welcome; surprises on the dance floor encouraged.",
  },
  footer: {
    hosts: "With love, Olivia & Daniel",
    note: "No gifts, please — your company is the whole point.",
  },
};
