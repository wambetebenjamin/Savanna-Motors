"use client";

import Link from "next/link";
import { Check, Fuel, Gauge, Settings2 } from "lucide-react";
import { Photo } from "@/components/Photo";
import { useCompare } from "@/lib/compareStore";
import { carTitle, type Car } from "@/data/cars";
import { formatKesShort, formatMileage } from "@/lib/format";
import { waLink } from "@/lib/notify";

export function CarCard({ car, sizes }: { car: Car; sizes?: string }) {
  const slugs = useCompare((s) => s.slugs);
  const toggle = useCompare((s) => s.toggle);
  const selected = slugs.includes(car.slug);

  const enquiry = waLink(
    `Hello Savanna Motors! I am interested in the ${carTitle(car)} (${formatKesShort(
      car.priceKes,
    )}). Is it still available?`,
  );

  return (
    <article className="sm-card">
      <button
        type="button"
        className="sm-card__compare"
        data-active={selected}
        aria-pressed={selected}
        onClick={() => {
          const result = toggle(car.slug);
          if (result.full) {
            window.alert("You can compare up to 3 cars at a time.");
          }
        }}
      >
        {selected ? <Check size={12} aria-hidden="true" /> : null}
        Compare
      </button>

      <Link href={`/cars/${car.slug}`} className="sm-card__media" aria-label={carTitle(car)}>
        <span
          className={`sm-card__badge${car.condition === "Used" ? " sm-card__badge--used" : ""}`}
        >
          {car.condition}
        </span>
        <Photo
          name={car.photos[0]}
          alt={`${carTitle(car)} exterior`}
          sizes={sizes ?? "(max-width: 575px) 100vw, (max-width: 768px) 50vw, 25vw"}
        />
        <Photo
          name={car.photos[1]}
          alt={`${carTitle(car)} interior`}
          sizes={sizes ?? "(max-width: 575px) 100vw, (max-width: 768px) 50vw, 25vw"}
          className="sm-card__alt"
        />
      </Link>

      <div className="sm-card__body">
        <h3 className="sm-card__title">
          <Link href={`/cars/${car.slug}`}>{carTitle(car)}</Link>
        </h3>
        <p className="sm-meta" style={{ margin: 0 }}>
          {car.variant}
        </p>

        <div className="sm-card__specs">
          <span className="sm-card__spec">
            <Gauge size={13} aria-hidden="true" />
            {car.condition === "New" ? "Brand new" : formatMileage(car.mileageKm)}
          </span>
          <span className="sm-card__spec">
            <Fuel size={13} aria-hidden="true" />
            {car.engineCc ? `${(car.engineCc / 1000).toFixed(1)}L` : "EV"}
          </span>
          <span className="sm-card__spec">
            <Settings2 size={13} aria-hidden="true" />
            {car.transmission}
          </span>
        </div>

        <p className="sm-card__price">
          {formatKesShort(car.priceKes)}
          <small>{car.fuelType} · {car.bodyType}</small>
        </p>

        <div className="sm-card__actions">
          <Link href={`/cars/${car.slug}`} className="sm-btn sm-btn--secondary sm-btn--sm">
            View Details
          </Link>
          <a
            href={enquiry}
            target="_blank"
            rel="noopener noreferrer"
            className="sm-btn sm-btn--ghost sm-btn--sm"
          >
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}
