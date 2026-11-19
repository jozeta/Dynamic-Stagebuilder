// Structures and range furniture common on IPSC and 2/3-gun stages: ramp, platform, car, table,
// chair, pallets, sandbag wall and traffic cone. Length along x, depth along z, standing on y = 0.
import * as THREE from "three";
import { CHAIR, CONE, PALLET, SANDBAG, TABLE } from "../../model/props.js";
import { box, group, mesh, fitTo } from "./parts.js";

// A plywood ramp rising toward +x, on two side beams, with anti-slip cleats across it.
export function buildRamp(obj) {
  const { length: L, width: W, height: H } = obj.params;
  const g = group(obj.id);
  const shape = new THREE.Shape([new THREE.Vector2(-L / 2, 0), new THREE.Vector2(L / 2, 0), new THREE.Vector2(L / 2, H)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false });
  geo.translate(0, 0, -W / 2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 1.2);
  g.add(mesh(geo, "plywood"));
  const slope = Math.atan2(H, L), along = Math.hypot(L, H);
  const cleats = Math.max(2, Math.floor(along / 0.35));
  for (let i = 1; i < cleats; i++) {
    const t = i / cleats;
    const c = box(0.03, 0.012, W * 0.92, "anti-slip", -L / 2 + t * L, t * H - 0.004, 0);
    c.rotation.z = slope;
    g.add(c);
  }
  return g;
}

// A platform: a board deck on four legs with cross bracing.
export function buildPlatform(obj) {
  const { length: L, width: W, height: H } = obj.params;
  const g = group(obj.id);
  const deck = 0.04, leg = 0.08;
  const boards = Math.max(3, Math.round(W / 0.14)), bw = W / boards;
  for (let i = 0; i < boards; i++) g.add(box(L, deck, bw - 0.006, "rough-wood", 0, H - deck / 2, -W / 2 + bw / 2 + i * bw));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(leg, H - deck, leg, "wood", (x * (L - leg)) / 2, (H - deck) / 2, (z * (W - leg)) / 2));
  g.add(box(L - 2 * leg, 0.06, 0.03, "wood", 0, H - deck - 0.03, -W / 2 + 0.015));
  g.add(box(L - 2 * leg, 0.06, 0.03, "wood", 0, H - deck - 0.03, W / 2 - 0.015));
  if (H > 0.4) for (const z of [-W / 2 + 0.03, W / 2 - 0.03]) {
    const brace = box(Math.hypot(L - 2 * leg, H - deck - 0.1), 0.05, 0.02, "wood", 0, (H - deck) / 2, z);
    brace.rotation.z = Math.atan2(H - deck - 0.1, L - 2 * leg);
    g.add(brace);
  }
  return g;
}

// A folding range table: plywood top on steel legs with a cross bar.
export function buildTable(obj) {
  const L = obj.params.length, D = TABLE.depth, H = TABLE.height;
  const g = group(obj.id);
  g.add(box(L, 0.03, D, "plywood", 0, H - 0.015, 0));
  g.add(box(L - 0.06, 0.06, 0.03, "bare-steel", 0, H - 0.06, -D / 2 + 0.05));
  g.add(box(L - 0.06, 0.06, 0.03, "bare-steel", 0, H - 0.06, D / 2 - 0.05));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(0.035, H - 0.03, 0.035, "bare-steel", x * (L / 2 - 0.08), (H - 0.03) / 2, z * (D / 2 - 0.06)));
  g.add(box(L - 0.16, 0.025, 0.025, "bare-steel", 0, 0.2, 0));
  // Start gear on the table: a pistol, a pistol with magazines, or a closed gun case.
  const it = obj.params.items;
  if (it === "pistol" || it === "pistol-mags") {
    g.add(box(0.2, 0.03, 0.035, "plastic-dark", 0, H + 0.015, 0));
    g.add(box(0.035, 0.03, 0.12, "plastic-dark", -0.07, H + 0.015, 0.06));
    if (it === "pistol-mags") for (const i of [0, 1, 2]) g.add(box(0.035, 0.025, 0.13, "steel-dark", 0.2 + i * 0.06, H + 0.0125, 0));
  } else if (it === "case") g.add(box(0.45, 0.12, 0.3, "plastic-dark", 0, H + 0.06, 0));
  return g;
}

