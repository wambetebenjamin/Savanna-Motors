/**
 * Curates the Pexels / Unsplash photographs that were pulled into `image-search/`
 * into `public/images/`, writes `image-credits.md`, and generates
 * `src/data/generated/photos.ts` (remote hi-res CDN url + local path + LQIP blur).
 *
 * Run: node scripts/prepare-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const srcDir = path.join(root, "image-search");
const outDir = path.join(root, "public", "images");

/** id, provider photo id, source file, credit page, description */
const MANIFEST = [
  // ---------------------------------------------------------------- hero / place
  ["heroNairobiStreet", "pexels", "37993590", "pexels-nairobi-kenya-city-street-cars-tr-2.jpg", "Street scene with traffic and tall buildings in Nairobi, Kenya"],
  ["heroNairobiDusk", "pexels", "8621747", "pexels-nairobi-kenya-city-street-cars-tr-1.jpg", "Traffic in Nairobi on a busy street at dusk"],
  ["heroNairobiAerial", "pexels", "30908923", "pexels-nairobi-kenya-city-street-cars-tr-4.jpg", "Aerial view of a bustling street in Nairobi with vehicles and roadside shops"],
  ["heroHighwayDrive", "pexels", "29615584", "pexels-luxury-car-exterior-side-view-roa-2.jpg", "Dynamic side view of a white luxury car on the highway"],
  ["showroomRow", "pexels", "9702325", "pexels-car-showroom-interior-new-cars-in-1.jpg", "A row of cars in a modern indoor showroom"],

  // ---------------------------------------------------------------- exteriors
  ["extBlackJeepStreet", "pexels", "19361878", "pexels-black-suv-exterior-parked-street-5.jpg", "Black SUV parked on a city street"],
  ["extBlackSuvCity", "pexels", "9408436", "pexels-black-suv-exterior-parked-street-1.jpg", "Black SUV parked under a modern architectural structure"],
  ["extBlackSuvNight", "pexels", "3370332", "pexels-black-suv-exterior-parked-street-2.jpg", "Sleek black SUV parked on a city street"],
  ["extBlackSuvGreen", "pexels", "8042432", "pexels-black-suv-exterior-parked-street-3.jpg", "Black SUV parked in an outdoor lot with greenery"],
  ["extBlackSuvUrban", "pexels", "16001318", "pexels-black-suv-exterior-parked-street-4.jpg", "Black SUV on a dimly lit urban street"],
  ["extWhitePickup", "pexels", "28215777", "pexels-white-pickup-truck-4x4-exterior-2.jpg", "Rugged white 4x4 pickup truck parked outside a modern building"],
  ["extWhiteTruckLot", "pexels", "4062472", "pexels-white-pickup-truck-4x4-exterior-3.jpg", "White pickup truck parked outdoors in a lot"],
  ["extPickupDunes", "pexels", "38036779", "pexels-white-pickup-truck-4x4-exterior-4.jpg", "White pickup truck driving across desert dunes"],
  ["extOffroad4x4", "pexels", "12215012", "pexels-white-pickup-truck-4x4-exterior-1.jpg", "Classic 4x4 parked on rough terrain under a cloudy sky"],
  ["extSilverMerc", "pexels", "16495911", "pexels-silver-sedan-car-parked-side-view-4.jpg", "Side view of a silver luxury sedan parked beside a lake"],
  ["extSilverSedan", "pexels", "11501948", "pexels-silver-sedan-car-parked-side-view-1.jpg", "Side view of a silver sedan in front of a brick wall"],
  ["extSilverPergola", "pexels", "33359730", "pexels-silver-sedan-car-parked-side-view-2.jpg", "Side view of a silver sedan parked under a pergola"],
  ["extSilverUrban", "pexels", "31138744", "pexels-silver-sedan-car-parked-side-view-3.jpg", "Silver car parked on a city street"],
  ["extRedCobble", "pexels", "5067327", "pexels-red-hatchback-compact-car-city-st-3.jpg", "Bright red car parked on a cobblestone street"],
  ["extRedRain", "pexels", "14747980", "pexels-red-hatchback-compact-car-city-st-2.jpg", "Red car on a city street during a rainy evening"],
  ["extRedUrban", "pexels", "4913911", "pexels-red-hatchback-compact-car-city-st-4.jpg", "Sleek red car driving on an urban street"],
  ["extGreyCompact", "pexels", "14818467", "pexels-grey-station-wagon-estate-car-par-2.jpg", "Grey compact car parked alongside a city street"],
  ["extGreyStreet", "pexels", "14818465", "pexels-grey-station-wagon-estate-car-par-3.jpg", "Two cars parked on a city street near a park"],

  // ---------------------------------------------------------------- interiors
  ["intWheelDash", "pexels", "10257897", "pexels-modern-car-interior-dashboard-ste-1.jpg", "Car interior with leather steering wheel and modern dashboard"],
  ["intLuxuryDash", "pexels", "3894064", "pexels-modern-car-interior-dashboard-ste-2.jpg", "High-end car interior with a modern dashboard and steering wheel"],
  ["intLitDash", "pexels", "5182355", "pexels-modern-car-interior-dashboard-ste-3.jpg", "Interior of a modern car with illuminated dashboard"],
  ["intCloseDash", "pexels", "12956058", "pexels-modern-car-interior-dashboard-ste-4.jpg", "Close-up of a modern car interior, steering wheel and dashboard"],
  ["intCabin", "pexels", "7744712", "pexels-modern-car-interior-dashboard-ste-5.jpg", "Close-up of a modern car cabin, steering wheel and dashboard"],
  ["intWheelRim", "pexels", "8305224", "pexels-car-tyre-wheel-close-up-alloy-rim-2.jpg", "Close-up of a car wheel and tyre showing rim detail"],
  ["intBrakeRim", "pexels", "14667497", "pexels-car-tyre-wheel-close-up-alloy-rim-4.jpg", "Close-up of a wheel rim and tyre with red brake calliper"],

  // ---------------------------------------------------------------- people
  ["personKeysA", "pexels", "7144214", "pexels-african-man-holding-car-keys-deal-1.jpg", "Buyer test driving a new car at a dealership"],
  ["personKeysB", "pexels", "7144189", "pexels-african-man-holding-car-keys-deal-2.jpg", "Smiling buyer holding car keys beside a new car"],
  ["personKeysC", "pexels", "6817013", "pexels-african-man-holding-car-keys-deal-3.jpg", "Happy buyer with a new car at a dealership"],
  ["personKeysD", "pexels", "7144242", "pexels-african-man-holding-car-keys-deal-4.jpg", "Buyer holding car keys in a dealership showroom"],
  ["personSuitStairs", "pexels", "7446953", "pexels-african-businessman-portrait-smil-2.jpg", "Confident businessman smiling while walking up stairs"],
  ["personBench", "pexels", "5061279", "pexels-african-businessman-portrait-smil-3.jpg", "Man seated outdoors using a smartphone"],
  ["personOfficeWoman", "pexels", "36551042", "pexels-african-woman-smiling-portrait-pr-2.jpg", "Woman smiling at an office desk in formal attire"],
  ["personBlazerWoman", "pexels", "37118121", "pexels-african-woman-smiling-portrait-pr-3.jpg", "Woman in a grey blazer smiling indoors"],
  ["coupleHandshake", "pexels", "36729857", "pexels-african-couple-car-salesman-deale-3.jpg", "Couple finalising a car purchase with a salesperson"],
  ["coupleDealership", "pexels", "7144172", "pexels-african-couple-car-salesman-deale-4.jpg", "Couple discussing a car purchase with a salesperson"],

  // ---------------------------------------------------------------- service
  ["serviceMechanic", "pexels", "8986148", "pexels-mechanic-working-car-garage-servi-3.jpg", "Mechanic inspecting a raised car in an auto workshop"],
];

