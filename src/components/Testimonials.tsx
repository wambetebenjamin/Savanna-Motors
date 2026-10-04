"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Photo } from "@/components/Photo";
import { TESTIMONIALS } from "@/data/content";

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % TESTIMONIALS.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div className="sm-testimonial">
        {TESTIMONIALS.map((t, index) => (
          <figure
            key={t.name}
            className="sm-testimonial__slide"
            data-active={index === active}
            aria-hidden={index !== active}
          >
            <div className="sm-testimonial__avatar">
              <Photo name={t.photo} alt={`${t.name}, Savanna Motors customer`} sizes="96px" />
            </div>
            <div>
              <div
                className="sm-testimonial__stars"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    aria-hidden="true"
                    fill={i < t.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <blockquote className="sm-testimonial__quote" style={{ margin: 0 }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: "var(--sm-space-3)" }}>
                <span className="sm-testimonial__name">{t.name}</span>
                <span style={{ display: "block" }} className="sm-testimonial__car">
                  {t.car} · {t.location}
                </span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <div className="sm-dots">
        {TESTIMONIALS.map((t, index) => (
          <button
            key={t.name}
            type="button"
            className="sm-dot"
            data-active={index === active}
            aria-label={`Show review from ${t.name}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
}
