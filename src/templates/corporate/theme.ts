import type { Theme, SectionBlock, SiteContent } from "@/lib/types";
import { themeFontsFor } from "@/templates/font-data";

/**
 * "Corporate" — a confident, structured template for conferences and summits.
 *
 * Identity: a clean editorial grid where monospace index numbers run the show.
 * Slate primary + steel secondary on near-white paper, a single amber rule as
 * the call-to-action signal. Deliberately not soft or decorative — generous
 * whitespace, tight numbering, and a "Register" energy throughout. Space Grotesk
 * (display) pairs with IBM Plex (body) for the modern-professional voice.
 */
export const corporateTheme: Theme = {
  palette: {
    canvas: "#F5F5F2", // warm paper-white
    surface: "#FFFFFF", // lifted card
    ink: "#1B1D21", // near-black text
    muted: "#54585F", // secondary text
    primary: "#2A3340", // slate
    secondary: "#456073", // steel
    accent: "#DC9A33", // amber CTA
    gold: "#B98A33", // deep amber / rule
  },
  fonts: themeFontsFor("corporate"),
};

/** Default, ordered sections for a corporate conference site. No story/gallery. */
export const corporateSections: SectionBlock[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "events", type: "events", visible: true, order: 1 },
  { id: "venue", type: "venue", visible: true, order: 2 },
  { id: "rsvp", type: "rsvp", visible: true, order: 3 },
  { id: "footer", type: "footer", visible: true, order: 4 },
];

/**
 * Warm, specific, professional placeholder copy — never lorem. Reads as a real
 * one-day product summit so a new organiser sees the finished feel immediately.
 */
export const corporateDefaultContent: SiteContent = {
  hero: {
    eyebrow: "One day · Single track · In person",
    titleA: "Annual Product Summit 2026",
    tagline:
      "A working day for builders, operators and leaders shaping what ships next. Keynotes, hands-on sessions, and the hallway conversations that actually move things forward.",
    date: "2026-09-17",
  },
  events: {
    title: "Agenda",
    items: [
      {
        id: "a1",
        name: "Registration & Networking Breakfast",
        date: "2026-09-17",
        startTime: "08:30",
        endTime: "09:15",
        venueName: "North Atrium",
        description:
          "Pick up your badge, grab coffee, and find your people before the doors open.",
      },
      {
        id: "a2",
        name: "Opening Keynote — The Year Ahead in Product",
        date: "2026-09-17",
        startTime: "09:30",
        endTime: "10:30",
        venueName: "Main Auditorium",
        description:
          "Our CEO and Head of Product set the agenda: where the market is heading and the bets we're making this year.",
      },
      {
        id: "a3",
        name: "Breakout Sessions — Build, Scale, Ship",
        date: "2026-09-17",
        startTime: "11:00",
        endTime: "12:30",
        venueName: "Rooms 2A–2C",
        description:
          "Three parallel tracks on platform architecture, go-to-market motion, and design systems. Pick one, switch freely.",
      },
      {
        id: "a4",
        name: "Lunch & Demo Floor",
        date: "2026-09-17",
        startTime: "12:30",
        endTime: "14:00",
        venueName: "West Pavilion",
        description:
          "Hot lunch, live product demos, and a chance to talk to the teams behind them.",
      },
      {
        id: "a5",
        name: "Fireside Chat & Customer Stories",
        date: "2026-09-17",
        startTime: "14:15",
        endTime: "15:15",
        venueName: "Main Auditorium",
        description:
          "Two customers share how they took a rollout from pilot to company-wide in under a quarter.",
      },
      {
        id: "a6",
        name: "Closing Keynote & Networking Reception",
        date: "2026-09-17",
        startTime: "16:00",
        endTime: "18:00",
        venueName: "Rooftop Terrace",
        description:
          "A look at the roadmap, followed by drinks, canapés, and golden-hour views over the city.",
      },
    ],
  },
  venue: {
    name: "Moscone Center, West Hall",
    address: "800 Howard St, San Francisco, CA 94103, United States",
    mapUrl: "https://maps.google.com/?q=Moscone+Center+West+San+Francisco",
  },
  rsvp: {
    note:
      "Seats are limited and assigned in registration order. Confirm by 1 September — we'll email your badge QR and the final room schedule the week before.",
  },
  footer: {
    hosts: "Hosted by the Cerelyx Product Team",
    note: "Questions? events@cerelyx.com",
  },
};
