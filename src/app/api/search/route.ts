import { NextResponse } from "next/server";
import { PHOTOS } from "@/data/generated/photos";
import { filterCars, parseFilters } from "@/lib/search";

/**
 * GET /api/search — filter by make, model, price, year, condition, transmission,
 * fuel and body type. Mirrors the query parameters used by /cars so any result set
 * is shareable between the UI and the API.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filters = parseFilters(url.searchParams);
  const { results, total, page, pages } = filterCars(filters);

  return NextResponse.json({
    ok: true,
    query: Object.fromEntries(url.searchParams.entries()),
    total,
    page,
    pages,
    results: results.map((car) => ({
      slug: car.slug,
      title: `${car.year} ${car.make} ${car.model}`,
      variant: car.variant,
      condition: car.condition,
      priceKes: car.priceKes,
      mileageKm: car.mileageKm,
      transmission: car.transmission,
      fuelType: car.fuelType,
      bodyType: car.bodyType,
      year: car.year,
      image: PHOTOS[car.photos[0]].remote,
      url: `/cars/${car.slug}`,
    })),
  });
}
