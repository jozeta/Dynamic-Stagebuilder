// Shared pieces for environments: a ground plane, canvas textures and a shadow-casting sun sized to
// the bay. Environments only ever build into their own group.
import * as THREE from "three";

export const hasDom = typeof document !== "undefined";

// Seeded random, so the surroundings look the same on every load.
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function canvasTexture(size, draw, repeat, { color = true, seed = 1 } = {}) {
  if (!hasDom) return null;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size, rng(seed));
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}

export function ground(width, depth, material, centreZ) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  m.rotation.x = -Math.PI / 2;
  m.position.set(0, 0, centreZ);
  m.receiveShadow = true;
  m.userData.ground = true;
  return m;
}

export function sun(bay, color, intensity, from) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(from[0], from[1], bay.depth / 2 + from[2]);
  light.target.position.set(0, 0, bay.depth / 2);
  light.castShadow = true;
  const r = Math.max(bay.width, bay.depth) * 0.75 + 5;
  Object.assign(light.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 200 });
  light.shadow.mapSize.set(4096, 4096);
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.02;
  light.shadow.radius = 3;      // soft shadow edges
  return light;
}

export function disposeGroup(group) {
  group.traverse((c) => {
    c.geometry?.dispose();
    const mats = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    for (const m of mats) { m.map?.dispose(); m.dispose(); }
  });
}
