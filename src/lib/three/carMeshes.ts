import * as THREE from "three";

/**
 * Procedurally built, fully shaded car models — solid bodywork with cut wheel
 * arches, tinted glass, a chrome beltline, alloy wheels and lit lamps. No
 * external model files, so the hero has nothing extra to download and nothing
 * to fail at runtime.
 *
 * Each model is a side profile extruded to width in two parts: the lower body
 * and, sitting on the beltline, a narrower greenhouse. That two-part build is
 * what gives the cars a tapered cabin instead of a slab silhouette.
 *
 * Proportions are taken from the real vehicles the showroom sells (a unit is
 * roughly a metre), which is what stops the models reading as toys:
 *
 *   shape      length   height   wheel ⌀
 *   suv         4.84      1.74      0.78   (Land Cruiser Prado)
 *   sedan       4.68      1.40      0.68   (C-Class)
 *   pickup      5.32      1.80      0.78   (Hilux Double Cab)
 *   coupe       4.72      1.30      0.70   (Mazda 6)
 *   hatchback   4.28      1.42      0.66   (Golf)
 *
 * Everything is authored nose-forward along +x and centred on z, standing on
 * y = 0, so a group can simply be rotated 180° to drive the other way.
 */

export type CarShape = "suv" | "sedan" | "pickup" | "coupe" | "hatchback";

export type Point = [x: number, y: number];

export type Spec = {
  /** x of the nose and of the tail */
  front: number;
  rear: number;
  /** underside of the bodywork */
  rocker: number;
  /** beltline — glass base and chrome strip */
  belt: number;
  /** roofline */
  roof: number;
  /** y at the very front / rear of the bodywork */
  nose: number;
  tail: number;
  /** x where the bonnet meets the windscreen, and where the boot meets the rear screen */
  cowl: number;
  deck: number;
  /** x span of the flat roof panel */
  roofX: [back: number, front: number];
  /** axle centres */
  axle: [rear: number, front: number];
  wheelR: number;
  wheelWidth: number;
  /** wheel-arch opening: half-width and height above the rocker */
  archR: number;
  archH: number;
  halfWidth: number;
  cabinHalfWidth: number;
  /** pickup only: top of the load-bed sides, and the bed x span */
  bedTop?: number;
  bed?: [back: number, front: number];
};

export const SPECS: Record<CarShape, Spec> = {
  suv: {
    front: 2.42,
    rear: -2.42,
    rocker: 0.3,
    belt: 1.08,
    roof: 1.74,
    nose: 1.02,
    tail: 1.04,
    cowl: 1.3,
    deck: -2.24,
    roofX: [-1.92, 0.78],
    axle: [-1.52, 1.5],
    wheelR: 0.39,
    wheelWidth: 0.3,
    archR: 0.47,
    archH: 0.58,
    halfWidth: 0.95,
    cabinHalfWidth: 0.84,
  },
  sedan: {
    front: 2.34,
    rear: -2.34,
    rocker: 0.26,
    belt: 0.88,
    roof: 1.4,
    nose: 0.8,
    tail: 0.86,
    cowl: 1.0,
    deck: -1.42,
    roofX: [-1.12, 0.18],
    axle: [-1.5, 1.48],
    wheelR: 0.34,
    wheelWidth: 0.28,
    archR: 0.41,
    archH: 0.5,
    halfWidth: 0.9,
    cabinHalfWidth: 0.78,
  },
  pickup: {
    front: 2.66,
    rear: -2.66,
    rocker: 0.32,
    belt: 1.1,
    roof: 1.8,
    nose: 1.06,
    tail: 1.0,
    cowl: 1.26,
    deck: -1.0,
    roofX: [-0.82, 0.72],
    axle: [-1.74, 1.56],
    wheelR: 0.39,
    wheelWidth: 0.32,
    archR: 0.47,
    archH: 0.58,
    halfWidth: 0.94,
    cabinHalfWidth: 0.86,
    bedTop: 1.0,
    bed: [-2.56, -1.1],
  },
  coupe: {
    front: 2.36,
    rear: -2.36,
    rocker: 0.24,
    belt: 0.84,
    roof: 1.3,
    nose: 0.72,
    tail: 0.82,
    cowl: 0.86,
    deck: -1.55,
    roofX: [-1.05, -0.05],
    axle: [-1.52, 1.52],
    wheelR: 0.35,
    wheelWidth: 0.3,
    archR: 0.42,
    archH: 0.52,
    halfWidth: 0.92,
    cabinHalfWidth: 0.78,
  },
  hatchback: {
    front: 2.14,
    rear: -2.14,
    rocker: 0.26,
    belt: 0.88,
    roof: 1.42,
    nose: 0.8,
    tail: 0.9,
    cowl: 0.84,
    deck: -1.96,
    roofX: [-1.62, 0.02],
    axle: [-1.36, 1.3],
    wheelR: 0.33,
    wheelWidth: 0.28,
    archR: 0.4,
    archH: 0.49,
    halfWidth: 0.88,
    cabinHalfWidth: 0.77,
  },
};

