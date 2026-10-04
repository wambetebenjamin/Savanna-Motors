import * as THREE from "three";

/**
 * Low-poly car silhouettes built procedurally — an extruded side profile plus
 * cylinder wheels. Rendered as wire-frame outlines only (no fills, no glow, no
 * bloom), in the design-source primary colour at 0.2 opacity.
 */

export type CarShape = "suv" | "sedan" | "pickup";

const PROFILES: Record<CarShape, [number, number][]> = {
  // x (length), y (height) — drawn from the rear bumper forward
  suv: [
    [-2.1, 0.0],
    [-2.15, 0.55],
    [-1.95, 0.95],
    [-1.25, 1.12],
    [-0.35, 1.18],
    [0.65, 1.1],
    [1.25, 0.78],
    [1.95, 0.62],
    [2.15, 0.3],
    [2.1, 0.0],
  ],
  sedan: [
    [-2.25, 0.0],
    [-2.3, 0.42],
    [-1.75, 0.6],
    [-0.95, 0.98],
    [0.05, 1.06],
    [0.9, 0.92],
    [1.55, 0.56],
    [2.25, 0.46],
    [2.35, 0.18],
    [2.25, 0.0],
  ],
  pickup: [
    [-2.4, 0.0],
    [-2.45, 0.62],
    [-0.55, 0.66],
    [-0.4, 1.12],
    [0.45, 1.16],
    [1.05, 0.95],
    [1.35, 0.7],
    [2.25, 0.6],
    [2.4, 0.26],
    [2.35, 0.0],
  ],
};

const WHEELBASE: Record<CarShape, [number, number]> = {
  suv: [-1.35, 1.3],
  sedan: [-1.5, 1.42],
  pickup: [-1.6, 1.45],
};

function wireMaterial(color: THREE.ColorRepresentation, opacity: number) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function wheel(radius: number, width: number, material: THREE.Material) {
  const geometry = new THREE.CylinderGeometry(radius, radius, width, 10, 1, true);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 1), material);
  mesh.userData.kind = "wheel";
  mesh.userData.radius = radius;
  return mesh;
}

export function buildCar(
  shape: CarShape,
  color: THREE.ColorRepresentation,
  opacity = 0.2,
  opts: { includeRing?: boolean } = {},
): THREE.Group {
  const { includeRing = true } = opts;
  const group = new THREE.Group();
  const material = wireMaterial(color, opacity);

  // --- body: extruded side profile
  const path = new THREE.Shape();
  const points = PROFILES[shape];
  path.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  path.lineTo(points[0][0], points[0][1]);

  const body = new THREE.ExtrudeGeometry(path, {
    depth: 1.75,
    bevelEnabled: true,
    bevelSize: 0.12,
    bevelThickness: 0.1,
    bevelSegments: 1,
    steps: 1,
  });
  body.translate(0, 0, -0.875);
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(body, 22), material));

  // --- greenhouse / cabin band, keeps the silhouette readable while rotating
  const cabin = new THREE.BoxGeometry(
    shape === "pickup" ? 1.5 : 2.2,
    0.42,
    1.58,
  );
  cabin.translate(shape === "pickup" ? 0.1 : -0.15, 1.08, 0);
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(cabin), material));

  // --- wheels
  const radius = shape === "sedan" ? 0.42 : 0.5;
  const [front, rear] = WHEELBASE[shape];
  [front, rear].forEach((x) => {
    [-0.92, 0.92].forEach((z) => {
      const w = wheel(radius, 0.26, material);
      w.position.set(x, radius * 0.86, z);
      group.add(w);
    });
  });

  // --- ground reference line (a single flat ring, no decorative shapes).
  // Skipped for cars that drive across the scene — only makes sense parked.
  if (includeRing) {
    const ring = new THREE.RingGeometry(2.6, 2.62, 48);
    ring.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(ring, 1),
      wireMaterial(color, opacity * 0.6),
    );
    group.add(ringMesh);
  }

  group.rotation.y = Math.PI * 0.12;
  return group;
}

