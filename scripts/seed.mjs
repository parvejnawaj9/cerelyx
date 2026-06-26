// Seed the Firestore emulator with the template catalog + a live demo site.
// Run with: npm run seed  (emulators must be running)
//
// The app's source of truth for rendering is the in-code catalog
// (src/templates/catalog.ts); this mirrors template metadata into Firestore for
// the future DB-driven gallery, and publishes a demo site at
// aarav-priya.<root> so the marketing "live example" link works immediately.

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "demo-cerelyx";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";

const app = initializeApp({ projectId });
const db = getFirestore(app);

const theme = {
  palette: {
    canvas: "#FBF4E6",
    surface: "#FFFDF7",
    ink: "#23150F",
    muted: "#7A6A57",
    primary: "#0E4D45",
    secondary: "#6E1423",
    accent: "#E8A33D",
    gold: "#C9A227",
  },
  fonts: { display: "var(--font-regal-display)", body: "var(--font-regal-body)" },
};

const sections = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "story", type: "story", visible: true, order: 1 },
  { id: "events", type: "events", visible: true, order: 2 },
  { id: "venue", type: "venue", visible: true, order: 3 },
  { id: "rsvp", type: "rsvp", visible: true, order: 4 },
  { id: "footer", type: "footer", visible: true, order: 5 },
];

// Section-keyed content (matches src/lib/types.ts SiteContent).
const content = {
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
      "It started with a mutual friend's chai stall recommendation and ended with a yes under the December sky.",
    items: [
      { id: "s1", title: "The first hello", date: "2021", body: "A crowded Diwali party and a borrowed umbrella in unexpected rain." },
      { id: "s2", title: "The question", date: "2025", body: "On the terrace where we had our first long talk." },
    ],
  },
  events: {
    title: "The celebrations",
    items: [
      { id: "e1", name: "Haldi", date: "2026-12-04", startTime: "10:00", venueName: "Family home, garden lawn", description: "Turmeric, laughter, and a lot of yellow." },
      { id: "e2", name: "Mehndi & Sangeet", date: "2026-12-05", startTime: "17:00", venueName: "The Courtyard", description: "Henna, music, and a dance-off." },
      { id: "e3", name: "Wedding ceremony", date: "2026-12-06", startTime: "19:30", venueName: "Falaknuma Palace, Grand Lawn", description: "The pheras, under the stars." },
      { id: "e4", name: "Reception", date: "2026-12-07", startTime: "20:00", venueName: "Durbar Hall", description: "Dinner, toasts, and dancing." },
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

const templates = [
  {
    id: "royal-indian",
    name: "Royal Indian",
    category: "wedding",
    style: "royal-indian",
    description:
      "Jewel tones, marigold warmth and gold-foil ornament — a regal invitation for traditional celebrations.",
    previewImage: "/templates/royal-indian/preview.svg",
  },
];

const DEMO_UID = "demo-user";
const DEMO_SITE_ID = "demo-aarav-priya";
const DEMO_SUB = "aarav-priya";

async function main() {
  console.log(`Seeding project "${projectId}" …`);

  for (const t of templates) {
    await db.collection("templates").doc(t.id).set(t, { merge: true });
    console.log(`  ✓ template/${t.id}`);
  }

  await db.collection("users").doc(DEMO_UID).set(
    {
      uid: DEMO_UID,
      email: "demo@cerelyx.online",
      displayName: "Cerelyx Demo",
      role: "user",
      locale: "en",
      plan: "free",
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const editable = {
    title: "Aarav & Priya's Wedding",
    theme,
    sections,
    content: { en: content },
    seo: {},
    privacy: "open",
    sharedCode: null,
    verifyField: null,
    driveGalleryUrl: null,
  };

  const siteRef = db.collection("sites").doc(DEMO_SITE_ID);
  await siteRef.set({
    ownerId: DEMO_UID,
    subdomain: DEMO_SUB,
    eventType: "wedding",
    templateId: "royal-indian",
    status: "published",
    languages: ["en"],
    defaultLanguage: "en",
    invitationCanvas: null,
    storageBytesUsed: 0,
    ...editable,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: FieldValue.serverTimestamp(),
  });
  await siteRef.collection("editor").doc("draft").set({
    ...editable,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection("subdomains").doc(DEMO_SUB).set({
    subdomain: DEMO_SUB,
    siteId: DEMO_SITE_ID,
    ownerId: DEMO_UID,
    status: "published",
  });
  console.log(`  ✓ demo site published at ${DEMO_SUB}.<root>`);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
