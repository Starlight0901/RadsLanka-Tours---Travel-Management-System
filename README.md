# RadsLanka Tours — Travel Management System

A professional public website and internal admin system for a small, one-person Sri Lankan travel agency. The product promotes tours, destinations, vehicles, and travel experiences, and gives the owner a content-management and inquiry workspace.

This repository is in **Phase 1 foundation**. The architecture, folder structure, Firebase/Cloudinary configuration, routing, layouts, and security rules are in place. Full public pages and admin CRUD modules are **not** implemented yet.

---

## 1. Project overview

RadsLanka Tours is a travel agency website with two audiences:

| Audience | Purpose |
|---|---|
| **Public visitors** | Browse Sri Lankan tours, destinations, vehicles, gallery, and reviews. Submit package-tour inquiries, custom-tour requests, or general contact messages. |
| **Agency owner (admin)** | Log in, manage website content, approve reviews, and process inquiries. |

There are **no customer accounts** and **no customer login** in Phase 1. Visitors do not create profiles. The important backend surface in Phase 1 is the **admin panel**.

The system supports two kinds of travel request:

1. **Predefined / package tours** — published itineraries the visitor can browse and inquire about.
2. **Customized tours** — a visitor describes the trip they want; the request is stored as an inquiry for the owner to follow up.

The product is intentionally small and maintainable. It should ship as a working brochure + CMS + inquiry desk, then grow into booking and operations tools later.

---

## 2. Business purpose

The agency owner currently needs:

- A trustworthy public website that sells Sri Lanka as a destination and presents real products (tours, destinations, vehicles).
- A single place to receive and track inquiries instead of relying only on email or WhatsApp.
- A simple CMS so tours, destinations, vehicles, reviews, gallery images, and site settings can be updated without a developer.
- A review collection flow that does **not** publish testimonials until the owner approves them.

The website must feel professional, warm, and travel-focused — premium enough for international visitors, but appropriate for a small local agency. It must not look like a generic SaaS dashboard.

**Developer credit:** the public footer includes “Site developed & managed by WeGrow”. “WeGrow” may be a subtle link.

---

## 3. Project phases

### Phase 1 — Public website + admin CMS + inquiries (current)

**Public routes to implement in feature work (skeletons exist now):**

- Home
- Tours and tour details
- Destinations and destination details
- Vehicles (dedicated page only — **not** a homepage section)
- About Us
- Gallery
- Reviews
- Contact Us
- Custom tour inquiry
- Booking / inquiry entry points
- Per-tour review submission (`/review/:tourSlug`)

**Admin routes:**

- Login
- Dashboard
- Tours, Destinations, Vehicles, Reviews, Gallery, Inquiries, Site Settings

**Phase 1 explicitly excludes:**

- Customer accounts / customer login
- Online payments
- Driver accounts
- Hotel booking integrations
- Vendor accounts
- AI itinerary generation
- Mobile application
- Advanced booking marketplace

### Phase 2 — Booking + business management (do not implement now)

Future modules: customers, bookings, booking calendar, quotations, PDF quotations, payment tracking, drivers, vehicle assignment, notifications, and a fuller booking workflow.

Expected business flow:

```
Visitor → Inquiry → Admin reviews inquiry → Contact customer
→ Create quotation → Customer accepts → Booking
→ Payment → Trip → Completed
```

### Phase 3 — Future travel platform (do not implement now)

Potential later work: customer accounts, online booking and payments, hotels, activities, guides, partner/vendor accounts, advanced availability, AI itinerary planner, personalized recommendations, loyalty/rewards, advanced analytics, and a mobile app.

The current architecture only needs to **leave room** for these collections and routes. Do not build them now.

---

## 4. Architecture

Phase 1 has **no** dedicated Node.js/Express server, **no** MongoDB, **no** Firebase Storage, and **no** VPS. Firebase is the backend. Cloudinary is the media CDN. Firebase Cloud Functions can be added later when a secret or server-side step is required.

```
Customer
   ↓
Custom domain
   ↓
Firebase Hosting
   ↓
React + Vite + TypeScript application
   ↓
Firebase
   ├── Authentication   (admin only in Phase 1)
   └── Firestore        (application data)

Images / media
   React app
      ↓
   Cloudinary (unsigned upload + CDN URLs)
      ↓
   Image CDN
```

**Rules of the architecture:**

- Firestore never stores binary image files. It stores Cloudinary URLs and metadata (`imageUrl`, `publicId`, `altText`, `caption`).
- Frontend route guards hide admin screens. **Firestore Security Rules independently deny unauthorized reads/writes.** Do not rely on the UI alone.
- Private credentials (Firebase Admin SDK, Cloudinary API secret) must never ship in the frontend. If an operation needs a secret, it belongs in Cloud Functions later.
- Related records use IDs (`tourId`, `relatedTours[]`), not copied document bodies.

