// The Outdoor range floor and berms (Step 2 of the look): a compacted dirt-and-gravel material
// with colour, normal, roughness and ambient-occlusion maps baked from a tileable gravel height
// field (generated in code), large-scale tonal variation (dry dust, compacted earth, damp patches,
// a worn lane), raw earth faces and patchy grass on the berms, sunk stones in three sizes and
// grass cards on the banks.
import * as THREE from "three";
import { rng } from "./common.js";
import { heightAt, groundTone, heightToNormal, cavityAO, BERM, fbm } from "./terrain.js";

const hasDom = typeof document !== "undefined";
const TILE = 4;          // metres per texture tile (1024 px → 256 px per metre)
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
  dry: new THREE.Color("#efe4d2"), compact: new THREE.Color("#cdbaa2"), damp: new THREE.Color("#a99886"),
  wear: new THREE.Color("#f3ead9"), earth: new THREE.Color("#bb8a62"), grass: new THREE.Color("#8e9a56"),
};

export function buildGround(bay) {
  const group = new THREE.Group();
  const W = bay.width + 120, D = bay.depth + 120;
  const geo = new THREE.PlaneGeometry(W, D, 260, 260);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, bay.depth / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const grassPatch = fbm(301);
  const c = new THREE.Color(), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z, bay);
    pos.setY(i, y);
    const t = groundTone(x, z, bay);
    c.setRGB(0, 0, 0).add(tmp.copy(TONE.dry).multiplyScalar(t.dry)).add(tmp.copy(TONE.compact).multiplyScalar(t.compact)).add(tmp.copy(TONE.damp).multiplyScalar(t.damp));
    c.lerp(TONE.wear, t.wear * 0.45);
    c.lerp(TONE.earth, Math.min(1, y / 0.9) * 0.8);                              // raw earth on the banks
    const grass = y > 1.8 ? Math.min(1, (y - 1.8) / 0.4) * Math.min(1, Math.max(0, grassPatch(x * 0.25, z * 0.25) + 0.45) * 1.6) : 0;
    c.lerp(TONE.grass, grass * 0.85);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const maps = bakeGroundMaps();
  for (const t of Object.values(maps)) t.repeat.set(W / TILE, D / TILE);
  const mat = new THREE.MeshStandardMaterial({ color: maps.map ? 0xffffff : 0xb89a78, vertexColors: true, roughness: 1,
    normalScale: new THREE.Vector2(0.9, 0.9), aoMapIntensity: 0.8, ...maps });
  const ground = new THREE.Mesh(geo, mat);
  ground.receiveShadow = true;
  ground.userData.ground = true;
  group.add(ground);

  group.add(...scatterStones(bay), grassCards(bay));
  return group;
}

// A pebble: a lumpy, smooth-shaded rock (not a faceted low-poly blob).
function pebbleGeometry(seed) {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const n = fbm(seed), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + n(x * 1.7 + 3, z * 1.7 + y) * 0.28;
    p.setXYZ(i, x * k, y * k * 0.7, z * k);
  }
  g.computeVertexNormals();
  return g;
}

const STONE_COLORS = ["#9a8b78", "#8c7d6b", "#a89882", "#7a6d5e", "#b09f88", "#837667"].map((h) => new THREE.Color(h));

// Stones in three sizes, randomly turned and sunk into the ground: denser toward the berms,
// sparser in the worn lane; the larger ones cast shadows.
function scatterStones(bay) {
  const r = rng(83);
  const sizes = [
    { count: 9000, min: 0.008, max: 0.025, shadow: false },
    { count: 1400, min: 0.03, max: 0.08, shadow: true },
    { count: 90, min: 0.12, max: 0.32, shadow: true, foot: true },
  ];
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82 });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  return sizes.map((s, si) => {
    const mesh = new THREE.InstancedMesh(pebbleGeometry(400 + si), mat, s.count);
    let placed = 0, tries = 0;
    while (placed < s.count && tries++ < s.count * 12) {
      const x = (r() - 0.5) * (bay.width + 2 * (BERM.setback + BERM.run + 2)), z = -6 + r() * (bay.depth + BERM.setback + BERM.run + 8);
      const y = heightAt(x, z, bay);
      const edge = Math.max(Math.abs(x) - bay.width / 2, z - bay.depth, 0);     // metres past the bay edge
      const nearBerm = Math.min(1, edge / BERM.setback);
      const keep = s.foot ? (y > 0.05 && y < 1.4) : (0.35 + 0.65 * nearBerm) * (1 - groundTone(x, z, bay).wear * 0.75);
      if (r() > keep) continue;
      const k = s.min + (s.max - s.min) * r() ** 2;
      e.set(r() * 6.28, r() * 6.28, r() * 6.28);
      m.compose(p.set(x, y - k * 0.3, z), q.setFromEuler(e), sc.set(k * (0.8 + r() * 0.5), k, k * (0.8 + r() * 0.5)));
      mesh.setMatrixAt(placed, m);
      mesh.setColorAt(placed, STONE_COLORS[(r() * STONE_COLORS.length) | 0]);
      placed++;
    }
    mesh.count = placed;
    mesh.castShadow = s.shadow;
    mesh.receiveShadow = true;
    return mesh;
  });
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

function grassCards(bay) {
  const r = rng(97), patch = fbm(301);
  const count = 7000;
  const map = bladeTexture();
  const mat = new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0x8e9a56, map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 });
  const mesh = new THREE.InstancedMesh(crossedQuads(), mat, count);
  const tones = ["#c9c08a", "#a9ab68", "#8f9a58", "#bcae72", "#7f8a4a"].map((h) => new THREE.Color(h));
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
    const k = 0.6 + r() * 0.9;
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
