"use client";

import { Send } from "lucide-react";
import { useFormPost, formToObject } from "@/lib/useFormPost";

export function NewsletterForm() {
  const { state, submit } = useFormPost("/api/newsletter");

  return (
    <form
      className="sm-newsletter"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ok = await submit(formToObject(form));
        if (ok) form.reset();
      }}
    >
      <input
        type="email"
        name="email"
        required
        placeholder="Your email for new arrivals"
        aria-label="Email address"
      />
      <button
        type="submit"
        className="sm-btn sm-btn--primary"
        disabled={state.status === "loading"}
        aria-label="Subscribe"
      >
        <Send size={14} aria-hidden="true" />
      </button>
      {state.status !== "idle" && state.status !== "loading" ? (
        <span className="sm-visually-hidden">{state.message}</span>
      ) : null}
    </form>
  );
}
