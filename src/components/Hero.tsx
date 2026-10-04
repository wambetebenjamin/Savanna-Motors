"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { Photo } from "@/components/Photo";
import { HeroSearch } from "@/components/HeroSearch";

const HeroCars3D = dynamic(
  () => import("@/components/HeroCars3D").then((m) => m.HeroCars3D),
  { ssr: false },
);

const HEADLINE = "Find Your Perfect Drive.";

export function Hero() {
  const mediaRef = useRef<HTMLDivElement | null>(null);

  // Parallax on the hero photograph at 0.2 scroll speed.
  useEffect(() => {
    const node = mediaRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const offset = Math.min(window.scrollY, window.innerHeight * 1.4) * 0.2;
      node.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="sm-hero" aria-labelledby="hero-title">
      <div className="sm-hero__media" ref={mediaRef}>
        <Photo
          name="heroNairobiStreet"
          alt="Traffic on a Nairobi street with the city skyline behind"
          sizes="100vw"
          priority
        />
      </div>
      <div className="sm-hero__scrim" />

      <div className="sm-hero__inner">
        <div className="sm-container">
          <div className="sm-hero__grid">
            <div>
              <span className="sm-eyebrow sm-hero__eyebrow">
                Mombasa Road, Nairobi
              </span>

              <h1 id="hero-title">
                {HEADLINE.split(" ").map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    className="sm-hero__word"
                    style={{ ["--sm-word-index" as string]: i }}
                  >
                    {word}
                  </span>
                ))}
              </h1>

              <p className="sm-hero__sub">
                New and Certified Used Cars. Flexible Financing. Nairobi&rsquo;s Most
                Trusted Dealership.
              </p>

              <div className="sm-hero__trust">
                <span>
                  <BadgeCheck size={16} aria-hidden="true" /> 120-point certified
                </span>
                <span>
                  <ShieldCheck size={16} aria-hidden="true" /> 3-year warranty
                </span>
                <span>
                  <MapPin size={16} aria-hidden="true" /> Showroom on Mombasa Road
                </span>
              </div>
            </div>

            <HeroCars3D />
          </div>

          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
