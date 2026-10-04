import { NextResponse } from "next/server";
import { getCar } from "@/data/cars";
import { PHOTOS } from "@/data/generated/photos";
import { SITE } from "@/data/site";
import { monthlyInstallment } from "@/lib/format";
import { similarCars } from "@/lib/search";

export const revalidate = 300;

/** GET /api/cars/[slug] — a single car with the full specification. */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const car = getCar(params.slug);
  if (!car) {
    return NextResponse.json({ ok: false, error: "Car not found" }, { status: 404 });
  }

  const monthly = monthlyInstallment(
    car.priceKes * (1 - SITE.financeDepositDefaultPct / 100),
    SITE.financeRateDefault,
    SITE.financeTermDefaultMonths,
  );

  return NextResponse.json(
    {
      ok: true,
      car: {
        ...car,
        url: `${SITE.url}/cars/${car.slug}`,
        images: car.photos.map((p) => ({
          url: PHOTOS[p].remote,
          local: PHOTOS[p].local,
          credit: PHOTOS[p].credit,
        })),
        finance: {
          depositPercent: SITE.financeDepositDefaultPct,
          termMonths: SITE.financeTermDefaultMonths,
          interestRate: SITE.financeRateDefault,
          monthlyEstimateKes: Math.round(monthly),
        },
      },
      similar: similarCars(car, 4).map((c) => ({
        slug: c.slug,
        title: `${c.year} ${c.make} ${c.model}`,
        priceKes: c.priceKes,
        url: `/cars/${c.slug}`,
      })),
    },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } },
  );
}
