// The Outdoor range's plants (look.foliage, Settings → Environment → Foliage): trees beyond the
// banks, bushes along the bank tops and grass on the banks, in one of several kinds:
//   mixed     broadleaf trees (oak-like) and leafy bushes
//   nordic    spruces, Scots pines and birches, low juniper
//   desert    ribbed saguaros, barrel cacti and prickly pear, silver sagebrush, sparse dry grass
//   savanna   umbrella acacias, a few thorn bushes, tall golden grass
//   tropical  coconut palms, broad-leaved bushes, green grass
//   none      bare earth banks
//
// Built the way real-time foliage is: a branching skeleton of tapered, curved branches (bark
// textured), carrying hundreds of alpha-tested cards painted with clusters of leaves, needles or
// leaflets. Card normals point out from the crown's centre, so a crown shades like a volume. Each
// tree prototype is merged into two meshes (bark, leaves) and cloned. All painted in code (seeded),
// never touching the stage. buildFoliage(bay, kind) returns a Group.
import * as THREE from "three";
import { canvasTexture, rng, hasDom } from "./common.js";
import { heightAt } from "./terrain.js";
import { grassCards } from "./ground.js";

export const FOLIAGE_KINDS = ["mixed", "nordic", "desert", "savanna", "tropical", "none"];

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// --- Geometry helpers -----------------------------------------------------------------------------

/** A tapered tube along points (radius r0 at the start, r1 at the end). */
function branch(points, r0, r1, radial = 6) {
  const path = new THREE.CatmullRomCurve3(points);
  const seg = Math.max(2, points.length * 3);
  const g = new THREE.TubeGeometry(path, seg, 1, radial, false);
  const p = g.attributes.position, c = V(0, 0, 0), q = V(0, 0, 0);
  for (let j = 0; j <= seg; j++) {
    const t = j / seg;
    path.getPointAt(t, c);
    const r = r0 + (r1 - r0) * t;
    for (let k = 0; k <= radial; k++) {
      const i = j * (radial + 1) + k;
      q.fromBufferAttribute(p, i).sub(c).multiplyScalar(r).add(c);
      p.setXYZ(i, q.x, q.y, q.z);
    }
  }
  // Bark texture runs along the branch: about one repeat per metre.
  const len = path.getLength(), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getX(i) * len);
  for (let i = 0; i < uv.count; i++) uv.setX(i, (i % (radial + 1)) / radial);
  g.computeVertexNormals();
  return g;
}

/**
 * A leaf card: a quad of size w × h at `at`, facing along `facing` (turned `spin` about it), its
 * normals bent out from `centre` so the crown shades like a volume.
 */
function card(at, w, h, facing, spin, centre) {
  const g = new THREE.PlaneGeometry(w, h);
  const m = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), facing.clone().normalize()));
  g.applyMatrix4(new THREE.Matrix4().makeRotationZ(spin)).applyMatrix4(m).translate(at.x, at.y, at.z);
  if (centre) {
    const p = g.attributes.position, n = g.attributes.normal, v = V(0, 0, 0);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).sub(centre).normalize(); n.setXYZ(i, v.x, v.y, v.z); }
  }
  return g;
}

/** One geometry from many (non-indexed; position, normal, uv). */
function merge(geoms) {
  const flat = (geoms || []).filter(Boolean).map((g) => (g.index ? g.toNonIndexed() : g));
  if (!flat.length) return null;
  const join = (name, size) => {
    const arrays = flat.map((g) => g.getAttribute(name).array);
    const out = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
    let o = 0;
    for (const a of arrays) { out.set(a, o); o += a.length; }
    return new THREE.BufferAttribute(out, size);
  };
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", join("position", 3));
  g.setAttribute("normal", join("normal", 3));
  g.setAttribute("uv", join("uv", 2));
  return g;
}

const randomDir = (r, upBias = 0) => V(r() - 0.5, r() - 0.5 + upBias, r() - 0.5).normalize();
const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.receiveShadow = true; return m; };

// --- Textures (canvas, alpha) ---------------------------------------------------------------------

