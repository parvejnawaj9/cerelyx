import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Anniversary" — a timeless, classical template for a milestone wedding
 * anniversary (e.g. a couple's 25th).
 *
 * Identity: an engraved keepsake. Warm linen canvas, midnight navy ink for the
 * display face, slate blue for supporting copy, and a brass/gold metallic for
 * the signature. The whole layout is centred and symmetrical, drawn together by
 * hairline rules and a large engraved numeral — the years celebrated — framed
 * like a struck medal. Restrained, grateful, and built to be re-read for years.
 */
export const anniversaryTheme: Theme = {
  palette: {
    canvas: "#F4F1EA", // warm linen paper
    surface: "#FFFFFF", // pressed card
    ink: "#161A24", // near-black slate
    muted: "#565C6A", // soft graphite
    primary: "#1B2440", // midnight navy
    secondary: "#3E5C76", // slate blue
    accent: "#C9A24B", // brass
    gold: "#B8862F", // antique gold (signature)
  },
  // Playfair Display (display) + Lato (body), loaded via src/templates/fonts.ts.
  fonts: themeFontsFor("classic"),
};

/** Default, ordered sections for an anniversary keepsake site. */
export const anniversarySections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "story", type: "story", visible: true, order: 1 },
  { id: "gallery", type: "gallery", visible: true, order: 2 },
  { id: "venue", type: "venue", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

/**
 * Warm, specific, human placeholder copy — never lorem. Reads as a real 25th
 * anniversary so a new host immediately feels the finished keepsake.
 */
export const anniversaryDefaultContent: SiteContent = {
  hero: {
    eyebrow: "25 Years Together · 2001 – 2026",
    titleA: "Edward",
    titleB: "Margaret",
    tagline:
      "A quarter of a century of quiet mornings, loud kitchens, and choosing each other on purpose. Come raise a glass with us.",
    date: "2026-06-13",
  },
  story: {
    title: "Twenty-five years, in moments",
    intro:
      "Not the grand headlines — the small, true things that added up to a life. A handful of the ones we keep coming back to.",
    items: [
      {
        id: "s1",
        title: "The first dance",
        date: "2001",
        body: "A borrowed banquet hall, a band that only knew six songs, and the decision — made somewhere around the third chorus — that this was it.",
      },
      {
        id: "s2",
        title: "The little blue house",
        date: "2005",
        body: "We painted every room the wrong colour twice and called it character. It is still the address our children draw when asked for home.",
      },
      {
        id: "s3",
        title: "Three becomes five",
        date: "2009",
        body: "Two babies, a great deal of coffee, and the discovery that you can love someone more by being exhausted together.",
      },
      {
        id: "s4",
        title: "The long way round",
        date: "2019",
        body: "We finally took the trip we'd promised each other on the honeymoon — eighteen years late, and worth every postponed mile.",
      },
    ],
  },
  gallery: {
    title: "A gallery of years",
    imagePaths: [],
  },
  venue: {
    name: "The Ashbury Conservatory",
    address: "14 Linden Terrace, Harrogate, North Yorkshire, HG1 2RB, United Kingdom",
    mapUrl: "https://maps.google.com/?q=Harrogate+North+Yorkshire",
  },
  rsvp: {
    note: "An intimate evening of dinner and dancing. Kindly reply by 1 May so we can set a place for you at the table.",
  },
  footer: {
    hosts: "With love and gratitude, Edward & Margaret",
    note: "No gifts, please — your company is the celebration.",
  },
};
