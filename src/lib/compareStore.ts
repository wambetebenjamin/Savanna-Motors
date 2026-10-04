"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MAX_COMPARE } from "@/data/site";

type CompareState = {
  slugs: string[];
  toggle: (slug: string) => { added: boolean; full: boolean };
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

/** Comparison selection — persisted to sessionStorage (max 3 cars). */
export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const { slugs } = get();
        if (slugs.includes(slug)) {
          set({ slugs: slugs.filter((s) => s !== slug) });
          return { added: false, full: false };
        }
        if (slugs.length >= MAX_COMPARE) return { added: false, full: true };
        set({ slugs: [...slugs, slug] });
        return { added: true, full: false };
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
      clear: () => set({ slugs: [] }),
      has: (slug) => get().slugs.includes(slug),
    }),
    {
      name: "savanna-compare",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as never) : window.sessionStorage,
      ),
      skipHydration: false,
    },
  ),
);
