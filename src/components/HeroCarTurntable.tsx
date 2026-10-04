"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildCar, setCarOpacity, type CarModel, type CarShape } from "@/lib/three/carMeshes";
import {
  addLighting,
  clamp01,
  createEnvironment,
  createRenderer,
  disposeScene,
  easeInCubic,
  easeOutBack,
  easeOutExpo,
} from "@/lib/three/stage";

const HOLD_MS = 5200; // how long a car holds centre stage before handing over
const SWAP_MS = 1900; // length of the exit + entrance choreography
const SPIN = 0.0052; // radians per frame on the turntable

/** Exit and entrance overlap: the new car starts arriving 34% into the swap. */
const ENTER_AT = 0.34;

/** Showcase models — shape, bodywork colour and the inventory line it stands for. */
const MODELS: { shape: CarShape; color: string; label: string }[] = [
  { shape: "suv", color: "#1d2430", label: "Land Cruiser Prado TX" },
  { shape: "pickup", color: "#e9edf2", label: "Hilux Double Cab" },
  { shape: "sedan", color: "#aeb6c2", label: "Mercedes-Benz C200 AMG Line" },
  { shape: "hatchback", color: "#c0111f", label: "Volkswagen Golf TSI" },
  { shape: "coupe", color: "#101b33", label: "Mazda 6 Skyactiv" },
];

/**
 * Corner showcase: one fully shaded car turning slowly on its axis. Every few
 * seconds the current car accelerates away to the left — lifting, shrinking
 * and fading — while the next sweeps in from the right, settling into place
 * with a slight overshoot as the key light sweeps across its flank.
 *
 * Desktop only (hidden under 1025px in CSS), DPR capped, and the loop pauses
 * when the showcase scrolls out of view or the tab hides. Under reduced motion
 * the models still cycle, but they cut rather than fly.
 */
export function HeroCarTurntable() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1025px)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = createRenderer(mount, 1.75); // small canvas, can afford the pixels
    if (!renderer) return;

    const scene = new THREE.Scene();
    const environment = createEnvironment(renderer);
    scene.environment = environment.texture;

    const { key } = addLighting(scene);
    const keyHome = key.position.clone();

    const camera = new THREE.PerspectiveCamera(
      33,
      Math.max(mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1),
      0.1,
      100,
    );
    camera.position.set(5.5, 2.45, 6.6);
    camera.lookAt(0, 0.78, 0);

    const cars: CarModel[] = MODELS.map(({ shape, color }) => {
      const car = buildCar(shape, { color, shadow: true, lamps: true });
      car.group.rotation.y = Math.PI * 0.16;
      car.group.visible = false;
      scene.add(car.group);
      return car;
    });

    /** Resting pose — every car returns to exactly this before it holds. */
    const settle = (car: CarModel) => {
      car.group.position.set(0, 0, 0);
      car.group.scale.setScalar(1);
      setCarOpacity(car, 1);
    };

    let current = 0;
    let incoming = -1;
    let swapStart = 0;
    let lastSwap = performance.now();
    let spinAngle = Math.PI * 0.16;

    cars[0].group.visible = true;
    settle(cars[0]);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const beginSwap = (now: number) => {
      incoming = (current + 1) % cars.length;
      swapStart = now;
      const next = cars[incoming];
      next.group.visible = true;
      next.group.rotation.y = spinAngle;
      setModel(incoming);

      if (reduceMotion) {
        cars[current].group.visible = false;
        settle(next);
        current = incoming;
        incoming = -1;
        lastSwap = now;
      }
    };

    const runSwap = (now: number) => {
      const p = clamp01((now - swapStart) / SWAP_MS);
      const leaving = cars[current];
      const arriving = cars[incoming];

      // --- exit: accelerate away to the left, lift, shrink, fade out
      const out = easeInCubic(clamp01(p / (ENTER_AT + 0.3)));
      leaving.group.position.set(-6.4 * out, 0.42 * out, -1.5 * out);
      leaving.group.scale.setScalar(1 - 0.26 * out);
      setCarOpacity(leaving, 1 - Math.pow(out, 0.85));

      // --- entrance: sweep in from the right and settle with a slight overshoot
      const inT = clamp01((p - ENTER_AT) / (1 - ENTER_AT));
      const glide = easeOutExpo(inT);
      const pop = inT <= 0 ? 0 : easeOutBack(inT);
      arriving.group.position.set(7.2 * (1 - glide), 0.5 * (1 - glide), -1.2 * (1 - glide));
      arriving.group.scale.setScalar(0.82 + 0.18 * pop);
      setCarOpacity(arriving, clamp01(Math.pow(inT, 0.55)));

      // --- key light rakes across the bodywork as the new car lands
      const sweep = Math.sin(Math.PI * p);
      key.position.set(keyHome.x - 9 * sweep, keyHome.y, keyHome.z + 2.2 * sweep);
      key.intensity = 2.3 + 1.5 * sweep;

      if (p >= 1) {
        leaving.group.visible = false;
        settle(leaving);
        settle(arriving);
        key.position.copy(keyHome);
        key.intensity = 2.3;
        current = incoming;
        incoming = -1;
        lastSwap = now;
      }
    };

    let raf = 0;
    let running = true;

    const loop = (now: number) => {
      raf = 0;
      if (!running) return;

      if (!reduceMotion) spinAngle += SPIN;

      if (incoming === -1 && now - lastSwap > HOLD_MS) beginSwap(now);
      if (incoming !== -1) runSwap(now);

      cars.forEach((car, i) => {
        if (car.group.visible && (i === current || i === incoming)) {
          car.group.rotation.y = spinAngle;
        }
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const resume = () => {
      if (running && !raf) raf = requestAnimationFrame(loop);
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(mount);

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
      sizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onDocVisibility);
      cars.forEach((car) => car.dispose());
      disposeScene(scene);
      environment.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="sm-hero__turntable" aria-hidden="true">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <span className="sm-hero__turntable-label" key={model}>
        <span className="sm-hero__turntable-dot" />
        {MODELS[model].label}
        <span className="sm-hero__turntable-count">
          {model + 1}/{MODELS.length}
        </span>
      </span>
    </div>
  );
}
