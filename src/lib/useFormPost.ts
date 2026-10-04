"use client";

import { useState } from "react";

export type PostState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  reference?: string;
  whatsappLink?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function useFormPost(endpoint: string) {
  const [state, setState] = useState<PostState>({ status: "idle" });

  async function submit(payload: unknown) {
    setState({ status: "loading" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        issues?: Record<string, string[] | undefined>;
        reference?: string;
        whatsappLink?: string;
        message?: string;
      };

      if (!res.ok || !data.ok) {
        setState({
          status: "error",
          message: data.error ?? "Something went wrong. Please try again.",
          fieldErrors: data.issues,
        });
        return false;
      }

      setState({
        status: "success",
        message: data.message,
        reference: data.reference,
        whatsappLink: data.whatsappLink,
      });
      return true;
    } catch {
      setState({
        status: "error",
        message: "Network problem. Please check your connection and try again.",
      });
      return false;
    }
  }

  const reset = () => setState({ status: "idle" });

  return { state, submit, reset };
}

export const formToObject = (form: HTMLFormElement) =>
  Object.fromEntries(new FormData(form).entries());