const shade = (r, base, spread) => base.map((c) => Math.max(0, Math.min(255, Math.round(c + (r() - 0.5) * spread))));
const rgb = ([a, b, c], al = 1) => `rgba(${a},${b},${c},${al})`;
// A leaf shape: a pointed oval from (0,0) out to length l, width w.
function leafPath(g, l, w) {
  g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(l * 0.25, -w, l * 0.75, -w * 0.8, l, 0);
  g.bezierCurveTo(l * 0.75, w * 0.8, l * 0.25, w, 0, 0);
}
function alphaTex(size, draw, seed) {
  const t = canvasTexture(size, draw, [1, 1], { seed });
  if (t) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 4; }
  return t;
}
// A spray of broad leaves on twigs, in `base` green.
function leafSpray(base, { leaves = 46, len = [26, 52], width = 0.42, size = 256, seed = 1, round = false } = {}) {
  return alphaTex(size, (g, s, r) => {
    const cx = s / 2, cy = s / 2;
    g.strokeStyle = "rgba(70,52,34,0.9)"; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { const a = r() * 6.28; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s * 0.34, cy + Math.sin(a) * s * 0.34); g.stroke(); }
    for (let i = 0; i < leaves; i++) {
      const a = r() * 6.28, d = s * (0.06 + r() * 0.3), l = len[0] + r() * (len[1] - len[0]);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      const col = shade(r, base, 46), dark = col.map((c) => c * 0.62);
      g.save(); g.translate(x, y); g.rotate(a + (r() - 0.5) * 1.3);
      const grd = g.createLinearGradient(0, -l * width, 0, l * width);
      grd.addColorStop(0, rgb(dark)); grd.addColorStop(0.5, rgb(col)); grd.addColorStop(1, rgb(dark));
      g.fillStyle = grd;
      if (round) { g.beginPath(); g.ellipse(l / 2, 0, l / 2, l * width, 0, 0, 7); } else leafPath(g, l, l * width);
      g.fill();
      g.strokeStyle = rgb(col.map((c) => Math.min(255, c * 1.35)), 0.55); g.lineWidth = 1;     // the midrib
      g.beginPath(); g.moveTo(1, 0); g.lineTo(l * 0.9, 0); g.stroke();
      g.restore();
    }
  }, seed);
}
// A conifer sprig: a twig with fine needles along it (spruce), or radiating tufts (pine).
function needleSprig(base, { tufts = false, size = 256, seed = 2 } = {}) {
  return alphaTex(size, (g, s, r) => {
    const draw = (x0, y0, a, len, count, nl) => {
      g.strokeStyle = "rgba(80,58,38,0.95)"; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); g.stroke();
      for (let i = 0; i < count; i++) {
        const t = i / count, x = x0 + Math.cos(a) * len * t, y = y0 + Math.sin(a) * len * t;
        for (const side of [-1, 1]) {
          const na = a + side * (0.7 + r() * 0.5), l = nl * (0.6 + 0.4 * (1 - t)) * (0.8 + r() * 0.4);
          g.strokeStyle = rgb(shade(r, base, 40), 0.95); g.lineWidth = 1.3;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(na) * l, y + Math.sin(na) * l); g.stroke();
        }
      }
    };
    if (tufts) {
      for (let k = 0; k < 9; k++) {
        const cx = s * (0.2 + r() * 0.6), cy = s * (0.2 + r() * 0.6);
        for (let i = 0; i < 34; i++) {
          const a = r() * 6.28, l = s * (0.07 + r() * 0.07);
          g.strokeStyle = rgb(shade(r, base, 44), 0.95); g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * l * 0.5, cy + Math.sin(a) * l * 0.5 - 3, cx + Math.cos(a) * l, cy + Math.sin(a) * l); g.stroke();
        }
      }
    } else {
      draw(s * 0.08, s * 0.5, 0, s * 0.84, 46, s * 0.12);
      for (let k = 0; k < 4; k++) { const t = 0.25 + k * 0.16; draw(s * (0.08 + 0.84 * t), s * 0.5, (k % 2 ? -1 : 1) * (0.55 + r() * 0.3), s * 0.28, 18, s * 0.08); }
    }
  }, seed);
}
// A palm frond: a curved rachis with long leaflets on both sides.
function frondTex(base, seed = 3) {
  return alphaTex(512, (g, s, r) => {
    g.strokeStyle = "rgba(150,140,80,1)"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(s * 0.5, s); g.lineTo(s * 0.5, 0); g.stroke();
    for (let i = 0; i < 60; i++) {
      const t = i / 60, y = s * (1 - t), l = s * 0.48 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.85 + r() * 0.3);
      for (const side of [-1, 1]) {
        const col = shade(r, base, 40);
        g.strokeStyle = rgb(col); g.lineWidth = 3 + (1 - t) * 3;
        g.beginPath(); g.moveTo(s * 0.5, y); g.quadraticCurveTo(s * 0.5 + side * l * 0.6, y - l * 0.1, s * 0.5 + side * l, y + l * 0.22); g.stroke();
      }
    }
  }, seed);
}
// Fine leaflets (acacia, sagebrush): many tiny leaves.
function leafletTex(base, { size = 256, seed = 4, count = 900, len = 9 } = {}) {
  return alphaTex(size, (g, s, r) => {
    g.strokeStyle = "rgba(90,66,40,0.9)"; g.lineWidth = 1.6;
    for (let k = 0; k < 7; k++) { const a = r() * 6.28; g.beginPath(); g.moveTo(s / 2, s / 2); g.lineTo(s / 2 + Math.cos(a) * s * 0.42, s / 2 + Math.sin(a) * s * 0.42); g.stroke(); }
    for (let i = 0; i < count; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * s * 0.44, x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d;
      g.fillStyle = rgb(shade(r, base, 50));
      g.save(); g.translate(x, y); g.rotate(r() * 6.28); g.beginPath(); g.ellipse(0, 0, len * (0.6 + r() * 0.6), len * 0.32, 0, 0, 7); g.fill(); g.restore();
    }
  }, seed);
}
function barkTex(base, { seed = 5, rings = false, birch = false } = {}) {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = rgb(base); g.fillRect(0, 0, s, s);
    if (birch) {
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(25,22,20,${0.55 + r() * 0.4})`; g.fillRect(r() * s, r() * s, 8 + r() * 40, 1.5 + r() * 4); }
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(120,110,100,${0.15 + r() * 0.2})`; g.fillRect(r() * s, r() * s, 2 + r() * 6, 1); }
      return;
    }
    if (rings) {
      for (let y = 0; y < s; y += 10 + r() * 8) { g.fillStyle = `rgba(50,40,28,${0.35 + r() * 0.3})`; g.fillRect(0, y, s, 2 + r() * 3); g.fillStyle = "rgba(190,170,130,0.18)"; g.fillRect(0, y + 3, s, 3); }
      return;
    }
    // Fissured bark: long dark cracks and light ridges.
    for (let i = 0; i < 140; i++) {
      const x = r() * s, w = 1 + r() * 4;
      g.fillStyle = `rgba(${r() > 0.5 ? "28,20,14" : "170,140,110"},${0.18 + r() * 0.35})`;
      g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= s; y += 16) g.lineTo(x + Math.sin(y * 0.05 + i) * 3, y); g.lineTo(x + w, s); g.lineTo(x + w, 0); g.fill();
    }
  }, [1, 1], { seed });
}
function cactusTex(base, seed = 6) {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = rgb(base); g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += s / 16) {
      const grd = g.createLinearGradient(x, 0, x + s / 16, 0);
      grd.addColorStop(0, "rgba(20,40,20,0.45)"); grd.addColorStop(0.5, "rgba(200,220,160,0.22)"); grd.addColorStop(1, "rgba(20,40,20,0.45)");
      g.fillStyle = grd; g.fillRect(x, 0, s / 16, s);
      for (let y = 4; y < s; y += 11) {                      // areoles with spines on each rib
        g.fillStyle = "rgba(235,225,190,0.9)"; g.beginPath(); g.arc(x + s / 32, y + r() * 2, 1.6, 0, 7); g.fill();
        g.strokeStyle = "rgba(240,235,210,0.7)"; g.lineWidth = 0.8;
        for (let k = 0; k < 4; k++) { const a = r() * 6.28; g.beginPath(); g.moveTo(x + s / 32, y); g.lineTo(x + s / 32 + Math.cos(a) * 5, y + Math.sin(a) * 5); g.stroke(); }
      }
    }
  }, [1, 1], { seed });
}

