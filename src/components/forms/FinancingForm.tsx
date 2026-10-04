"use client";

import { Calculator } from "lucide-react";
import { useFormPost, formToObject } from "@/lib/useFormPost";
import { FormStatus, FieldError } from "@/components/forms/FormStatus";

export function FinancingForm({
  carPrice,
  deposit,
  termMonths,
  interestRate,
  monthlyEstimate,
  carSlug,
  carName,
}: {
  carPrice: number;
  deposit: number;
  termMonths: number;
  interestRate: number;
  monthlyEstimate: number;
  carSlug?: string;
  carName?: string;
}) {
  const { state, submit } = useFormPost("/api/financing");

  return (
    <form
      className="sm-form-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ok = await submit({
          ...formToObject(form),
          carPrice,
          deposit,
          termMonths,
          interestRate,
          monthlyEstimate,
          carSlug,
          carName,
        });
        if (ok) form.reset();
      }}
    >
      <div className="sm-field">
        <label className="sm-label" htmlFor="fin-name">
          Full name
        </label>
        <input id="fin-name" name="name" className="sm-input" required autoComplete="name" />
        <FieldError errors={state.fieldErrors} name="name" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="fin-phone">
          Phone
        </label>
        <input id="fin-phone" name="phone" className="sm-input" required autoComplete="tel" />
        <FieldError errors={state.fieldErrors} name="phone" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="fin-email">
          Email
        </label>
        <input
          id="fin-email"
          name="email"
          type="email"
          className="sm-input"
          required
          autoComplete="email"
        />
        <FieldError errors={state.fieldErrors} name="email" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="fin-employment">
          Income type
        </label>
        <select id="fin-employment" name="employment" className="sm-select" defaultValue="Employed">
          <option>Employed</option>
          <option>Self-employed</option>
          <option>Company / Fleet</option>
        </select>
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="fin-notes">
          Anything else? (optional)
        </label>
        <textarea id="fin-notes" name="notes" className="sm-textarea" rows={3} />
      </div>

      <p className="sm-help" style={{ gridColumn: "span 2", margin: 0 }}>
        We share your application with the banks on our panel only. Approval usually takes
        48 hours and no deposit is payable to apply.
      </p>

      <button
        type="submit"
        className="sm-btn sm-btn--primary sm-btn--block"
        style={{ gridColumn: "span 2" }}
        disabled={state.status === "loading"}
      >
        <Calculator size={15} aria-hidden="true" />
        {state.status === "loading" ? "Sending…" : "Submit Application"}
      </button>

      <div style={{ gridColumn: "span 2" }}>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
