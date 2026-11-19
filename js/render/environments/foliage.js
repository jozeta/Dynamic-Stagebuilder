// The Outdoor range's plants (look.foliage, Settings → Environment → Foliage): trees beyond the
// banks, bushes along the bank tops and grass on the banks, in one of several kinds:
//   mixed     broadleaf trees and green bushes (the original look)
//   nordic    spruces, pines and birches, low dark juniper, greener grass
//   desert    saguaros, barrel cacti and prickly pear, grey sagebrush, sparse dry grass
//   savanna   flat-topped acacias, a few thorn bushes, tall golden grass
//   tropical  palms, lush bright bushes, green grass
//   none      bare earth banks
// All generated in code (flat-shaded, seeded), never touching the stage. buildFoliage(bay, kind)
// returns a Group; the Outdoor surroundings swap it when the choice changes.
import * as THREE from "three";
import { canvasTexture, rng } from "./common.js";
import { heightAt } from "./terrain.js";
import { grassCards } from "./ground.js";

export const FOLIAGE_KINDS = ["mixed", "nordic", "desert", "savanna", "tropical", "none"];

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true, ...o });

function jitter(geo, r, amount) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + (r() - 0.5) * amount), p.getY(i) * (1 + (r() - 0.5) * amount), p.getZ(i) * (1 + (r() - 0.5) * amount));
  geo.computeVertexNormals();
  return geo;
}
const mesh = (geo, mat, [x, y, z] = [0, 0, 0]) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = false; m.receiveShadow = true; return m; };

// --- Textures -------------------------------------------------------------------------------------
function barkTexture(base = "#6e5236", seed = 29) {
  return canvasTexture(128, (g, s, r) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "40,28,18" : "150,120,90"},${0.15 + r() * 0.3})`; g.fillRect(r() * s, 0, 1 + r() * 3, s); }
  }, [1, 2], { seed });
}
function birchTexture() {
  return canvasTexture(128, (g, s, r) => {
    g.fillStyle = "#e9e5da"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,28,26,${0.5 + r() * 0.4})`; g.fillRect(r() * s, r() * s, 6 + r() * 18, 1 + r() * 3); }
  }, [1, 2], { seed: 33 });
}
function leafTexture(base = "#5d7c35", seed = 31) {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1600; i++) {
      const v = r();
      g.fillStyle = v > 0.66 ? "rgba(160,180,90,0.5)" : v > 0.33 ? "rgba(60,90,40,0.5)" : "rgba(40,60,28,0.45)";
      g.beginPath(); g.ellipse(r() * s, r() * s, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, 7); g.fill();
    }
  }, [2, 2], { seed });
}
function ribTexture(base = "#5e7a45") {
  return canvasTexture(128, (g, s) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 8) { g.fillStyle = "rgba(20,40,20,0.35)"; g.fillRect(x, 0, 2, s); g.fillStyle = "rgba(200,220,160,0.18)"; g.fillRect(x + 3, 0, 2, s); }
  }, [3, 1], { seed: 37 });
}
// A material with a canvas texture, or a plain colour when there is no DOM (tests).
const textured = (map, fallback, o = {}) => std({ color: map ? 0xffffff : fallback, map, ...o });

