// Obstacles: a worn steel drum, tyres with tread, a board crate and a potted palm.
import * as THREE from "three";
import { BARREL, TYRE, PLANT } from "../../model/props.js";
import { box, group, mesh, lathe, fitTo } from "./parts.js";

// A 200 l (216.5 l) steel drum after the reference photos: rolled chimes standing proud at top
// and bottom; at a third and two thirds of the height a main rolling hoop with a smaller
// corrugation bead either side; a recessed lid with a pressed ring and two bung caps (2" with a
// raised flange, 3/4" plain). Paint per colour (materials "barrel-…" and "barrel-lid-…").
export function buildBarrel(obj) {
  const g = group(obj.id);
  const color = obj.params.color || "black";
  const R = BARREL.diameter / 2, H = BARREL.height, body = R - 0.006, lidY = H - 0.016;
  const bead = (y, w, out) => [[body, y - w], [body + out * 0.6, y - w * 0.5], [body + out, y], [body + out * 0.6, y + w * 0.5], [body, y + w]];
  const hoops = (y) => [...bead(y - 0.036, 0.007, 0.0035), ...bead(y, 0.013, 0.006), ...bead(y + 0.036, 0.007, 0.0035)];
  const profile = [
    [0, 0.002], [R - 0.02, 0.002], [R - 0.004, 0.004], [R, 0.012], [R - 0.002, 0.02], [body, 0.028],
    ...hoops(H / 3), ...hoops((2 * H) / 3),
    [body, H - 0.028], [R - 0.002, H - 0.02], [R, H - 0.012], [R - 0.004, H - 0.003], [R - 0.012, H], [R - 0.02, H - 0.004],
    [R - 0.024, lidY + 0.002],
  ];
  // Bottom at y = 0 exactly: the first ring sits at 0.002 above a closing disc at 0.
  const bodyMesh = lathe(profile, `barrel-${color}`, 56);
  g.add(bodyMesh);
  const base = mesh(new THREE.CircleGeometry(R - 0.02, 40), `barrel-${color}`);
  base.rotation.x = Math.PI / 2;
  g.add(base);
  const lid = mesh(new THREE.CircleGeometry(R - 0.024, 48), `barrel-lid-${color}`);
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = lidY;
  g.add(lid);
  // Bungs on opposite sides of the lid.
  const big = new THREE.Group();
  const flange = mesh(new THREE.TorusGeometry(0.036, 0.006, 8, 24), "bare-steel");
  flange.rotation.x = Math.PI / 2;
  const cap = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), "bare-steel");
  cap.position.y = 0.004;
  big.add(flange, cap);
  big.position.set(R * 0.62, lidY + 0.004, 0);
  const small = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 16), "bare-steel");
  small.position.set(-R * 0.66, lidY + 0.006, R * 0.08);
  g.add(big, small);
  // Two high: a second drum stood on the first.
  if (obj.params.stack > 1) {
    const top = buildBarrel({ ...obj, params: { ...obj.params, stack: 1 } });
    top.position.y = H;
    top.rotation.y = Math.PI;          // bungs on the other side
    g.add(top);
  }
  return g;
}

// One tyre lying flat: rounded sidewalls, a treaded band and the bead opening.
function tyre(y) {
  const t = new THREE.Group();
  const R = TYRE.diameter / 2, W = TYRE.height, bead = 0.19;
  t.add(lathe([[bead, 0.025], [bead + 0.03, 0.006], [R - 0.05, 0], [R - 0.012, 0.012], [R - 0.004, 0.035]], "rubber", 40));
  t.add(lathe([[R - 0.004, W - 0.035], [R - 0.012, W - 0.012], [R - 0.05, W], [bead + 0.03, W - 0.006], [bead, W - 0.025]], "rubber", 40));
  const tread = lathe([[R - 0.004, 0.035], [R, 0.06], [R, W - 0.06], [R - 0.004, W - 0.035]], "tread", 40);
  t.add(tread);
  const inner = mesh(new THREE.CylinderGeometry(bead, bead, W - 0.05, 32, 1, true), "rubber-inner");
  inner.position.y = W / 2;
  t.add(inner);
  t.position.y = y;
  return t;
}

export function buildTyre(obj) {
  const g = group(obj.id);
  const count = obj.type === "tyre-stack" ? obj.params.count : 1;
  for (let i = 0; i < count; i++) {
    g.add(tyre(i * TYRE.height));
  }
  return g;
}

