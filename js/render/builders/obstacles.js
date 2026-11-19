// Obstacles: a worn steel drum, tyres with tread, a board crate and a potted palm.
import * as THREE from "three";
import { BARREL, TYRE, PLANT } from "../../model/props.js";
import { box, group, mesh, lathe, fitTo } from "./parts.js";

// A 200 l steel drum: two rolling hoops, rolled chimes top and bottom, a recessed lid with two
// bung caps; paint worn with scratches and rust (material per colour).
export function buildBarrel(obj) {
  const g = group(obj.id);
  const R = BARREL.diameter / 2, H = BARREL.height;
  const body = R - 0.008;
  const hoop = (y) => [[body, y - 0.022], [R - 0.002, y - 0.01], [R, y], [R - 0.002, y + 0.01], [body, y + 0.022]];
  const profile = [
    [0, 0], [body - 0.01, 0], [R, 0.012], [R - 0.004, 0.024], [body, 0.03],
    ...hoop(H / 3), ...hoop((2 * H) / 3),
    [body, H - 0.03], [R - 0.004, H - 0.022], [R, H - 0.006], [body - 0.012, H - 0.002], [body - 0.016, H - 0.018], [0, H - 0.018],
  ];
  g.add(lathe(profile, `barrel-${obj.params.color || "black"}`, 48));
  for (const [x, z, r] of [[R * 0.55, 0, 0.032], [-R * 0.6, R * 0.2, 0.02]]) {
    const bung = mesh(new THREE.CylinderGeometry(r, r, 0.014, 14), "bare-steel");
    bung.position.set(x, H - 0.012, z);
    g.add(bung);
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

// A crate of rough boards: four horizontal boards per side with small gaps, corner battens and a
// boarded lid with two cleats.
export function buildCrate(obj) {
  const g = group(obj.id);
  const s = obj.params.size, t = 0.02, bat = 0.045, gap = 0.008;
  const boards = 4, bh = (s - t - (boards - 1) * gap) / boards;
  for (let i = 0; i < boards; i++) {
    const y = i * (bh + gap) + bh / 2;
    g.add(box(s - 2 * bat, bh, t, "rough-wood", 0, y, -s / 2 + t / 2));
    g.add(box(s - 2 * bat, bh, t, "rough-wood", 0, y, s / 2 - t / 2));
    g.add(box(t, bh, s - 2 * bat, "rough-wood", -s / 2 + t / 2, y, 0));
    g.add(box(t, bh, s - 2 * bat, "rough-wood", s / 2 - t / 2, y, 0));
  }
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(bat, s - t, bat, "rough-wood", (x * (s - bat)) / 2, (s - t) / 2, (z * (s - bat)) / 2));
  const lid = 5, lw = (s - (lid - 1) * gap) / lid;
  for (let i = 0; i < lid; i++) g.add(box(lw, t, s, "rough-wood", -s / 2 + lw / 2 + i * (lw + gap), s - t / 2, 0));
  for (const z of [-s / 3, s / 3]) g.add(box(s * 0.92, t * 0.6, 0.06, "rough-wood", 0, s - t * 0.3, z));
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
