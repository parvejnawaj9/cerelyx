# Cerelyx

A multi-tenant event & wedding website builder. Anyone can sign up, fill a
guided form, customize a design, and publish a beautiful website on their own
subdomain (e.g. `aarav-priya.cerelyx.online`).

This repository currently implements **Phase 1 — Foundation**: project scaffold,
host-based multi-tenant routing, authentication, the Firestore data model +
security rules, a dashboard, one polished **Royal Indian** wedding template, and
the full **save-draft → preview → publish → live subdomain** pipeline.

---

## Tech stack

- **Next.js (App Router)** + **TypeScript (strict)**, server-rendered
- **Tailwind CSS v4** (CSS-variable theming) + **Framer Motion** (restrained motion)
- **Firebase**: Auth (Email/Password + Google), Cloud Firestore, Storage
- **next-intl** for UI i18n (English now; structured for Bengali/Hindi + more)
- **sharp** image pipeline (AVIF/WebP, responsive widths, blur placeholder, EXIF strip)
- Target host: **Firebase App Hosting** (single backend, wildcard `*.cerelyx.online`)

---

## Architecture: two surfaces, one app

A single Next.js app serves two surfaces, distinguished by the **request host**:

| Host | Surface | Internal route |
| --- | --- | --- |
| `cerelyx.online`, `www` | Marketing + sign-up | `app/(marketing)` at `/` |
| `app.cerelyx.online` | Builder (dashboard, editor) | `app/(builder)` (`/` → `/dashboard`) |
| `admin.cerelyx.online` | Admin (Phase 4) | `app/admin` |
| `<anything>.cerelyx.online` | Published guest site | `app/s/[subdomain]` |

[`src/middleware.ts`](src/middleware.ts) parses the host and **rewrites the
internal path** (the browser URL never changes). It is edge-safe — it does **no**
database work. The actual site lookup happens server-side in
[`app/s/[subdomain]/page.tsx`](src/app/s/[subdomain]/page.tsx) via the Admin SDK.

### Wildcard subdomains & `X-Forwarded-Host`

Firebase App Hosting maps the domain to one backend that sits **behind a proxy**,
so the real requested host arrives in the **`X-Forwarded-Host`** header.
[`src/lib/host.ts`](src/lib/host.ts) reads `X-Forwarded-Host` first, falling back
to `Host`. To serve every subdomain from the one backend, add **both** the apex
(`cerelyx.online`) **and** the wildcard (`*.cerelyx.online`) as custom domains on
the App Hosting backend, then point DNS as the console instructs.

### Draft vs. published

Each site has a public document (`sites/{id}`) holding the **published snapshot**
plus a private working draft (`sites/{id}/editor/draft`). The editor and preview
read the draft; the live site reads the public doc. **Publishing copies the draft
into the public doc** — so edits never affect the live site until you re-publish.
Subdomain uniqueness is enforced by server-managed `subdomains/{sub}` lock docs.

---

## Local development

### Prerequisites

- Node.js 20+
- Java 17+ (required by the Firestore/Storage emulators)
- The Firebase CLI is pinned as a **local devDependency** (`firebase-tools` v13), so
  `npm run emulators` works out of the box — no global install needed. (The latest
  global CLI requires Java 21+; the pinned v13 runs on Java 17.)

### 1. Install & configure

```bash
npm install
cp .env.local.example .env.local   # defaults already target the emulators
```

The defaults run fully against the **Firebase Local Emulator Suite** — no real
Firebase project, credentials, or billing required. Key vars (see
[`.env.local.example`](.env.local.example)):

- `NEXT_PUBLIC_ROOT_DOMAIN=lvh.me:3000` — `lvh.me` and all its subdomains resolve
  to `127.0.0.1`, so subdomain routing works locally with **no hosts-file edits**.
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=1` — connect both SDKs to the emulators.

### 2. Run (two terminals)

```bash
# Terminal 1 — emulators (Auth :9099, Firestore :8080, Storage :9199, UI :4000)
npm run emulators