const cdn = (provider, id) =>
  provider === "pexels"
    ? `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`
    : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=70`;

const page = (provider, id) =>
  provider === "pexels" ? `https://www.pexels.com/photo/${id}/` : `https://unsplash.com/photos/${id}`;

fs.mkdirSync(outDir, { recursive: true });

const entries = [];
const missing = [];

for (const [key, provider, id, file, alt] of MANIFEST) {
  const from = path.join(srcDir, file);
  if (!fs.existsSync(from)) {
    missing.push(file);
    continue;
  }
  const localName = `${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}-${id}.jpg`;
  const to = path.join(outDir, localName);
  const img = sharp(from).rotate();
  const meta = await img.metadata();
  await img.jpeg({ quality: 82, mozjpeg: true }).toFile(to);
  const lqip = await sharp(from).resize(16).blur(1).jpeg({ quality: 40 }).toBuffer();
  entries.push({
    key,
    provider,
    id,
    local: `/images/${localName}`,
    remote: cdn(provider, id),
    credit: page(provider, id),
    alt,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    blur: `data:image/jpeg;base64,${lqip.toString("base64")}`,
  });
}

if (missing.length) console.warn("Missing source files:", missing.join(", "));

// --------------------------------------------------------------- photos.ts
const ts = `// AUTO-GENERATED by scripts/prepare-images.mjs — do not edit by hand.
// Every photograph is a free-licence Pexels / Unsplash photo. A local copy lives in
// /public/images; \`remote\` points at the provider CDN for full-resolution delivery.

export type Photo = {
  key: string;
  provider: "pexels" | "unsplash";
  id: string;
  /** Locally saved copy (also committed to the repo). */
  local: string;
  /** Full-resolution provider CDN url. */
  remote: string;
  credit: string;
  alt: string;
  width: number;
  height: number;
  blur: string;
};

export const PHOTOS = ${JSON.stringify(
  Object.fromEntries(entries.map((e) => [e.key, e])),
  null,
  2,
)} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

export const photo = (key: PhotoKey): Photo => PHOTOS[key];
`;

