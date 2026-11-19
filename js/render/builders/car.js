// Cars: one smooth body lofted through rounded cross-sections along the car (model/props.js
// CAR_MODELS gives the side-profile curves), so the bonnet, windscreen, roof, pillars and boot flow
// into each other and the sides lean in above the beltline. Glass, pillars, bumpers and the
// underbody are material groups of the same shell. Then the parts: treaded tyres on alloys inside
// dark wheel wells, framed lights, indicators, grille, plates, mirrors, handles, wipers, aerial and
// exhaust. Fitted exactly to the catalogue size.
import * as THREE from "three";
import { CAR_MODELS } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, group, mesh, fitTo } from "./parts.js";

const STATIONS = 90;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// A piecewise-linear curve through [u, value] points.
function curve(points) {
  return (u) => {
    if (u <= points[0][0]) return points[0][1];
    for (let i = 0; i < points.length - 1; i++) {
      const [a, va] = points[i], [b, vb] = points[i + 1];
      if (u <= b) return lerp(va, vb, (u - a) / (b - a || 1));
    }
    return points[points.length - 1][1];
  };
}
// Soften the corners where curve segments meet (a few passes of a 3-point average, ends kept).
function smooth(values, passes = 2) {
  let v = values;
  for (let p = 0; p < passes; p++) v = v.map((x, i) => (i === 0 || i === v.length - 1 ? x : (v[i - 1] + 2 * x + v[i + 1]) / 4));
  return v;
}
const inRanges = (u, ranges) => ranges.some(([a, b]) => u >= a && u <= b);

/** The stations along the car: x, u and the section sizes (belt, roof, half width, sill, greenhouse t). */
export function carStations(m) {
  const L = m.length, belt = curve(m.belt), roof = curve(m.roof), half = curve(m.half), sill = curve(m.sill);
  const us = [...Array(STATIONS)].map((_, i) => 0.5 - 0.5 * Math.cos((Math.PI * i) / (STATIONS - 1)));   // denser at the ends
  const xs = us.map((u) => (u - 0.5) * L);
  const yb = smooth(us.map(belt)), yr = smooth(us.map(roof)).map((v, i) => Math.max(v, yb[i]));
  const wb = smooth(us.map(half));
  // The underside rises over the wheel arches.
  const ys = us.map((u, i) => {
    let y = sill(u);
    for (const wx of m.wheels) {
      const dx = xs[i] - wx;
      if (Math.abs(dx) < m.arch) y = Math.max(y, m.tyre + Math.sqrt(m.arch * m.arch - dx * dx));
    }
    return Math.min(y, yb[i] - 0.12);
  });
  return us.map((u, i) => {
    const t = clamp01((yr[i] - yb[i] - 0.04) / 0.3);          // 0 = deck (bonnet, boot), 1 = full cabin
    return { u, x: xs[i], yb: yb[i], yr: yr[i], wb: wb[i], ys: ys[i], t, wr: lerp(wb[i] - 0.1, m.roofHalf, t) };
  });
}

// Half a cross-section (z ≥ 0) from the bottom centre round the side to the top centre: [y, z].
function halfRing(s) {
  const { ys, yb, yr, wb, wr, t } = s;
  const glassBase = yb + 0.015;
  const roofEdge = Math.max(glassBase + 0.006, yr - 0.045 * t - 0.01);
  return [
    [ys, 0], [ys, wb - 0.13], [ys + 0.05, wb - 0.025], [ys + 0.45 * (yb - ys), wb], [yb - 0.07, wb - 0.008],
    [yb - 0.01, wb - 0.035], [glassBase, wb - 0.07], [roofEdge, wr], [yr, wr - 0.11 * (0.4 + 0.6 * t)], [yr + 0.025 * t + 0.008, 0],
  ];
}
const HALF = 10;
// Which material each band of the half ring gets (band k joins half points k and k+1).
const MAT = ["paint", "glass", "trim", "under", "bumper", "tonneau"];

function bandMaterial(m, k, a, b) {
  const u = (a.u + b.u) / 2, x = (a.x + b.x) / 2;
  const t = Math.min(a.t, b.t);
  const bumper = Math.abs(x) > m.length / 2 - 0.2;
  if (k <= 1) return "under";
  if (k <= 3 && bumper) return "bumper";
  if (k === 6) {                                             // the cabin side: windows and pillars
    if (t > 0.55 && inRanges(u, m.windows)) return "glass";
    if (t > 0.55) return "trim";
    return "paint";
  }
  if (k >= 7 && inRanges(u, m.screens) && Math.max(a.t, b.t) > 0.2) return "glass";
  if (k >= 7 && m.bed && u < m.bed) return "tonneau";
  return "paint";
}