# Terminal 2 — Next.js dev server
npm run dev
```

Optionally seed the catalog + a live demo site:

```bash
npm run seed
```

### 3. Open

- Marketing: <http://lvh.me:3000>
- Builder: <http://app.lvh.me:3000> (redirects to sign-in, then `/dashboard`)
- A published site: <http://aarav-priya.lvh.me:3000> (after seeding or publishing)
- Emulator UI: <http://127.0.0.1:4000>

> Sign-in/up happen on the **app** host so the session cookie is scoped there.
> Use any email + password against the Auth emulator; Google sign-in also works
> via the emulator's mock flow.

---

## Project structure

```
src/
  middleware.ts            # host → surface routing (edge-safe)
  i18n/                    # next-intl config + request handler
  messages/en.json         # UI strings
  lib/
    env.ts host.ts subdomains.ts cn.ts sanitize.ts
    firebase/{client,admin}.ts
    auth/session.ts        # session-cookie helpers
    validation/site.ts     # zod schemas + publish checklist
    images/pipeline.ts     # sharp pipeline
    server/{sites,users,api,rate-limit}.ts   # Admin-SDK data access
    types.ts               # full Section 3 data model
  app/
    (marketing)/           # apex landing
    (auth)/                # sign-in / sign-up
    (builder)/             # dashboard, /new, sites/[id]/edit
    (preview)/             # chrome-free draft preview (editor iframe)
    s/[subdomain]/         # published guest sites + claim page
    admin/                 # Phase 4 placeholder (gated)
    api/                   # auth/session, sites CRUD, public rsvp
  components/{ui,auth,builder}/
  templates/
    catalog.ts             # pure-data template catalog
    registry.tsx           # templateId → renderer
    royal-indian/          # the flagship template
```

---

## Security model (summary)

- Strict [`firestore.rules`](firestore.rules) / [`storage.rules`](storage.rules):
  owners write only their own sites; **open** published sites are world-readable;
  private sites are server-gated; guests may only **create** RSVP/wish docs.
- Most reads/writes go through **server route handlers** using the Admin SDK with
  session + ownership checks — rules are defense-in-depth.
- User input is sanitized ([`src/lib/sanitize.ts`](src/lib/sanitize.ts)); RSVP
  submissions are rate-limited and validated.

---

## Deploying to Firebase App Hosting (Blaze plan)

The real project is **`cerelyx`** and its config is already wired into
[`apphosting.yaml`](apphosting.yaml) and [`.firebaserc`](.firebaserc) (alias `prod`).

1. **One-time, in the Firebase console for `cerelyx`** (Blaze plan):
   - **Firestore → Create database** (pick a region near your users, e.g.
     `asia-south1` for India — this is permanent).
   - **Storage → Get started** (creates the `cerelyx.firebasestorage.app` bucket).
   - **Authentication** → enable Email/Password + Google.
2. **Deploy the rules + indexes** to `cerelyx`:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage --project cerelyx
   ```
   (The rules already compile; they just need a database + bucket to land on.)
3. Set the access-cookie secret:
   `firebase apphosting:secrets:set ACCESS_TOKEN_SECRET` (a long random string).
4. Create an **App Hosting backend** connected to this repo (needs a git remote).
5. Add custom domains on the backend: **`cerelyx.online`** and the wildcard
   **`*.cerelyx.online`**; update DNS as instructed.
6. Push to the connected branch to trigger a build. The Admin SDK uses
   Application Default Credentials on App Hosting — no service-account key needed.

---

## Roadmap

- ~~**Phase 1** — foundation: routing, auth, data model, one template, publish.~~ ✅
- ~~**Phase 2** — smart editor (reorder/show-hide, theming, photo upload), a
  catalog of **7 distinct templates** + gallery + template switching, guest-list
  manager, and the **three access modes** (open / shared code / guest verification
  with masked hints + personalized links + server-side gate).~~ ✅
- **Phase 3** — RSVP (advanced summary), schedule/itinerary, venue maps,
  countdown, music, wishes + moderation, registry, livestream, Drive photo link.
- **Phase 4** — multi-language content + switcher, downloads (PDF/CSV/Excel),
  free-drag invitation canvas, admin dashboard. (OTP/WhatsApp verification plugs
  into the existing `verifyAccess` seam.)
- **Phase 5** — SEO/OG/structured data, performance, accessibility, responsive QA.
#   c e r e l y x  
 