// Building pieces for your own surroundings: walls (concrete, brick, wood or metal), square pillars,
// round columns, earth berms, shipping containers, chain-link fences and concrete barriers. All are
// worn: textures in metres (the same scale on every face and size), dirt at the foot.
import * as THREE from "three";
import { CONTAINERS, BARRIER } from "../../model/props.js";
import { box, group, mesh, worldBox } from "./parts.js";
import { worldUV, wrapUV, grime, corrugationProfile, mergeMeshes } from "./wear.js";

const mat = (m) => `bld-${["concrete", "brick", "wood", "metal"].includes(m) ? m : "concrete"}`;
const rows = (h, step = 0.25) => Math.max(2, Math.ceil(h / step));

// A seeded random, so a prop looks the same every time it is drawn.
function rng(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// A weathered building mesh: geometry placed in the prop, texture in metres, vertex grime.
function weathered(geo, material, { height, seed = 1, wrapRadius = 0 } = {}) {
  if (wrapRadius) wrapUV(geo, wrapRadius); else worldUV(geo);
  grime(geo, { height, seed });
  return mesh(geo, material);
}

export function buildBuildingWall(obj) {
  const { length, height, thickness, material } = obj.params;
  const g = group(obj.id);
  const geo = new THREE.BoxGeometry(length, height, thickness, Math.max(1, Math.ceil(length / 0.5)), rows(height), 1);
  geo.translate(0, height / 2, 0);
  g.add(weathered(geo, mat(material), { height, seed: 11 }));
  return g;
}

export function buildPillar(obj) {
  const { size, height, material } = obj.params;
  const g = group(obj.id);
  const geo = new THREE.BoxGeometry(size, height, size, 1, rows(height), 1);
  geo.translate(0, height / 2, 0);
  g.add(weathered(geo, mat(material), { height, seed: 23 }));
  return g;
}

export function buildColumn(obj) {
  const { diameter, height, material } = obj.params;
  const g = group(obj.id);
  const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 32, rows(height));
  geo.translate(0, height / 2, 0);
  g.add(weathered(geo, mat(material), { height, seed: 31, wrapRadius: diameter / 2 }));
  return g;
}

// (The earth berm is built in builders/berm.js.)

// ---------------------------------------------------------------- shipping container

/**
 * A sheet through a grid of points: point(i, j) for i across `cols` columns and j up `rowsN` rows,
 * facing `out`. Flat-shaded (each quad its own normal), so corrugation reads crisply. uv(i, j) gives
 * the texture coordinate.
 */
