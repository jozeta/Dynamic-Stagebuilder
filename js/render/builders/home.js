// Home and office furniture at real size (model/props.js FURNITURE): a bed with frame, mattress,
// duvet, pillows and headboard; sofas (1–3 seats, L, U and corner) with a base, seat and back
// cushions, arms and feet; an office desk with a drawer pedestal and a swivel chair; a dining table
// with chairs along its long sides; a coffee table. The back of each is + z. Textures in metres.
import * as THREE from "three";
import { FURNITURE } from "../../model/props.js";
import { furnitureMaterial } from "../furnishing.js";
import { worldUV } from "./wear.js";
import { group } from "./parts.js";

// A box from its extents (x0…x1, y0…y1, z0…z1), textured in metres.
function block(x0, x1, y0, y1, z0, z1, mat) {
  const geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  geo.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  worldUV(geo);
  const m = new THREE.Mesh(geo, furnitureMaterial(mat));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
// A rounded cushion: a box with softened edges (a rounded-rectangle extrusion), from its extents.
function cushion(x0, x1, y0, y1, z0, z1, mat) {
  const w = x1 - x0, d = z1 - z0, h = y1 - y0, r = Math.min(0.04, h / 2.5, w / 4, d / 4);
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: Math.min(0.02, h / 4), bevelSize: Math.min(0.015, r / 2), bevelSegments: 2, curveSegments: 4 });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox, sx = w / (bb.max.x - bb.min.x), sy = h / (bb.max.y - bb.min.y), sz = d / (bb.max.z - bb.min.z);
  geo.scale(sx, sy, sz);
  geo.computeBoundingBox();
  geo.translate((x0 + x1) / 2 - (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2, y0 - geo.boundingBox.min.y, (z0 + z1) / 2 - (geo.boundingBox.min.z + geo.boundingBox.max.z) / 2);
  worldUV(geo);
  const m = new THREE.Mesh(geo, furnitureMaterial(mat));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
const cylinder = (r0, r1, y0, y1, x, z, mat, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, y1 - y0, seg), furnitureMaterial(mat)); m.position.set(x, (y0 + y1) / 2, z); m.castShadow = true; m.receiveShadow = true; return m; };

export function buildBed(obj) {
  const B = FURNITURE.bed, p = obj.params, mw = B[p.size], w = mw + 2 * B.frame, d = B.length + B.frame + B.headboard;
  const g = group(obj.id), wood = `wood-${p.finish}`, z0 = -d / 2, zh = d / 2 - B.headboard;
  for (const x of [-w / 2, w / 2 - 0.06]) for (const z of [z0, zh - 0.06]) g.add(block(x, x + 0.06, 0, 0.14, z, z + 0.06, wood));     // legs
  g.add(block(-w / 2, w / 2, 0.14, 0.32, z0, zh, wood));                                                                          // the frame
  g.add(cushion(-mw / 2, mw / 2, 0.3, B.mattressTop, z0 + B.frame, z0 + B.frame + B.length, "mattress"));                       // the mattress
  // The duvet over the foot two-thirds, hanging a little over the sides, folded back at the top.
  const dz1 = z0 + B.frame + B.length * 0.72;
  g.add(cushion(-mw / 2 - 0.03, mw / 2 + 0.03, B.mattressTop - 0.02, B.mattressTop + 0.07, z0 + 0.02, dz1, `bedding-${p.bedding}`));
  g.add(cushion(-mw / 2 - 0.02, mw / 2 + 0.02, B.mattressTop + 0.05, B.mattressTop + 0.1, dz1 - 0.24, dz1 + 0.02, `bedding-${p.bedding}`));
  for (const x of [-mw / 2 - 0.035, mw / 2 + 0.005]) g.add(block(x, x + 0.03, 0.3, B.mattressTop + 0.04, z0 + 0.04, dz1, `bedding-${p.bedding}`));
  // Pillows against the headboard: one on a single bed, two on a double.
  const n = p.size === "single" ? 1 : 2, pw = Math.min(0.66, (mw - 0.1) / n);
  for (let i = 0; i < n; i++) { const cx = -mw / 2 + (mw / n) * (i + 0.5); g.add(cushion(cx - pw / 2, cx + pw / 2, B.mattressTop, B.mattressTop + 0.14, zh - 0.48, zh - 0.06, "bedding-white")); }
  g.add(block(-w / 2, w / 2, 0, B.height, zh, d / 2, wood));                                                                      // the headboard
  return g;
}

