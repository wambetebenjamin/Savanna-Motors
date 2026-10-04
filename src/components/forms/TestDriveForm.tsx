"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useFormPost, formToObject } from "@/lib/useFormPost";
import { FormStatus, FieldError } from "@/components/forms/FormStatus";
import { CARS } from "@/data/cars";

export function TestDriveForm({
  carSlug,
  carName,
}: {
  carSlug?: string;
  carName?: string;
}) {
  const { state, submit } = useFormPost("/api/test-drive");
  const [slug, setSlug] = useState(carSlug ?? "");
  const selected = CARS.find((c) => c.slug === slug);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = formToObject(form) as Record<string, string>;
    const wantsDeposit = values.reserveDeposit === "on";
    const ok = await submit({
      ...values,
      carName:
        carName ??
        (selected ? `${selected.year} ${selected.make} ${selected.model}` : "Any vehicle"),
      reserveDeposit: wantsDeposit,
    });

    if (ok && wantsDeposit) {
      // Refundable reservation deposit via M-Pesa Daraja (STK push).
      fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone, amount: 5000, carSlug }),
      }).catch(() => undefined);
    }

    if (ok) form.reset();
  };

  return (
    <form onSubmit={onSubmit} className="sm-form-grid">
      <div className="sm-field">
        <label className="sm-label" htmlFor="td-name">
          Full name
        </label>
        <input id="td-name" name="name" className="sm-input" required autoComplete="name" />
        <FieldError errors={state.fieldErrors} name="name" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="td-phone">
          Phone (Safaricom / Airtel)
        </label>
        <input
          id="td-phone"
          name="phone"
          className="sm-input"
          placeholder="07xx xxx xxx"
          required
          autoComplete="tel"
        />
        <FieldError errors={state.fieldErrors} name="phone" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="td-email">
          Email
        </label>
        <input
          id="td-email"
          name="email"
          type="email"
          className="sm-input"
          required
          autoComplete="email"
        />
        <FieldError errors={state.fieldErrors} name="email" />
      </div>

      {carSlug ? (
        <input type="hidden" name="carSlug" value={carSlug} />
      ) : (
        <div className="sm-field" style={{ gridColumn: "span 2" }}>
          <label className="sm-label" htmlFor="td-car">
            Which car?
          </label>
          <select
            id="td-car"
            name="carSlug"
            className="sm-select"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          >
            <option value="">Select a vehicle</option>
            {CARS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.year} {c.make} {c.model} — {c.variant}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors} name="carSlug" />
        </div>
      )}

      <div className="sm-field">
        <label className="sm-label" htmlFor="td-date">
          Preferred date
        </label>
        <input id="td-date" name="date" type="date" className="sm-input" required />
        <FieldError errors={state.fieldErrors} name="date" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="td-time">
          Preferred time
        </label>
        <input id="td-time" name="time" type="time" className="sm-input" required />
        <FieldError errors={state.fieldErrors} name="time" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="td-location">
          Where
        </label>
        <select id="td-location" name="location" className="sm-select" defaultValue="Mombasa Road Showroom">
          <option>Mombasa Road Showroom</option>
          <option>Home / office test drive</option>
        </select>
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="td-notes">
          Anything we should know? (optional)
        </label>
        <textarea id="td-notes" name="notes" className="sm-textarea" rows={3} />
      </div>

      <label className="sm-check" style={{ gridColumn: "span 2" }}>
        <input type="checkbox" name="reserveDeposit" />
        <span>
          Reserve this car with a refundable M-Pesa deposit of KES 5,000 (optional)
        </span>
      </label>

      <button
        type="submit"
        className="sm-btn sm-btn--primary sm-btn--block"
        style={{ gridColumn: "span 2" }}
        disabled={state.status === "loading"}
      >
        <CalendarCheck size={15} aria-hidden="true" />
        {state.status === "loading" ? "Booking…" : "Book Test Drive"}
      </button>

      <div style={{ gridColumn: "span 2" }}>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
