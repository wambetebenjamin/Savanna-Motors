import { CarCard } from "@/components/CarCard";
import { Reveal } from "@/components/Reveal";
import type { Car } from "@/data/cars";

export function CarGrid({
  cars,
  columns = 4,
  sizes,
}: {
  cars: Car[];
  columns?: 3 | 4;
  sizes?: string;
}) {
  return (
    <div className={`sm-cars-grid${columns === 3 ? " sm-cars-grid--three" : ""}`}>
      {cars.map((car, index) => (
        <Reveal key={car.slug} index={index} step={70}>
          <CarCard car={car} sizes={sizes} />
        </Reveal>
      ))}
    </div>
  );
}