// A sofa from rectangles: seat bases, backs along the outer edges, arms at open ends.
const SOFAS = (w, d) => {
  const W = w / 2, D = d / 2, A = FURNITURE.sofa.arm, back = 0.2, deep = FURNITURE.sofa.depth;
  return {
    straight: { seats: [[-W + A, W - A, -D, D - back]], backs: [[-W, W, D - back, D]], arms: [[-W, -W + A, -D, D - back], [W - A, W, -D, D - back]] },
    "l-left": { seats: [[-W + A, W - A, D - deep, D - back], [W - A - (deep - A), W - A, -D, D - deep]], backs: [[-W, W, D - back, D]], arms: [[-W, -W + A, D - deep, D - back], [W - A, W, -D, D - back]] },
    u: { seats: [[-W + A, W - A, D - deep, D - back], [-W + A, -W + deep, -D, D - deep], [W - deep, W - A, -D, D - deep]], backs: [[-W, W, D - back, D]], arms: [[-W, -W + A, -D, D - back], [W - A, W, -D, D - back]] },
    corner: { seats: [[-W + back, W - A, D - deep, D - back], [-W + back, -W + deep, -D + A, D - deep]], backs: [[-W, W, D - back, D], [-W, -W + back, -D, D - back]], arms: [[W - A, W, D - deep, D - back], [-W + back, -W + deep, -D, -D + A]] },
  };
};
export function buildSofa(obj) {
  const S = FURNITURE.sofa, p = obj.params, [w, d] = S.shapes[p.shape], g = group(obj.id), cover = p.cover.endsWith("leather") ? `leather-${p.cover}` : `fabric-${p.cover}`;
  const all = SOFAS(w, d);
  let plan = p.shape === "l-left" || p.shape === "l-right" ? all["l-left"] : all[p.shape] || all.straight;
  if (p.shape === "l-right") { const flip = ([x0, x1, z0, z1]) => [-x1, -x0, z0, z1]; plan = { seats: plan.seats.map(flip), backs: plan.backs.map(flip), arms: plan.arms.map(flip) }; }
  const LEG = 0.08, BASE = 0.3;
  const feet = [];
  for (const [x0, x1, z0, z1] of [...plan.seats, ...plan.backs, ...plan.arms]) {
    g.add(block(x0, x1, LEG, BASE, z0, z1, cover));                                                    // the frame under it
    feet.push([x0 + 0.03, z0 + 0.03], [x1 - 0.07, z0 + 0.03], [x0 + 0.03, z1 - 0.07], [x1 - 0.07, z1 - 0.07]);
  }
  for (const [x, z] of feet) g.add(block(x, x + 0.04, 0, LEG, z, z + 0.04, "wood-walnut"));
  for (const [x0, x1, z0, z1] of plan.seats) {                                                          // seat cushions, about 62 cm each
    const along = x1 - x0 >= z1 - z0, len = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(len / S.seat)), k = len / n;
    for (let i = 0; i < n; i++) {
      const [a0, a1] = [(along ? x0 : z0) + k * i + 0.01, (along ? x0 : z0) + k * (i + 1) - 0.01];
      g.add(along ? cushion(a0, a1, BASE, S.seatH, z0 + 0.01, z1 - 0.01, cover) : cushion(x0 + 0.01, x1 - 0.01, BASE, S.seatH, a0, a1, cover));
    }
  }
  for (const [x0, x1, z0, z1] of plan.backs) {                                                          // backs, and back cushions leaning on them
    g.add(block(x0, x1, BASE, S.height, z0, z1, cover));
    const along = x1 - x0 >= z1 - z0, len = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round((len - 0.4) / S.seat)), k = (len - 0.4) / n;
    for (let i = 0; i < n; i++) {
      const a0 = (along ? x0 : z0) + 0.2 + k * i + 0.01, a1 = a0 + k - 0.02;
      if (along) g.add(cushion(a0, a1, S.seatH, S.height - 0.06, z0 - 0.16, z0, cover));
      else g.add(cushion(x1, x1 + 0.16, S.seatH, S.height - 0.06, a0, a1, cover));
    }
  }
  for (const [x0, x1, z0, z1] of plan.arms) g.add(cushion(x0, x1, BASE, 0.62, z0, z1, cover));       // arms
  return g;
}

// A swivel office chair: five-star base with castors, gas lift, seat, backrest; centre (x, z), facing + z.
function officeChair(g, x, z, colour) {
  const shell = `fabric-${colour === "black" ? "grey-fabric" : colour === "blue" ? "blue-fabric" : "grey"}`;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, ex = x + Math.sin(a) * 0.27, ez = z + Math.cos(a) * 0.27;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.27), furnitureMaterial("plastic"));
    arm.position.set((x + ex) / 2, 0.065, (z + ez) / 2); arm.rotation.y = a; arm.castShadow = true;
    g.add(arm, cylinder(0.025, 0.025, 0, 0.05, ex, ez, "plastic", 10));
  }
  g.add(cylinder(0.03, 0.03, 0.06, 0.44, x, z, "steel", 12));
  g.add(cushion(x - 0.24, x + 0.24, 0.44, 0.52, z - 0.23, z + 0.23, shell));
  g.add(block(x - 0.02, x + 0.02, 0.5, 0.62, z - 0.27, z - 0.23, "plastic"));
  g.add(cushion(x - 0.23, x + 0.23, 0.6, FURNITURE.desk.chairH, z - 0.3, z - 0.24, shell));
}

