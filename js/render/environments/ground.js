// The Outdoor range floor and berms: a photo-scanned CC0 sand-and-gravel material (Poly Haven
// "Gravelly Sand", vendored in vendor/textures/, see SOURCE.md there) with colour, normal,
// roughness and AO maps; until it has loaded, maps baked in code from a gravel height field stand
// in. Large-scale tonal variation (dry dust, compacted earth, damp patches, a worn lane) hides the
// tiling; raw earth faces and patchy grass on the berms, many sunk stones in four sizes and grass
// cards on the banks.
import * as THREE from "three";
import { rng } from "./common.js";
import { heightAt, groundTone, heightToNormal, cavityAO, BERM, fbm, bankBlend } from "./terrain.js";

const hasDom = typeof document !== "undefined";
const TILE = 4;          // metres per procedural tile (1024 px → 256 px per metre)
const PHOTO_TILE = 2.48; // metres per photo-scanned tile (its real-world size)
const PHOTO = "vendor/textures/polyhaven/gravelly_sand/gravelly_sand";
const MAP = 1024;

// A tileable gravel height field: grit everywhere and pebbles (wrapped round the edges).
function gravelHeight(size, r) {
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) h[i] = 0.25 + r() * 0.08;            // grit
  const pebbles = [];
  for (let n = 0; n < 2600; n++) {
    const cx = r() * size, cy = r() * size, rx = 1.5 + r() ** 2 * 7, ry = rx * (0.55 + r() * 0.45);
    const a = r() * Math.PI, top = 0.45 + r() * 0.5, tone = r();
    pebbles.push({ cx, cy, rx, ry, tone });
    const ca = Math.cos(a), sa = Math.sin(a), R = Math.ceil(rx) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const u = (dx * ca + dy * sa) / rx, v = (-dx * sa + dy * ca) / ry, d = u * u + v * v;
      if (d >= 1) continue;
      const x = (Math.floor(cx) + dx + size) % size, y = (Math.floor(cy) + dy + size) % size;
      const k = y * size + x;
      h[k] = Math.max(h[k], 0.25 + top * Math.sqrt(1 - d));
    }
  }
  return { h, pebbles };
}

function bakeGroundMaps() {
  if (!hasDom) return {};
  const r = rng(71), size = MAP;
  const { h, pebbles } = gravelHeight(size, r);
  const ao = cavityAO(h, size, 2, 3);
  const normal = heightToNormal(h, size, 6);
  const albedo = new Uint8ClampedArray(size * size * 4), rough = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const lift = h[i] > 0.34 ? 1 : 0;                                       // pebble or grit?
    const g = 0.92 + r() * 0.12, occ = ao[i * 4] / 255;
    // Grit: warm tan dust; pebbles: lighter, greyer stone.
    const [cr, cg, cb] = lift ? [192, 186, 174] : [182, 168, 150];
    albedo[i * 4] = cr * g * occ; albedo[i * 4 + 1] = cg * g * occ; albedo[i * 4 + 2] = cb * g * occ; albedo[i * 4 + 3] = 255;
    const ro = lift ? 170 : 242;                                            // stones a little smoother
    rough[i * 4] = rough[i * 4 + 1] = rough[i * 4 + 2] = ro + (r() - 0.5) * 20; rough[i * 4 + 3] = 255;
  }
  // Stone colour variety: tint some pebbles grey, rust or cream.
  for (const p of pebbles) {
    const tint = p.tone < 0.3 ? [0.86, 0.88, 0.92] : p.tone < 0.45 ? [1.06, 0.9, 0.78] : p.tone > 0.9 ? [1.08, 1.06, 1.0] : null;
    if (!tint) continue;
    const R = Math.ceil(p.rx);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      if ((dx * dx) / (p.rx * p.rx) + (dy * dy) / (p.ry * p.ry) >= 1) continue;
      const k = (((Math.floor(p.cy) + dy + size) % size) * size + ((Math.floor(p.cx) + dx + size) % size)) * 4;
      albedo[k] *= tint[0]; albedo[k + 1] *= tint[1]; albedo[k + 2] *= tint[2];
    }
  }
  const tex = (data, color) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    c.getContext("2d").putImageData(new ImageData(data, size, size), 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: tex(albedo, true), normalMap: tex(normal, false), roughnessMap: tex(rough, false), aoMap: tex(ao, false) };
}