// A plastic chair on steel legs.
export function buildChair(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  inner.add(box(0.44, 0.04, 0.42, "plastic-dark", 0, 0.45, 0));
  const back = box(0.44, 0.38, 0.03, "plastic-dark", 0, 0.68, 0.21);
  back.rotation.x = 0.12;
  inner.add(back);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) inner.add(box(0.022, 0.45, 0.022, "bare-steel", x * 0.2, 0.225, z * 0.19));
  g.add(fitTo(inner, CHAIR.w, CHAIR.h, CHAIR.d));
  return g;
}

// Euro pallets (1.2 × 0.8 m), stacked: deck boards, blocks and bottom boards.
export function buildPallet(obj) {
  const g = group(obj.id);
  const { length: L, width: W, height: H } = PALLET;
  for (let n = 0; n < obj.params.count; n++) {
    const y0 = n * H;
    for (let i = 0; i < 5; i++) g.add(box(L, 0.022, 0.1, "rough-wood", 0, y0 + H - 0.011, -W / 2 + 0.05 + i * ((W - 0.1) / 4)));
    for (const z of [-W / 2 + 0.05, 0, W / 2 - 0.05]) {
      g.add(box(L, 0.022, 0.1, "rough-wood", 0, y0 + 0.011, z));
      for (const x of [-L / 2 + 0.05, 0, L / 2 - 0.05]) g.add(box(0.1, H - 0.044, 0.1, "rough-wood", x, y0 + H / 2, z));
    }
  }
  return g;
}

// A sandbag wall: rows of rounded burlap bags, staggered like brickwork.
function bag(w) {
  const geo = new THREE.BoxGeometry(w, SANDBAG.height, SANDBAG.depth * 0.95, 6, 3, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2), y = p.getY(i) / (SANDBAG.height / 2);
    const k = 1 - 0.18 * (y * y) - 0.08 * (x * x * x * x);      // round the bag's sides and ends
    p.setXYZ(i, p.getX(i) * (1 - 0.05 * y * y), p.getY(i), p.getZ(i) * k);
  }
  geo.computeVertexNormals();
  return mesh(geo, "burlap");
}

export function buildSandbags(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  const { length: L, rows } = obj.params;
  const n = Math.max(1, Math.round(L / 0.55)), w = L / n;
  for (let r = 0; r < rows; r++) {
    // Offset rows sit half a bag over (brickwork); a one-bag-wide wall stacks straight.
    const offset = r % 2 && n > 1;
    const shift = offset ? w / 2 : 0, count = offset ? n - 1 : n;
    for (let i = 0; i < count; i++) {
      const b = bag(w * 0.98);
      b.position.set(-L / 2 + w / 2 + shift + i * w, SANDBAG.height * (r + 0.5), 0);
      b.rotation.y = (i % 3 - 1) * 0.03;
      inner.add(b);
    }
  }
  g.add(fitTo(inner, L, SANDBAG.height * rows, SANDBAG.depth));
  return g;
}

// A traffic cone: orange with white reflective bands on a square base.
export function buildCone(obj) {
  const g = group(obj.id);
  const { diameter: D, height: H } = CONE;
  g.add(box(D, 0.03, D, "plastic-dark", 0, 0.015, 0));
  const c = mesh(new THREE.CylinderGeometry(0.025, D * 0.42, H - 0.03, 24), "cone");
  c.position.y = 0.03 + (H - 0.03) / 2;
  g.add(c);
  return g;
}
