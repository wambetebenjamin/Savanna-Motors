import { NextResponse } from "next/server";
import { CARS } from "@/data/cars";

export const runtime = "nodejs";

/**
 * GET /api/verify-registration?plate=KDJ441X
 *
 * Kenya has no public vehicle-registration API; verification runs through the
 * NTSA TIMS partner endpoint when `NTSA_API_URL` + `NTSA_API_KEY` are configured.
 * Without credentials we answer from our own inspection records so the UI always
 * has something truthful to show.
 */
export async function GET(req: Request) {
  const plate = (new URL(req.url).searchParams.get("plate") ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

  if (!plate) {
    return NextResponse.json({ ok: false, error: "Provide a ?plate= value." }, { status: 400 });
  }

  const endpoint = process.env.NTSA_API_URL;
  const key = process.env.NTSA_API_KEY;

  if (endpoint && key) {
    try {
      const res = await fetch(`${endpoint}?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      if (res.ok) {
        return NextResponse.json({ ok: true, source: "ntsa", result: await res.json() });
      }
    } catch (error) {
      console.error("[ntsa:error]", error);
    }
  }

  const car = CARS.find((c) => c.registration.toUpperCase().replace(/\s+/g, " ") === plate);

  return NextResponse.json({
    ok: true,
    source: "savanna-inspection-records",
    verified: Boolean(car),
    result: car
      ? {
          plate: car.registration,
          make: car.make,
          model: `${car.model} ${car.variant}`,
          year: car.year,
          engineCc: car.engineCc,
          fuelType: car.fuelType,
          colour: car.color,
          condition: car.condition,
          listing: `/cars/${car.slug}`,
        }
      : null,
    note: car
      ? "Details confirmed against our 120-point inspection and import documentation."
      : "That plate is not in our current inventory. Bring the logbook to Mombasa Road and we will verify it with you.",
  });
}
