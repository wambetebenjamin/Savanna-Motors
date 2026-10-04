import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(9, "Enter a valid phone number")
  .max(20)
  .regex(/^[+0-9 ()-]+$/, "Enter a valid phone number");

const name = z.string().trim().min(2, "Enter your full name").max(80);
const email = z.string().trim().email("Enter a valid email address").max(120);

export const financingSchema = z.object({
  name,
  phone,
  email,
  carSlug: z.string().trim().max(120).optional(),
  carName: z.string().trim().max(160).optional(),
  carPrice: z.coerce.number().min(0).max(100_000_000),
  deposit: z.coerce.number().min(0).max(100_000_000),
  termMonths: z.coerce.number().int().min(12).max(60),
  interestRate: z.coerce.number().min(0).max(40),
  monthlyEstimate: z.coerce.number().min(0).max(100_000_000),
  employment: z.enum(["Employed", "Self-employed", "Company / Fleet"]),
  notes: z.string().trim().max(600).optional(),
});

export const testDriveSchema = z.object({
  name,
  phone,
  email,
  carSlug: z.string().trim().max(120),
  carName: z.string().trim().max(160),
  date: z.string().trim().min(4, "Choose a date"),
  time: z.string().trim().min(3, "Choose a time"),
  location: z.enum(["Mombasa Road Showroom", "Home / office test drive"]),
  reserveDeposit: z.boolean().optional(),
  notes: z.string().trim().max(600).optional(),
});

export const tradeInSchema = z.object({
  name,
  phone,
  make: z.string().trim().min(2, "Enter the make").max(40),
  model: z.string().trim().min(1, "Enter the model").max(40),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0).max(1_000_000),
  condition: z.enum(["Excellent", "Good", "Fair", "Needs work"]),
  notes: z.string().trim().max(600).optional(),
});

export const serviceBookingSchema = z.object({
  name,
  phone,
  email: email.optional().or(z.literal("")),
  service: z.string().trim().min(2).max(80),
  vehicle: z.string().trim().min(2, "Tell us the vehicle").max(80),
  date: z.string().trim().min(4, "Choose a date"),
  time: z.string().trim().min(3, "Choose a time"),
  notes: z.string().trim().max(600).optional(),
});

export const enquirySchema = z.object({
  name,
  phone,
  email,
  subject: z.string().trim().max(120).optional(),
  carSlug: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5, "Tell us how we can help").max(1200),
});

export const newsletterSchema = z.object({ email });

export type FinancingInput = z.infer<typeof financingSchema>;
export type TestDriveInput = z.infer<typeof testDriveSchema>;
export type TradeInInput = z.infer<typeof tradeInSchema>;
export type ServiceBookingInput = z.infer<typeof serviceBookingSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