function bodyGeometry(m) {
  const st = carStations(m);
  const ring = (s) => {
    const hRing = halfRing(s);
    return [...hRing, ...hRing.slice(1, -1).reverse().map(([y, z]) => [y, -z])];   // closed loop
  };
  const N = HALF * 2 - 2;                                    // points per ring
  const pos = [], uv = [];
  for (const s of st) for (const [y, z] of ring(s)) { pos.push(s.x, y, z); uv.push(s.u, y / m.height); }
  const idx = Object.fromEntries(MAT.map((k) => [k, []]));
  for (let i = 0; i < st.length - 1; i++) {
    for (let j = 0; j < N; j++) {
      const k = j < HALF - 1 ? j : N - 1 - j;                // mirror bands back to the half's index
      const a = i * N + j, b = i * N + ((j + 1) % N), c = (i + 1) * N + ((j + 1) % N), d = (i + 1) * N + j;
      const list = idx[bandMaterial(m, k, st[i], st[i + 1])];
      if (j < HALF - 1) list.push(a, d, c, a, c, b); else list.push(a, d, c, a, c, b);
    }
  }
  // Close the nose and the tail with a fan to each end ring's centre.
  for (const [i, flip] of [[0, true], [st.length - 1, false]]) {
    const s = st[i], r = ring(s);
    const cy = r.reduce((sum, p) => sum + p[0], 0) / N;
    const centre = pos.length / 3;
    pos.push(s.x + (flip ? -0.015 : 0.015), cy, 0);
    uv.push(s.u, cy / m.height);
    for (let j = 0; j < N; j++) {
      const a = i * N + j, b = i * N + ((j + 1) % N);
      const k = j < HALF - 1 ? j : N - 1 - j;
      const list = idx[k <= 3 ? "bumper" : k >= 7 ? "paint" : "paint"];
      if (flip) list.push(centre, a, b); else list.push(centre, b, a);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const all = [];
  MAT.forEach((k, n) => { geo.addGroup(all.length, idx[k].length, n); all.push(...idx[k]); });
  geo.setIndex(all);
  geo.computeVertexNormals();
  return { geo, st };
}

function wheel(m, x, z, side) {
  const w = new THREE.Group();
  const R = m.tyre, Wd = m.tyreWidth, rimR = R * 0.62;
  const prof = [[rimR, -Wd / 2], [R * 0.82, -Wd / 2], [R - 0.01, -Wd / 2 + 0.02], [R, -Wd / 2 + 0.05], [R, Wd / 2 - 0.05], [R - 0.01, Wd / 2 - 0.02], [R * 0.82, Wd / 2], [rimR, Wd / 2]];
  const t = mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40), "tread");
  t.rotation.x = Math.PI / 2;
  w.add(t);
  const rim = new THREE.Group();
  rim.userData.rim = true;
  const disc = mesh(new THREE.CylinderGeometry(rimR, rimR, 0.04, 30), "alloy");
  disc.rotation.x = Math.PI / 2;
  rim.add(disc);
  const lip = mesh(new THREE.TorusGeometry(rimR - 0.01, 0.012, 8, 30), "alloy");
  lip.position.z = 0.025;
  rim.add(lip);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = box(0.05, rimR * 0.82, 0.025, "alloy", Math.cos(a) * rimR * 0.48, Math.sin(a) * rimR * 0.48, 0.03);
    spoke.rotation.z = a - Math.PI / 2;
    rim.add(spoke);
  }
  const hub = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16), "chrome");
  hub.rotation.x = Math.PI / 2;
  rim.add(hub);
  rim.position.z = side * (Wd / 2 - 0.035);
  rim.scale.z = side;
  w.add(rim);
  w.position.set(x, R, z);
  return w;
}

// The station nearest to x, for placing parts on the body surface.
const at = (st, x) => st.reduce((best, s) => (Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best), st[0]);