// Ground tone multipliers (vertex colours): dry dust, compacted earth, damp, the worn lane,
// raw berm earth and grass on the berm tops.
const TONE = {
  dry: new THREE.Color("#f4ece0"), compact: new THREE.Color("#d9cbb8"), damp: new THREE.Color("#b9aa98"),
  wear: new THREE.Color("#fbf4e8"), earth: new THREE.Color("#c99a72"), grass: new THREE.Color("#8e9a56"),
};

// Each ground's bank earth and stones (Settings → Ground): the earth tone the banks blend to, and a
// tint for every stone (sandstone on sand, grey stones on gravel, red-brown ones on red dirt).
export const GROUND_PALETTE = Object.freeze({
  sand: { earth: "#c99a72", stone: "#ffffff" },
  "light-sand": { earth: "#dcb98f", stone: "#fff6e8" },
  "dark-sand": { earth: "#9a7454", stone: "#b9a894" },
  "red-dirt": { earth: "#b85c38", stone: "#d8907a" },
  gravel: { earth: "#9b958c", stone: "#d4d9de" },
});

// Colour grades for the ground choices (Settings → Ground), applied to the photo scan: saturation,
// gain, an added lift and a per-channel tint. The scan itself is a deep red-brown.
const GRADES = {
  sand: { sat: 0.62, gain: 1.22, add: [6, 6, 8], mul: [1, 1, 1] },
  "light-sand": { sat: 0.42, gain: 1.5, add: [18, 15, 10], mul: [1, 0.99, 0.94] },
  "dark-sand": { sat: 0.7, gain: 0.84, add: [0, 0, 0], mul: [1, 0.95, 0.88] },
  "red-dirt": { sat: 0.98, gain: 1.04, add: [6, 0, 0], mul: [1.1, 0.9, 0.78] },
  gravel: { sat: 0.1, gain: 1.12, add: [4, 6, 10], mul: [0.97, 1, 1.05] },
};
function gradeImage(img, name) {
  const { sat, gain, add, mul } = GRADES[name] || GRADES.sand;
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const l = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
    for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, ((l + (px[i + k] - l) * sat) * gain + add[k]) * mul[k]);
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Load the photo-scanned maps (same origin, cached offline by the service worker) and swap them
// into the material when ready; `onUpdate` asks for a new frame.
function loadPhotoMaps(mat, W, D, onUpdate, control, offset = [0, 0]) {
  if (!hasDom) return;
  const loader = new THREE.TextureLoader();
  const prep = (t, color, repeat) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(...repeat);
    t.offset.set(...offset);
    return t;
  };
  const rep = [W / PHOTO_TILE, D / PHOTO_TILE];
  let pending = 3;
  const done = () => { if (--pending === 0) { mat.needsUpdate = true; onUpdate?.(); } };
  // Colour map: graded once on load (lighter, a little less saturated) toward the warm tan of a
  // dusty range floor; the scan itself is a deep red-brown.
  new THREE.ImageLoader().load(`${PHOTO}_diff_2k.jpg`, (img) => {
    control.image = img;
    mat.map?.dispose();
    mat.map = prep(new THREE.CanvasTexture(gradeImage(img, control.ground)), true, rep);
    control.regrade = (name) => {
      const t = prep(new THREE.CanvasTexture(gradeImage(img, name)), true, rep);
      mat.map?.dispose();
      mat.map = t;
      mat.needsUpdate = true;
      onUpdate?.();
    };
    done();
  }, undefined, () => done());
  loader.load(`${PHOTO}_nor_gl_2k.jpg`, (t) => { mat.normalMap?.dispose(); mat.normalMap = prep(t, false, rep); done(); }, undefined, () => done());
  loader.load(`${PHOTO}_arm_1k.jpg`, (t) => {
    mat.aoMap?.dispose(); mat.roughnessMap?.dispose();
    mat.aoMap = prep(t, false, rep);
    mat.roughnessMap = mat.aoMap;                           // roughness is in the green channel
    done();
  }, undefined, () => done());
}