---

## 5. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| UI | React + Vite + TypeScript | Single-page app |
| Styling | Tailwind CSS | Custom travel-agency theme, not a SaaS kit |
| Routing | React Router | Public layout vs admin layout |
| Forms / validation | React Hook Form + Zod | Login now; inquiry/CMS forms later |
| Icons | Lucide React | |
| Backend / DB / Auth / Hosting | Firebase | Auth, Firestore, Hosting |
| Media | Cloudinary | Images and site assets |
| Version control | Git + GitHub | |

**Not in Phase 1:** Express, MongoDB, Firebase Storage, Firebase Admin SDK in the client, Cloudinary secret keys in the client.

---

## 6. Firebase responsibilities

### Authentication

- Email/password sign-in for the agency owner.
- Phase 1 expects **one admin account**.
- The `admins` collection maps `auth.uid` → admin profile. Extra admin roles can be added later by creating more Auth users and `admins` documents.
- Auth state is provided by `AuthProvider`. Admin routes use `ProtectedRoute`.

### Firestore

Stores structured application data. See [section 8](#8-database-collections).

### Hosting

Serves the Vite `dist` output. All unmatched paths rewrite to `index.html` so React Router can handle client-side routes.

### What Firebase does **not** do in Phase 1

- File storage (use Cloudinary)
- Server-side PDF / email / payment processing (Cloud Functions later)
- Customer authentication

---

## 7. Cloudinary responsibilities

Cloudinary holds **all** website media. Firestore only stores references.

Suggested folder layout:

```
travel-agency/
  tours/
  destinations/
  vehicles/
  gallery/
  reviews/
  site/
```

Typical assets: tour photos, destination photos, vehicle photos, gallery images, optional review photos, logo, and other site assets.

Configuration lives in `src/config/env.ts` and `src/services/cloudinary/`. Cloud name and unsigned upload preset come from environment variables. **Never put the Cloudinary API secret in this repo or in frontend env vars.**

The Cloudinary module is isolated so the cloud name, folders, or upload approach can change later without rewriting pages.

---

## 8. Database collections

Document IDs should be stable generated IDs (Firestore auto-IDs), not human-readable names. Public URLs use `slug` fields.

### Phase 1 collections

| Collection | Purpose |
|---|---|
| `admins` | Maps Firebase Auth UID to an admin record. Used by security rules (`exists(/admins/{uid})`). |
| `tours` | Package tours. Public read only when `published == true`. |
| `destinations` | Destination pages. Public read only when published. |
| `vehicles` | Fleet / vehicle pages. Public read only when published. |
| `reviews` | Testimonials. Public read only when published. Creates start as unpublished. |
| `gallery` | Standalone gallery items. Public read only when published. |
| `inquiries` | Package, custom-tour, and general inquiries. Public **create** only. Admin read/update. |
| `siteSettings` | Singleton (or small set of docs) for logo, contact, hero copy, social links, footer. Public read. |

### Future collections (Phase 2+)

`customers`, `bookings`, `quotations`, `payments`, `drivers`

Do not create UI or write paths for these yet. Rules can stay closed until those modules exist.

### Field contracts (Phase 1)

**tours**

`title`, `slug`, `description`, `duration`, `price`, `destinations` (IDs), `itinerary`, `included`, `excluded`, `images` (Cloudinary refs), `featured`, `popular`, `published`, `createdAt`, `updatedAt`

**destinations**

`name`, `slug`, `description`, `coverImage`, `thingsToDo`, `placesToVisit`, `bestTime`, `travelInfo`, `gallery`, `relatedTours` (tour IDs), `published`, `createdAt`, `updatedAt`

**vehicles**

`name`, `type`, `description`, `passengerCapacity`, `luggageCapacity`, `features`, `images`, `published`, `createdAt`, `updatedAt`

**reviews**

`travelerName`, `country`, `rating`, `review`, `photo` (optional Cloudinary ref), `tourId`, `date`, `published`, `featured`

**gallery**

`imageUrl`, `publicId`, `category`, `caption`, `altText`, `published`, `createdAt`

**inquiries**

`type` (`package_tour` \| `custom_tour` \| `general`), `name`, `email`, `phone`, `travelDate`, `returnDate`, `travellers`, `tourId` (optional), `destinations`, `message`, `status` (`New` \| `Contacted` \| `Follow-up` \| `Converted` \| `Closed`), `createdAt`, `updatedAt`

Custom-tour inquiries may also store interests, budget, accommodation, vehicle preference, adults/children, and country. Extend the inquiry document rather than creating a second collection.

**siteSettings**

`logo`, `phone`, `whatsapp`, `email`, `address`, `socialLinks`, `heroText`, `footer`, plus any small public copy the layout needs.

**admins**

`email`, `displayName`, `role` (start with `"owner"`; more roles later), `createdAt`

**Image object shape** (embedded, not a collection):

```json
{
  "imageUrl": "https://res.cloudinary.com/…",
  "publicId": "travel-agency/tours/…",
  "altText": "Tea country near Ella",
  "caption": "Optional caption"
}
```

Timestamps: use Firestore `Timestamp` (or server timestamp on write) for `createdAt` / `updatedAt`.

---

## 9. Public website structure

### Chrome (every public page)

**Top information bar**

- Location icon + line: “Explore Sri Lanka with Local Experts”
- Contact number
- Email

Values come from `siteSettings` once that module exists. Until then the layout uses typed fallbacks in `src/config/site.ts` — do not invent fake reviews or fake inventory.

**Main navigation**

Home · Tours · Destinations · Vehicles · About Us · Gallery · Reviews · Contact Us · **BOOK NOW** (visually highlighted)

**BOOK NOW** is the primary inquiry entry point. In Phase 1 it routes to the custom-tour / booking inquiry page (`/custom-tour`).

**Floating WhatsApp button** on all public pages. Number comes from site settings / fallback config.

**Footer**

Logo, short description, quick links, services, contact details, social links, Privacy Policy, Terms, copyright, and “Site developed & managed by WeGrow”.

### Homepage sections (feature work)

1. Hero — e.g. “Discover Sri Lanka, Your Way”, short intro, Explore Tours, Book Now
2. Popular tour packages (about 3–4 featured tours) + “View All Tours”
3. Top destinations (Ella, Kandy, Sigiriya, Galle, Nuwara Eliya, Mirissa as examples of real places to load from Firestore) + “View All Destinations”
4. Why Choose Us? — Personalized Travel Experiences, Local Expertise, Flexible Itineraries, Hassle-Free Planning, Friendly Support
5. Custom inquiry CTA — “Let's Plan Your Sri Lankan Journey”
6. Recent reviews — only real, **published** reviews. Empty state if none. **Never generate fake reviews.**
7. Footer

**Do not** add a Vehicles / “Travel Comfortably” block on the homepage. Vehicles have their own page.

### Public URL map

| Path | Page |
|---|---|
| `/` | Home |
| `/tours` | Tour listing (search, duration, destination, type, price, featured/popular) |
| `/tours/:slug` | Tour detail (cover, duration, price, overview, destinations, itinerary, inclusions/exclusions, gallery, important info, book/inquiry, related tours, tour-specific published reviews) |
| `/destinations` | Destination listing |
| `/destinations/:slug` | Destination detail (overview, things to do, places, best time, travel info, gallery, related tours) |
| `/vehicles` | Vehicles |
| `/about` | About Us |
| `/gallery` | Gallery |
| `/reviews` | All published reviews |
| `/review/:tourSlug` | Submit a review for that tour (starts unpublished) |
| `/contact` | Contact / general inquiry |
| `/custom-tour` | Custom tour inquiry |
| `/privacy` | Privacy Policy |
| `/terms` | Terms |
| `*` | 404 |

---

## 10. Admin panel structure

| Path | Page |
|---|---|
| `/admin/login` | Admin sign-in (unauthenticated) |
| `/admin` | Dashboard |
| `/admin/tours` | Tour CMS |
| `/admin/destinations` | Destination CMS |
| `/admin/vehicles` | Vehicle CMS |
| `/admin/reviews` | Review moderation |
| `/admin/gallery` | Gallery CMS |
| `/admin/inquiries` | Inquiry inbox and status updates |
| `/admin/settings` | Site settings |

Dashboard (when implemented) should show totals for tours, destinations, vehicles, reviews, new inquiries, a bookings placeholder, and a recent-inquiry list. Phase 2 bookings can stay a labelled placeholder.

Admin UX is functional and quiet. It must not reuse the public marketing look.

---

## 11. Authentication approach

1. Create a Firebase Auth user (email/password) for the owner.
2. Create `admins/{uid}` with that user's UID. Security rules treat anyone with such a document as an admin.
3. The SPA listens with `onAuthStateChanged`.
4. `ProtectedRoute` redirects unauthenticated users to `/admin/login`.
5. Authenticated users hitting `/admin/login` redirect to `/admin`.
6. Firestore rules call `isAdmin()` via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.

Frontend hiding is not enough. A crafted client must still be rejected by rules.

Phase 1 does not implement role-based UI beyond “is admin”. Extra roles can be fields on `admins` later.

---

## 12. Inquiry workflow

Every inquiry is written to Firestore. Email and WhatsApp are follow-up channels, not the system of record.

**Types:** `package_tour` · `custom_tour` · `general`

**Statuses:** `New` · `Contacted` · `Follow-up` · `Converted` · `Closed`

```
Visitor submits form
   ↓
Firestore inquiries document (status: New)
   ↓
Admin opens Inquiries
   ↓
Admin contacts the customer (phone / WhatsApp / email)
   ↓
Admin updates status
   ↓
Phase 2: quotation → booking (not built yet)
```

Package inquiries should include `tourId`. Custom and general inquiries do not require it.

---

## 13. Customized tour workflow

Custom tours are **not** catalog products. They are inquiries.

The public form (to be built) should collect: name, email, WhatsApp/phone, country, arrival date, departure date, number of travellers (adults/children as needed), preferred destinations, interests, budget range, accommodation preference, vehicle preference, special requirements, and a message.

Suggested interests: Beaches, Wildlife, Culture, Adventure, Nature, Food, History, Photography, Relaxation.

Example document:

```json
{
  "type": "custom_tour",
  "customerName": "…",
  "email": "…",
  "phone": "…",
  "arrivalDate": "…",
  "departureDate": "…",
  "travellers": 2,
  "destinations": [],
  "interests": [],
  "budget": "…",
  "accommodation": "…",
  "vehiclePreference": "…",
  "message": "…",
  "status": "New",
  "createdAt": "…"
}
```

---

## 14. Review workflow

Reviews must not become public automatically.

```
Customer opens /review/:tourSlug
   ↓
Form stored in Firestore (published: false)
   ↓
Admin reviews the submission
   ↓
Admin sets published: true (and optionally featured)
   ↓
Review appears on /reviews and on that tour’s detail page
```

Required data: `tourId`, traveler name, country, rating, review text, optional photo, date, `published`, `featured`.

- Tour pages show **only** published reviews for that `tourId`.
- `/reviews` shows published reviews from all tours.
- Future customized-trip reviews can attach to a completed booking instead of a catalog tour. Keep `tourId` optional in the type if that lands in Phase 2.

---

## 15. Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and fill in real values. **Do not commit files that contain secrets.**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

| Variable | Safe in frontend? | Purpose |
|---|---|---|
| `VITE_FIREBASE_*` | Yes — these are the Firebase **web** config values | Initialize the JS SDK |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Build CDN URLs |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes, if it is an **unsigned** preset | Browser uploads later |
| Firebase Admin private key | **No** | Never add |
| Cloudinary API secret | **No** | Never add |

Vite only exposes variables prefixed with `VITE_`.

Typed access: `src/config/env.ts`.

---

## 16. Local development setup

### Prerequisites

- Node.js 20 LTS or newer (verified with Node 22)
- npm 10+ (this repo uses **npm**; `package-lock.json` is the lockfile)
- Git
- A Firebase project (for live Auth/Firestore)
- A Cloudinary cloud (for media in later feature work)

### Install and run

```bash
npm install
```

Start the Vite development server (default URL `http://localhost:5173`):

```bash
npm run dev
```

Type-check and create a production build in `dist/`:

```bash
npm run build
```

Serve the production build locally:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

The app **boots without credentials**. Admin login and Firestore stay disabled until `.env.local` is filled and the Firebase project is created. The admin login screen shows a configuration message instead of crashing.

```bash
copy .env.example .env.local
```

On macOS/Linux use `cp .env.example .env.local`. Then fill in the Firebase web config and restart `npm run dev`.

---

## 17. Firebase setup

These steps are **manual**. This repository cannot create your Firebase project for you.

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project (or reuse one).
2. Enable **Authentication → Email/Password**.
3. Create the owner user (Authentication → Users).
4. Enable **Cloud Firestore** (start in production mode; deploy the rules in this repo immediately).
5. Register a **Web app**. Copy the firebaseConfig object into `.env.local`.
6. In Firestore, create `admins/{THE_USER_UID}` so security rules recognize the owner.
7. Install the CLI if you will deploy from this machine: `npm install -g firebase-tools`
8. `firebase login`
9. Replace `your-firebase-project-id` in `.firebaserc` with the real project ID.
10. Deploy rules (and later hosting):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Do not use the Firebase Admin SDK in this frontend.

---

## 18. Cloudinary setup

1. Create a Cloudinary account and note the **cloud name**.
2. Create an **unsigned** upload preset for later admin uploads (folder prefix `travel-agency/` is recommended). Restrict allowed formats and max file size in the preset.
3. Put `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env.local`.
4. Create the folder tree (`tours`, `destinations`, `vehicles`, `gallery`, `reviews`, `site`) when you start uploading.
5. Keep the **API secret** only in the Cloudinary dashboard (or a future Cloud Function). Never add it to Vite env files.

Until the CMS upload UI exists, you can upload in the Cloudinary Media Library and paste URLs/`publicId`s into Firestore.

---

## 19. Deployment process

Phase 1 hosting target is **Firebase Hosting**.

1. `npm run build`
2. Confirm `.firebaserc` points at the correct project.
3. `firebase deploy --only hosting` (or `firebase deploy` for hosting + Firestore rules/indexes)

`firebase.json` publishes `dist/` and rewrites all routes to `index.html`.

Attach a custom domain in the Firebase Hosting console when the site is ready.

There is no CI workflow in the foundation. Add GitHub Actions later if you want deploy-on-push.

---

## 20. Security considerations

- Firestore rules in `firestore.rules` are the real access-control layer.
- Public clients may **read published** catalog content and site settings, and **create** inquiries and unpublished reviews. They cannot update or delete those records.
- Admin writes require an authenticated user whose UID exists in `admins`.
- Unpublished tours, destinations, vehicles, reviews, and gallery items are admin-only.
- Inquiry documents are admin-only after create.
- Validate forms with Zod on the client. Rules also constrain create payloads for inquiries and reviews.
- Never commit `.env`, `.env.local`, service-account JSON, or Cloudinary secrets.
- Do not expose Firebase Admin credentials in Hosting.
- Use loading, empty, and error states for every async screen (foundation components live under `src/components/ui/`).

---

## 21. Future expansion plan

| When | What to add | How the foundation supports it |
|---|---|---|
| Phase 1 features | Public pages, admin CRUD, Cloudinary upload UI, inquiry/review forms | Routes, types, services, rules already named |
| Phase 2 | Bookings, quotations, payments, drivers | Add collections; keep rules closed until screens exist; Cloud Functions for PDFs/email |
| Phase 3 | Customer Auth, payments, vendors, AI, mobile | Separate Auth methods / apps; do not overload the single admin `admins` check |

Suggested Phase 2 inquiry-to-booking path: inquiry status `Converted` → create `quotations` → accepted → `bookings` + optional `payments`.

---

## 22. Important development rules

1. Inspect the repo before adding files. Do not overwrite working config.
2. Use **npm**. Do not introduce a second package manager without a reason.
3. TypeScript only. Avoid `any` unless there is a strong technical reason.
4. Keep Firebase access in `src/services/firebase/` and hooks/contexts — not inside presentational components.
5. Keep Cloudinary URL/upload logic in `src/services/cloudinary/`.
6. Do not hardcode catalog data (tours, reviews, vehicles) in components. Load from Firestore. Layout chrome may use `src/config/site.ts` fallbacks until `siteSettings` is wired.
7. Do not invent fake reviews. Empty states are required.
8. Do not add a Vehicles section to the homepage.
9. Mark unfinished screens as placeholders. Do not pretend CRUD is done.
10. Do not add Express, MongoDB, Firebase Storage, or extra libraries “just in case”.
11. Do not implement Phase 2 or Phase 3 modules until Phase 1 CMS and public pages are real.
12. Prefer slugs for public URLs and stable IDs for documents.
13. Use `createdAt` / `updatedAt` on writable records.
14. Match the public brand (warm, travel, responsive) and keep admin UX separate.

---

## Current foundation status

`npm run build` succeeds on the foundation (TypeScript project references + Vite production bundle). The SPA boots without Firebase or Cloudinary credentials.

Implemented now:

- Vite + React + TypeScript
- Tailwind CSS with a travel-agency theme
- React Router with public and admin layouts
- Firebase app / Auth / Firestore initialization (safe when env is missing)
- Auth context, login form, protected admin routes
- Cloudinary env + folder + URL helpers
- Typed domain models
- Placeholder public and admin pages
- Firestore security rules and Hosting config
- `.env.example` and `.gitignore`

Not implemented yet (next Phase 1 work):

- Real homepage sections backed by Firestore
- Tour / destination / vehicle / gallery / review / inquiry / settings CRUD
- Public filters, detail pages, and forms
- Cloudinary upload UI
- Dashboard metrics
- Legal page copy
- Production Firebase project and first admin user (manual)

---

## License

MIT License. Copyright (c) 2026 Shamini Fernando. See `LICENSE`.