export function buildOfficeDesk(obj) {
  const D = FURNITURE.desk, p = obj.params, [w, dd] = D.sizes[p.size], d = dd + D.chairReach, g = group(obj.id), wood = `wood-${p.finish}`;
  const zb = d / 2, zf = d / 2 - dd;                                       // the desk's back and front edges
  g.add(block(-w / 2, w / 2, D.height - 0.03, D.height, zf, zb, wood));   // the top
  g.add(block(-w / 2, -w / 2 + 0.03, 0, D.height - 0.03, zf + 0.03, zb - 0.02, wood));   // the left side panel
  g.add(block(w / 2 - 0.42, w / 2, 0, D.height - 0.03, zf + 0.03, zb - 0.02, wood));     // a drawer pedestal on the right
  for (const y of [0.06, 0.28, 0.5]) g.add(block(w / 2 - 0.4, w / 2 - 0.02, y, y + 0.2, zf + 0.025, zf + 0.03, wood));
  for (const y of [0.15, 0.37, 0.59]) g.add(block(w / 2 - 0.25, w / 2 - 0.17, y, y + 0.015, zf + 0.01, zf + 0.025, "steel"));   // handles
  g.add(block(-w / 2 + 0.03, w / 2 - 0.42, 0.3, D.height - 0.03, zb - 0.04, zb - 0.02, wood));   // the modesty panel
  officeChair(g, 0, -d / 2 + 0.3, p.chair);
  return g;
}

export function buildDiningSet(obj) {
  const D = FURNITURE.dining, p = obj.params, [tw, td] = D.tables[p.seats], d = td + 2 * D.chairReach, g = group(obj.id), wood = `wood-${p.finish}`;
  g.add(block(-tw / 2, tw / 2, D.height - 0.04, D.height, -td / 2, td / 2, wood));
  for (const x of [-tw / 2 + 0.05, tw / 2 - 0.12]) for (const z of [-td / 2 + 0.05, td / 2 - 0.12]) g.add(block(x, x + 0.07, 0, D.height - 0.04, z, z + 0.07, wood));
  g.add(block(-tw / 2 + 0.06, tw / 2 - 0.06, D.height - 0.12, D.height - 0.04, -td / 2 + 0.06, -td / 2 + 0.08, wood));   // aprons
  g.add(block(-tw / 2 + 0.06, tw / 2 - 0.06, D.height - 0.12, D.height - 0.04, td / 2 - 0.08, td / 2 - 0.06, wood));
  // Chairs along both long sides, tucked in a little: seat with a pad, four legs, a slatted back.
  const n = Number(p.seats) / 2;
  for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
    const cx = -tw / 2 + (tw / n) * (i + 0.5), outer = side * (d / 2), inner = side * (td / 2 - 0.02);
    const z0 = Math.min(inner, outer), z1 = Math.max(inner, outer);
    g.add(block(cx - 0.22, cx + 0.22, 0.43, 0.47, z0, z1, wood));
    g.add(cushion(cx - 0.2, cx + 0.2, 0.47, 0.5, z0 + 0.02, z1 - 0.02, "fabric-grey"));
    for (const lx of [cx - 0.21, cx + 0.18]) for (const lz of [z0 + 0.01, z1 - 0.04]) g.add(block(lx, lx + 0.03, 0, 0.43, lz, lz + 0.03, wood));
    const bz = side > 0 ? [z1 - 0.03, z1] : [z0, z0 + 0.03];
    for (const lx of [cx - 0.21, cx + 0.18]) g.add(block(lx, lx + 0.03, 0.47, D.chairH, bz[0], bz[1], wood));
    for (const y of [0.62, 0.74, D.chairH - 0.06]) g.add(block(cx - 0.18, cx + 0.18, y, y + 0.06, bz[0], bz[1], wood));
  }
  return g;
}

export function buildCoffeeTable(obj) {
  const C = FURNITURE.coffee, p = obj.params, [w, d] = C[p.shape], g = group(obj.id);
  const top = p.finish === "glass" ? "glass" : `wood-${p.finish}`, legs = p.finish === "glass" ? "steel" : `wood-${p.finish}`;
  if (p.shape === "round") {
    g.add(cylinder(w / 2, w / 2, C.height - 0.03, C.height, 0, 0, top, 48));
    g.add(cylinder(0.05, 0.06, 0.03, C.height - 0.03, 0, 0, legs, 16));
    g.add(cylinder(0.22, 0.25, 0, 0.03, 0, 0, legs, 32));
    return g;
  }
  g.add(block(-w / 2, w / 2, C.height - 0.03, C.height, -d / 2, d / 2, top));
  for (const x of [-w / 2 + 0.03, w / 2 - 0.08]) for (const z of [-d / 2 + 0.03, d / 2 - 0.08]) g.add(block(x, x + 0.05, 0, C.height - 0.03, z, z + 0.05, legs));
  g.add(block(-w / 2 + 0.06, w / 2 - 0.06, 0.1, 0.12, -d / 2 + 0.06, d / 2 - 0.06, p.finish === "glass" ? "steel" : legs));   // a lower shelf
  return g;
}
