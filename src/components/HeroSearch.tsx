"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { MAKES, MODELS_BY_MAKE, YEAR_BOUNDS } from "@/data/cars";

const BUDGETS = [1500000, 2500000, 3500000, 5000000, 7500000, 10000000, 12000000];

export function HeroSearch() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [budget, setBudget] = useState("");

  const models = useMemo(() => (make ? MODELS_BY_MAKE[make] ?? [] : []), [make]);

  const years = useMemo(() => {
    const out: number[] = [];
    for (let y = YEAR_BOUNDS.max; y >= YEAR_BOUNDS.min; y -= 1) out.push(y);
    return out;
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (yearFrom) params.set("yearMin", yearFrom);
    if (budget) params.set("priceMax", budget);
    router.push(`/cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form className="sm-herosearch" onSubmit={submit} aria-label="Search cars">
      <div className="sm-herosearch__grid">
        <div className="sm-herosearch__cell sm-field">
          <label className="sm-label" htmlFor="hero-make">
            Make
          </label>
          <select
            id="hero-make"
            className="sm-select"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
            }}
          >
            <option value="">Any make</option>
            {MAKES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="sm-herosearch__cell sm-field">
          <label className="sm-label" htmlFor="hero-model">
            Model
          </label>
          <select
            id="hero-model"
            className="sm-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
          >
            <option value="">{make ? "Any model" : "Select a make first"}</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="sm-herosearch__cell sm-field">
          <label className="sm-label" htmlFor="hero-year">
            Year from
          </label>
          <select
            id="hero-year"
            className="sm-select"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          >
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="sm-herosearch__cell sm-field">
          <label className="sm-label" htmlFor="hero-budget">
            Max budget (KES)
          </label>
          <select
            id="hero-budget"
            className="sm-select"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="">No limit</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                Up to {new Intl.NumberFormat("en-KE").format(b)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="sm-btn sm-btn--primary sm-herosearch__submit">
          <Search size={15} aria-hidden="true" />
          Search Cars
        </button>
      </div>
    </form>
  );
}