// Materials: bark (opaque) and cards (alpha-tested, both sides). Without a DOM (tests): plain colours.
function barkMat(tex, fallback) { return new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : fallback, map: tex, roughness: 0.95 }); }
function cardMat(tex, fallback) {
  return new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : fallback, map: tex, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.82 });       // low, so crowns stay full far off
}

function materials() {
  return {
    oakBark: barkMat(barkTex([96, 80, 62], { seed: 11 }), 0x60503e),
    pineBark: barkMat(barkTex([150, 92, 58], { seed: 12 }), 0x965c3a),
    spruceBark: barkMat(barkTex([86, 70, 58], { seed: 13 }), 0x56463a),
    birchBark: barkMat(barkTex([232, 228, 218], { birch: true, seed: 14 }), 0xe8e4da),
    acaciaBark: barkMat(barkTex([92, 78, 64], { seed: 15 }), 0x5c4e40),
    palmBark: barkMat(barkTex([140, 122, 94], { rings: true, seed: 16 }), 0x8c7a5e),
    oakLeaf: cardMat(leafSpray([82, 112, 48], { seed: 21 }), 0x52702f),
    oakLeafDark: cardMat(leafSpray([58, 86, 36], { seed: 22 }), 0x3a5624),
    birchLeaf: cardMat(leafSpray([128, 150, 58], { seed: 23, leaves: 70, len: [14, 26], width: 0.6 }), 0x80963a),
    spruce: cardMat(needleSprig([40, 70, 46], { seed: 24 }), 0x284630),
    pine: cardMat(needleSprig([70, 98, 52], { tufts: true, seed: 25 }), 0x466234),
    juniper: cardMat(needleSprig([62, 86, 70], { tufts: true, seed: 26 }), 0x3e5646),
    acacia: cardMat(leafletTex([104, 120, 56], { seed: 27 }), 0x687838),
    thorn: cardMat(leafletTex([116, 124, 66], { seed: 28, count: 500 }), 0x747c42),
    sage: cardMat(leafletTex([150, 160, 140], { seed: 29, count: 1100, len: 7 }), 0x96a08c),
    frond: cardMat(frondTex([70, 130, 50], 30), 0x46823a),
    deadFrond: cardMat(frondTex([150, 120, 70], 31), 0x967846),
    tropical: cardMat(leafSpray([52, 130, 46], { seed: 32, leaves: 16, len: [70, 110], width: 0.5 }), 0x34822e),
    leafyBush: cardMat(leafSpray([90, 122, 52], { seed: 33, leaves: 60, len: [18, 34] }), 0x5a7a34),
    cactus: new THREE.MeshStandardMaterial({ color: hasDom ? 0xffffff : 0x5e7a45, map: cactusTex([88, 122, 70]), roughness: 0.65 }),
    pad: new THREE.MeshStandardMaterial({ color: hasDom ? 0xffffff : 0x6f8a48, map: cactusTex([108, 140, 72], 7), roughness: 0.7 }),
    flower: new THREE.MeshStandardMaterial({ color: 0xf2c23a, roughness: 0.6 }),
    fruit: new THREE.MeshStandardMaterial({ color: 0xb2304a, roughness: 0.6 }),
    nut: new THREE.MeshStandardMaterial({ color: 0x6a5a32, roughness: 0.7 }),
  };
}

