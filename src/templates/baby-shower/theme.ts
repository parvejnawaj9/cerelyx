import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Baby Shower" — a soft, airy welcome for a little one on the way.
 *
 * Identity: a calm sky of rounded clouds and gentle arches. Deliberately NOT the
 * cream + serif baby-shower cliché — the ground is a cool lilac mist, the type is
 * the rounded, friendly Quicksand/Nunito Sans pairing, and the palette leans on a
 * soft violet with mint and blush as the tender supporting tones. Everything is
 * rounded, unhurried, and full of breathing room.
 */
export const babyShowerTheme: Theme = {
  palette: {
    canvas: "#F6F5FB", // cool lilac mist
    surface: "#FFFFFF", // clean cloud-white panel
    ink: "#2A2733", // soft charcoal text
    muted: "#66616E", // gentle grey-violet secondary
    primary: "#5E4F88", // soft violet
    secondary: "#2F7660", // calm mint, darkened for AA text contrast
    accent: "#DCA6C8", // blush pink
    gold: "#C0A263", // warm muted gold
  },
  // Quicksand (display) + Nunito Sans (body) — rounded and reassuring.
  fonts: themeFontsFor("soft"),
};

/** Default, ordered sections for a baby-shower site. */
export const babyShowerSections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "story", type: "story", visible: true, order: 1 },
  { id: "events", type: "events", visible: true, order: 2 },
  { id: "venue", type: "venue", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

/**
 * Warm, specific, human placeholder copy — never lorem. Reads like a real baby
 * shower so a new host immediately sees the finished, tender feel.
 */
export const babyShowerDefaultContent: SiteContent = {
  hero: {
    eyebrow: "A little one is on the way",
    titleA: "Baby Rivera",
    tagline:
      "We're growing by two tiny feet — come shower our little sweet pea with love.",
    date: "2026-09-12",
  },
  story: {
    title: "A note from us",
    intro:
      "Our hearts have been doing somersaults ever since we saw that first flutter on the screen. We can hardly wait to meet the newest member of our little family — and we'd love for you to be part of the welcome.",
    items: [
      {
        id: "s1",
        title: "The happy news",
        date: "February",
        body: "A quiet morning, two pink lines, and a lot of happy tears in the kitchen before the coffee even brewed.",
      },
      {
        id: "s2",
        title: "It's a... surprise!",
        date: "May",
        body: "We decided to let this one stay a mystery a little longer. Pastel everything, and a name list far too long.",
      },
      {
        id: "s3",
        title: "Almost here",
        date: "September",
        body: "The nursery is painted the softest sage, the tiny socks are folded, and our hearts are very, very full.",
      },
    ],
  },
  events: {
    title: "How we'll celebrate",
    items: [
      {
        id: "e1",
        name: "Welcome brunch",
        date: "2026-09-12",
        startTime: "11:00",
        endTime: "12:00",
        venueName: "The Garden Room",
        description:
          "Pastries, fresh juice, and a slow, sunny start. Come as you are — comfy and cosy.",
      },
      {
        id: "e2",
        name: "Games & gifts",
        date: "2026-09-12",
        startTime: "12:00",
        endTime: "14:00",
        venueName: "The Garden Room",
        description:
          "Gentle games, a wish jar for the baby, and a few happy tears guaranteed.",
      },
      {
        id: "e3",
        name: "Cake & cuddles",
        date: "2026-09-12",
        startTime: "14:00",
        endTime: "15:30",
        venueName: "The Garden Lawn",
        description:
          "Lemon-and-elderflower cake under the trees, with plenty of time to chat and unwind.",
      },
    ],
  },
  venue: {
    name: "The Garden Room at Willowbrook",
    address: "48 Meadow Lane, Willowbrook, Portland, OR 97210",
    mapUrl: "https://maps.google.com/?q=Willowbrook+Portland+Oregon",
  },
  rsvp: {
    note:
      "Please let us know you're coming by 1 September. No gifts are expected — your presence is the present, but a sweet note for baby is always welcome.",
  },
  footer: {
    hosts: "With love, Maya & Daniel Rivera",
    note: "Made with love on Cerelyx.",
  },
};