// A shipping crate after the reference photos: light pine board sheathing on every face, a
// picture frame of thicker nailed cleats round each face, diagonal braces on the sides, and
// stencilled "this side up" arrows and FRAGILE on the front.
export function buildCrate(obj) {
  const g = group(obj.id);
  const s = obj.params.size, ct = Math.max(0.018, s * 0.035), cw = Math.max(0.05, s * 0.12);
  const inner = s - 2 * ct;
  // Sheathed core: boards on every side, the stencilled face toward the front (−z).
  const core = mesh(new THREE.BoxGeometry(inner, inner, inner), ["crate-boards", "crate-boards", "crate-boards", "crate-boards", "crate-boards", "crate-stencil"]);
  core.position.y = s / 2;
  g.add(core);
  // A frame of cleats on each face. Faces: normal axis and sign.
  const half = s / 2, k = half - ct / 2;
  const faces = [["x", 1], ["x", -1], ["z", 1], ["z", -1], ["y", 1]];
  for (const [axis, sign] of faces) {
    const put = (along, len, offA, offB) => {
      // along: which in-face axis the cleat runs on ("u" or "v"); offA/offB: position in the face.
      let w, h, d, x, y, z;
      if (axis === "x") { [w, h, d] = along === "u" ? [ct, cw, len] : [ct, len, cw]; [x, y, z] = [sign * k, half + offB, offA]; }
      else if (axis === "z") { [w, h, d] = along === "u" ? [len, cw, ct] : [cw, len, ct]; [x, y, z] = [offA, half + offB, sign * k]; }
      else { [w, h, d] = along === "u" ? [len, ct, cw] : [cw, ct, len]; [x, y, z] = [offA, s - ct / 2, offB]; }
      g.add(box(w, h, d, "crate-cleat", x, y, z));
    };
    const e = half - cw / 2;
    if (axis === "y") {
      put("u", s, 0, -e); put("u", s, 0, e); put("v", s - 2 * cw, -e, 0); put("v", s - 2 * cw, e, 0);
    } else {
      put("u", s, 0, -e); put("u", s, 0, e); put("v", s - 2 * cw, -e, 0); put("v", s - 2 * cw, e, 0);
    }
    // Diagonal brace across the side faces.
    if (axis === "x") {
      const len = Math.hypot(s - 2 * cw, s - 2 * cw);
      const brace = box(ct * 0.9, cw * 0.9, len, "crate-cleat", sign * k, half, 0);
      brace.rotation.x = Math.PI / 4 * sign;
      g.add(brace);
    }
  }
  return g;
}

// A potted palm: pot with a rim and soil, a ringed trunk, and arching fronds with leaflets.
function frond(length, leaflets) {
  const pos = [];
  const curve = (t) => [0, t * length * 0.85, -0.55 * (t * length) ** 2];
  for (let i = 1; i < leaflets; i++) {
    const t0 = i / leaflets, [x, y, z] = curve(t0);
    const l = 0.16 * Math.sin(Math.PI * Math.min(1, t0 * 1.1)) + 0.03;
    for (const side of [-1, 1]) {
      const tip = [x + side * l, y - l * 0.35, z - l * 0.15];
      const [nx, ny, nz] = curve(Math.min(1, t0 + 0.7 / leaflets));
      pos.push(x, y, z, nx, ny, nz, ...tip);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

export function buildPlant(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  inner.add(lathe([[0, 0], [0.15, 0], [0.165, 0.02], [0.2, 0.33], [0.215, 0.34], [0.215, 0.36], [0.19, 0.36], [0.185, 0.33]], "pot", 28));
  const soil = mesh(new THREE.CircleGeometry(0.188, 24), "soil");
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.32;
  inner.add(soil);
  // An areca palm: many slender stems rising from the pot, each arching into a frond.
  const stems = 22;
  for (let i = 0; i < stems; i++) {
    const a = (i / stems) * Math.PI * 2 + (i % 3) * 0.4;
    const lean = 0.12 + (i % 5) * 0.07;
    const len = 0.75 + ((i * 7) % 5) * 0.08;
    const stem = mesh(new THREE.CylinderGeometry(0.006, 0.01, len * 0.7, 4), "trunk");
    stem.position.set(Math.cos(a) * lean * 0.3, 0.36 + len * 0.35, Math.sin(a) * lean * 0.3);
    stem.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean);
    inner.add(stem);
    const m = mesh(frond(0.5 + (i % 4) * 0.06, 16), i % 3 ? "leaf" : "leaf-dark");
    m.position.set(Math.cos(a) * lean * 0.75, 0.36 + len * 0.68, Math.sin(a) * lean * 0.75);
    m.rotation.set(-0.35 - lean, -a + Math.PI / 2, 0, "YXZ");
    inner.add(m);
  }
  g.add(fitTo(inner, PLANT.diameter, PLANT.height, PLANT.diameter));
  return g;
}