// --- Trees ----------------------------------------------------------------------------------------

// A tree from a recursive skeleton: returns { bark: [geoms], cards: [geoms] }.
function grow(r, { trunk, limbs, twigs, leaves }) {
  const bark = [], cards = [], tips = [];
  const h = trunk.h, bend = V((r() - 0.5) * trunk.bend, 0, (r() - 0.5) * trunk.bend);
  const tp = [V(0, 0, 0), V(bend.x * 0.3, h * 0.35, bend.z * 0.3), V(bend.x * 0.7, h * 0.7, bend.z * 0.7), V(bend.x, h, bend.z)];
  bark.push(branch(tp, trunk.r0, trunk.r1, 8));
  const trunkCurve = new THREE.CatmullRomCurve3(tp);
  for (let i = 0; i < limbs.n; i++) {
    const t = limbs.from + (limbs.to - limbs.from) * (i / Math.max(1, limbs.n - 1)) * (0.85 + r() * 0.15);
    const base = trunkCurve.getPointAt(Math.min(1, t));
    const a = (i / limbs.n) * Math.PI * 2 * 1.618 + r() * 0.8;
    const out = V(Math.cos(a), 0, Math.sin(a));
    const tilt = limbs.tilt[0] + r() * (limbs.tilt[1] - limbs.tilt[0]);           // degrees above the horizontal
    const dir = out.clone().multiplyScalar(Math.cos((tilt * Math.PI) / 180)).add(V(0, Math.sin((tilt * Math.PI) / 180), 0));
    const len = (limbs.len[0] + r() * (limbs.len[1] - limbs.len[0])) * (limbs.taper ? 1 - t * limbs.taper : 1);
    const mid = base.clone().addScaledVector(dir, len * 0.5).add(V(0, -limbs.sag * len * 0.15, 0));
    const end = base.clone().addScaledVector(dir, len).add(V(0, -limbs.sag * len * 0.35, 0));
    bark.push(branch([base, mid, end], limbs.r0, limbs.r1, 6));
    const curve = new THREE.CatmullRomCurve3([base, mid, end]);
    for (let k = 0; k < twigs.n; k++) {
      const tt = twigs.from + r() * (1 - twigs.from);
      const tb = curve.getPointAt(tt);
      const td = dir.clone().add(randomDir(r, twigs.up)).normalize();
      const tl = twigs.len[0] + r() * (twigs.len[1] - twigs.len[0]);
      const te = tb.clone().addScaledVector(td, tl).add(V(0, -twigs.droop * tl, 0));
      bark.push(branch([tb, tb.clone().lerp(te, 0.5).add(V(0, -twigs.droop * tl * 0.3, 0)), te], twigs.r, twigs.r * 0.4, 4));
      tips.push({ at: te, along: td, from: tb });
    }
    tips.push({ at: end, along: dir, from: base });
  }
  const centre = tips.reduce((c, t) => c.add(t.at), V(0, 0, 0)).multiplyScalar(1 / Math.max(1, tips.length));
  centre.y -= leaves.lift ?? 0.3;
  for (const tip of tips) {
    for (let k = 0; k < leaves.per; k++) {
      const s = leaves.size[0] + r() * (leaves.size[1] - leaves.size[0]);
      const at = tip.from.clone().lerp(tip.at, leaves.along ? 0.35 + r() * 0.65 : 1).add(randomDir(r).multiplyScalar(leaves.spread * r()));
      const facing = leaves.flat ? V((r() - 0.5) * 0.4, 1, (r() - 0.5) * 0.4) : randomDir(r, 0.2);
      cards.push(card(at, s, s, facing, r() * 6.28, centre));
    }
  }
  return { bark, cards };
}