export function buildGround(bay, { onUpdate } = {}) {
  const group = new THREE.Group();
  const W = bay.width + 120, D = bay.depth + 120;
  const geo = new THREE.PlaneGeometry(W, D, 320, 320);              // fine enough for a smooth foot to the banks
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, bay.depth / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const grassPatch = fbm(301);
  const c = new THREE.Color(), tmp = new THREE.Color();
  // Per vertex: the floor's tone, how much bank earth and how much grass it gets, kept so a ground
  // change can recolour the banks.
  const floorTone = new Float32Array(pos.count * 3), earthW = new Float32Array(pos.count), grassW = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z, bay);
    pos.setY(i, y);
    const t = groundTone(x, z, bay);
    c.setRGB(0, 0, 0).add(tmp.copy(TONE.dry).multiplyScalar(t.dry)).add(tmp.copy(TONE.compact).multiplyScalar(t.compact)).add(tmp.copy(TONE.damp).multiplyScalar(t.damp));
    c.lerp(TONE.wear, t.wear * 0.45);
    floorTone.set([c.r, c.g, c.b], i * 3);
    earthW[i] = bankBlend(x, z, bay) * 0.8;                                      // raw earth on the banks, blended in from the floor
    grassW[i] = (y > 1.8 ? Math.min(1, (y - 1.8) / 0.4) * Math.min(1, Math.max(0, grassPatch(x * 0.25, z * 0.25) + 0.45) * 1.6) : 0) * 0.85;
  }
  const colorAttr = new THREE.BufferAttribute(colors, 3);
  geo.setAttribute("color", colorAttr);
  const paintBanks = (earth) => {
    const e = new THREE.Color(earth);
    for (let i = 0; i < pos.count; i++) {
      c.setRGB(floorTone[i * 3], floorTone[i * 3 + 1], floorTone[i * 3 + 2]).lerp(e, earthW[i]).lerp(TONE.grass, grassW[i]);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    colorAttr.needsUpdate = true;
  };
  paintBanks(GROUND_PALETTE.sand.earth);
  geo.computeVertexNormals();
  const maps = bakeGroundMaps();
  // Texture coordinates in the world's frame (u = x / tile, v = − z / tile), so berms on the ground
  // (builders/berm.js) carry the same pattern on unbroken.
  const zTop = bay.depth / 2 + D / 2;
  for (const t of Object.values(maps)) { t.repeat.set(W / TILE, D / TILE); t.offset.set(-(W / 2) / TILE, -zTop / TILE); }
  const mat = new THREE.MeshStandardMaterial({ color: maps.map ? 0xffffff : 0xb89a78, vertexColors: true, roughness: 1,
    normalScale: new THREE.Vector2(0.9, 0.9), aoMapIntensity: 0.8, ...maps });
  const ground = new THREE.Mesh(geo, mat);
  ground.receiveShadow = true;
  ground.userData.ground = true;
  group.add(ground);

  const stones = scatterStones(bay);
  group.add(...stones.meshes);            // grass comes with the foliage (foliage.js)
  // The ground choice: regrade the photo when it has loaded, else remember it for when it does.
  const control = { ground: "sand", regrade: null };
  group.userData.setGround = (name) => {
    if (name === control.ground) return;
    control.ground = name;
    control.regrade?.(name);
    const pal = GROUND_PALETTE[name] || GROUND_PALETTE.sand;
    paintBanks(pal.earth);                         // the banks' earth and the stones follow the ground
    stones.material.color.set(pal.stone);
  };
  loadPhotoMaps(mat, W, D, onUpdate, control, [-(W / 2) / PHOTO_TILE, -zTop / PHOTO_TILE]);
  return group;
}

// A stone: a lumpy, smooth-shaded pebble, or for bigger rocks a broken, angular one with flat
// fracture faces (cut by random planes), never a faceted low-poly blob.
function pebbleGeometry(seed, angular = false) {
  const g = new THREE.IcosahedronGeometry(1, angular ? 3 : 2);
  const n = fbm(seed), p = g.attributes.position, r = rng(seed);
  const cuts = angular ? Array.from({ length: 5 }, () => {
    const v = new THREE.Vector3(r() - 0.5, (r() - 0.3) * 0.8, r() - 0.5).normalize();
    return { v, d: 0.55 + r() * 0.3 };
  }) : [];
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    v.multiplyScalar(1 + n(v.x * 1.7 + 3, v.z * 1.7 + v.y) * (angular ? 0.18 : 0.28));
    for (const c of cuts) { const over = v.dot(c.v) - c.d; if (over > 0) v.addScaledVector(c.v, -over); }
    p.setXYZ(i, v.x, v.y * 0.72, v.z);
  }
  g.computeVertexNormals();
  return g;
}

