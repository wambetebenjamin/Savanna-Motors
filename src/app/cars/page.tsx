import { Suspense } from "react";
import type { Metadata } from "next";
import { Filters, SortSelect } from "@/components/Filters";
import { CarGrid } from "@/components/CarGrid";
import { Pagination } from "@/components/Pagination";
import { PageHeader } from "@/components/PageHeader";
import { filterCars, filtersToParams, parseFilters } from "@/lib/search";

/** SSR so that every filter combination renders live, accurate results. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse cars for sale in Nairobi",
  description:
    "Search new and certified used cars at Savanna Motors, Mombasa Road Nairobi. Filter by condition, make, model, year, price, transmission, fuel and body type.",
};

export default function CarsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFilters(searchParams);
  const { results, total, page, pages } = filterCars(filters);
  const params = filtersToParams(filters);

  return (
    <>
      <PageHeader
        title="Cars for sale"
        eyebrow="Inventory"
        lead="Everything currently on the floor at Mombasa Road. Filters update the web address, so you can share exactly what you are looking at."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Cars" }]}
        photo="showroomRow"
      />

      <section className="sm-section">
        <div className="sm-container">
          <div className="sm-browse">
            <Suspense fallback={<div aria-hidden="true" />}>
              <Filters total={total} />
            </Suspense>

            <div>
              <div className="sm-results-bar">
                <p className="sm-results-bar__count">
                  Showing <strong>{results.length}</strong> of <strong>{total}</strong>{" "}
                  vehicles
                  {page > 1 ? ` · page ${page} of ${pages}` : null}
                </p>
                <Suspense fallback={<div aria-hidden="true" />}>
                  <SortSelect />
                </Suspense>
              </div>

              {results.length ? (
                <>
                  <CarGrid
                    cars={results}
                    columns={3}
                    sizes="(max-width: 575px) 100vw, (max-width: 1024px) 50vw, 30vw"
                  />
                  <Pagination page={page} pages={pages} params={params} />
                </>
              ) : (
                <div className="sm-form-status">
                  <strong style={{ display: "block", marginBottom: 6 }}>
                    No cars match those filters.
                  </strong>
                  <span>
                    Try widening the price or year range — or send us an enquiry and we
                    will source it for you.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
