import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Royal Indian" — the Phase 1 flagship wedding template.
 *
 * Identity: a jewel-toned invitation that feels like pressed gold foil on
 * handmade paper. Deep teal + jewel maroon ground, marigold warmth, metallic
 * gold for the signature ornament. Deliberately NOT the cream/serif/terracotta
 * AI-default — the canvas is warm ivory, the display face is a high-contrast
 * classical serif, and the body is a calm humanist serif.
 */
export const royalIndianTheme: Theme = {
  palette: {
    canvas: "#FBF4E6", // warm ivory paper
    surface: "#FFFDF7", // lifted panel
    ink: "#23150F", // deep espresso text
    muted: "#7A6A57", // aged-ink secondary
    primary: "#0E4D45", // deep peacock teal
    secondary: "#6E1423", // jewel maroon
    accent: "#E8A33D", // marigold
    gold: "#C9A227", // metallic gold (signature)
  },
  // Marcellus (display) + Spectral (body), loaded via src/templates/fonts.ts.
  fonts: themeFontsFor("regal"),
};

/** Default, ordered sections for a Royal Indian wedding site. */
export const royalIndianSections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "story", type: "story", visible: true, order: 1 },
  { id: "events", type: "events", visible: true, order: 2 },
  { id: "venue", type: "venue", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

/**
 * Warm, specific, human placeholder copy (brief §12.3) — never lorem. These
 * read as a real Indian wedding so a new host immediately sees the finished feel.
 */
export const royalIndianDefaultContent: SiteContent = {
  hero: {
    eyebrow: "Together with their families",
    titleA: "Aarav",
    titleB: "Priya",
    tagline: "Two families, one celebration — and we'd love you there.",
    date: "2026-12-06",
  },
  story: {
    title: "How we got here",
    intro:
      "It started with a mutual friend's chai stall recommendation and ended with a yes under the December sky. Here are a few of the moments in between.",
    items: [
      {
        id: "s1",
        title: "The first hello",
        date: "2021",
        body: "A crowded Diwali party, a borrowed umbrella in unexpected rain, and a conversation that didn't end until the lights came back on.",
      },
      {
        id: "s2",
        title: "The question",
        date: "2025",
        body: "On the terrace where we had our first long talk, with both sets of parents pretending they hadn't planned the whole thing.",
      },
    ],
  },
  events: {
    title: "The celebrations",
    items: [
      {
        id: "e1",
        name: "Haldi",
        date: "2026-12-04",
        startTime: "10:00",
        venueName: "Family home, garden lawn",
        description: "Turmeric, laughter, and a lot of yellow. Wear something you don't mind getting colourful.",
      },
      {
        id: "e2",
        name: "Mehndi & Sangeet",
        date: "2026-12-05",
        startTime: "17:00",
        venueName: "The Courtyard, Taj Falaknuma",
        description: "Henna, music, and a dance-off the families have been rehearsing in secret.",
      },
      {
        id: "e3",
        name: "Wedding ceremony",
        date: "2026-12-06",
        startTime: "19:30",
        venueName: "Falaknuma Palace, Grand Lawn",
        description: "The pheras, under the stars. Please be seated by 7:15 pm.",
      },
      {
        id: "e4",
        name: "Reception",
        date: "2026-12-07",
        startTime: "20:00",
        venueName: "Falaknuma Palace, Durbar Hall",
        description: "Dinner, toasts, and dancing until the lights come up.",
      },
    ],
  },
  venue: {
    name: "Taj Falaknuma Palace",
    address: "Engine Bowli, Falaknuma, Hyderabad, Telangana 500053, India",
    mapUrl: "https://maps.google.com/?q=Taj+Falaknuma+Palace+Hyderabad",
  },
  rsvp: {
    note: "Kindly let us know by 15 November so we can save you a seat (and a plate).",
  },
  footer: {
    hosts: "With love, the Sharma & Gupta families",
    note: "Made with joy on Cerelyx.",
  },
};
