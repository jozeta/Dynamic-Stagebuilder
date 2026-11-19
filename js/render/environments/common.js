// Shared pieces for environments: a ground plane, canvas textures and a shadow-casting sun sized to
// the bay. Environments only ever build into their own group.
import * as THREE from "three";
import { sunFromHour } from "../../model/look.js";

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
  // 4096 on computers; 2048 on touch devices (iPads), where GPU memory is tighter.
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const size = touch ? 2048 : 4096;
  light.shadow.mapSize.set(size, size);
  // Tuned for a low sun: a little normal offset stops acne on the ground without peter-panning.
  light.shadow.bias = -0.00025;
  light.shadow.normalBias = 0.035;
  light.shadow.radius = 1;      // crisp but not aliased
  return light;
}

export function disposeGroup(group) {
  group.traverse((c) => {
    if (c.isInstancedMesh) c.dispose();      // frees the instance matrix and colour buffers
    c.geometry?.dispose();
    const mats = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    for (const m of mats) { m.map?.dispose(); m.dispose(); }
  });
}

// Apply the look settings (time of day, sun, ambient, shadows, haze, exposure) to an environment
// built by technical() or outdoor(). Only lights, fog and the sky change; the stage never does.
// Sun colours: warm golden at the default late afternoon (#FFD9A8 … #FFC98A), deeper toward sunset.
const WHITE = new THREE.Color(0xfff1df), SUNSET = new THREE.Color(0xffb15e);

export function applyLook(env, look, bay) {
  const s = sunFromHour(look.hour);
  const sunLight = env.sunLight, hemi = env.hemiLight;
  const centre = new THREE.Vector3(0, 0, bay.depth / 2);
  // Below about 8° the shadow map smears across the ground, so the light that casts shadows stays
  // at least that high; the colour and strength still follow the real sun.
  const dir = new THREE.Vector3(...s.direction);
  const minY = Math.sin((8 * Math.PI) / 180);
  if (dir.y < minY) { const h = Math.hypot(dir.x, dir.z) || 1; dir.set((dir.x / h) * Math.cos(Math.asin(minY)), minY, (dir.z / h) * Math.cos(Math.asin(minY))); }
  sunLight.position.copy(centre).addScaledVector(dir, 70);
  sunLight.target.position.copy(centre);
  sunLight.color.copy(WHITE).lerp(SUNSET, Math.pow(s.warmth, 1.6) * env.warmth);
  sunLight.intensity = env.sunStrength * look.sun * s.strength;
  sunLight.castShadow = look.shadows;
  sunLight.shadow.radius = look.softness;
  hemi.intensity = env.hemiStrength * look.ambient * (0.7 + 0.3 * s.strength);
  env.fog = look.haze > 0.01 && env.hazeColor
    ? new THREE.Fog(env.hazeColor, 30 + (1 - look.haze) * 140, 90 + (1 - look.haze) * 260)
    : null;
  env.exposure = look.exposure;
  env.paintSky?.(s.warmth);
  return env;
}
