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

// A saloon car: body, cabin with windows, wheels, lights and bumpers; fitted to the catalogue size.
export function buildCar(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  const paint = `car-${obj.params.color || "white"}`;
  const W = 1.8;
  const side = new THREE.Shape();
  side.moveTo(-2.2, 0.3); side.lineTo(2.1, 0.3); side.quadraticCurveTo(2.22, 0.32, 2.2, 0.55);
  side.lineTo(2.15, 0.78); side.quadraticCurveTo(1.8, 0.86, 1.2, 0.86); side.lineTo(-1.5, 0.86);
  side.quadraticCurveTo(-2.15, 0.84, -2.2, 0.62); side.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(side, { depth: W - 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 });
  bodyGeo.translate(0, 0, -(W - 0.1) / 2);
  inner.add(mesh(bodyGeo, paint));
  const cab = new THREE.Shape();
  cab.moveTo(-1.35, 0.86); cab.lineTo(1.05, 0.86); cab.lineTo(0.55, 1.42); cab.lineTo(-0.9, 1.42); cab.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(cab, { depth: W - 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  cabGeo.translate(0, 0, -(W - 0.3) / 2);
  inner.add(mesh(cabGeo, paint));
  // Windows: side glass and windscreens, slightly proud of the cabin.
  const glassSide = new THREE.Shape();
  glassSide.moveTo(-1.22, 0.92); glassSide.lineTo(0.95, 0.92); glassSide.lineTo(0.5, 1.36); glassSide.lineTo(-0.84, 1.36); glassSide.closePath();
  for (const z of [-(W - 0.3) / 2 - 0.035, (W - 0.3) / 2 + 0.035]) {
    const gl = mesh(new THREE.ShapeGeometry(glassSide), "glass");
    gl.position.z = z;
    if (z < 0) gl.rotation.y = Math.PI, gl.scale.x = -1;
    inner.add(gl);
  }
  const ws = mesh(new THREE.PlaneGeometry(W - 0.4, 0.66), "glass");
  ws.position.set(0.8, 1.14, 0); ws.rotation.set(0, Math.PI / 2, -0.85, "YXZ");
  const rs = mesh(new THREE.PlaneGeometry(W - 0.4, 0.6), "glass");
  rs.position.set(-1.12, 1.14, 0); rs.rotation.set(0, -Math.PI / 2, -0.7, "YXZ");
  inner.add(ws, rs);
  // Wheels.
  for (const [x, z] of [[1.35, 1], [-1.35, 1], [1.35, -1], [-1.35, -1]]) {
    const wheel = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24), "tread");
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.32, z * (W / 2 - 0.12));
    const hub = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.225, 16), "chrome");
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(wheel.position);
    inner.add(wheel, hub);
  }
  for (const z of [-0.62, 0.62]) {
    inner.add(box(0.04, 0.12, 0.3, "light-white", 2.23, 0.66, z));
    inner.add(box(0.04, 0.12, 0.3, "light-red", -2.23, 0.68, z));
  }
  inner.add(box(0.12, 0.14, W - 0.1, "plastic-dark", 2.2, 0.38, 0), box(0.12, 0.14, W - 0.1, "plastic-dark", -2.22, 0.4, 0));
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
    const shift = r % 2 ? w / 2 : 0, count = r % 2 ? n - 1 : n;
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
