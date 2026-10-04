"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildCar, setCarOpacity, type CarModel, type CarShape } from "@/lib/three/carMeshes";
import {
  addLighting,
  createEnvironment,
  createRenderer,
  disposeScene,
} from "@/lib/three/stage";

const FOV = 32;
const EDGE_FADE = 3.2; // world units over which a car fades in / out at the edges

/* Camera looking slightly down the road. Lane heights below are solved against
   this framing so the near lane lands around 85% of the hero height and the far
   lane around 76% — i.e. inside the band the photograph mask clears, which is
   what makes the cars read as driving on a road beneath the picture rather than
   floating over it. Move the camera and both lane heights need re-solving. */
const CAMERA = { y: 2.4, z: 13 };
const LOOK_AT_Y = 0.4;

type Lane = {
  /** depth — nearer the camera reads lower and larger on screen */
  z: number;
  /** ground height for this lane, solved against the framing above */
  y: number;
  scale: number;
  /** travel direction: -1 = right → left, 1 = left → right */
  dir: -1 | 1;
  opacity: number;
  speed: [min: number, max: number];
  count: number;
};

// Kenyan left-hand traffic: the near (lower) lane runs right → left, the far
// lane runs left → right, like the carriageways of Mombasa Road.
const LANES: Lane[] = [
  { z: 4.2, y: -0.86, scale: 0.64, dir: -1, opacity: 0.66, speed: [2.4, 3.1], count: 3 },
  { z: -3.2, y: -2.5, scale: 0.44, dir: 1, opacity: 0.34, speed: [1.3, 1.9], count: 3 },
];

const SHAPES: CarShape[] = ["suv", "sedan", "pickup", "coupe", "hatchback"];

/** Muted, road-at-dusk bodywork so the traffic never competes with the photo. */
const PAINT = ["#20283a", "#5d6472", "#8f98a6", "#2d3440", "#7a1420", "#3c4452"];

type Vehicle = {
  car: CarModel;
  lane: Lane;
  x: number;
  speed: number;
  bobPhase: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Full-bleed hero WebGL layer behind the photographs. Fully shaded cars drive
 * continuously across the hero in two opposing lanes, with perspective depth,
 * edge fade-in/out, rolling wheels, lit lamps and a subtle road bob.
 *
 * Desktop only (no WebGL init under 1025px — CSS also hides the holder), DPR
 * capped, and the loop pauses when the hero scrolls out of view or the tab
 * hides. Under reduced motion a single static frame is drawn.
 */
export function HeroCars3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    // Keep phones and tablets light — the canvas is hidden below 1025px in CSS.
    if (!window.matchMedia("(min-width: 1025px)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = createRenderer(mount, 1.25); // full-bleed canvas, keep the fill rate down
    if (!renderer) return;

    const scene = new THREE.Scene();
    const environment = createEnvironment(renderer);
    scene.environment = environment.texture;
    addLighting(scene, 0.85);

    const camera = new THREE.PerspectiveCamera(
      FOV,
      Math.max(mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1),
      0.1,
      100,
    );
    camera.position.set(0, CAMERA.y, CAMERA.z);
    camera.lookAt(0, LOOK_AT_Y, 0);

    // World-space half-width of the view at a given depth, so cars fade in
    // just off-screen and fully exit before they wrap around.
    const halfWidthAt = (laneZ: number) =>
      Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (camera.position.z - laneZ) * camera.aspect;

    const vehicles: Vehicle[] = [];
    let paintIndex = 0;

    LANES.forEach((lane) => {
      for (let i = 0; i < lane.count; i += 1) {
        const car = buildCar(SHAPES[(i + lane.count) % SHAPES.length], {
          color: PAINT[paintIndex++ % PAINT.length],
          shadow: false, // nothing to cast onto — the backdrop is the photograph
          lamps: true,
        });
        car.group.rotation.y = lane.dir === 1 ? 0 : Math.PI; // face travel direction
        car.group.scale.setScalar(lane.scale);
        car.group.position.set(0, lane.y, lane.z);
        setCarOpacity(car, lane.opacity);
        scene.add(car.group);

        // Stratified spawn so cars never start clustered.
        const offX = halfWidthAt(lane.z) + 6;
        const x = lane.dir * -offX + lane.dir * 2 * offX * ((i + rand(0.1, 0.9)) / lane.count);

        vehicles.push({
          car,
          lane,
          x,
          speed: rand(lane.speed[0], lane.speed[1]),
          bobPhase: Math.random() * Math.PI * 2,
        });
      }
    });

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const frame = (now: number, last: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp after the tab sleeps

      vehicles.forEach((v) => {
        const offX = halfWidthAt(v.lane.z) + 3;
        v.x += v.lane.dir * v.speed * dt;
        if (v.x > offX) v.x -= offX * 2;
        if (v.x < -offX) v.x += offX * 2;

        v.car.group.position.x = v.x;
        v.car.group.position.y = v.lane.y + Math.sin(now * 0.002 + v.bobPhase) * 0.014;

        // Fade across the screen edges so cars never pop in or out.
        const edge = offX - Math.abs(v.x);
        setCarOpacity(v.car, v.lane.opacity * THREE.MathUtils.clamp(edge / EDGE_FADE, 0, 1));

        // Angular speed from ground speed, corrected for the group's scale.
        v.car.wheels.forEach((wheel) => {
          wheel.rotation.z -= (v.speed * dt) / (v.car.wheelRadius * v.lane.scale);
        });
      });

      renderer.render(scene, camera);
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(mount);

    const teardown = () => {
      sizeObserver.disconnect();
      vehicles.forEach((v) => v.car.dispose());
      disposeScene(scene);
      environment.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };

    if (reduceMotion) {
      // Static frame: cars standing in the lanes, no motion.
      vehicles.forEach((v, i) => {
        v.car.group.position.x = (i % 3) * 5 - 5;
      });
      resize();
      renderer.render(scene, camera);
      const still = () => {
        resize();
        renderer.render(scene, camera);
      };
      const stillObserver = new ResizeObserver(still);
      stillObserver.observe(mount);
      return () => {
        stillObserver.disconnect();
        teardown();
      };
    }

    let raf = 0;
    let running = true;
    let last = performance.now();

    const loop = (now: number) => {
      raf = 0;
      if (!running) return;
      frame(now, last);
      last = now;
      raf = requestAnimationFrame(loop);
    };

    const resume = () => {
      if (running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    // Pause when the canvas scrolls out of view.
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
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onDocVisibility);
      teardown();
    };
  }, []);

  return (
    <div className="sm-hero__cars3d" aria-hidden="true">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
