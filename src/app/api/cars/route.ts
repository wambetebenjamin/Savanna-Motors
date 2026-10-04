import { NextResponse } from "next/server";
import { CARS } from "@/data/cars";
import { PHOTOS } from "@/data/generated/photos";
import { kv } from "@/lib/kv";
import { parseFilters, filterCars } from "@/lib/search";

/**
 * GET /api/cars — paginated inventory.
 *
 * Inventory is served from Vercel KV when a store is attached (key
 * `savanna:inventory`), falling back to the bundled catalogue otherwise.
 */
export const revalidate = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filters = parseFilters(url.searchParams);

  let source = CARS;
  if (kv.enabled) {
    const stored = await kv.listRecords<(typeof CARS)[number]>("savanna:inventory", 200);
    if (stored.length) source = stored;
  }

  const { results, total, page, pages, perPage } = filterCars(filters, source);

  return NextResponse.json(
    {
      ok: true,
      page,
      pages,
      perPage,
      total,
      source: kv.enabled ? "vercel-kv" : "catalogue",
      results: results.map((car) => ({
        ...car,
        image: PHOTOS[car.photos[0]].remote,
        url: `/cars/${car.slug}`,
      })),
    },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } },
  );
}