// --- Trees ----------------------------------------------------------------------------------------
function broadleaf(r, m) {
  const tree = new THREE.Group();
  const h = 3.2 + r() * 2.6;
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.2, h * 0.62, 8, 5);
  const p = trunkGeo.attributes.position;
  const bend = (r() - 0.5) * 0.5;
  for (let i = 0; i < p.count; i++) { const t = p.getY(i) / (h * 0.62) + 0.5; p.setX(i, p.getX(i) + bend * t * t); }
  trunkGeo.computeVertexNormals();
  tree.add(mesh(trunkGeo, m.bark, [0, h * 0.31, 0]));
  const tips = [];
  for (let b = 0; b < 4; b++) {
    const a = (b / 4) * Math.PI * 2 + r(), len = 0.8 + r() * 0.8, y = h * (0.5 + r() * 0.15);
    const br = mesh(new THREE.CylinderGeometry(0.03, 0.07, len, 5), m.bark, [bend * 0.6 + Math.cos(a) * len * 0.35, y + len * 0.3, Math.sin(a) * len * 0.35]);
    br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    tree.add(br);
    tips.push([bend * 0.6 + Math.cos(a) * len * 0.7, y + len * 0.6, Math.sin(a) * len * 0.7]);
  }
  tips.push([bend, h * 0.85, 0]);
  for (const [x, y, z] of tips) for (let k = 0; k < 3; k++) {
    tree.add(mesh(jitter(new THREE.IcosahedronGeometry(0.55 + r() * 0.6, 1), r, 0.35), k % 2 ? m.leaf : m.leafDark,
      [x + (r() - 0.5) * 0.8, y + (r() - 0.3) * 0.6, z + (r() - 0.5) * 0.8]));
  }
  return tree;
}
function spruce(r, m) {
  const tree = new THREE.Group();
  const h = 5 + r() * 4;
  tree.add(mesh(new THREE.CylinderGeometry(0.08, 0.18, h * 0.9, 7), m.bark, [0, h * 0.45, 0]));
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers, rad = (1.5 - t * 1.2) * (0.9 + r() * 0.2), th = h * 0.32;
    tree.add(mesh(jitter(new THREE.ConeGeometry(rad, th, 9, 2), r, 0.18), i % 2 ? m.needle : m.needleDark, [0, h * 0.2 + t * h * 0.72 + th / 2, 0]));
  }
  return tree;
}
function pine(r, m) {
  const tree = new THREE.Group();
  const h = 7 + r() * 4;
  const lean = (r() - 0.5) * 0.3;
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.22, h, 7), m.pineBark, [lean * h * 0.3, h / 2, 0]);
  trunk.rotation.z = -lean * 0.3;
  tree.add(trunk);
  for (let k = 0; k < 5; k++) {
    tree.add(mesh(jitter(new THREE.IcosahedronGeometry(0.9 + r() * 0.6, 1), r, 0.3).scale(1, 0.55, 1), k % 2 ? m.needle : m.needleDark,
      [lean * h * 0.55 + (r() - 0.5) * 1.4, h * (0.82 + r() * 0.16), (r() - 0.5) * 1.4]));
  }
  return tree;
}
function birch(r, m) {
  const tree = new THREE.Group();
  const h = 4.5 + r() * 3;
  const trunk = mesh(new THREE.CylinderGeometry(0.06, 0.12, h, 7), m.birch, [0, h / 2, 0]);
  trunk.rotation.z = (r() - 0.5) * 0.12;
  tree.add(trunk);
  for (let k = 0; k < 6; k++) {
    tree.add(mesh(jitter(new THREE.IcosahedronGeometry(0.45 + r() * 0.4, 1), r, 0.35), k % 2 ? m.birchLeaf : m.leaf,
      [(r() - 0.5) * 1.2, h * (0.55 + r() * 0.45), (r() - 0.5) * 1.2]));
  }
  return tree;
}
function saguaro(r, m) {
  const g = new THREE.Group();
  const h = 2.6 + r() * 2.4, rad = 0.22 + r() * 0.08;
  g.add(mesh(new THREE.CapsuleGeometry(rad, h - rad * 2, 4, 12), m.cactus, [0, h / 2, 0]));
  const arms = 1 + Math.floor(r() * 3);
  for (let i = 0; i < arms; i++) {
    const side = i % 2 ? 1 : -1, y = h * (0.35 + r() * 0.3), out = 0.5 + r() * 0.2, up = 0.6 + r() * 0.8, ar = rad * 0.75;
    const a = (r() - 0.5) * 0.6 + (side > 0 ? 0 : Math.PI);
    const elbow = mesh(new THREE.CapsuleGeometry(ar, out, 4, 10), m.cactus, [Math.cos(a) * out / 2, y, Math.sin(a) * out / 2]);
    elbow.rotation.set(0, -a, Math.PI / 2);
    g.add(elbow, mesh(new THREE.CapsuleGeometry(ar, up, 4, 10), m.cactus, [Math.cos(a) * out, y + up / 2, Math.sin(a) * out]));
  }
  return g;
}
function barrelCactus(r, m) {
  const g = new THREE.Group();
  for (let i = 0; i < 1 + Math.floor(r() * 3); i++) {
    const s = 0.25 + r() * 0.2;
    g.add(mesh(new THREE.SphereGeometry(1, 12, 8).scale(s, s * 1.3, s), m.cactus, [(r() - 0.5) * 0.8, s * 1.1, (r() - 0.5) * 0.8]));
  }
  return g;
}
function pricklyPear(r, m) {
  const g = new THREE.Group();
  const pad = (x, y, z, s, tilt) => { const p = mesh(new THREE.SphereGeometry(1, 10, 6).scale(s * 0.75, s, s * 0.18), m.pad, [x, y, z]); p.rotation.set(0, r() * 3, tilt); return p; };
  for (let i = 0; i < 4 + Math.floor(r() * 5); i++) g.add(pad((r() - 0.5) * 0.9, 0.25 + r() * 0.8, (r() - 0.5) * 0.9, 0.22 + r() * 0.12, (r() - 0.5) * 1.2));
  return g;
}
function acacia(r, m) {
  const tree = new THREE.Group();
  const h = 3.5 + r() * 2.2, lean = (r() - 0.5) * 0.5;
  const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.18, h, 7), m.bark, [lean * h * 0.3, h / 2, 0]);
  trunk.rotation.z = -lean * 0.4;
  tree.add(trunk);
  for (const s of [-1, 1]) {
    const br = mesh(new THREE.CylinderGeometry(0.05, 0.08, h * 0.45, 6), m.bark, [lean * h * 0.55 + s * 0.45, h * 0.85, 0]);
    br.rotation.z = -s * 0.7;
    tree.add(br);
  }
  // The flat, wide crown of a thorn tree.
  for (let k = 0; k < 3; k++) {
    tree.add(mesh(jitter(new THREE.IcosahedronGeometry(1, 1), r, 0.3).scale(2 + r() * 1.2, 0.3 + r() * 0.15, 1.6 + r() * 1), k % 2 ? m.acacia : m.leafDark,
      [lean * h * 0.55 + (r() - 0.5) * 1.6, h + 0.2 + r() * 0.4, (r() - 0.5) * 1.6]));
  }
  return tree;
}
function palm(r, m) {
  const tree = new THREE.Group();
  const h = 5 + r() * 4, curve = 0.6 + r() * 1.4, segs = 7;
  let top = new THREE.Vector3();
  for (let i = 0; i < segs; i++) {
    const t = i / segs, t1 = (i + 1) / segs;
    const a = new THREE.Vector3(curve * t * t, h * t, 0), b = new THREE.Vector3(curve * t1 * t1, h * t1, 0);
    const seg = mesh(new THREE.CylinderGeometry(0.13 - t1 * 0.03, 0.16 - t * 0.03, a.distanceTo(b), 7), m.palmBark, a.clone().lerp(b, 0.5).toArray());
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    tree.add(seg);
    top = b;
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + r() * 0.3, len = 2.2 + r() * 0.8, droop = 0.35 + r() * 0.35;
    const frond = mesh(new THREE.SphereGeometry(1, 8, 4).scale(0.32, 0.04, len / 2), k % 2 ? m.frond : m.frondDark, top.toArray());
    frond.rotation.order = "YXZ";
    frond.rotation.set(droop, a, 0);
    frond.translateZ(len * 0.45);
    tree.add(frond);
  }
  return tree;
}

