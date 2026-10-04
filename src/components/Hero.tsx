"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { Photo } from "@/components/Photo";
import { HeroSearch } from "@/components/HeroSearch";
import type { PhotoKey } from "@/data/generated/photos";

const HeroCars3D = dynamic(
  () => import("@/components/HeroCars3D").then((m) => m.HeroCars3D),
  { ssr: false },
);

const HeroCarTurntable = dynamic(
  () => import("@/components/HeroCarTurntable").then((m) => m.HeroCarTurntable),
  { ssr: false },
);

const HEADLINE = "Find Your Perfect Drive.";
const SLIDE_MS = 6800; // time each hero photograph stays before crossfading

/**
 * Hero photographs that crossfade one into the next. The 3D traffic layer
 * renders behind them (see HeroCars3D) and reads through the translucent,
 * bottom-masked stack.
 */
const SLIDES: { name: PhotoKey; alt: string }[] = [
  {
    name: "extBlackSuvNight",
    alt: "Black SUV parked outside glowing city restaurant lights at night",
  },
  {
    name: "heroHighwayDrive",
    alt: "White sports car cruising along the open highway at golden hour",
  },
  {
    name: "showroomRow",
    alt: "A row of new cars lined up inside the Savanna Motors showroom",
  },
  {
    name: "extOffroad4x4",
    alt: "Classic 4x4 facing forward in open rocky country under a moody sky",
  },
];

export function Hero() {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const [slide, setSlide] = useState(0);

  // Crossfade between the hero photographs.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  // Parallax on the whole backdrop (3D cars + photographs) at 0.2 scroll speed.
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
        {/* 3D cars driving across, behind the transitioning photographs */}
        <HeroCars3D />
        <div className="sm-hero__slides">
          {SLIDES.map((s, i) => (
            <div
              key={s.name}
              className="sm-hero__slide"
              style={{ opacity: i === slide ? 1 : 0 }}
              aria-hidden={i !== slide}
            >
              <Photo name={s.name} alt={s.alt} sizes="100vw" priority={i === 0} />
            </div>
          ))}
        </div>
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

            {/* corner showcase: rotating wire-frame model, switching occasionally */}
            <HeroCarTurntable />
          </div>

          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