function oak(r) {
  return grow(r, { trunk: { h: 2.8 + r() * 1.4, r0: 0.26, r1: 0.13, bend: 0.6 },
    limbs: { n: 6 + Math.floor(r() * 3), from: 0.5, to: 1, tilt: [20, 55], len: [1.8, 3], r0: 0.11, r1: 0.04, sag: 0.25, taper: 0.3 },
    twigs: { n: 5, from: 0.25, len: [0.6, 1.2], r: 0.03, up: 0.3, droop: 0.05 },
    leaves: { per: 9, size: [0.9, 1.45], spread: 0.7, along: true } });
}
function birch(r) {
  return grow(r, { trunk: { h: 6 + r() * 3, r0: 0.13, r1: 0.05, bend: 0.4 },
    limbs: { n: 9, from: 0.35, to: 1, tilt: [30, 70], len: [1.2, 2.2], r0: 0.04, r1: 0.015, sag: 0.6, taper: 0.4 },
    twigs: { n: 5, from: 0.2, len: [0.6, 1.2], r: 0.012, up: -0.6, droop: 0.5 },                   // hanging twigs
    leaves: { per: 8, size: [0.55, 0.85], spread: 0.3, along: true } });
}
function acacia(r) {
  const h = 3 + r() * 1.4;
  return grow(r, { trunk: { h, r0: 0.2, r1: 0.12, bend: 0.9 },
    limbs: { n: 4, from: 0.75, to: 1, tilt: [30, 45], len: [2.2, 3.2], r0: 0.1, r1: 0.04, sag: -0.1 },
    twigs: { n: 7, from: 0.4, len: [1, 1.8], r: 0.025, up: 0, droop: -0.02 },
    leaves: { per: 5, size: [1, 1.5], spread: 0.35, flat: true, lift: 1.5 } });
}
// Spruce: a straight trunk and whorls of drooping branches clad in needle sprigs, a cone overall.
function spruce(r) {
  const bark = [], cards = [];
  const h = 7 + r() * 5, top = V(0, h, 0);
  bark.push(branch([V(0, 0, 0), V(0, h * 0.5, 0), top], 0.2, 0.03, 7));
  const centre = V(0, h * 0.45, 0);
  for (let y = 0.9; y < h - 0.3; y += 0.24 + r() * 0.08) {
    const t = y / h, L = (1 - t) * h * 0.3 + 0.25;
    const n = 7 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + r() * 0.6, out = V(Math.cos(a), 0, Math.sin(a));
      const base = V(0, y, 0), end = base.clone().addScaledVector(out, L).add(V(0, -L * 0.28, 0));
      bark.push(branch([base, base.clone().lerp(end, 0.5).add(V(0, L * 0.05, 0)), end], 0.035 * (1 - t) + 0.01, 0.006, 4));
      const sprigs = Math.max(2, Math.round(L / 0.22));
      for (let k = 0; k < sprigs; k++) {
        const at = base.clone().lerp(end, (k + 0.6) / sprigs);
        const s = 0.8 + (1 - t) * 0.5;
        const facing = V(-out.z, 1.2, out.x).normalize().add(randomDir(r).multiplyScalar(0.3));
        cards.push(card(at, s * 1.3, s * 0.8, facing, Math.atan2(out.z, out.x) + (r() - 0.5) * 0.5, centre));
        cards.push(card(at.clone().add(V(0, -0.06, 0)), s * 1.1, s * 0.7, randomDir(r, 0.2), r() * 6.28, centre));   // a second, crossing one
      }
    }
  }
  for (let k = 0; k < 3; k++) cards.push(card(V(0, h - 0.2, 0), 0.5, 0.8, randomDir(r), r() * 6.28, centre));   // the leader
  return { bark, cards };
}
// Scots pine: a tall bare trunk, orange near the top, and a rounded crown of needle tufts.
function pine(r) {
  const bark = [], cards = [];
  const h = 9 + r() * 4, lean = V((r() - 0.5) * 0.8, 0, (r() - 0.5) * 0.8);
  const tp = [V(0, 0, 0), V(lean.x * 0.3, h * 0.4, lean.z * 0.3), V(lean.x * 0.8, h * 0.8, lean.z * 0.8), V(lean.x, h, lean.z)];
  bark.push(branch(tp, 0.24, 0.06, 8));
  const curve = new THREE.CatmullRomCurve3(tp);
  const centre = curve.getPointAt(0.86);
  for (let i = 0; i < 18; i++) {
    const t = 0.55 + (i / 18) * 0.43, base = curve.getPointAt(t);
    const a = i * 2.4 + r(), out = V(Math.cos(a), 0, Math.sin(a));
    const L = 1.2 + r() * 1.6 * (1 - (t - 0.62) * 1.5);
    const end = base.clone().addScaledVector(out, L).add(V(0, L * (0.25 + r() * 0.3), 0));
    bark.push(branch([base, base.clone().lerp(end, 0.5).add(V(0, -0.1, 0)), end], 0.06, 0.015, 5));
    for (let k = 0; k < 12; k++) {
      const at = base.clone().lerp(end, 0.3 + r() * 0.7).add(randomDir(r).multiplyScalar(0.5));
      cards.push(card(at, 1.3 + r() * 0.7, 1.3 + r() * 0.7, randomDir(r, 0.6), r() * 6.28, centre));
    }
  }
  return { bark, cards, barkSplit: true };
}
// Coconut palm: a curved, ringed trunk; arching fronds (and two dead brown ones) and coconuts.
function palm(r) {
  const bark = [], cards = [], dead = [], nuts = [];
  const h = 6 + r() * 4, lean = 1 + r() * 1.8, a0 = r() * 6.28, dir = V(Math.cos(a0), 0, Math.sin(a0));
  const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => V(0, h * t, 0).addScaledVector(dir, lean * t * t));
  bark.push(branch(pts, 0.22, 0.15, 9));
  const top = pts.at(-1);
  // A frond: a strip arching out of the crown and drooping toward its tip (the leaflets are in its
  // texture). `lift` is how far it starts above the horizontal (radians); `droop` how much it bends.
  const frond = (yaw, lift, len, width, into, droop = 1.5) => {
    const segs = 12, g = new THREE.PlaneGeometry(width, len, 1, segs);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = (p.getY(i) + len / 2) / len;                    // 0 at the crown … 1 at the tip
      // Walk along the arc: the angle falls from `lift` by `droop` over the frond's length.
      let out = 0, up = 0;
      const steps = 12;
      for (let k = 0; k < steps; k++) { const a = lift - droop * ((k + 0.5) / steps) * v; out += Math.cos(a) * (v * len) / steps; up += Math.sin(a) * (v * len) / steps; }
      p.setXYZ(i, p.getX(i) * (1 - v * 0.35), up, out);
    }
    g.rotateY(yaw).translate(top.x, top.y, top.z);
    g.computeVertexNormals();
    into.push(g);
  };
  for (let k = 0; k < 18; k++) frond((k / 18) * 6.28 + r() * 0.3, 0.2 + r() * 0.7, 4 + r() * 1.6, 1.7, cards, 1.4 + r() * 0.6);
  for (let k = 0; k < 3; k++) frond(r() * 6.28, -0.9, 2.6, 1, dead, 0.5);           // dead ones hang down the trunk
  for (let k = 0; k < 5; k++) { const a = r() * 6.28; nuts.push(new THREE.SphereGeometry(0.11, 8, 6).translate(top.x + Math.cos(a) * 0.22, top.y - 0.25, top.z + Math.sin(a) * 0.22)); }
  return { bark, cards, dead, nuts };
}

