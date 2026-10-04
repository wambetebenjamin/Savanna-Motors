"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Photo } from "@/components/Photo";
import { CARS, carTitle } from "@/data/cars";
import { useCompare } from "@/lib/compareStore";
import { formatKesShort, formatMileage } from "@/lib/format";
import { waLink } from "@/lib/notify";

const ROWS = [
  { label: "Price", render: (slug: string) => fmt(slug, (c) => formatKesShort(c.priceKes)) },
  { label: "Make", render: (slug: string) => fmt(slug, (c) => c.make) },
  { label: "Model", render: (slug: string) => fmt(slug, (c) => `${c.model} ${c.variant}`) },
  { label: "Year", render: (slug: string) => fmt(slug, (c) => String(c.year)) },
  { label: "Condition", render: (slug: string) => fmt(slug, (c) => c.condition) },
  {
    label: "Mileage",
    render: (slug: string) =>
      fmt(slug, (c) => (c.condition === "New" ? "Brand new" : formatMileage(c.mileageKm))),
  },
  { label: "Engine", render: (slug: string) => fmt(slug, (c) => c.engineLabel) },
  { label: "Transmission", render: (slug: string) => fmt(slug, (c) => c.transmission) },
  { label: "Fuel", render: (slug: string) => fmt(slug, (c) => c.fuelType) },
  { label: "Body type", render: (slug: string) => fmt(slug, (c) => c.bodyType) },
  { label: "Colour", render: (slug: string) => fmt(slug, (c) => c.color) },
  { label: "Drive", render: (slug: string) => fmt(slug, (c) => c.drive) },
];

const fmt = (slug: string, pick: (car: (typeof CARS)[number]) => string) => {
  const car = CARS.find((c) => c.slug === slug);
  return car ? pick(car) : "—";
};

export function CompareTable() {
  const slugs = useCompare((s) => s.slugs);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <p>Loading your selection…</p>;

  if (!slugs.length) {
    return (
      <div className="sm-form-status">
        <strong style={{ display: "block", marginBottom: 6 }}>Nothing to compare yet.</strong>
        <span>
          Tick <strong>Compare</strong> on up to three cars in the listings and they will
          line up here side by side.
        </span>
        <div style={{ marginTop: "var(--sm-space-3)" }}>
          <Link href="/cars" className="sm-btn sm-btn--primary sm-btn--sm">
            Browse all cars
          </Link>
        </div>
      </div>
    );
  }

  const cars = slugs
    .map((slug) => CARS.find((c) => c.slug === slug))
    .filter(Boolean) as (typeof CARS)[number][];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--sm-space-3)",
          gap: "var(--sm-space-3)",
          flexWrap: "wrap",
        }}
      >
        <p className="sm-meta" style={{ margin: 0 }}>
          {cars.length} of 3 selected
        </p>
        <button type="button" className="sm-btn sm-btn--ghost sm-btn--sm" onClick={clear}>
          Clear all
        </button>
      </div>

      <div className="sm-compare-scroll">
        <table className="sm-compare-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sm-visually-hidden">Specification</span>
              </th>
              {cars.map((car, index) => (
                <th
                  key={car.slug}
                  scope="col"
                  className="sm-compare-col"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="sm-compare-thumb">
                    <Photo
                      name={car.photos[0]}
                      alt={`${carTitle(car)} exterior`}
                      sizes="(max-width: 768px) 60vw, 25vw"
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <Link
                      href={`/cars/${car.slug}`}
                      style={{
                        fontFamily: "var(--sm-font-heading)",
                        fontWeight: 700,
                        color: "var(--sm-secondary)",
                      }}
                    >
                      {carTitle(car)}
                    </Link>
                    <button
                      type="button"
                      className="sm-square sm-square--sm"
                      aria-label={`Remove ${carTitle(car)} from comparison`}
                      onClick={() => remove(car.slug)}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {cars.map((car) => (
                  <td key={car.slug}>{row.render(car.slug)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">Enquire</th>
              {cars.map((car) => (
                <td key={car.slug}>
                  <a
                    className="sm-btn sm-btn--primary sm-btn--sm sm-btn--block"
                    href={waLink(
                      `Hello Savanna Motors! I am comparing cars and I am interested in the ${carTitle(
                        car,
                      )} at ${formatKesShort(car.priceKes)}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    Enquire About This Car
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