function sheet(cols, rowsN, point, uvAt, out) {
  const pos = [], uv = [];
  const push = (i, j) => { pos.push(...point(i, j)); uv.push(...uvAt(i, j)); };
  for (let i = 0; i < cols - 1; i++) for (let j = 0; j < rowsN - 1; j++) {
    for (const [a, b] of [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]]) push(i + a, j + b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  // Face the sheet outwards.
  const n = geo.attributes.normal;
  if (n.getX(0) * out[0] + n.getY(0) * out[1] + n.getZ(0) * out[2] < 0) {
    const p = geo.attributes.position, t = geo.attributes.uv;
    for (let k = 0; k < p.count; k += 3) for (const attr of [p, t]) {
      for (let c = 0; c < attr.itemSize; c++) { const a = attr.getComponent(k + 1, c); attr.setComponent(k + 1, c, attr.getComponent(k + 2, c)); attr.setComponent(k + 2, c, a); }
    }
    geo.computeVertexNormals();
  }
  return geo;
}

// A few shallow dents, pushed in where they are (depth in metres at (x, y)).
function dents(r, span, y0, y1, n) {
  const list = Array.from({ length: n }, () => ({ x: (r() - 0.5) * span * 0.9, y: y0 + r() * (y1 - y0), rad: 0.25 + r() * 0.45, d: 0.006 + r() * 0.012 }));
  return (x, y) => list.reduce((s, k) => s + k.d * Math.max(0, 1 - ((x - k.x) ** 2 + (y - k.y) ** 2) / k.rad ** 2), 0);
}

const C = {
  casting: [0.178, 0.118, 0.162],     // corner casting: along the length, height, across
  post: 0.115,                        // corner posts, along the length
  bottom: [0.013, 0.175],             // bottom side rail (castings stand 13 mm proud below)
  top: 0.115,                         // top side rail, down from the roof line
  skin: 0.006,                        // corrugation's outer flats, in from the castings' face
  doorIn: 0.06,                       // door panels, in from the door end
};

export function buildContainer(obj) {
  const c = CONTAINERS[obj.params.size] || CONTAINERS["20ft"];
  const color = obj.params.color || "blue";
  const paint = `container-${color}`, doorPaint = `container-door-${color}`;
  const L = c.length, W = c.width, H = c.height, g = group(obj.id);
  const r = rng(L * 100 + color.length);
  const count = {};
  const tag = (m, part) => { count[part] = (count[part] || 0) + 1; m.userData.part = part; return m; };
  const painted = [], hardware = [], holes = [];
  const pb = (w, h, d, x, y, z, part) => { const m = worldBox(w, h, d, paint, x, y, z); if (part) tag(m, part); painted.push(m); return m; };

  // Hidden core, so no gap ever shows daylight through the box.
  g.add(box(L - 0.2, H - 0.1, W - 0.2, "hard-cover", 0, H / 2, 0));

  // Corrugated long sides: the trapezoid runs along the length, a few dents, texture u along the side.
  const y0 = C.bottom[1], y1 = H - C.top, span = L - 2 * C.post;
  const prof = corrugationProfile(span), ys = Array.from({ length: 8 }, (_, j) => y0 + ((y1 - y0) * j) / 7);
  for (const s of [-1, 1]) {
    const dent = dents(r, span, y0 + 0.3, y1 - 0.3, L > 7 ? 6 : 3);
    const geo = sheet(prof.length, ys.length,
      (i, j) => [prof[i][0], ys[j], s * (W / 2 - C.skin - prof[i][1] - dent(prof[i][0], ys[j]))],
      (i, j) => [s * prof[i][0], ys[j]], [0, 0, s]);
    g.add(tag(mesh(geo, paint), "corrugated-side"));
  }
  // The closed front end, corrugated across the width.
  const endSpan = W - 2 * 0.15, eprof = corrugationProfile(endSpan);
  g.add(tag(mesh(sheet(eprof.length, 2, (i, j) => [-(L / 2 - C.skin - 0.03 - eprof[i][1]), j ? y1 : y0, eprof[i][0]], (i, j) => [eprof[i][0], j ? y1 : y0], [-1, 0, 0]), paint), "corrugated-end"));

  // Frame: roof, top and bottom side rails, corner posts, the end rails (door header and sill).
  pb(L - 0.1, 0.03, W - 0.04, 0, H - 0.03, 0, "roof");
  for (const s of [-1, 1]) {
    pb(L - 2 * C.casting[0] + 0.02, C.top - 0.012, 0.07, 0, H - C.top / 2 - 0.004, s * (W / 2 - 0.035 - 0.002), "top-rail");
    pb(L - 2 * C.casting[0] + 0.02, C.bottom[1] - C.bottom[0], 0.09, 0, (C.bottom[0] + C.bottom[1]) / 2, s * (W / 2 - 0.045 - 0.002), "bottom-rail");
    for (const e of [-1, 1]) pb(C.post, H - 2 * C.casting[1], 0.15, e * (L / 2 - C.post / 2 - 0.003), H / 2, s * (W / 2 - 0.075 - 0.003), "corner-post");
  }
  for (const e of [-1, 1]) {
    pb(0.1, 0.13, W - 2 * C.casting[2] + 0.02, e * (L / 2 - 0.055), H - 0.075, 0, "end-top-rail");
    pb(0.12, 0.15, W - 2 * C.casting[2] + 0.02, e * (L / 2 - 0.065), C.bottom[0] + 0.075, 0, "end-bottom-rail");
  }
  // Corner castings with their oval holes (dark decals on the outer faces).
  const [cl, ch, cw] = C.casting;
  for (const ex of [-1, 1]) for (const ez of [-1, 1]) for (const top of [0, 1]) {
    const x = ex * (L / 2 - cl / 2), y = top ? H - ch / 2 : ch / 2, z = ez * (W / 2 - cw / 2);
    pb(cl, ch, cw, x, y, z, "corner-casting");
    const side = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.05)); side.position.set(x, y, ez * W / 2); if (ez < 0) side.rotation.y = Math.PI; holes.push(side);
    const end = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.05)); end.position.set(ex * L / 2, y, z); end.rotation.y = ex * Math.PI / 2; holes.push(end);
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06)); cap.position.set(x, top ? H : 0, z); cap.rotation.x = top ? -Math.PI / 2 : Math.PI / 2; holes.push(cap);
  }
  // Forklift pockets in the bottom rails of a 20 ft box.
  if (L < 7) for (const s of [-1, 1]) for (const px of [-1.03, 1.03]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.1)); p.position.set(px, 0.095, s * (W / 2 - 0.0005)); if (s < 0) p.rotation.y = Math.PI; holes.push(p);
  }

  // The door end (+x): two doors with horizontal pressings, four locking bars with cam keepers,
  // guides and handles, hinges on the outer edges.
  const dz0 = W / 2 - 0.15, dy0 = C.bottom[0] + 0.15, dy1 = H - 0.14, dh = dy1 - dy0, dx = L / 2 - C.doorIn;
  const press = corrugationProfile(dh, { pitch: 0.42, outer: 0.2, inner: 0.15, depth: 0.022 });
  for (const s of [-1, 1]) {
    const za = s < 0 ? -dz0 : 0.006, zb = s < 0 ? -0.006 : dz0;
    const geo = sheet(2, press.length, (i, j) => [dx - press[j][1], dy0 + dh / 2 + press[j][0], i ? zb : za], (i, j) => [-(i ? zb : za), dy0 + dh / 2 + press[j][0]], [1, 0, 0]);
    const door = tag(mesh(geo, doorPaint), "door");
    g.add(door);
    // The door's frame (stiles and rails) standing proud of the pressings.
    for (const [w, h, z, y] of [[0.05, dh, za + 0.025, dy0 + dh / 2], [0.05, dh, zb - 0.025, dy0 + dh / 2], [zb - za, 0.06, (za + zb) / 2, dy0 + 0.03], [zb - za, 0.06, (za + zb) / 2, dy1 - 0.03]]) {
      const m = box(0.02, h, w, doorPaint, dx + 0.002, y, z);
      worldUV(m.geometry, { offset: [dx + 0.002, y, z] });
      g.add(m);
    }
    // Locking bars at about a quarter and two thirds of the door's width from its hinge side.
    const hingeZ = s < 0 ? -dz0 : dz0, inner = s < 0 ? -0.006 : 0.006;
    for (const f of [0.26, 0.68]) {
      const z = hingeZ + (inner - hingeZ) * f, bx = L / 2 - 0.032;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, dh + 0.05, 10)); bar.position.set(bx, dy0 + dh / 2, z); hardware.push(bar); count["locking-bar"] = (count["locking-bar"] || 0) + 1;
      for (const y of [dy0 - 0.02, dy1 + 0.02]) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.075)); k.position.set(L / 2 - 0.04, y, z); hardware.push(k); }   // cam keepers
      for (const y of [dy0 + dh * 0.28, dy0 + dh * 0.78]) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.06)); k.position.set(L / 2 - 0.042, y, z); hardware.push(k); }   // guides
      // The cam handle: a hub on the bar and a lever folded flat toward the door's hinge side,
      // held in a retainer.
      const hy = 1.02 + (f > 0.5 ? 0.12 : 0), dir = Math.sign(hingeZ - z);
      const hub = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.045)); hub.position.set(L / 2 - 0.03, hy, z); hardware.push(hub);
      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.028, 0.36)); lever.position.set(L / 2 - 0.016, hy, z + dir * 0.18); hardware.push(lever);
      const keep = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03)); keep.position.set(L / 2 - 0.03, hy, z + dir * 0.33); hardware.push(keep);
      count["cam-handle"] = (count["cam-handle"] || 0) + 1;
    }
    for (const y of [dy0 + 0.25, dy0 + dh * 0.36, dy0 + dh * 0.64, dy1 - 0.25]) {                 // hinges
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 10)); h.position.set(L / 2 - 0.04, y, s * (dz0 + 0.005)); hardware.push(h);
    }
  }
  g.add(box(0.012, dh, 0.012, "hard-cover", dx - 0.01, dy0 + dh / 2, 0));                       // the seal between the doors

  // Fewer draw calls: the frame, the hardware and the holes are one mesh each.
  const paintedMesh = mesh(mergeMeshes(painted), paint);
  for (const m of hardware) worldUV(m.geometry, { offset: m.position.toArray() });
  const hw = mesh(mergeMeshes(hardware), "galv-steel");
  const holeMesh = mesh(mergeMeshes(holes), "hole-dark");
  holeMesh.castShadow = false;
  g.add(paintedMesh, hw, holeMesh);
  g.userData.parts = count;
  return g;
}