// --- Cacti ----------------------------------------------------------------------------------------

// A ribbed column (saguaro trunk or arm): radius modulated by 12 ribs, rounded top.
function ribbedColumn(h, rad, ribs = 12) {
  const g = new THREE.CapsuleGeometry(rad, Math.max(0.01, h - rad * 2), 6, ribs * 3);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.cos(a * ribs);
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.translate(0, h / 2, 0);
  g.computeVertexNormals();
  return g;
}
function saguaro(r) {
  const parts = [];
  const h = 3 + r() * 3, rad = 0.24 + r() * 0.08;
  parts.push(ribbedColumn(h, rad));
  const arms = 1 + Math.floor(r() * 4);
  for (let i = 0; i < arms; i++) {
    const a = r() * 6.28, y = h * (0.3 + r() * 0.35), out = 0.45 + r() * 0.25, up = 0.8 + r() * 1.3, ar = rad * 0.72;
    const d = V(Math.cos(a), 0, Math.sin(a));
    const elbow = branch([V(0, y, 0), V(0, y, 0).addScaledVector(d, out * 0.6).add(V(0, -0.05, 0)), V(0, y + ar, 0).addScaledVector(d, out)], ar, ar, 12);
    parts.push(elbow, ribbedColumn(up, ar).translate(d.x * out, y + ar * 0.6, d.z * out));
  }
  return { body: parts };
}
function barrelCactus(r) {
  const body = [], flowers = [];
  for (let i = 0; i < 1 + Math.floor(r() * 3); i++) {
    const s = 0.22 + r() * 0.2, x = (r() - 0.5) * 0.8, z = (r() - 0.5) * 0.8;
    const g = new THREE.SphereGeometry(1, 36, 14), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const a = Math.atan2(p.getZ(k), p.getX(k)), m = 1 + 0.09 * Math.cos(a * 18); p.setX(k, p.getX(k) * m); p.setZ(k, p.getZ(k) * m); }
    g.scale(s, s * 1.25, s).translate(x, s * 1.05, z);
    g.computeVertexNormals();
    body.push(g);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.28; flowers.push(new THREE.ConeGeometry(0.035, 0.07, 6).translate(x + Math.cos(a) * s * 0.35, s * 2.3, z + Math.sin(a) * s * 0.35)); }
  }
  return { body, flowers };
}
function pricklyPear(r) {
  const body = [], fruit = [];
  const pad = (x, y, z, s, yaw, tilt) => {
    const g = new THREE.SphereGeometry(1, 16, 10).scale(s * 0.72, s, s * 0.15);
    g.rotateZ(tilt).rotateY(yaw).translate(x, y, z);
    body.push(g);
    for (let k = 0; k < 3; k++) if (r() < 0.5) fruit.push(new THREE.SphereGeometry(0.045, 6, 5).scale(1, 1.3, 1).translate(x + (r() - 0.5) * s * 0.8, y + s * 0.95, z));
  };
  let y = 0.25;
  for (let i = 0; i < 5 + Math.floor(r() * 5); i++) { pad((r() - 0.5) * 0.9, y + r() * 0.4, (r() - 0.5) * 0.9, 0.22 + r() * 0.12, r() * 6.28, (r() - 0.5) * 1.1); if (i % 2) y += 0.25; }
  return { body, fruit };
}

