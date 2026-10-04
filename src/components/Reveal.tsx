"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger position — multiplied by `step`. */
  index?: number;
  /** Milliseconds between staggered items (cards 70ms, service cards 80ms). */
  step?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Scroll-triggered fade-up. Honours prefers-reduced-motion by revealing instantly
 * with no stagger (handled in CSS).
 */
export function Reveal({ children, index = 0, step = 70, as, className }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={["sm-reveal", className].filter(Boolean).join(" ")}
      data-visible={visible}
      style={
        {
          "--sm-reveal-index": index,
          "--sm-reveal-step": `${step}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
