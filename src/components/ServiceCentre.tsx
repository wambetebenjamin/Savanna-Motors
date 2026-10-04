"use client";

import { useState } from "react";
import { Clock, Wrench } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Reveal } from "@/components/Reveal";
import { SERVICES } from "@/data/content";
import { formatKesShort } from "@/lib/format";
import { useFormPost, formToObject } from "@/lib/useFormPost";
import { FormStatus, FieldError } from "@/components/forms/FormStatus";

function ServiceBookingForm({ service }: { service: string }) {
  const { state, submit } = useFormPost("/api/service-booking");

  return (
    <form
      className="sm-form-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ok = await submit({ ...formToObject(form), service });
        if (ok) form.reset();
      }}
    >
      <div className="sm-field">
        <label className="sm-label" htmlFor="sv-name">
          Full name
        </label>
        <input id="sv-name" name="name" className="sm-input" required autoComplete="name" />
        <FieldError errors={state.fieldErrors} name="name" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="sv-phone">
          Phone
        </label>
        <input id="sv-phone" name="phone" className="sm-input" required autoComplete="tel" />
        <FieldError errors={state.fieldErrors} name="phone" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="sv-email">
          Email (optional — we send a confirmation)
        </label>
        <input id="sv-email" name="email" type="email" className="sm-input" autoComplete="email" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="sv-vehicle">
          Vehicle
        </label>
        <input
          id="sv-vehicle"
          name="vehicle"
          className="sm-input"
          placeholder="2016 Toyota Prado, KDJ 441X"
          required
        />
        <FieldError errors={state.fieldErrors} name="vehicle" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="sv-date">
          Date
        </label>
        <input id="sv-date" name="date" type="date" className="sm-input" required />
        <FieldError errors={state.fieldErrors} name="date" />
      </div>

      <div className="sm-field">
        <label className="sm-label" htmlFor="sv-time">
          Drop-off time
        </label>
        <input id="sv-time" name="time" type="time" className="sm-input" required />
        <FieldError errors={state.fieldErrors} name="time" />
      </div>

      <div className="sm-field" style={{ gridColumn: "span 2" }}>
        <label className="sm-label" htmlFor="sv-notes">
          Symptoms or requests (optional)
        </label>
        <textarea id="sv-notes" name="notes" className="sm-textarea" rows={3} />
      </div>

      <button
        type="submit"
        className="sm-btn sm-btn--primary sm-btn--block"
        style={{ gridColumn: "span 2" }}
        disabled={state.status === "loading"}
      >
        <Wrench size={15} aria-hidden="true" />
        {state.status === "loading" ? "Booking…" : "Confirm Booking"}
      </button>

      <div style={{ gridColumn: "span 2" }}>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

export function ServiceCentre() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="sm-services">
        {SERVICES.map((service, index) => (
          <Reveal key={service.slug} index={index} step={80}>
            <article className="sm-service">
              <span className="sm-service__duration">
                <Clock size={13} aria-hidden="true" />
                {service.duration}
              </span>
              <h3 style={{ margin: 0, fontSize: "1.125rem" }}>{service.name}</h3>
              <p>{service.description}</p>
              <p className="sm-meta" style={{ margin: 0 }}>
                From {formatKesShort(service.fromKes)}
              </p>
              <button
                type="button"
                className="sm-btn sm-btn--outline sm-btn--sm"
                onClick={() => setActive(service.name)}
                style={{ marginTop: "var(--sm-space-3)" }}
              >
                Book Service
              </button>
            </article>
          </Reveal>
        ))}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={`Book: ${active ?? ""}`}
        subtitle="Savanna Motors Service Centre · Mombasa Road"
      >
        <ServiceBookingForm service={active ?? ""} />
      </Modal>
    </>
  );
}