export function buildCar(obj) {
  const m = CAR_MODELS[obj.params.model] || CAR_MODELS.sedan;
  const color = obj.params.color || "white";
  const model = CAR_MODELS[obj.params.model] ? obj.params.model : "sedan";
  const g = group(obj.id);
  const inner = new THREE.Group();
  const tag = (o, part) => { o.userData.part = part; return o; };
  const { geo, st } = bodyGeometry(m);
  const body = new THREE.Mesh(geo, [
    getMaterial(`car-body-${model}-${color}`), getMaterial("glass"), getMaterial("plastic-dark"),
    getMaterial("wheel-well"), getMaterial("plastic-dark"), getMaterial("plastic-dark"),
  ]);
  body.castShadow = true;
  body.receiveShadow = true;
  inner.add(tag(body, "body"));
  const L = m.length;

  // Wheels in dark wells.
  for (const wx of m.wheels) for (const side of [-1, 1]) {
    const s = at(st, wx);
    inner.add(wheel(m, wx, side * (s.wb - m.tyreWidth / 2 - 0.02), side));
    const well = mesh(new THREE.CylinderGeometry(m.arch - 0.01, m.arch - 0.01, 0.36, 28, 1, true, -Math.PI / 2, Math.PI), "wheel-well");
    well.rotation.x = Math.PI / 2;
    well.position.set(wx, m.tyre, side * (s.wb - 0.2));
    inner.add(tag(well, "wheelwell"));
  }

  // Front and back: framed lights, indicators, grille, plates, fog lamps.
  const nose = st[st.length - 1], tail = st[0];
  const fy = lerp(nose.ys, nose.yb, 0.78), ry = lerp(tail.ys, tail.yb, 0.72);
  for (const side of [-1, 1]) {
    const hz = side * (nose.wb - 0.2), tz = side * (tail.wb - 0.17);
    const head = new THREE.Group();
    head.add(box(0.05, 0.13, 0.32, "plastic-dark", 0, 0, 0), box(0.05, 0.1, 0.27, "light-white", 0.012, 0, 0));
    head.position.set(L / 2 - 0.01, fy, hz);
    inner.add(tag(head, "headlight"));
    const back = new THREE.Group();
    back.add(box(0.05, 0.15, 0.3, "plastic-dark", 0, 0, 0), box(0.05, 0.12, 0.26, "light-red", -0.012, 0, 0));
    back.position.set(-L / 2 + 0.01, ry, tz);
    inner.add(tag(back, "taillight"));
    inner.add(tag(box(0.04, 0.05, 0.08, "light-amber", L / 2 - 0.02, fy, side * (nose.wb - 0.05)), "indicator"));
    inner.add(box(0.04, 0.05, 0.09, "light-white", L / 2 - 0.02, lerp(nose.ys, nose.yb, 0.25), side * (nose.wb - 0.22)));   // fog lamps
  }
  inner.add(box(0.05, 0.13, (nose.wb - 0.36) * 2, "grille", L / 2 - 0.005, lerp(nose.ys, nose.yb, 0.62), 0));
  inner.add(box(0.02, 0.11, 0.5, "number-plate", L / 2 + 0.005, lerp(nose.ys, nose.yb, 0.3), 0));
  inner.add(box(0.02, 0.11, 0.5, "number-plate", -L / 2 - 0.005, lerp(tail.ys, tail.yb, 0.42), 0));

  // Door mirrors at the foot of the windscreen: an arm and a painted housing with glass.
  const screenFront = m.screens[m.screens.length - 1];
  const mirrorX = (screenFront[0] - 0.5) * L - 0.08;
  const ms = at(st, mirrorX);
  for (const side of [-1, 1]) {
    const mg = new THREE.Group();
    mg.add(box(0.07, 0.035, 0.09, "plastic-dark", 0, 0, 0));
    mg.add(box(0.1, 0.11, 0.16, `car-${color}`, -0.01, 0.04, side * 0.11));
    mg.add(box(0.006, 0.09, 0.13, "chrome", -0.062, 0.04, side * 0.11));
    mg.position.set(mirrorX, ms.yb + 0.06, side * (ms.wb - 0.06));
    inner.add(tag(mg, "mirror"));
  }
  // Door handles standing out from the doors.
  for (const hx of m.handles) for (const side of [-1, 1]) {
    const s = at(st, hx), hy = s.yb - 0.1;
    inner.add(tag(box(0.15, 0.03, 0.025, "chrome", hx, hy, side * (s.wb + 0.002)), "handle"));
  }
  // Wipers resting at the foot of the windscreen.
  const wx = (screenFront[1] - 0.5) * L - 0.04, ws = at(st, wx);
  for (const z of [-0.36, 0.3]) {
    const wiper = box(0.03, 0.015, 0.58, "plastic-dark", wx, ws.yr + 0.03, z);
    wiper.rotation.y = 0.18;
    inner.add(tag(wiper, "wiper"));
  }
  // Aerial on the roof (towards the back) and an exhaust under the rear bumper.
  const top = st.reduce((a, s) => (s.yr > a.yr ? s : a), st[0]);
  const ax = top.x - 0.6, as = at(st, ax);
  const aerial = mesh(new THREE.CylinderGeometry(0.003, 0.006, 0.38, 6), "plastic-dark");
  aerial.position.set(ax, as.yr + 0.19, 0.25);
  aerial.rotation.z = 0.35;
  inner.add(tag(aerial, "aerial"));
  const exhaust = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 12), "exhaust");
  exhaust.rotation.z = Math.PI / 2;
  exhaust.position.set(-L / 2 + 0.05, tail.ys + 0.02, 0.45);
  inner.add(tag(exhaust, "exhaust"));

  g.add(fitTo(inner, m.length, m.height, m.width));
  return g;
}