/** Semi-elliptical wheel arch, traced forwards along the underside. */
function arch(centreX: number, s: Spec, segments = 9): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = Math.PI * (1 - i / segments); // 180° → 0°
    points.push([centreX + s.archR * Math.cos(a), s.rocker + s.archH * Math.sin(a)]);
  }
  return points;
}

/**
 * Closed outline of the lower bodywork: forwards along the underside through
 * both wheel arches, up the nose, then back along bonnet, beltline and boot.
 */
export function bodyOutline(s: Spec): Point[] {
  const [rearAxle, frontAxle] = s.axle;
  return [
    [s.rear + 0.06, s.rocker],
    ...arch(rearAxle, s),
    ...arch(frontAxle, s),
    [s.front - 0.06, s.rocker],
    [s.front, s.rocker + 0.24],
    [s.front - 0.03, s.nose],
    [s.cowl, s.belt],
    ...(s.bedTop !== undefined
      ? ([
          [s.deck, s.belt],
          [s.deck - 0.08, s.bedTop],
          [s.rear + 0.05, s.bedTop],
        ] as Point[])
      : ([
          [s.deck, s.belt],
          [s.rear + 0.04, s.tail],
        ] as Point[])),
    [s.rear, s.rocker + 0.22],
  ];
}

/** Closed outline of the greenhouse, standing on the beltline. */
export function cabinOutline(s: Spec): Point[] {
  return [
    [s.cowl, s.belt],
    [s.roofX[1], s.roof],
    [s.roofX[0], s.roof],
    [s.deck, s.belt],
  ];
}

const BEVEL = 0.03;

function extrudeProfile(points: Point[], depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 4,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Soft elliptical contact shadow — sells the car as standing on something. */
function contactShadowTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.62)");
  gradient.addColorStop(0.42, "rgba(0,0,0,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export type CarModel = {
  group: THREE.Group;
  /** every material on the car, so the whole thing can be faded as one */
  materials: (THREE.Material & { opacity: number })[];
  /** wheel pivots, spun about their own z axis as the car travels */
  wheels: THREE.Object3D[];
  wheelRadius: number;
  dispose: () => void;
};

export type BuildOptions = {
  /** bodywork colour */
  color?: THREE.ColorRepresentation;
  /** drop the contact shadow — pointless for cars crossing a dark backdrop */
  shadow?: boolean;
  /** lamps lit; off for daylight traffic */
  lamps?: boolean;
};

/**
 * Builds one shaded car. Materials are per-car (never shared) so a single
 * model can be faded in or out without touching its neighbours.
 */
