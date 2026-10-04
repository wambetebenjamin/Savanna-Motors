"use client";

import { MessageCircle } from "lucide-react";
import type { PostState } from "@/lib/useFormPost";

export function FormStatus({ state }: { state: PostState }) {
  if (state.status === "idle" || state.status === "loading") return null;

  return (
    <div className="sm-form-status" role="status" aria-live="polite">
      <strong style={{ display: "block", marginBottom: 4 }}>
        {state.status === "success" ? "Received." : "We could not send that."}
      </strong>
      <span>{state.message}</span>
      {state.reference ? (
        <span style={{ display: "block", marginTop: 6 }}>
          Reference: <strong>{state.reference}</strong>
        </span>
      ) : null}
      {state.status === "success" && state.whatsappLink ? (
        <a
          href={state.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="sm-btn sm-btn--primary sm-btn--sm"
          style={{ marginTop: 12 }}
        >
          <MessageCircle size={14} aria-hidden="true" />
          Continue on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function FieldError({
  errors,
  name,
}: {
  errors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return <span className="sm-error">{message}</span>;
}