// --- Bushes and the whole set ----------------------------------------------------------------------
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
function bushes(bay, r, { count, colors, size = [0.25, 0.5], flat = 0.55 }) {
  const spots = bushSpots(bay, r, count);
  if (!spots.length) return null;
  const geo = jitter(new THREE.IcosahedronGeometry(1, 1), rng(53), 0.3);
  const inst = new THREE.InstancedMesh(geo, std({ color: 0xffffff }), spots.length);
  const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const tones = colors.map((h) => new THREE.Color(h));
  spots.forEach(([x, y, z], i) => {
    const s = size[0] + r() * size[1];
    q.setFromEuler(new THREE.Euler(r(), r() * 6.28, r()));
    mm.compose(p.set(x, y + s * 0.15, z), q, sc.set(s * (1 + r() * 0.4), s * (flat + r() * 0.3), s));
    inst.setMatrixAt(i, mm);
    inst.setColorAt(i, tones[(r() * tones.length) | 0]);
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

function materials() {
  return {
    bark: textured(barkTexture(), 0x6e5236, { roughness: 1 }),
    pineBark: textured(barkTexture("#7a4f32", 41), 0x7a4f32, { roughness: 1 }),
    palmBark: textured(barkTexture("#8c7a5c", 43), 0x8c7a5c, { roughness: 1 }),
    birch: textured(birchTexture(), 0xe9e5da, { roughness: 0.8 }),
    leaf: textured(leafTexture(), 0x5d7c35),
    leafDark: std({ color: 0x48652c }),
    birchLeaf: textured(leafTexture("#7f9e3e", 45), 0x7f9e3e),
    needle: textured(leafTexture("#2f4a2b", 47), 0x2f4a2b),
    needleDark: std({ color: 0x223a24 }),
    cactus: textured(ribTexture(), 0x5e7a45, { roughness: 0.7 }),
    pad: std({ color: 0x6f8a48, roughness: 0.75 }),
    acacia: textured(leafTexture("#6b7a3a", 49), 0x6b7a3a),
    frond: std({ color: 0x4f8a34 }),
    frondDark: std({ color: 0x3a6e28 }),
  };
}

// Each kind: its trees (a list of makers, used in turn), bushes, bank plants and grass.
const KINDS = {
  mixed: { trees: [broadleaf], count: 30, bushes: { count: 1400, colors: ["#5f8a32", "#73a03c", "#4f7a2c", "#86ab4c", "#6c8f3a"] },
    grass: { count: 7000, tones: ["#c9c08a", "#a9ab68", "#8f9a58", "#bcae72", "#7f8a4a"] } },
  nordic: { trees: [spruce, spruce, pine, birch], count: 42, bushes: { count: 1100, colors: ["#3d5a3a", "#2f4a30", "#4d6a3e", "#5a6e44"], size: [0.2, 0.35], flat: 0.45 },
    grass: { count: 7500, tones: ["#7d9250", "#6f8a4a", "#8ea05a", "#5f7a42", "#a4a868"] } },
  desert: { trees: [saguaro], count: 26, bank: [{ make: barrelCactus, count: 60 }, { make: pricklyPear, count: 40 }],
    bushes: { count: 500, colors: ["#8f9a7a", "#9aa284", "#7f8a6a", "#a8a48a"], size: [0.18, 0.28], flat: 0.5 },
    grass: { count: 2200, tones: ["#d8c48a", "#cdb97c", "#e0cf9a", "#c4ad72"] } },
  savanna: { trees: [acacia], count: 22, bushes: { count: 450, colors: ["#6b7a3a", "#7d8a44", "#5f6e34"], size: [0.3, 0.4] },
    grass: { count: 11000, tones: ["#d9b866", "#e3c477", "#c9a656", "#d4b26a", "#bfa25a"], scale: 1.6 } },
  tropical: { trees: [palm, palm, broadleaf], count: 34, bushes: { count: 1700, colors: ["#3f8f2e", "#52a33a", "#2f7a26", "#6ab845", "#3a8a3a"], size: [0.3, 0.6] },
    grass: { count: 8000, tones: ["#7fae4a", "#6a9e3e", "#8fbb56", "#5e9238"] } },
  none: { trees: [], count: 0, grass: null },
};

/** The plants for one kind (see FOLIAGE_KINDS), as a Group to add to the Outdoor scene. */
export function buildFoliage(bay, kind = "mixed") {
  const spec = KINDS[kind] || KINDS.mixed;
  const group = new THREE.Group();
  group.name = `foliage-${kind}`;
  const r = rng(11);
  if (spec.bushes) { const b = bushes(bay, r, spec.bushes); if (b) group.add(b); }
  const m = materials();
  if (spec.trees.length) {
    const protos = Array.from({ length: Math.max(4, spec.trees.length) }, (_, i) => spec.trees[i % spec.trees.length](r, m));
    for (let i = 0; i < spec.count; i++) {
      const [x, z] = treeSpot(bay, r, i);
      const t = protos[i % protos.length].clone();
      const k = 0.8 + r() * 0.5;
      t.scale.set(k, k * (0.9 + r() * 0.3), k);
      t.rotation.y = r() * 6.28;
      t.position.set(x, heightAt(x, z, bay) - 0.1, z);
      group.add(t);
    }
  }
  for (const { make, count } of spec.bank || []) {
    const protos = Array.from({ length: 4 }, () => make(r, m));
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