export function buildCar(shape: CarShape, options: BuildOptions = {}): CarModel {
  const { color = "#c9ced6", shadow = true, lamps = true } = options;
  const s = SPECS[shape];
  const group = new THREE.Group();

  const geometries: THREE.BufferGeometry[] = [];
  const materials: (THREE.Material & { opacity: number })[] = [];
  const textures: THREE.Texture[] = [];

  const track = <T extends THREE.Material>(material: T): T => {
    material.transparent = true;
    material.depthWrite = true;
    materials.push(material as unknown as THREE.Material & { opacity: number });
    return material;
  };

  const add = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    geometries.push(geometry);
    group.add(new THREE.Mesh(geometry, material));
  };

  // ---------------------------------------------------------------- materials
  const paint = track(
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 }),
  );
  const glass = track(
    new THREE.MeshStandardMaterial({ color: "#090c12", metalness: 1, roughness: 0.07 }),
  );
  const chrome = track(
    new THREE.MeshStandardMaterial({ color: "#e6eaf0", metalness: 1, roughness: 0.15 }),
  );
  const trim = track(
    new THREE.MeshStandardMaterial({ color: "#14161b", metalness: 0.4, roughness: 0.62 }),
  );
  const rubber = track(
    new THREE.MeshStandardMaterial({ color: "#0b0c0f", metalness: 0, roughness: 0.95 }),
  );
  const alloy = track(
    new THREE.MeshStandardMaterial({ color: "#ccd2da", metalness: 1, roughness: 0.22 }),
  );

  // ---------------------------------------------------------------- bodywork
  add(extrudeProfile(bodyOutline(s), s.halfWidth * 2 - BEVEL * 2), paint);

  // Greenhouse: narrower than the body, so the cabin tapers in like a real car.
  add(extrudeProfile(cabinOutline(s), s.cabinHalfWidth * 2 - BEVEL * 2), glass);

  // Painted roof panel capping the glass.
  const roofPanel = new THREE.BoxGeometry(
    s.roofX[1] - s.roofX[0],
    0.07,
    s.cabinHalfWidth * 2 + 0.03,
  );
  roofPanel.translate((s.roofX[0] + s.roofX[1]) / 2, s.roof - 0.015, 0);
  add(roofPanel, paint);

  // Chrome beltline strip along the base of the glass.
  const strip = new THREE.BoxGeometry(s.cowl - s.deck, 0.042, s.cabinHalfWidth * 2 + 0.05);
  strip.translate((s.cowl + s.deck) / 2, s.belt + 0.012, 0);
  add(strip, chrome);

  // Dark rocker panel along the sills. Kept clear of both arch openings so it
  // never pokes into a wheel well.
  const rocker = new THREE.BoxGeometry(
    s.axle[1] - s.axle[0] - s.archR * 2.2,
    0.11,
    s.halfWidth * 2 + 0.02,
  );
  rocker.translate((s.axle[0] + s.axle[1]) / 2, s.rocker + 0.04, 0);
  add(rocker, trim);

  // Open load bed for the pickup — a recessed dark floor reads as a tray.
  if (s.bed && s.bedTop !== undefined) {
    const floor = new THREE.BoxGeometry(s.bed[1] - s.bed[0], 0.06, s.halfWidth * 1.6);
    floor.translate((s.bed[0] + s.bed[1]) / 2, s.bedTop - 0.26, 0);
    add(floor, trim);
  }

  // ---------------------------------------------------------------- wheels
  const tyreGeometry = new THREE.CylinderGeometry(s.wheelR, s.wheelR, s.wheelWidth, 26);
  tyreGeometry.rotateX(Math.PI / 2);
  const rimGeometry = new THREE.CylinderGeometry(
    s.wheelR * 0.64,
    s.wheelR * 0.64,
    s.wheelWidth + 0.02,
    22,
  );
  rimGeometry.rotateX(Math.PI / 2);
  const hubGeometry = new THREE.CylinderGeometry(
    s.wheelR * 0.2,
    s.wheelR * 0.2,
    s.wheelWidth + 0.04,
    14,
  );
  hubGeometry.rotateX(Math.PI / 2);
  geometries.push(tyreGeometry, rimGeometry, hubGeometry);

  const wheels: THREE.Object3D[] = [];
  const wheelZ = s.halfWidth - s.wheelWidth * 0.46;
  s.axle.forEach((x) => {
    [-wheelZ, wheelZ].forEach((z) => {
      const wheel = new THREE.Group();
      wheel.add(new THREE.Mesh(tyreGeometry, rubber));
      wheel.add(new THREE.Mesh(rimGeometry, alloy));
      wheel.add(new THREE.Mesh(hubGeometry, trim));
      wheel.position.set(x, s.wheelR, z);
      group.add(wheel);
      wheels.push(wheel);
    });
  });

  // ---------------------------------------------------------------- lamps
  if (lamps) {
    const headlight = track(
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: new THREE.Color("#fff3d6"),
        emissiveIntensity: 1.9,
        roughness: 0.25,
        metalness: 0,
      }),
    );
    const taillight = track(
      new THREE.MeshStandardMaterial({
        color: "#3a0509",
        emissive: new THREE.Color("#ff2436"),
        emissiveIntensity: 2.2,
        roughness: 0.3,
        metalness: 0,
      }),
    );

    const lampZ = s.halfWidth - 0.26;
    [-lampZ, lampZ].forEach((z) => {
      const head = new THREE.BoxGeometry(0.12, 0.12, 0.4);
      head.translate(s.front - 0.1, s.nose - 0.16, z);
      add(head, headlight);

      const tail = new THREE.BoxGeometry(0.1, 0.13, 0.34);
      tail.translate(s.rear + 0.08, s.tail - 0.16, z);
      add(tail, taillight);
    });
  }

  // ---------------------------------------------------------------- shadow
  if (shadow) {
    const texture = contactShadowTexture();
    if (texture) {
      textures.push(texture);
      const shadowMaterial = track(
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
      );
      const plane = new THREE.PlaneGeometry((s.front - s.rear) * 1.3, s.halfWidth * 3.6);
      plane.rotateX(-Math.PI / 2);
      plane.translate(0, 0.012, 0);
      add(plane, shadowMaterial);
    }
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return { group, materials, wheels, wheelRadius: s.wheelR, dispose };
}

/** Fades a whole car as one object. */
export function setCarOpacity(model: CarModel, opacity: number) {
  model.materials.forEach((m) => {
    m.opacity = opacity;
  });
}
