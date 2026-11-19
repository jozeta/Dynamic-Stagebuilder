// Structures and range furniture common on IPSC and 2/3-gun stages: ramp, platform, car, table,
// chair, pallets, sandbag wall and traffic cone. Length along x, depth along z, standing on y = 0.
import * as THREE from "three";
import { CAR, CHAIR, CONE, PALLET, SANDBAG, TABLE } from "../../model/props.js";
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

// A saloon car: one smooth body traced from a side profile with real wheel arches, rounded edges
// (bevel) and sides that lean in above the beltline (tumblehome); printed sides with windows,
// pillars, door seams and handles; tinted windscreen and rear window; treaded tyres on five-spoke
// alloys; headlights, tail lights, grille, bumpers, number plates and mirrors. Fitted exactly to
// the catalogue size.
function carProfile() {
  const s = new THREE.Shape();
  s.moveTo(-2.16, 0.24);
  s.lineTo(-1.74, 0.24);
  s.lineTo(-1.74, 0.31);
  s.absarc(-1.35, 0.31, 0.39, Math.PI, 0, true);          // rear wheel arch
  s.lineTo(-0.96, 0.22);
  s.lineTo(0.96, 0.22);
  s.lineTo(0.96, 0.31);
  s.absarc(1.35, 0.31, 0.39, Math.PI, 0, true);           // front wheel arch
  s.lineTo(1.74, 0.24);
  s.lineTo(2.14, 0.26);
  s.quadraticCurveTo(2.27, 0.3, 2.26, 0.5);               // front bumper
  s.quadraticCurveTo(2.25, 0.68, 2.12, 0.74);
  s.quadraticCurveTo(1.6, 0.82, 1.06, 0.88);              // bonnet
  s.quadraticCurveTo(0.8, 1.15, 0.5, 1.41);               // windscreen
  s.quadraticCurveTo(-0.1, 1.48, -0.76, 1.43);            // roof
  s.quadraticCurveTo(-1.2, 1.2, -1.55, 0.99);             // rear window
  s.quadraticCurveTo(-1.85, 0.95, -2.12, 0.93);           // boot lid
  s.quadraticCurveTo(-2.27, 0.9, -2.26, 0.62);            // rear
  s.quadraticCurveTo(-2.26, 0.3, -2.16, 0.24);
  return s;
}

function wheel(x, z, side) {
  const w = new THREE.Group();
  const R = 0.31, Wd = 0.2;
  const tyre = new THREE.LatheGeometry([[0.2, -Wd / 2], [0.26, -Wd / 2], [R - 0.01, -Wd / 2 + 0.02], [R, -Wd / 2 + 0.05], [R, Wd / 2 - 0.05], [R - 0.01, Wd / 2 - 0.02], [0.26, Wd / 2], [0.2, Wd / 2]].map(([r, y]) => new THREE.Vector2(r, y)), 36);
  const t = mesh(tyre, "tread");
  t.rotation.x = Math.PI / 2;
  w.add(t);
  const rim = new THREE.Group();
  rim.userData.rim = true;
  const disc = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), "alloy");
  disc.rotation.x = Math.PI / 2;
  rim.add(disc);
  for (let i = 0; i < 5; i++) {
    const spoke = box(0.045, 0.16, 0.02, "alloy", 0, 0, 0);
    spoke.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.1, Math.sin((i / 5) * Math.PI * 2) * 0.1, 0.03);
    spoke.rotation.z = (i / 5) * Math.PI * 2 - Math.PI / 2;
    rim.add(spoke);
  }
  const hub = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16), "chrome");
  hub.rotation.x = Math.PI / 2;
  rim.add(hub);
  rim.position.z = side * 0.06;
  rim.scale.z = side;
  w.add(rim);
  w.position.set(x, R, z);
  return w;
}

export function buildCar(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  const color = obj.params.color || "white";
  const W = 1.8, bevel = 0.07, depth = W - 2 * bevel;
  const geo = new THREE.ExtrudeGeometry(carProfile(), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: 0.05, bevelSegments: 5, curveSegments: 24 });
  geo.translate(0, 0, -depth / 2);
  // Tumblehome (the greenhouse leans in) and a gentle taper toward the bumpers in plan view.
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const lean = Math.min(1, Math.max(0, (y - 0.9) / 0.55));
    const taper = 1 - 0.07 * Math.abs(x / 2.3) ** 6;
    p.setZ(i, p.getZ(i) * (1 - 0.2 * lean) * taper);
  }
  geo.computeVertexNormals();
  // Group 0 = the two side caps (printed sides), group 1 = the swept surface (paint).
  inner.add(mesh(geo, [`car-side-${color}`, `car-${color}`]));

  // Windscreen and rear window: quads from the profile's slope, as wide as the leaning body is at
  // each end, set just proud of the surface.
  const halfAt = (y) => (W / 2 - 0.1) * (1 - 0.2 * Math.min(1, Math.max(0, (y - 0.9) / 0.55)));
  const pane = (x0, y0, x1, y1) => {
    const n = new THREE.Vector2(-(y1 - y0), x1 - x0).normalize().multiplyScalar(x1 < x0 ? 0.015 : -0.015);
    const a = [x0 + n.x, y0 + n.y], b = [x1 + n.x, y1 + n.y], ha = halfAt(y0), hb = halfAt(y1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([a[0], a[1], -ha, a[0], a[1], ha, b[0], b[1], hb, b[0], b[1], -hb], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    return mesh(geo, "glass");
  };
  inner.add(pane(1.04, 0.9, 0.52, 1.39), pane(-0.78, 1.41, -1.5, 1.0));

  for (const [x, z] of [[1.35, 1], [-1.35, 1], [1.35, -1], [-1.35, -1]]) inner.add(wheel(x, z * (W / 2 - 0.16), z));

  // Lights, grille, bumpers, plates and mirrors.
  for (const z of [-0.6, 0.6]) {
    inner.add(box(0.05, 0.1, 0.32, "light-white", 2.22, 0.62, z));
    inner.add(box(0.05, 0.12, 0.3, "light-red", -2.24, 0.72, z));
    const mirror = box(0.12, 0.08, 0.1, `car-${color}`, 0.92, 1.0, z > 0 ? W / 2 - 0.12 : -(W / 2 - 0.12));
    inner.add(mirror);
  }
  inner.add(box(0.05, 0.12, 0.62, "plastic-dark", 2.23, 0.55, 0));               // grille
  inner.add(box(0.14, 0.14, W - 0.18, "plastic-dark", 2.2, 0.34, 0));             // front bumper
  inner.add(box(0.14, 0.14, W - 0.18, "plastic-dark", -2.21, 0.36, 0));           // rear bumper
  inner.add(box(0.02, 0.11, 0.48, "plate-white", 2.29, 0.36, 0));
  inner.add(box(0.02, 0.11, 0.48, "plate-white", -2.3, 0.58, 0));
  g.add(fitTo(inner, CAR.length, CAR.height, CAR.width));
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
