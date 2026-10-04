"use client";

import { Repeat } from "lucide-react";
import { useFormPost, formToObject } from "@/lib/useFormPost";
import { FormStatus, FieldError } from "@/components/forms/FormStatus";

export function TradeInForm() {
  const { state, submit } = useFormPost("/api/trade-in");

  return (
    <form
      className="sm-form-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ok = await submit(formToObject(form));
        if (ok) form.reset();
      }}
    >
      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-make">
          Car make
        </label>
        <input id="ti-make" name="make" className="sm-input" placeholder="Toyota" required />
        <FieldError errors={state.fieldErrors} name="make" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-model">
          Model
        </label>
        <input id="ti-model" name="model" className="sm-input" placeholder="Fielder" required />
        <FieldError errors={state.fieldErrors} name="model" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-year">
          Year of manufacture
        </label>
        <input
          id="ti-year"
          name="year"
          type="number"
          min={1980}
          max={new Date().getFullYear() + 1}
          className="sm-input"
          placeholder="2015"
          required
        />
        <FieldError errors={state.fieldErrors} name="year" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-mileage">
          Mileage (km)
        </label>
        <input
          id="ti-mileage"
          name="mileageKm"
          type="number"
          min={0}
          className="sm-input"
          placeholder="120000"
          required
        />
        <FieldError errors={state.fieldErrors} name="mileageKm" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-condition">
          Condition
        </label>
        <select id="ti-condition" name="condition" className="sm-select" defaultValue="Good">
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
          <option>Needs work</option>
        </select>
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="ti-phone">
          Phone number
        </label>
        <input
          id="ti-phone"
          name="phone"
          className="sm-input"
          placeholder="07xx xxx xxx"
          required
          autoComplete="tel"
        />
        <FieldError errors={state.fieldErrors} name="phone" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="ti-name">
          Your name
        </label>
        <input id="ti-name" name="name" className="sm-input" required autoComplete="name" />
        <FieldError errors={state.fieldErrors} name="name" />
      </div>

      <button
        type="submit"
        className="sm-btn sm-btn--primary sm-btn--block"
        style={{ gridColumn: "span 2" }}
        disabled={state.status === "loading"}
      >
        <Repeat size={15} aria-hidden="true" />
        {state.status === "loading" ? "Sending…" : "Get My Valuation"}
      </button>

      <div style={{ gridColumn: "span 2" }}>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
