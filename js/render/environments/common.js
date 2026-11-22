// Shared pieces for environments: a ground plane, canvas textures and a shadow-casting sun sized to
// the bay. Environments only ever build into their own group.
import * as THREE from "three";
import { sunFromLook, groundTone, gridTone } from "../../model/look.js";
import { isDrawn, raisedHeight, RAISE } from "../../model/bay.js";
import { gridOrigin } from "../../model/snap.js";

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

/**
 * Lines every metre over the bay (and a little round it), from the bay's left and up-range edges so
 * they meet its edges whatever its width, and a stronger line every 5 m. Split into 0.5 m pieces
 * 3 cm above `heightAt(x, z)` so they follow slopes (Outdoor), or flat (Industrial). Off until set.
 */
export function lineGrid(bay, heightAt = () => 0) {
  const g = new THREE.Group();
  g.name = "ground-grid";
  g.visible = false;
  const fine = [], bold = [];
  const [ox, oz] = gridOrigin(bay);
  const nx = Math.ceil(bay.width), nz = Math.ceil(bay.depth);
  const y = (x, z) => heightAt(x, z) + 0.03;
  const line = (out, a, b) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5));
    for (let i = 0; i < n; i++) {
      const p = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n], q = [a[0] + ((b[0] - a[0]) * (i + 1)) / n, a[1] + ((b[1] - a[1]) * (i + 1)) / n];
      out.push(p[0], y(...p), p[1], q[0], y(...q), q[1]);
    }
  };
  for (let i = 0; i <= nx; i++) line(i % 5 === 0 ? bold : fine, [ox + i, oz], [ox + i, oz + nz]);
  for (let k = 0; k <= nz; k++) line(k % 5 === 0 ? bold : fine, [ox, oz + k], [ox + nx, oz + k]);
  const mats = [];
  for (const [pts, k] of [[fine, 1], [bold, 1.6]]) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
    mat.userData.k = k;
    mats.push(mat);
    g.add(new THREE.LineSegments(geo, mat));
  }
  return { group: g, set(shown, opacity) { g.visible = Boolean(shown) && opacity > 0.001; for (const m of mats) m.opacity = Math.min(1, opacity * m.userData.k); } };
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
  const s = sunFromLook(look);           // from the time of day, or set by hand
  const sunLight = env.sunLight, hemi = env.hemiLight;
  const centre = new THREE.Vector3(0, 0, bay.depth / 2);
  // Below about 8° the shadow map smears across the ground, so the light that casts shadows stays
  // at least that high; the colour and strength still follow the real sun.
  // Indoors the light comes from the hall's lamps: a fixed direction and colour, its strength from the look.
  const dir = new THREE.Vector3(...(env.indoor ? env.indoor.direction : s.direction)).normalize();
  const minY = Math.sin((8 * Math.PI) / 180);
  if (dir.y < minY) { const h = Math.hypot(dir.x, dir.z) || 1; dir.set((dir.x / h) * Math.cos(Math.asin(minY)), minY, (dir.z / h) * Math.cos(Math.asin(minY))); }
  sunLight.position.copy(centre).addScaledVector(dir, 70);
  sunLight.target.position.copy(centre);
  if (env.indoor) sunLight.color.set(env.indoor.color);
  else if (s.color) sunLight.color.setRGB(...s.color, THREE.SRGBColorSpace);      // chosen by hand
  else sunLight.color.copy(WHITE).lerp(SUNSET, Math.pow(s.warmth, 1.6) * env.warmth);
  sunLight.intensity = env.sunStrength * look.sun * (env.indoor ? 1 : s.strength);
  sunLight.castShadow = look.shadows;
  sunLight.shadow.radius = look.softness;
  sunLight.shadow.intensity = look.shadowStrength ?? 1;     // 1 = full shadows, lower = lighter
  hemi.intensity = env.hemiStrength * look.ambient * (env.indoor ? 1 : 0.7 + 0.3 * s.strength);
  // Haze: atmospheric (exponential-squared) fog that thickens with distance, tuned so it is
  // visible across a stage seen from 30–80 m: light at 20 %, thick at 100 %. One fog object is
  // kept and only its density changes, so dragging the slider doesn't rebuild every shader.
  if (look.haze > 0.01 && env.hazeColor) {
    env.hazeFog ??= new THREE.FogExp2(env.hazeColor, 0.01);
    env.hazeFog.density = 0.002 + look.haze * 0.0135;
    env.fog = env.hazeFog;
  } else env.fog = env.baseFog ?? null;      // Blueprint keeps its distance fade
  env.exposure = look.exposure;
  env.paintSky?.(s.warmth);
  env.clouds?.setCoverage(look.clouds ?? 0);
  env.clouds?.setWarmth(s.warmth);
  env.clouds?.setShadow(look.shadows ? s.strength * (look.cloudShadow ?? 0.5) * 2 : 0);   // its own slider; shadow strength is for the props
  if (env.setGround && look.ground && look.ground !== env.ground) env.setGround(look.ground);
  if (env.setFoliage && look.foliage && look.foliage !== env.foliage) env.setFoliage(look.foliage);
  if (env.setWalls && look.walls !== undefined && look.walls !== env.walls) env.setWalls(look.walls !== false);
  if (env.setGroundTone) env.setGroundTone(groundTone(look, env.toneName || "technical"));
  if (env.setGrid) { const t = gridTone(look, env.toneName || "technical"); env.setGrid(look.gridShown === false ? { ...t, intensity: 0 } : t); }
  if (env.setRoof) env.setRoof(look.roof !== false);
  if (env.setOutdoorGrid) env.setOutdoorGrid({ shown: look.outdoorGrid === true, opacity: look.outdoorGridOpacity ?? 0.35 });
  return env;
}

/**
 * A drawn bay's raised ground as a mesh (Technical, Blueprint): a height field over the grid (and a
 * strip beside and behind it, which is raised too), two
 * vertices a metre, at the same heights as the Outdoor ground. The floor parts sit just under the
 * floor so only the raised parts show. null for other bays.
 */
export function reliefMesh(bay, material) {
  if (!isDrawn(bay)) return null;
  // The raised ground beside and behind the drawing too, out to where it reaches full height.
  const m = Math.ceil(RAISE.slope) + 1;
  const geo = new THREE.PlaneGeometry(bay.width + 2 * m, bay.depth + m, (bay.width + 2 * m) * 2, (bay.depth + m) * 2);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, (bay.depth + m) / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const h = raisedHeight(bay, pos.getX(i), pos.getZ(i)); pos.setY(i, h > 0 ? h : -0.03); }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = "relief";
  mesh.receiveShadow = true;
  return mesh;
}
