import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

export const birthdayTheme: Theme = {
  palette: {
    canvas: "#FAF7F0",
    surface: "#FFFFFF",
    ink: "#1C2230",
    muted: "#5C6270",
    primary: "#2B4C9B",
    secondary: "#C2412B", // coral, darkened for AA text contrast
    accent: "#F2B441",
    gold: "#C9912F",
  },
  fonts: themeFontsFor("playful"),
};

export const birthdaySections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "events", type: "events", visible: true, order: 1 },
  { id: "venue", type: "venue", visible: true, order: 2 },
  { id: "gallery", type: "gallery", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

export const birthdayDefaultContent: SiteContent = {
  hero: {
    eyebrow: "It's a party!",
    titleA: "Aanya turns 7",
    tagline:
      "Cake, confetti, and the whole crew — come help us make Aanya's big day the loudest, happiest one yet.",
    date: "2026-08-15",
  },
  events: {
    title: "The plan",
    items: [
      {
        id: "ev-welcome",
        name: "Doors open & balloon drop",
        date: "2026-08-15",
        startTime: "15:00",
        endTime: "15:30",
        venueName: "The Sunshine Loft",
        description:
          "Grab a party hat, pick your confetti color, and say hi. The big balloon drop is right at the top of the hour — don't be late!",
      },
      {
        id: "ev-games",
        name: "Games, crafts & face paint",
        date: "2026-08-15",
        startTime: "15:30",
        endTime: "16:30",
        venueName: "The Sunshine Loft",
        description:
          "Pin-the-tail, a glitter craft table, and a face-paint corner where you can become a tiger, a unicorn, or both.",
      },
      {
        id: "ev-cake",
        name: "Cake & the big wish",
        date: "2026-08-15",
        startTime: "16:30",
        endTime: "17:00",
        venueName: "The Sunshine Loft",
        description:
          "Seven candles, one giant rainbow cake, and the loudest 'Happy Birthday' we can manage. Make a wish, Aanya!",
      },
      {
        id: "ev-dance",
        name: "Dance party & goodie bags",
        date: "2026-08-15",
        startTime: "17:00",
        endTime: "18:00",
        venueName: "The Sunshine Loft",
        description:
          "Turn the music way up. Bubbles, a sing-along, and a goodie bag for every little guest on the way out.",
      },
    ],
  },
  venue: {
    name: "The Sunshine Loft",
    address: "84 Maple Court, Riverside, San Diego, CA 92103",
    mapUrl: "",
  },
  gallery: {
    title: "Snapshots",
    imagePaths: [],
  },
  rsvp: {
    note:
      "Let us know if you're coming by August 8th so we have enough cake, party hats, and goodie bags ready. Tell us about any allergies in your note!",
  },
  footer: {
    hosts: "With love, Priya & Dev",
    note: "Can't wait to celebrate with you!",
  },
};
