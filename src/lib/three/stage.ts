import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Shared WebGL stage setup for the hero: a tone-mapped transparent renderer,
 * a pre-filtered studio environment (what makes the paint and chrome read as
 * metal rather than flat plastic) and a three-point lighting rig.
 */

const BRAND_RED = "#d81324";

/**
 * @param maxDpr caps the pixel ratio. The full-bleed traffic canvas needs a
 * tighter budget than the small corner showcase.
 */
export function createRenderer(mount: HTMLElement, maxDpr = 1.5): THREE.WebGLRenderer | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null; // no WebGL — the hero simply renders without the canvas
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);
  return renderer;
}

/**
 * Pre-filtered studio environment. Generated once per renderer; the caller
 * owns the returned dispose().
 */
export function createEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  room.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose?.();
  });
  return { texture: target.texture, dispose: () => target.dispose() };
}

export type Rig = {
  key: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
};

/**
 * Three-point rig: a warm key over the driver's side, a cool fill to lift the
 * shadow side, and a brand-red rim light raking the far edge. The key is
 * returned so callers can sweep it across the bodywork during a transition.
 */
export function addLighting(scene: THREE.Scene, intensity = 1): Rig {
  scene.add(new THREE.HemisphereLight(0xdfe6f5, 0x0c0d10, 0.5 * intensity));

  const key = new THREE.DirectionalLight(0xfff4e2, 2.3 * intensity);
  key.position.set(4.2, 6.4, 5.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdbe6ff, 0.75 * intensity);
  fill.position.set(-5.4, 2.6, 4.6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(new THREE.Color(BRAND_RED), 1.5 * intensity);
  rim.position.set(-3.8, 2.2, -5.6);
  scene.add(rim);

  return { key, rim };
}

/** Frees every geometry, material and texture reachable from a scene. */
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose?.();
  });
}

/* ------------------------------------------------------------------ easing */

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Overshoots slightly past the target, then settles — the "premium" arrival. */
export const easeOutBack = (t: number, overshoot = 1.18) => {
  const c = overshoot + 1;
  return 1 + c * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
};

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