// ---------------------------------------------------------------- chain-link fence

const FENCE = { end: 0.03, line: 0.024, rail: 0.017, bottom: 0.05, sag: 0.025 };

export function buildFence(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  const posts = Math.max(2, Math.round(length / 2.5) + 1);
  const xs = Array.from({ length: posts }, (_, i) => -length / 2 + FENCE.end + (i * (length - 2 * FENCE.end)) / (posts - 1));
  const meshZ = -(FENCE.line + 0.006), railY = height - 0.05;
  xs.forEach((x, i) => {
    const end = i === 0 || i === posts - 1, r = end ? FENCE.end : FENCE.line;
    const post = mesh(new THREE.CylinderGeometry(r, r, height - 0.03, 14), "galv-steel");
    post.position.set(x, (height - 0.03) / 2, 0);
    post.userData.part = "post";
    g.add(post);
    // End posts get a dome cap; line posts a loop cap that carries the top rail.
    const cap = end
      ? mesh(new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), "galv-steel")
      : mesh(new THREE.CylinderGeometry(r, r, 0.03, 14), "galv-steel");
    cap.position.set(x, height - (end ? 0.03 : 0.015), 0);
    g.add(cap);
    if (!end) g.add(box(0.03, 0.04, Math.abs(meshZ) + FENCE.rail, "galv-steel", x, railY, meshZ / 2));
    g.add(box(0.06, 0.04, 0.5, "galv-steel", x, 0.02, 0));                       // a foot
    if (end) for (const y of [0.3, height * 0.5, height - 0.3]) g.add(box(0.015, 0.03, 0.05, "galv-steel", x + (i ? -1 : 1) * 0.02, y, meshZ / 2));   // tension bands
  });
  const span = length - 2 * FENCE.end;
  const rail = mesh(new THREE.CylinderGeometry(FENCE.rail, FENCE.rail, span, 10), "galv-steel");
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, railY, meshZ);
  rail.userData.part = "top-rail";
  g.add(rail);
  const wire = mesh(new THREE.CylinderGeometry(0.0025, 0.0025, span, 5), "galv-steel");     // bottom tension wire
  wire.rotation.z = Math.PI / 2;
  wire.position.set(0, FENCE.bottom + 0.01, meshZ);
  g.add(wire);

  // The mesh: hung from the rail, sagging a little and bowing between posts; uv in metres.
  const mh = railY - FENCE.bottom, segX = (posts - 1) * 10, segY = 6;
  const geo = new THREE.PlaneGeometry(span, mh, segX, segY);
  const pos = geo.attributes.position, uv = geo.attributes.uv, bay = span / (posts - 1);
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k), yf = (pos.getY(k) + mh / 2) / mh;
    const t = ((x + span / 2) % bay) / bay, bulge = Math.sin(Math.PI * t);
    pos.setXYZ(k, x, FENCE.bottom + yf * mh - FENCE.sag * bulge * yf * yf, meshZ - 0.015 * bulge * Math.sin(Math.PI * yf));
    uv.setXY(k, x + span / 2, pos.getY(k));
  }
  geo.computeVertexNormals();
  const net = mesh(geo, "fence-mesh");
  net.userData.part = "mesh";
  net.castShadow = true;
  g.add(net);
  return g;
}

