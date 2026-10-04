import { CARS, PRICE_BOUNDS, YEAR_BOUNDS, type Car } from "@/data/cars";

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "mileage-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "year-desc", label: "Year: newest first" },
  { value: "mileage-asc", label: "Mileage: lowest first" },
];

export type CarFilters = {
  q?: string;
  condition?: string[];
  make?: string[];
  model?: string[];
  transmission?: string[];
  fuel?: string[];
  body?: string[];
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
  sort: SortKey;
  page: number;
  perPage: number;
};

export const PER_PAGE = 8;

const list = (value: string | string[] | undefined | null): string[] | undefined => {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : value.split(",");
  const clean = arr.map((v) => v.trim()).filter(Boolean);
  return clean.length ? clean : undefined;
};

const num = (value: string | string[] | undefined | null, fallback: number) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function parseFilters(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
): CarFilters {
  const get = (key: string) =>
    params instanceof URLSearchParams ? params.getAll(key).join(",") : params[key];

  const sortRaw = Array.isArray(get("sort")) ? get("sort")![0] : (get("sort") as string);
  const sort = (SORT_OPTIONS.find((o) => o.value === sortRaw)?.value ?? "newest") as SortKey;

  return {
    q: (Array.isArray(get("q")) ? get("q")![0] : (get("q") as string)) || undefined,
    condition: list(get("condition")),
    make: list(get("make")),
    model: list(get("model")),
    transmission: list(get("transmission")),
    fuel: list(get("fuel")),
    body: list(get("body")),
    yearMin: num(get("yearMin"), YEAR_BOUNDS.min),
    yearMax: num(get("yearMax"), YEAR_BOUNDS.max),
    priceMin: num(get("priceMin"), PRICE_BOUNDS.min),
    priceMax: num(get("priceMax"), PRICE_BOUNDS.max),
    sort,
    page: Math.max(1, Math.floor(num(get("page"), 1))),
    perPage: Math.min(24, Math.max(4, Math.floor(num(get("perPage"), PER_PAGE)))),
  };
}

const matches = (values: string[] | undefined, value: string) =>
  !values || values.some((v) => v.toLowerCase() === value.toLowerCase());

export function filterCars(filters: CarFilters, source: Car[] = CARS) {
  const q = filters.q?.toLowerCase().trim();

  const filtered = source.filter((car) => {
    if (!matches(filters.condition, car.condition)) return false;
    if (!matches(filters.make, car.make)) return false;
    if (!matches(filters.model, car.model)) return false;
    if (!matches(filters.transmission, car.transmission)) return false;
    if (!matches(filters.fuel, car.fuelType)) return false;
    if (!matches(filters.body, car.bodyType)) return false;
    if (car.year < filters.yearMin || car.year > filters.yearMax) return false;
    if (car.priceKes < filters.priceMin || car.priceKes > filters.priceMax) return false;
    if (q) {
      const haystack =
        `${car.make} ${car.model} ${car.variant} ${car.year} ${car.bodyType} ${car.fuelType} ${car.color}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return a.priceKes - b.priceKes;
      case "price-desc":
        return b.priceKes - a.priceKes;
      case "year-desc":
        return b.year - a.year;
      case "mileage-asc":
        return a.mileageKm - b.mileageKm;
      default:
        return +new Date(b.createdAt) - +new Date(a.createdAt);
    }
  });

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / filters.perPage));
  const page = Math.min(filters.page, pages);
  const start = (page - 1) * filters.perPage;

  return {
    results: sorted.slice(start, start + filters.perPage),
    total,
    page,
    pages,
    perPage: filters.perPage,
  };
}

/** Serialises filter state back to URL params so every view is shareable. */
export function filtersToParams(filters: Partial<CarFilters>) {
  const params = new URLSearchParams();
  const push = (key: string, value?: string[] | string | number) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      return;
    }
    params.set(key, String(value));
  };

  push("q", filters.q);
  push("condition", filters.condition);
  push("make", filters.make);
  push("model", filters.model);
  push("transmission", filters.transmission);
  push("fuel", filters.fuel);
  push("body", filters.body);
  if (filters.yearMin !== undefined && filters.yearMin !== YEAR_BOUNDS.min)
    push("yearMin", filters.yearMin);
  if (filters.yearMax !== undefined && filters.yearMax !== YEAR_BOUNDS.max)
    push("yearMax", filters.yearMax);
  if (filters.priceMin !== undefined && filters.priceMin !== PRICE_BOUNDS.min)
    push("priceMin", filters.priceMin);
  if (filters.priceMax !== undefined && filters.priceMax !== PRICE_BOUNDS.max)
    push("priceMax", filters.priceMax);
  if (filters.sort && filters.sort !== "newest") push("sort", filters.sort);
  if (filters.page && filters.page > 1) push("page", filters.page);

  return params;
}

export function similarCars(car: Car, limit = 6) {
  return CARS.filter((c) => c.slug !== car.slug)
    .map((c) => {
      let score = 0;
      if (c.bodyType === car.bodyType) score += 3;
      if (c.make === car.make) score += 2;
      if (c.fuelType === car.fuelType) score += 1;
      if (Math.abs(c.priceKes - car.priceKes) < car.priceKes * 0.3) score += 2;
      return { car: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.car);
}