const STONE_COLORS = ["#b6aa98", "#a59a8a", "#c4b8a4", "#958a7c", "#cbbfac", "#a39484", "#8d8478"].map((h) => new THREE.Color(h));

// Stones in four sizes, randomly turned and sunk into the ground all over the range: grit and
// small rocks everywhere (denser toward the berms, a little sparser in the worn lane), scattered
// fist-sized rocks, and larger ones at the berms' foot. The bigger ones cast shadows.
function scatterStones(bay) {
  const r = rng(83);
  const sizes = [
    { count: 14000, min: 0.008, max: 0.025, shadow: false },
    { count: 4500, min: 0.025, max: 0.07, shadow: true },
    { count: 700, min: 0.07, max: 0.15, shadow: true, anywhere: true },
    { count: 110, min: 0.15, max: 0.35, shadow: true, foot: true },
  ];
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  const meshes = sizes.map((s, si) => {
    const mesh = new THREE.InstancedMesh(pebbleGeometry(400 + si, si >= 2), mat, s.count);
    let placed = 0, tries = 0;
    while (placed < s.count && tries++ < s.count * 12) {
      const x = (r() - 0.5) * (bay.width + 2 * (BERM.setback + BERM.run + 2)), z = -6 + r() * (bay.depth + BERM.setback + BERM.run + 8);
      const y = heightAt(x, z, bay);
      const edge = Math.max(Math.abs(x) - bay.width / 2, z - bay.depth, 0);     // metres past the bay edge
      const nearBerm = Math.min(1, edge / BERM.setback);
      const keep = s.foot ? (y > 0.05 && y < 1.4) : s.anywhere ? (1 - groundTone(x, z, bay).wear * 0.5)
        : (0.45 + 0.55 * nearBerm) * (1 - groundTone(x, z, bay).wear * 0.6);
      if (r() > keep) continue;
      const k = s.min + (s.max - s.min) * r() ** 2;
      e.set(r() * 6.28, r() * 6.28, r() * 6.28);
      m.compose(p.set(x, y - k * 0.3, z), q.setFromEuler(e), sc.set(k * (0.8 + r() * 0.5), k, k * (0.8 + r() * 0.5)));
      mesh.setMatrixAt(placed, m);
      mesh.setColorAt(placed, STONE_COLORS[(r() * STONE_COLORS.length) | 0]);
      placed++;
    }
    mesh.count = placed;
    mesh.castShadow = false;        // only props cast sun shadows, so Shadow strength is about them alone
    mesh.receiveShadow = true;
    return mesh;
  });
  return { meshes, material: mat };
}

