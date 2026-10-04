import type { PhotoKey } from "@/data/generated/photos";

export const USPS = [
  {
    icon: "check-circle" as const,
    title: "Certified Vehicles",
    body: "Every used car passes a 120-point mechanical and body inspection. Odometer and import papers verified.",
  },
  {
    icon: "calculator" as const,
    title: "Flexible Financing",
    body: "Asset finance from seven Kenyan banks, from 20% deposit over 12 to 60 months. Approval in 48 hours.",
  },
  {
    icon: "wrench" as const,
    title: "After-Sales Service",
    body: "A full service centre on site, genuine parts and a 3-year powertrain warranty on certified units.",
  },
  {
    icon: "repeat" as const,
    title: "Trade-In Option",
    body: "Bring your current car to Mombasa Road for a free valuation and offset it against your next drive.",
  },
];

export const STATS = [
  { value: 500, suffix: "+", label: "Cars Sold" },
  { value: 12, suffix: "", label: "Years in Business" },
  { value: 4.8, suffix: "", label: "Star Rating", decimals: 1 },
  { value: 3, suffix: "-Year", label: "Warranty" },
];

export type Service = {
  slug: string;
  name: string;
  description: string;
  duration: string;
  fromKes: number;
};

export const SERVICES: Service[] = [
  {
    slug: "full-service",
    name: "Full Service",
    description:
      "Engine oil and all filters, fluid top-ups, 40-point inspection and a written health report.",
    duration: "3 – 4 hours",
    fromKes: 12500,
  },
  {
    slug: "oil-change",
    name: "Oil Change",
    description:
      "Genuine or fully synthetic oil with a new filter, sump washer and reset service light.",
    duration: "45 minutes",
    fromKes: 6500,
  },
  {
    slug: "brake-check",
    name: "Brake Check",
    description:
      "Pad and disc measurement, calliper service, fluid moisture test and road test on the bypass.",
    duration: "1 hour",
    fromKes: 3500,
  },
  {
    slug: "tyre-replacement",
    name: "Tyre Replacement",
    description:
      "Supply and fitting, computerised balancing, four-wheel alignment and valve replacement.",
    duration: "1 – 2 hours",
    fromKes: 9000,
  },
  {
    slug: "diagnostics",
    name: "Diagnostics",
    description:
      "Full ECU scan on multi-brand equipment, live data analysis and a plain-language fault report.",
    duration: "1 hour",
    fromKes: 4000,
  },
  {
    slug: "body-work",
    name: "Body Work",
    description:
      "Panel beating, dent removal and oven-baked spray painting with colour matching to factory code.",
    duration: "2 – 5 days",
    fromKes: 25000,
  },
];

export type Testimonial = {
  name: string;
  car: string;
  rating: number;
  quote: string;
  /**
   * The vehicle the review is about — never a portrait of the reviewer.
   * Site-wide imagery policy is cars only, so the testimonial thumbnail shows
   * the model that was bought (the same shot that fronts its listing in CARS).
   */
  carPhoto: PhotoKey;
  location: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Brian Otieno",
    car: "Toyota Harrier 2018",
    rating: 5,
    quote:
      "I had been burnt by a Ngong Road dealer before, so I came to Mombasa Road with my own mechanic. Savanna handed over the inspection report before I even asked. Three months in, zero surprises.",
    carPhoto: "extBlackSuvCity",
    location: "Nairobi",
  },
  {
    name: "Amina Wanjiru",
    car: "Mazda Demio 2019",
    rating: 5,
    quote:
      "My first car ever. They explained the financing in plain language, showed me the total cost over four years and never pushed me into a bigger loan. The Demio has been perfect for town.",
    carPhoto: "extRedRain",
    location: "Westlands",
  },
  {
    name: "David Kiprotich",
    car: "Toyota Hilux Double Cab 2024",
    rating: 5,
    quote:
      "We bought four Hilux units for our Eldoret depot. Fleet pricing was honest, the logbooks came through in two weeks and their service centre handles the schedule for all of them.",
    carPhoto: "extWhitePickup",
    location: "Eldoret",
  },
  {
    name: "Grace Njeri",
    car: "Nissan X-Trail 2018",
    rating: 4,
    quote:
      "The hybrid battery report is what sold me. They also took my old Fielder on trade-in at a fair number — no haggling games, just a valuation sheet I could read.",
    carPhoto: "extBlackSuvUrban",
    location: "Karen",
  },
  {
    name: "Samuel & Faith Mwangi",
    car: "Subaru Forester XT 2017",
    rating: 5,
    quote:
      "We test drove on a Saturday morning, the whole family came. They let us take it up Limuru Road properly rather than around the block. Bought it the following week.",
    carPhoto: "extBlackSuvGreen",
    location: "Kiambu",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Buying Guide" | "Maintenance" | "Financing";
  date: string;
  readMinutes: number;
  photo: PhotoKey;
  author: string;
};

export const POSTS: BlogPost[] = [
  {
    slug: "importing-vs-buying-locally-kenya",
    title: "Importing versus buying locally: the real numbers for Kenyan buyers",
    excerpt:
      "Duty, IDF, railway levy, clearing and that 8-year rule — what a Japanese import actually costs once it lands in Mombasa, compared with buying off a Nairobi yard.",
    category: "Buying Guide",
    date: "2026-09-14",
    readMinutes: 7,
    photo: "extWhiteTruckLot",
    author: "Savanna Motors Sales Desk",
  },
  {
    slug: "service-schedule-kenyan-roads",
    title: "A service schedule that actually suits Kenyan roads",
    excerpt:
      "Manufacturer intervals assume smooth tarmac and clean fuel. Here is how we adjust oil, filter and suspension intervals for Nairobi traffic and upcountry murram.",
    category: "Maintenance",
    date: "2026-08-30",
    readMinutes: 6,
    photo: "extRedCobble",
    author: "Savanna Motors Service Centre",
  },
  {
    slug: "car-finance-kenya-deposit-guide",
    title: "How much deposit do you really need for car finance in Kenya?",
    excerpt:
      "Asset finance in Kenya typically runs 14% to 16% on a reducing balance. We break down deposits, tenure and the total cost of credit on a KES 3 million car.",
    category: "Financing",
    date: "2026-08-12",
    readMinutes: 8,
    photo: "extSilverPergola",
    author: "Savanna Motors Finance Desk",
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
