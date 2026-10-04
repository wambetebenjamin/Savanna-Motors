# Savanna Motors

New and used car sales, financing and servicing — Mombasa Road, Nairobi.

Next.js 14 (App Router) · TypeScript · Three.js · Zustand · Lucide · Vercel KV.

---

## 1. The design system came from the uploaded zip — not from guesswork

`carserv-1.0.0.zip` was extracted and read in full **before any code was written**.
Every colour, font, weight, spacing step, shadow, border and transition in the build is
traced back to a line in that archive, and all of them are declared as CSS custom
properties at `:root` in `src/app/globals.css`.

The provenance table lives in **[`DESIGN-TOKENS.md`](./DESIGN-TOKENS.md)**. The headlines:

| | Value | Where it came from |
| --- | --- | --- |
| Primary | `#D81324` | `css/style.css :root --primary` |
| Secondary | `#0B2154` | `scss/bootstrap.scss $secondary` |
| Light / Dark | `#F2F2F2` / `#111111` | `css/style.css :root` |
| Body text | `#596277` | `$body-color` |
| Headings | Barlow 600/700, colour `#0B2154` | `$headings-font-family`, `$headings-color` |
| Body | Ubuntu 400/500 | `$font-family-base` |
| Radius | `0px` (2px for square icon buttons) | `$border-radius: 0px`, `.btn-square` |
| Shadows | `0 .125rem .25rem / 0 .5rem 1rem / 0 1rem 3rem rgba(0,0,0,…)` | compiled `.shadow-sm/.shadow/.shadow-lg` |
| Transitions | `.5s` UI, `.3s` links | `.btn`, `.footer .btn-social` |

Brief-mandated type sizes sit on top of those families: body 16px (15px minimum),
navigation 13px, buttons 12px/700 uppercase, metadata 11px.

## 2. Photography

Real Pexels / Unsplash photography only — no AI car renders. Local copies are committed
to `public/images`, and **[`image-credits.md`](./image-credits.md)** lists every file with
its description and licence page. `src/data/generated/photos.ts` additionally stores the
provider CDN url (used for full-resolution delivery) and a base64 LQIP generated from the
local copy, which is what feeds the `next/image` blur placeholder.

The hero, page headers and blog art use genuine Nairobi street photography; the people in
the testimonials and finance sections are East African buyers.

Regenerate the derived files with:

```bash
node scripts/prepare-images.mjs
```

## 3. Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Copy `.env.example` to `.env.local` if you want the live integrations. **Every integration
degrades gracefully** — the whole site, including all eight write endpoints, works with no
credentials at all (in-process storage, `wa.me` deep links, logged emails, pinned FX rate).

## 4. What is in here

### Pages

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | ISR 300 | Hero, featured grid, financing calculator, trade-in, service centre, testimonials, blog, contact |
| `/cars` | SSR (`force-dynamic`) | Live filter accuracy; every filter writes to the URL |
| `/cars/[slug]` | ISR 300 + `generateStaticParams` | Gallery, 360 viewer, specs, three CTAs, similar-cars carousel, `Car` JSON-LD, per-car Open Graph |
| `/compare` | Static shell + session state | Up to three cars side by side |
| `/financing` | Static | Calculator + application flow |
| `/service`, `/about`, `/contact` | Static | |
| `/blog`, `/blog/[slug]` | ISR 300 | MDX in `content/blog`, rendered with `next-mdx-remote/rsc` |
| `/sitemap.xml`, `/robots.txt` | Generated | Built from every car and blog slug |

### API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/cars` | Paginated inventory (Vercel KV when attached, bundled catalogue otherwise) |
| `GET /api/cars/[slug]` | One car + finance estimate + similar cars |
| `GET /api/search` | Filter by make, model, price, year, condition, transmission, fuel, body |
| `POST /api/financing` | Saves the application, WhatsApp notification, email receipt — rate limited |
| `POST /api/test-drive` | Saves the booking, WhatsApp + email confirmation, optional M-Pesa deposit |
| `POST /api/trade-in` | Trade-in valuation enquiry |
| `POST /api/service-booking` | Workshop appointment + confirmation |
| `POST /api/enquiry` | General and per-car enquiries |
| `POST /api/mpesa/stk-push` | Daraja STK push for the refundable reservation deposit |
| `GET /api/verify-registration` | NTSA/TIMS lookup when configured, inspection records otherwise |
| `GET /api/blog` | MDX article index / single article |
| `POST /api/newsletter` | Subscriber set in Vercel KV |

All write endpoints are validated with Zod and fixed-window rate limited (5 requests /
minute / IP; 3 for M-Pesa).

### Motion

Hero headline enters word by word, `cubic-bezier(0.22, 1, 0.36, 1)` with a 0.09s stagger.
Search bar slides up 0.6s after load. Car cards fade up on scroll 70ms apart, and on hover
crossfade to the second photograph while the shadow lifts and the card translates −4px over
250ms. Service cards stagger 80ms. Stats count up on scroll. Testimonials crossfade every
5s over 700ms. The financing installment flips digit by digit on every input change. The
comparison columns slide in from the right. `prefers-reduced-motion` collapses all of this
to instant fades: no stagger, no digit flip, no 3D rotation.

### WebGL hero

Two canvases, both built from `src/lib/three/carMeshes.ts` — fully shaded procedural cars
(solid bodywork with cut wheel arches, tinted glass, chrome beltline, alloy wheels, lit
lamps and a contact shadow) at the real length/height/wheel proportions of the vehicles the
showroom sells. No model files are downloaded. `src/lib/three/stage.ts` provides the shared
tone-mapped renderer, the pre-filtered `RoomEnvironment` that makes paint and chrome read as
metal, and a three-point rig with a brand-red rim light.

`HeroCars3D.tsx` is the full-bleed layer: two opposing lanes of traffic behind the hero
photographs, with perspective depth, edge fades, rolling wheels and a road bob. Lane heights
are solved against the camera so the cars land in the band the photo mask clears — they read
as driving on a road beneath the picture. DPR capped at 1.25.

`HeroCarTurntable.tsx` is the corner showcase: one car turning on its axis, swapping every
5.2s. The outgoing car accelerates away to the left, lifting, shrinking and fading, while
the next sweeps in from the right on an `easeOutExpo` glide and settles with a slight
`easeOutBack` overshoot; the key light rakes across the bodywork as it lands. DPR capped at
1.75.

Both loops pause whenever the canvas leaves the viewport or the tab is hidden, both bail out
entirely below 1025px (the holders are also `display: none` there), and both fall back to a
static frame under `prefers-reduced-motion`.

## 5. Deployment

Push to Vercel and it builds as-is. `vercel.json` carries the security headers (CSP, HSTS,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) plus
immutable caching for `/images`. Attach a KV store to persist leads; everything else is
optional environment configuration.

## 6. Repository layout

```
content/blog/           MDX articles
public/images/          Committed Pexels / Unsplash photography
scripts/                prepare-images.mjs (curation, LQIP, credits)
src/app/                App Router pages + API routes
src/components/         UI (client islands kept small and specific)
src/data/               Inventory, site constants, editorial content, generated photos
src/lib/                search, format, kv, notify, mpesa, currency, three meshes
DESIGN-TOKENS.md        Extraction report for carserv-1.0.0.zip
image-credits.md        Photo-by-photo credit and licence table
```