// Grass cards: two crossed quads with a painted blade texture (alpha tested), in dry yellow-green
// and olive tones, on the berm tops, patchy down the faces and in tufts along the berm foot.
function bladeTexture() {
  if (!hasDom) return null;
  const c = document.createElement("canvas");
  c.width = 128; c.height = 256;
  const g = c.getContext("2d"), r = rng(91);
  for (let i = 0; i < 26; i++) {
    const x = 10 + r() * 108, lean = (r() - 0.5) * 60, h = 120 + r() * 130, w = 3 + r() * 4;
    const grd = g.createLinearGradient(0, 256, 0, 256 - h);
    grd.addColorStop(0, "#5f6a34"); grd.addColorStop(0.6, "#a3a65e"); grd.addColorStop(1, "#d6c98c");
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(x - w, 256); g.quadraticCurveTo(x + lean * 0.4, 256 - h * 0.6, x + lean, 256 - h); g.quadraticCurveTo(x + lean * 0.4 + w * 0.3, 256 - h * 0.6, x + w, 256); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function crossedQuads() {
  const w = 0.42, h = 0.36, pos = [], uv = [], idx = [];
  for (let k = 0; k < 2; k++) {
    const a = k * Math.PI / 2, dx = Math.cos(a) * w / 2, dz = Math.sin(a) * w / 2, b = pos.length / 3;
    pos.push(-dx, 0, -dz, dx, 0, dz, dx, h, dz, -dx, h, -dz);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Grass tufts on the banks: `count` cards in `tones`, `scale` times their usual size. */
export function grassCards(bay, { count = 7000, tones: toneList = ["#c9c08a", "#a9ab68", "#8f9a58", "#bcae72", "#7f8a4a"], scale = 1 } = {}) {
  const r = rng(97), patch = fbm(301);
  const map = bladeTexture();
  const mat = new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0x8e9a56, map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 });
  const mesh = new THREE.InstancedMesh(crossedQuads(), mat, count);
  const tones = toneList.map((h) => new THREE.Color(h));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  let placed = 0, tries = 0;
  while (placed < count && tries++ < count * 20) {
    const x = (r() - 0.5) * (bay.width + 2 * (BERM.setback + BERM.run + 6)), z = -8 + r() * (bay.depth + BERM.setback + BERM.run + 12);
    const y = heightAt(x, z, bay);
    const patchy = patch(x * 0.25, z * 0.25) + 0.45;
    const top = y > 1.8 && patchy > 0;
    const foot = y > 0.02 && y < 0.5 && patchy > 0.35;
    const face = y >= 0.5 && y <= 1.8 && patchy > 0.55;
    if (!(top || foot || face)) continue;
    const k = (0.6 + r() * 0.9) * scale;
    e.set((r() - 0.5) * 0.25, r() * 6.28, (r() - 0.5) * 0.25);
    m.compose(p.set(x, y - 0.02, z), q.setFromEuler(e), sc.set(k, k * (0.7 + r() * 0.6), k));
    mesh.setMatrixAt(placed, m);
    mesh.setColorAt(placed, tones[(r() * tones.length) | 0]);
    placed++;
  }
  mesh.count = placed;
  mesh.receiveShadow = true;
  return mesh;
}

// The Outdoor ground's surface on other things (the earth berm): the same photo-scanned earth,
// graded per ground (sand, gravel…), with its normal and AO/roughness maps. UVs are in metres /
// PHOTO_TILE, so it is at the same scale as the ground. One material per ground, shared.
const earthMats = new Map();
let earthNotify = null;
/** Ask for a new frame when the photo maps arrive (set by the engine). */
export function onEarthLoaded(fn) { earthNotify = fn; }
export const EARTH_TILE = PHOTO_TILE;
export function earthMaterial(ground = "sand") {
  if (earthMats.has(ground)) return earthMats.get(ground);
  const pal = GROUND_PALETTE[ground] || GROUND_PALETTE.sand;
  const maps = bakeGroundMaps();
  for (const t of Object.values(maps)) t.repeat?.set(PHOTO_TILE / TILE, PHOTO_TILE / TILE);    // UVs are in photo tiles
  const mat = new THREE.MeshStandardMaterial({ color: maps.map ? 0xffffff : pal.earth, roughness: 1, normalScale: new THREE.Vector2(0.9, 0.9), aoMapIntensity: 0.8, ...maps, vertexColors: true });
  mat.name = `berm-earth-${ground}`;
  const control = { ground, regrade: null };
  loadPhotoMaps(mat, PHOTO_TILE, PHOTO_TILE, () => earthNotify?.(), control);
  earthMats.set(ground, mat);
  return mat;
}

/** Grass tufts at spots [[x, y, z], …] (the same blades as on the Outdoor banks). */
let grassMat = null;
export function grassAt(spots, { seed = 5, scale = 1, tones: toneList = ["#c9c08a", "#a9ab68", "#8f9a58", "#bcae72", "#7f8a4a"] } = {}) {
  const r = rng(seed);
  if (!grassMat) { const map = bladeTexture(); grassMat = new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0x8e9a56, map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 }); }
  const mesh = new THREE.InstancedMesh(crossedQuads(), grassMat, Math.max(1, spots.length));
  const tones = toneList.map((h) => new THREE.Color(h));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  spots.forEach(([x, y, z], i) => {
    const k = (0.6 + r() * 0.9) * scale;
    e.set((r() - 0.5) * 0.25, r() * 6.28, (r() - 0.5) * 0.25);
    m.compose(p.set(x, y - 0.02, z), q.setFromEuler(e), sc.set(k, k * (0.7 + r() * 0.6), k));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, tones[(r() * tones.length) | 0]);
  });
  mesh.count = spots.length;
  mesh.receiveShadow = true;
  return mesh;
}