// --- Bushes ---------------------------------------------------------------------------------------

/** A bush prototype: leaf cards over a dome, normals out from its middle (one merged geometry). */
function bushGeometry(r, { cards = 34, w = 1, h = 0.7, size = [0.45, 0.8] }) {
  const centre = V(0, h * 0.25, 0), out = [];
  for (let i = 0; i < cards; i++) {
    const a = r() * 6.28, rr = Math.sqrt(r()), up = r();
    const at = V(Math.cos(a) * rr * w * 0.5, up * h, Math.sin(a) * rr * w * 0.5);
    const s = size[0] + r() * (size[1] - size[0]);
    out.push(card(at, s, s, randomDir(r, 0.4), r() * 6.28, centre));
  }
  return merge(out);
}

// --- The kinds ------------------------------------------------------------------------------------

// Bush spots along the bank tops and edges, a few lower down the faces.
function bushSpots(bay, r, count) {
  const spots = [];
  for (let i = 0; i < 20000 && spots.length < count; i++) {
    const x = (r() - 0.5) * (bay.width + 44), z = -6 + r() * (bay.depth + 26);
    const y = heightAt(x, z, bay);
    if (y > 2.2 || (y > 1 && r() < 0.08)) spots.push([x, y, z]);
  }
  return spots;
}
function bushes(bay, r, mat, { count, shape, tint }) {
  const spots = bushSpots(bay, r, count);
  if (!spots.length) return null;
  const geo = bushGeometry(rng(53), shape);
  const inst = new THREE.InstancedMesh(geo, mat, spots.length);
  const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  spots.forEach(([x, y, z], i) => {
    const s = 0.6 + r() * 0.9;
    q.setFromEuler(new THREE.Euler(0, r() * 6.28, 0));
    mm.compose(p.set(x, y - 0.08, z), q, sc.set(s, s * (0.8 + r() * 0.4), s));
    inst.setMatrixAt(i, mm);
    inst.setColorAt(i, c.setHSL(tint[0] + (r() - 0.5) * 0.04, tint[1], tint[2] + (r() - 0.5) * 0.12));
  });
  inst.castShadow = false;
  inst.receiveShadow = true;
  return inst;
}
// Where the trees stand: beyond the banks on both sides and behind the backstop.
function treeSpot(bay, r, i) {
  const side = i % 3;
  const x = side === 0 ? -(bay.width / 2 + 13 + r() * 14) : side === 1 ? bay.width / 2 + 13 + r() * 14 : (r() - 0.5) * (bay.width + 34);
  const z = side === 2 ? bay.depth + 12 + r() * 12 : r() * bay.depth * 1.1;
  return [x, z];
}
// Plants scattered on the banks (cacti, prickly pear): on the top and down the faces.
function bankSpots(bay, r, count) {
  const out = [];
  for (let i = 0; i < 20000 && out.length < count; i++) {
    const x = (r() - 0.5) * (bay.width + 40), z = -4 + r() * (bay.depth + 24);
    const y = heightAt(x, z, bay);
    if (y > 0.8) out.push([x, y, z]);
  }
  return out;
}

// A tree prototype as a Group of merged meshes: bark, leaf cards (in two greens, alternating), extras.
function treeGroup(made, m, kind) {
  const g = new THREE.Group();
  const leafMats = { mixed: [m.oakLeaf, m.oakLeafDark], nordic: [m.spruce, m.spruce], savanna: [m.acacia, m.acacia], tropical: [m.frond, m.frond] };
  const barkFor = { oak: m.oakBark, birch: m.birchBark, spruce: m.spruceBark, pine: m.pineBark, acacia: m.acaciaBark, palm: m.palmBark };
  const add = (geoms, mat) => { const geo = merge(geoms); if (geo) g.add(mesh(geo, mat)); };
  add(made.bark, barkFor[made.kind]);
  if (made.cards?.length) {
    const [a, b] = made.leaf || leafMats[kind] || [m.oakLeaf, m.oakLeafDark];
    add(made.cards.filter((_, i) => i % 2 === 0), a);
    add(made.cards.filter((_, i) => i % 2 === 1), b);
  }
  if (made.dead?.length) add(made.dead, m.deadFrond);
  if (made.nuts?.length) add(made.nuts, m.nut);
  if (made.body?.length) add(made.body, made.bodyMat || m.cactus);
  if (made.flowers?.length) add(made.flowers, m.flower);
  if (made.fruit?.length) add(made.fruit, m.fruit);
  return g;
}

