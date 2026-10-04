export const SITE = {
  name: "Savanna Motors",
  legalName: "Savanna Motors Ltd",
  tagline: "Find Your Perfect Drive.",
  description:
    "New and certified used cars, flexible financing and a full service centre on Mombasa Road, Nairobi. Book a test drive with Savanna Motors.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://savannamotors.co.ke",
  locale: "en_KE",
  currency: "KES",
  phoneDisplay: "+254 112 272 061",
  phone: "+254112272061",
  whatsapp: "254112272061",
  email: "sales@savannamotors.co.ke",
  serviceEmail: "service@savannamotors.co.ke",
  address: {
    street: "Savanna Motors Centre, Mombasa Road",
    locality: "Nairobi",
    region: "Nairobi County",
    postalCode: "00100",
    country: "KE",
    full: "Savanna Motors Centre, Mombasa Road, Nairobi, Kenya",
  },
  geo: { lat: -1.3209, lng: 36.8513 },
  hours: [
    { day: "Monday – Friday", time: "08:00 – 18:00" },
    { day: "Saturday", time: "08:30 – 17:00" },
    { day: "Sunday", time: "10:00 – 15:00" },
    { day: "Public holidays", time: "By appointment" },
  ],
  social: [
    { label: "Facebook", href: "https://facebook.com/savannamotorske" },
    { label: "Instagram", href: "https://instagram.com/savannamotorske" },
    { label: "X", href: "https://x.com/savannamotorske" },
    { label: "LinkedIn", href: "https://linkedin.com/company/savannamotorske" },
    { label: "YouTube", href: "https://youtube.com/@savannamotorske" },
  ],
  paymentPartners: [
    "M-Pesa",
    "KCB Bank",
    "Equity Bank",
    "NCBA Asset Finance",
    "Absa Vehicle Finance",
    "Stanbic Bank",
    "Co-operative Bank",
  ],
  /**
   * Indicative asset-finance rate used to pre-fill the financing calculator.
   * Kenyan banks price vehicle asset finance off the CBK Central Bank Rate plus a
   * margin; this is reviewed quarterly by the Savanna Motors finance desk.
   */
  financeRateDefault: 14.5,
  financeTermDefaultMonths: 48,
  financeDepositDefaultPct: 20,
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars?condition=New", label: "New Cars" },
  { href: "/cars?condition=Used", label: "Used Cars" },
  { href: "/financing", label: "Financing" },
  { href: "/service", label: "Service Centre" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const MAX_COMPARE = 3;
