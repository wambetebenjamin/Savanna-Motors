"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  BODY_TYPES,
  FUEL_TYPES,
  MAKES,
  MODELS_BY_MAKE,
  PRICE_BOUNDS,
  TRANSMISSIONS,
  YEAR_BOUNDS,
} from "@/data/cars";
import { formatKesShort } from "@/lib/format";

const CONDITIONS = ["New", "Used"];

export function Filters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = useMemo(() => {
    const read = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
    return {
      condition: read("condition"),
      make: read("make"),
      model: read("model"),
      transmission: read("transmission"),
      fuel: read("fuel"),
      body: read("body"),
      yearMin: Number(params.get("yearMin") ?? YEAR_BOUNDS.min),
      yearMax: Number(params.get("yearMax") ?? YEAR_BOUNDS.max),
      priceMin: Number(params.get("priceMin") ?? PRICE_BOUNDS.min),
      priceMax: Number(params.get("priceMax") ?? PRICE_BOUNDS.max),
    };
  }, [params]);

  /** Every filter change is written to the URL so the view stays shareable. */
  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggleValue = (key: string, value: string) => {
    const list = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    update(key, next.length ? next.join(",") : null);
  };

  const availableModels = current.make.length
    ? current.make.flatMap((m) => MODELS_BY_MAKE[m] ?? [])
    : [];

  const clearAll = () => router.replace(pathname, { scroll: false });

  return (
    <>
      <button
        type="button"
        className="sm-btn sm-btn--outline sm-btn--sm sm-filter-toggle"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        Filters
      </button>

      {open ? (
        <div className="sm-filters-drawer__backdrop" onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className="sm-filters"
        data-drawer={open ? "open" : "closed"}
        aria-label="Filter cars"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--sm-space-3)",
          }}
        >
          <strong style={{ fontFamily: "var(--sm-font-heading)", color: "var(--sm-secondary)" }}>
            Filters
          </strong>
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="sm-btn sm-btn--ghost sm-btn--sm"
              onClick={clearAll}
            >
              Reset
            </button>
            <button
              type="button"
              className="sm-square sm-square--sm sm-filter-toggle"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </span>
        </div>

        <p className="sm-meta" style={{ marginBottom: "var(--sm-space-3)" }}>
          {total} vehicles match
        </p>

        <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="sm-filters__legend">Condition</legend>
          {CONDITIONS.map((c) => (
            <label key={c} className="sm-check">
              <input
                type="checkbox"
                checked={current.condition.includes(c)}
                onChange={() => toggleValue("condition", c)}
              />
              <span>{c}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="sm-filters__legend">Make</legend>
          {MAKES.map((m) => (
            <label key={m} className="sm-check">
              <input
                type="checkbox"
                checked={current.make.includes(m)}
                onChange={() => toggleValue("make", m)}
              />
              <span>{m}</span>
            </label>
          ))}
        </fieldset>

        {availableModels.length ? (
          <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="sm-filters__legend">Model</legend>
            {availableModels.map((m) => (
              <label key={m} className="sm-check">
                <input
                  type="checkbox"
                  checked={current.model.includes(m)}
                  onChange={() => toggleValue("model", m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </fieldset>
        ) : null}

        <div className="sm-filters__group">
          <span className="sm-filters__legend">Year from {current.yearMin}</span>
          <input
            className="sm-range"
            type="range"
            min={YEAR_BOUNDS.min}
            max={YEAR_BOUNDS.max}
            value={current.yearMin}
            aria-label="Minimum year"
            onChange={(e) =>
              update(
                "yearMin",
                e.target.value === String(YEAR_BOUNDS.min) ? null : e.target.value,
              )
            }
          />
          <span className="sm-filters__legend" style={{ marginTop: "var(--sm-space-2)" }}>
            Year up to {current.yearMax}
          </span>
          <input
            className="sm-range"
            type="range"
            min={YEAR_BOUNDS.min}
            max={YEAR_BOUNDS.max}
            value={current.yearMax}
            aria-label="Maximum year"
            onChange={(e) =>
              update(
                "yearMax",
                e.target.value === String(YEAR_BOUNDS.max) ? null : e.target.value,
              )
            }
          />
        </div>

        <div className="sm-filters__group">
          <span className="sm-filters__legend">
            Max price {formatKesShort(current.priceMax)}
          </span>
          <input
            className="sm-range"
            type="range"
            min={500000}
            max={PRICE_BOUNDS.max}
            step={250000}
            value={current.priceMax}
            aria-label="Maximum price"
            onChange={(e) =>
              update(
                "priceMax",
                Number(e.target.value) === PRICE_BOUNDS.max ? null : e.target.value,
              )
            }
          />
          <span className="sm-filters__legend" style={{ marginTop: "var(--sm-space-2)" }}>
            Min price {formatKesShort(current.priceMin)}
          </span>
          <input
            className="sm-range"
            type="range"
            min={0}
            max={PRICE_BOUNDS.max}
            step={250000}
            value={current.priceMin}
            aria-label="Minimum price"
            onChange={(e) =>
              update("priceMin", Number(e.target.value) === 0 ? null : e.target.value)
            }
          />
        </div>

        <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="sm-filters__legend">Transmission</legend>
          {TRANSMISSIONS.map((t) => (
            <label key={t} className="sm-check">
              <input
                type="checkbox"
                checked={current.transmission.includes(t)}
                onChange={() => toggleValue("transmission", t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="sm-filters__legend">Fuel type</legend>
          {FUEL_TYPES.map((f) => (
            <label key={f} className="sm-check">
              <input
                type="checkbox"
                checked={current.fuel.includes(f)}
                onChange={() => toggleValue("fuel", f)}
              />
              <span>{f}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="sm-filters__group" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="sm-filters__legend">Body type</legend>
          {BODY_TYPES.map((b) => (
            <label key={b} className="sm-check">
              <input
                type="checkbox"
                checked={current.body.includes(b)}
                onChange={() => toggleValue("body", b)}
              />
              <span>{b}</span>
            </label>
          ))}
        </fieldset>
      </aside>
    </>
  );
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="sm-field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <span className="sm-label" style={{ whiteSpace: "nowrap" }}>
        Sort by
      </span>
      <select
        className="sm-select"
        value={params.get("sort") ?? "newest"}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "newest") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        <option value="newest">Newest arrivals</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="year-desc">Year: newest first</option>
        <option value="mileage-asc">Mileage: lowest first</option>
      </select>
    </label>
  );
}