// ---------------------------------------------------------------- Jersey barrier

// Half-widths of the profile (F-shape/Jersey: 75 mm toe, 55° lower face to 330 mm, then near
// vertical to a 150 mm top) at 810 mm high and 600 mm wide.
const J = { toe: 0.075, knee: 0.33, kneeHalf: 0.127, topHalf: 0.075, slot: 0.1, slotW: 0.25 };
const halfAt = (y) => {
  const b = BARRIER.base / 2, h = BARRIER.height;
  if (y <= J.toe) return b;
  if (y <= J.knee) return b + ((J.kneeHalf - b) * (y - J.toe)) / (J.knee - J.toe);
  return J.kneeHalf + ((J.topHalf - J.kneeHalf) * (y - J.knee)) / (h - J.knee);
};

function profile(yFrom, yTo) {
  const s = new THREE.Shape(), ys = [yFrom, J.toe, J.knee, yTo].filter((y, i, a) => y >= yFrom && y <= yTo && a.indexOf(y) === i).sort((a, b) => a - b);
  s.moveTo(-halfAt(yFrom), yFrom);
  for (const y of ys) s.lineTo(halfAt(y), y);
  for (const y of [...ys].reverse()) s.lineTo(-halfAt(y), y);
  s.closePath();
  return s;
}

function barrierPiece(shape, x0, x1) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
  geo.translate(0, 0, x0);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  worldUV(geo, { topV: 0.9 });
  return mesh(geo, "barrier-concrete");
}

// A concrete Jersey barrier: sloped foot, narrow top, two slots through the foot for forks and
// drainage, lifting pockets on top.
export function buildBarrier(obj) {
  const { length } = obj.params;
  const g = group(obj.id), h = BARRIER.height;
  g.add(barrierPiece(profile(J.slot, h), -length / 2, length / 2));
  const foot = profile(0, J.slot), slots = [-length / 4, length / 4];
  let x = -length / 2;
  for (const sx of slots) {
    g.add(barrierPiece(foot, x, sx - J.slotW / 2));
    const slot = new THREE.Group();
    slot.position.set(sx, J.slot / 2, 0);
    slot.userData.part = "slot";
    g.add(slot);
    x = sx + J.slotW / 2;
  }
  g.add(barrierPiece(foot, x, length / 2));
  for (const sx of slots) {
    const pocket = mesh(new THREE.PlaneGeometry(0.12, 0.06), "hole-dark");
    pocket.rotation.x = -Math.PI / 2;
    pocket.position.set(sx, h + 0.0002, 0);
    pocket.castShadow = false;
    pocket.userData.part = "lift-pocket";
    g.add(pocket);
  }
  return g;
}
