"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildCar, CAR_SEQUENCE } from "@/lib/three/carMeshes";

const WIRE_COLOR = "#D81324"; // --sm-primary, taken from the design source
const WIRE_OPACITY = 0.2; // brief: wire-frame outline only, 0.2 opacity
const HOLD_MS = 6200; // time a car stays centred before the next one swipes in
const SWIPE_MS = 1100;
const OFFSCREEN_X = 11;

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Hero WebGL layer.
 *
 * A low-poly car silhouette rotates slowly on its Y axis on the right of the hero;
 * after a few seconds the next car swipes in from the right and takes over the
 * rotation. Desktop only (hidden under 1024px in CSS), DPR limited to 1.5, and the
 * render loop is paused whenever the hero leaves the viewport.
 */
export function HeroCars3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState(CAR_SEQUENCE[0].label);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (typeof window === "undefined") return;

    // Respect the user's motion preference: show a single static silhouette.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // no WebGL — the hero simply renders without the canvas
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
    camera.position.set(6.4, 3.1, 7.6);
    camera.lookAt(0, 0.75, 0);

    const cars = CAR_SEQUENCE.map(({ shape }) => {
      const car = buildCar(shape, WIRE_COLOR, WIRE_OPACITY);
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

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    // Pause the loop when the canvas scrolls out of view.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running && !raf) {
          lastSwap = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.01 },
    );
    visibility.observe(mount);

    const onDocVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !raf) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onDocVisibility);

    function frame(now: number) {
      raf = 0;
      if (!running) return;

      const spin = reduceMotion ? 0 : 0.0045;

      if (incoming === -1 && now - lastSwap > HOLD_MS) {
        incoming = (current + 1) % cars.length;
        swipeStart = now;
        cars[incoming].visible = true;
        cars[incoming].position.x = reduceMotion ? 0 : OFFSCREEN_X;
        cars[incoming].rotation.y = cars[current].rotation.y;
        setCarOpacity(cars[incoming], reduceMotion ? 1 : 0);
        setLabel(CAR_SEQUENCE[incoming].label);

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
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onDocVisibility);
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
  }, []);

  return (
    <div className="sm-hero__canvas" aria-hidden="true">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <span className="sm-hero__canvas-label">{label}</span>
    </div>
  );
}