// Each kind: tree makers (used in turn, each tagged with its bark and leaf), bushes, bank plants, grass.
const KINDS = {
  mixed: { trees: [["oak", oak]], count: 30, bush: { mat: "leafyBush", count: 900, shape: { cards: 34, w: 1.1, h: 0.75 }, tint: [0.25, 0.32, 0.72] },
    grass: { count: 7000, tones: ["#c9c08a", "#a9ab68", "#8f9a58", "#bcae72", "#7f8a4a"] } },
  nordic: { trees: [["spruce", spruce], ["spruce", spruce], ["pine", pine, "pine"], ["birch", birch, "birch"]], count: 42,
    bush: { mat: "juniper", count: 800, shape: { cards: 26, w: 1, h: 0.5 }, tint: [0.33, 0.25, 0.7] },
    grass: { count: 7500, tones: ["#7d9250", "#6f8a4a", "#8ea05a", "#5f7a42", "#a4a868"] } },
  desert: { trees: [["cactus", saguaro]], count: 26, bank: [{ make: barrelCactus, count: 60 }, { make: pricklyPear, count: 40, bodyMat: "pad" }],
    bush: { mat: "sage", count: 420, shape: { cards: 22, w: 0.8, h: 0.5, size: [0.35, 0.6] }, tint: [0.2, 0.1, 0.8] },
    grass: { count: 2200, tones: ["#d8c48a", "#cdb97c", "#e0cf9a", "#c4ad72"] } },
  savanna: { trees: [["acacia", acacia]], count: 22, bush: { mat: "thorn", count: 380, shape: { cards: 24, w: 1.3, h: 0.7 }, tint: [0.2, 0.25, 0.7] },
    grass: { count: 11000, tones: ["#d9b866", "#e3c477", "#c9a656", "#d4b26a", "#bfa25a"], scale: 1.6 } },
  tropical: { trees: [["palm", palm], ["palm", palm], ["oak", oak]], count: 34, bush: { mat: "tropical", count: 1000, shape: { cards: 18, w: 1.3, h: 0.9, size: [0.7, 1.1] }, tint: [0.3, 0.4, 0.68] },
    grass: { count: 8000, tones: ["#7fae4a", "#6a9e3e", "#8fbb56", "#5e9238"] } },
  none: { trees: [], count: 0, grass: null },
};

/** The plants for one kind (see FOLIAGE_KINDS), as a Group to add to the Outdoor scene. */
export function buildFoliage(bay, kind = "mixed") {
  const spec = KINDS[kind] || KINDS.mixed;
  const group = new THREE.Group();
  group.name = `foliage-${kind}`;
  const r = rng(11);
  const m = materials();
  if (spec.bush) { const b = bushes(bay, r, m[spec.bush.mat], spec.bush); if (b) group.add(b); }
  if (spec.trees.length) {
    const leafFor = { pine: [m.pine, m.pine], birch: [m.birchLeaf, m.birchLeaf], oak: [m.oakLeaf, m.oakLeafDark] };
    const protos = Array.from({ length: Math.max(5, spec.trees.length) }, (_, i) => {
      const [barkKind, make, leaf] = spec.trees[i % spec.trees.length];
      const made = make(r);
      made.kind = barkKind;
      if (leaf || (kind === "tropical" && barkKind === "oak")) made.leaf = leafFor[leaf || "oak"];
      return treeGroup(made, m, kind);
    });
    for (let i = 0; i < spec.count; i++) {
      const [x, z] = treeSpot(bay, r, i);
      const t = protos[i % protos.length].clone();
      const k = 0.85 + r() * 0.4;
      t.scale.set(k, k * (0.9 + r() * 0.25), k);
      t.rotation.y = r() * 6.28;
      t.position.set(x, heightAt(x, z, bay) - 0.1, z);
      group.add(t);
    }
  }
  for (const { make, count, bodyMat } of spec.bank || []) {
    const protos = Array.from({ length: 4 }, () => { const made = make(r); made.bodyMat = bodyMat ? m[bodyMat] : null; return treeGroup(made, m, kind); });
    bankSpots(bay, r, count).forEach(([x, y, z], i) => {
      const t = protos[i % protos.length].clone();
      t.rotation.y = r() * 6.28;
      t.position.set(x, y - 0.05, z);
      group.add(t);
    });
  }
  if (spec.grass) group.add(grassCards(bay, spec.grass));
  return group;
}
