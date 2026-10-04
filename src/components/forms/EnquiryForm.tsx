"use client";

import { Send } from "lucide-react";
import { useFormPost, formToObject } from "@/lib/useFormPost";
import { FormStatus, FieldError } from "@/components/forms/FormStatus";

export function EnquiryForm({
  carSlug,
  subject,
}: {
  carSlug?: string;
  subject?: string;
}) {
  const { state, submit } = useFormPost("/api/enquiry");

  return (
    <form
      className="sm-form-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ok = await submit({ ...formToObject(form), carSlug, subject });
        if (ok) form.reset();
      }}
    >
      <div className="sm-field">
        <label className="sm-label" htmlFor="en-name">
          Full name
        </label>
        <input id="en-name" name="name" className="sm-input" required autoComplete="name" />
        <FieldError errors={state.fieldErrors} name="name" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="en-phone">
          Phone
        </label>
        <input id="en-phone" name="phone" className="sm-input" required autoComplete="tel" />
        <FieldError errors={state.fieldErrors} name="phone" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="en-email">
          Email
        </label>
        <input
          id="en-email"
          name="email"
          type="email"
          className="sm-input"
          required
          autoComplete="email"
        />
        <FieldError errors={state.fieldErrors} name="email" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="en-message">
          How can we help?
        </label>
        <textarea id="en-message" name="message" className="sm-textarea" rows={5} required />
        <FieldError errors={state.fieldErrors} name="message" />
      </div>

      <button
        type="submit"
        className="sm-btn sm-btn--primary sm-btn--block"
        style={{ gridColumn: "span 2" }}
        disabled={state.status === "loading"}
      >
        <Send size={15} aria-hidden="true" />
        {state.status === "loading" ? "Sending…" : "Send Enquiry"}
      </button>

      <div style={{ gridColumn: "span 2" }}>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
