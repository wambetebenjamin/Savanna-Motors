"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildCar, type CarShape } from "@/lib/three/carMeshes";

const WIRE_COLOR = "#D81324"; // --sm-primary, taken from the design source
const FOV = 32;
const EDGE_FADE = 2.4; // world units over which a car fades in/out at the edges

type Lane = {
  /** depth — closer to the camera reads lower/larger on screen */
  z: number;
  y: number;
  scale: number;
  /** travel direction: -1 = right → left, 1 = left → right */
  dir: -1 | 1;
  baseOpacity: number;
  speed: [min: number, max: number];
  bob: number;
  count: number;
};

// Kenyan left-hand traffic read from the hero: the near (lower) lane travels
// right → left, the far lane travels left → right (dual carriageway).
const LANES: Lane[] = [
  // near: bottom third of the hero
  { z: 4.2, y: -1.0, scale: 0.62, dir: -1, baseOpacity: 0.2, speed: [2.2, 2.9], bob: 0.016, count: 3 },
  // far: just above it, smaller and fainter for depth
  { z: -3.2, y: -0.12, scale: 0.38, dir: 1, baseOpacity: 0.11, speed: [1.2, 1.7], bob: 0.008, count: 3 },
];

const SHAPES: CarShape[] = ["suv", "sedan", "pickup", "coupe", "hatchback"];

type Vehicle = {
  group: THREE.Group;
  lane: Lane;
  materials: THREE.Material[];
  wheels: { mesh: THREE.Object3D; radius: number }[];
  x: number;
  speed: number;
  bobPhase: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Full-bleed hero WebGL layer, rendered behind the transitioning hero
 * photographs. Wire-frame car silhouettes drive continuously across the hero
 * in two opposing lanes, with perspective depth, edge fade-in/out, rolling
 * wheels and a subtle road bob.
 *
 * Desktop only (no WebGL init under 1025px — CSS also hides the holder), DPR
 * capped at 1.5, and the loop pauses when the hero scrolls out of view or the
 * tab hides. With reduced-motion a single static frame is drawn.
 */
export function HeroCars3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    // Keep phones/tablets light — the canvas is hidden below 1025px in CSS.
    if (!window.matchMedia("(min-width: 1025px)").matches) return;

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
      FOV,
      Math.max(mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1),
      0.1,
      100,
    );
    camera.position.set(0, 2.4, 13);
    camera.lookAt(0, 0.4, 0);

    // World-space half-width of the view at a given depth — used so cars fade
    // in just off-screen and fully exit before wrapping.
    const halfWidthAt = (laneZ: number) => {
      const dist = camera.position.z - laneZ;
      return Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * dist * camera.aspect;
    };

    const vehicles: Vehicle[] = [];
    LANES.forEach((lane) => {
      for (let i = 0; i < lane.count; i += 1) {
        const group = buildCar(SHAPES[i % SHAPES.length], WIRE_COLOR, lane.baseOpacity, {
          includeRing: false,
        });
        group.rotation.y = lane.dir === 1 ? 0 : Math.PI; // face travel direction
        group.scale.setScalar(lane.scale);
        group.position.y = lane.y;

        const materials: THREE.Material[] = [];
        const wheels: { mesh: THREE.Object3D; radius: number }[] = [];
        group.traverse((child) => {
          const mesh = child as THREE.LineSegments;
          if (mesh.material && !materials.includes(mesh.material as THREE.Material)) {
            materials.push(mesh.material as THREE.Material);
          }
          if (mesh.userData.kind === "wheel") {
            wheels.push({ mesh, radius: mesh.userData.radius as number });
          }
        });

        // Stratified spawn so cars never start clustered.
        const offX = halfWidthAt(lane.z) + 6;
        const x =
          lane.dir * -offX +
          lane.dir * 2 * offX * ((i + rand(0.1, 0.9)) / lane.count);

        scene.add(group);
        vehicles.push({
          group,
          lane,
          materials,
          wheels,
          x,
          speed: rand(lane.speed[0], lane.speed[1]),
          bobPhase: Math.random() * Math.PI * 2,
        });
      }
    });

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

    const frame = (now: number, last: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp after tab sleeps
      vehicles.forEach((v) => {
        const offX = halfWidthAt(v.lane.z) + 3;
        v.x += v.lane.dir * v.speed * dt;
        if (v.x > offX) v.x -= offX * 2;
        if (v.x < -offX) v.x += offX * 2;

        v.group.position.x = v.x;
        v.group.position.y =
          v.lane.y + Math.sin(now * 0.002 + v.bobPhase) * v.lane.bob;

        // Fade in/out across the screen edges so cars never pop.
        const edge = offX - Math.abs(v.x);
        const f = THREE.MathUtils.clamp(edge / EDGE_FADE, 0, 1);
        v.materials.forEach((m) => {
          (m as THREE.Material & { opacity: number }).opacity = v.lane.baseOpacity * f;
        });

        // Angular speed from ground speed, corrected for the group's scale.
        v.wheels.forEach(({ mesh, radius }) => {
          mesh.rotation.z -= (v.speed * dt) / (radius * v.lane.scale);
        });
      });
      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      // Static frame: cars parked mid-road, no motion.
      vehicles.forEach((v, i) => {
        v.group.position.x = (i % 3) * 4 - 4;
        v.group.position.y = v.lane.y;
      });
      resize();
      renderer.render(scene, camera);
      const still = () => {
        resize();
        renderer.render(scene, camera);
      };
      const ro = new ResizeObserver(still);
      ro.observe(mount);
      return () => {
        ro.disconnect();
        observer.disconnect();
        dispose();
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
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onDocVisibility);
      dispose();
    };
  }, []);

  return (
    <div className="sm-hero__cars3d" aria-hidden="true">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