fs.mkdirSync(path.join(root, "src", "data", "generated"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "data", "generated", "photos.ts"), ts);

// --------------------------------------------------------------- credits
const rows = entries
  .map(
    (e) =>
      `| \`${e.local.replace("/images/", "")}\` | ${e.alt} | ${
        e.provider === "pexels" ? "Pexels" : "Unsplash"
      } | [${e.credit}](${e.credit}) |`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(root, "image-credits.md"),
  `# Image credits — Savanna Motors

All photography on this site is real car / dealership / street photography licensed under the
free **Pexels Licence** or the **Unsplash Licence**. No AI-generated car renders are used.

* Local copies live in \`public/images/\` (committed to the repository).
* \`src/data/generated/photos.ts\` additionally stores the provider CDN URL so full-resolution
  variants can be served, plus a base64 LQIP used as the \`next/image\` blur placeholder.
* Regenerate with \`node scripts/prepare-images.mjs\`.

| File | Description | Source | Credit / licence page |
| --- | --- | --- | --- |
${rows}

## Imagery policy — cars only

The homepage renders **vehicle photography exclusively**: no photograph of a person appears
anywhere on it. That covers the hero slides, featured inventory, the trade-in section,
customer testimonials (each thumbnail is the model that was bought, not the buyer) and the
blog cards. \`/about\` follows the same rule.

The \`person-*\` and \`couple-*\` files below are retained in the library but are not referenced
by any page; \`service-mechanic-*\` is used only on \`/service\`.

## Licences

* Pexels Licence — https://www.pexels.com/license/ (free to use, no attribution required;
  attribution given here as good practice).
* Unsplash Licence — https://unsplash.com/license

## Design source

UI colours, typography, spacing, shadow and border values are extracted from the uploaded
\`carserv-1.0.0.zip\` design source (CarServ HTML template by HTML Codex,
https://htmlcodex.com/car-repair-html-template). See \`DESIGN-TOKENS.md\`.
`,
);

console.log(`Prepared ${entries.length} photos -> public/images`);
