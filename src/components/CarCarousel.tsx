import { CarCard } from "@/components/CarCard";
import type { Car } from "@/data/cars";

/** Horizontal snap carousel used for "similar cars" below a listing. */
export function CarCarousel({ cars }: { cars: Car[] }) {
  return (
    <div className="sm-carousel" role="list" aria-label="Similar cars">
      {cars.map((car) => (
        <div role="listitem" key={car.slug}>
          <CarCard car={car} sizes="(max-width: 768px) 80vw, 300px" />
        </div>
      ))}
    </div>
  );
}
