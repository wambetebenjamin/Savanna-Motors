"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildCar, type CarShape } from "@/lib/three/carMeshes";

const WIRE_COLOR = "#D81324"; // --sm-primary, taken from the design source
const WIRE_OPACITY = 0.26; // slightly brighter than the background traffic
const HOLD_MS = 6500; // how long a model shows before the next one drives in
const SWIPE_MS = 1100;
const OFFSCREEN_X = 6.5;

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Corner showcase: one wire-frame car turning slowly on its axis, switching to
 * a new model every few seconds — the next silhouette drives in and takes over
 * the rotation. Labels come from real inventory lines.
 */
const MODELS: { shape: CarShape; label: string }[] = [
  { shape: "suv", label: "Land Cruiser Prado TX" },
  { shape: "pickup", label: "Hilux Double Cab" },
  { shape: "sedan", label: "Mercedes-Benz C200 AMG Line" },
  { shape: "hatchback", label: "Volkswagen Golf TSI" },
  { shape: "coupe", label: "Mazda 6 Skyactiv" },
];

/**
 * Desktop only (hidden under 1025px in CSS), DPR capped at 1.5, and the loop
 * pauses when the showcase scrolls out of view or the tab hides. With
 * reduced-motion the models still cycle but without rotation or swipes.
 */
export function HeroCarTurntable() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1025px)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      Math.max(mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1),
      0.1,
      100,
    );
    camera.position.set(5.6, 2.6, 6.4);
    camera.lookAt(0, 0.62, 0);

    const cars = MODELS.map(({ shape }) => {
      const car = buildCar(shape, WIRE_COLOR, WIRE_OPACITY); // ring on — parked display
      car.traverse((child) => {
        const mesh = child as THREE.LineSegments;
        if (mesh.material) {
          const m = mesh.material as THREE.Material & { opacity: number };
          m.userData.baseOpacity = m.opacity;
        }
      });
      car.position.x = OFFSCREEN_X;
      car.visible = false;
      scene.add(car);
      return car;
    });

    const setCarOpacity = (car: THREE.Group, factor: number) => {
      car.traverse((child) => {
        const mesh = child as THREE.LineSegments;
        const m = mesh.material as (THREE.Material & { opacity: number }) | undefined;
        if (m && typeof m.userData.baseOpacity === "number") {
          m.opacity = m.userData.baseOpacity * factor;
        }
      });
    };

    let current = 0;
    let incoming = -1;
    let swipeStart = 0;
    let lastSwap = performance.now();
    let raf = 0;
    let running = true;

    cars[0].visible = true;
    cars[0].position.x = 0;
    setCarOpacity(cars[0], 1);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const dispose = () => {
      scene.traverse((child) => {
        const mesh = child as THREE.LineSegments;
        mesh.geometry?.dispose?.();
        const m = mesh.material as THREE.Material | undefined;
        m?.dispose?.();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const loop = (now: number) => {
      raf = 0;
      if (!running) return;

      const spin = reduceMotion ? 0 : 0.0042;

      if (incoming === -1 && now - lastSwap > HOLD_MS) {
        incoming = (current + 1) % cars.length;
        swipeStart = now;
        cars[incoming].visible = true;
        cars[incoming].position.x = reduceMotion ? 0 : OFFSCREEN_X;
        cars[incoming].rotation.y = cars[current].rotation.y;
        setCarOpacity(cars[incoming], reduceMotion ? 1 : 0);
        setModel(incoming);

        if (reduceMotion) {
          cars[current].visible = false;
          current = incoming;
          incoming = -1;
          lastSwap = now;
        }
      }

      if (incoming !== -1) {
        const t = Math.min((now - swipeStart) / SWIPE_MS, 1);
        const e = easeOutQuint(t);
        cars[incoming].position.x = OFFSCREEN_X * (1 - e);
        setCarOpacity(cars[incoming], e);
        cars[current].position.x = -OFFSCREEN_X * e;
        setCarOpacity(cars[current], 1 - e);
        if (t >= 1) {
          cars[current].visible = false;
          cars[current].position.x = OFFSCREEN_X;
          current = incoming;
          incoming = -1;
          lastSwap = now;
        }
      }

      cars.forEach((car, i) => {
        if (!car.visible) return;
        if (i === current || i === incoming) car.rotation.y += spin;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const resume = () => {
      if (running && !raf) raf = requestAnimationFrame(loop);
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && document.visibilityState === "visible";
        resume();
      },
      { threshold: 0.01 },
    );
    visibility.observe(mount);

    const onDocVisibility = () => {
      running = document.visibilityState === "visible";
      resume();
    };
    document.addEventListener("visibilitychange", onDocVisibility);

    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onDocVisibility);
      dispose();
    };
  }, []);

  return (
    <div className="sm-hero__turntable" aria-hidden="true">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <span className="sm-hero__turntable-label">
        <span className="sm-hero__turntable-dot" />
        {MODELS[model].label}
        <span className="sm-hero__turntable-count">
          {model + 1}/{MODELS.length}
        </span>
      </span>
    </div>
  );
}
