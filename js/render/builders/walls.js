// Walls: wire mesh in a pine (or black) frame with a post about every metre, a mesh wall with a
// framed port, a plywood wall, and a plywood wall with a port. Centred on the origin, length along
// x, thickness along z. Ports are real openings.
import * as THREE from "three";
import { STICK, WALL_FOOT } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, extrude, group } from "./parts.js";

const MESH_TILE = 0.5;    // one texture tile of wire mesh (5 × 5 holes of 10 cm), in metres
const PANEL = 0.018;
const PORT_FRAME = 0.035;

// Triangular gussets screwed into the frame's inside corners, as on DIY training walls.
function gussets(g, length, height, material) {
  const leg = Math.min(0.16, length / 6, height / 6);
  const tri = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(leg, 0), new THREE.Vector2(0, leg)]);
  const geo = new THREE.ExtrudeGeometry(tri, { depth: STICK * 0.5, bevelEnabled: false });
  geo.translate(0, 0, -STICK * 0.25);
  const x0 = -length / 2 + STICK, x1 = length / 2 - STICK, y0 = STICK, y1 = height - STICK;
  for (const [x, y, rz] of [[x0, y0, 0], [x1, y0, Math.PI / 2], [x1, y1, Math.PI], [x0, y1, -Math.PI / 2]]) {
    const m = new THREE.Mesh(geo, getMaterial(material));
    m.position.set(x, y, 0);
    m.rotation.z = rz;
    m.castShadow = true;
    m.userData.gusset = true;
    g.add(m);
  }
}

// Feet: a board across the bottom of each end post with two short braces up to the post.
function feet(g, length, material) {
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) {
    g.add(box(STICK, 0.035, WALL_FOOT, material, x, 0.0175, 0));
    for (const s of [-1, 1]) {
      const len = Math.hypot(WALL_FOOT / 2 - 0.02, 0.22);
      const b = box(STICK * 0.8, 0.03, len, material, x, 0.13, s * (WALL_FOOT / 4));
      b.rotation.x = s * Math.atan2(0.22, WALL_FOOT / 2 - 0.02);
      g.add(b);
    }
  }
}

function frame(g, length, height, material) {
  const posts = [-length / 2 + STICK / 2, length / 2 - STICK / 2];
  const mids = Math.max(0, Math.round(length / 1.0) - 1);
  for (let i = 1; i <= mids; i++) posts.push(-length / 2 + (length * i) / (mids + 1));
  for (const x of posts) g.add(box(STICK, height, STICK, material, x, height / 2, 0));
  const rail = length - 2 * STICK;
  g.add(box(rail, STICK, STICK, material, 0, STICK / 2, 0));
  g.add(box(rail, STICK, STICK, material, 0, height - STICK / 2, 0));
}

/** A mesh rectangle from (x0, y0) to (x1, y1); UVs follow world size so the wire spacing is real. */
function meshRect(x0, x1, y0, y1, material) {
  const w = x1 - x0, h = y1 - y0;
  if (w <= 0.001 || h <= 0.001) return null;
  // Subdivided so the netting can sag and bow a little between its fixings.
  const segX = Math.max(2, Math.round(w / 0.25)), segY = Math.max(2, Math.round(h / 0.25));
  const geo = new THREE.PlaneGeometry(w, h, segX, segY);
  geo.translate(x0 + w / 2, y0 + h / 2, -STICK / 2 - 0.003);   // stapled to the front of the frame
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, pos.getX(i) / MESH_TILE, pos.getY(i) / MESH_TILE);
    const u = (pos.getX(i) - x0) / w, v = (pos.getY(i) - y0) / h;
    const bow = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    pos.setZ(i, pos.getZ(i) - bow * Math.min(0.025, w * 0.012));          // bulges a couple of cm
    pos.setY(i, pos.getY(i) - bow * 0.012 * (1 - v));                      // and sags slightly
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, getMaterial(material));
  m.castShadow = true;
  return m;
}

/** Keep a port inside the panel, at least 5 cm from every edge. */
function fitPort(p, inner, height) {
  const pw = Math.min(p.portWidth, inner - 0.1);
  const ph = Math.min(p.portHeight, height - 0.1);
  const pb = Math.min(Math.max(p.portBottom, 0.05), height - 0.05 - ph);
  return { pw, ph, pb };
}

const frameMaterial = (p) => (p.frame === "black" ? "frame-black" : "wood");
const meshMaterial = (p) => `mesh-${p.mesh === "blue" || p.mesh === "black" ? p.mesh : "orange"}`;

export function buildMeshWall(obj) {
  const p = obj.params;
  const g = group(obj.id);
  frame(g, p.length, p.height, frameMaterial(p));
  gussets(g, p.length, p.height, frameMaterial(p));
  feet(g, p.length, frameMaterial(p));
  // The netting covers the whole frame front, edge to edge.
  const m = meshRect(-p.length / 2, p.length / 2, 0, p.height, meshMaterial(p));
  if (m) g.add(m);
  return g;
}

export function buildMeshPortWall(obj) {
  const p = obj.params;
  const g = group(obj.id);
  const fm = frameMaterial(p), mm = meshMaterial(p);
  // End posts and rails only (no middle post through the port).
  for (const x of [-p.length / 2 + STICK / 2, p.length / 2 - STICK / 2]) g.add(box(STICK, p.height, STICK, fm, x, p.height / 2, 0));
  const inner = p.length - 2 * STICK;
  g.add(box(inner, STICK, STICK, fm, 0, STICK / 2, 0));
  g.add(box(inner, STICK, STICK, fm, 0, p.height - STICK / 2, 0));
  const { pw, ph, pb } = fitPort(p, inner - 2 * PORT_FRAME, p.height - 2 * STICK);
  const y0 = Math.max(pb, STICK + PORT_FRAME), y1 = Math.min(y0 + ph, p.height - STICK - PORT_FRAME);
  // Port frame.
  const F = PORT_FRAME;
  g.add(box(pw + 2 * F, F, STICK, fm, 0, y0 - F / 2, 0));
  g.add(box(pw + 2 * F, F, STICK, fm, 0, y1 + F / 2, 0));
  g.add(box(F, y1 - y0, STICK, fm, -pw / 2 - F / 2, (y0 + y1) / 2, 0));
  g.add(box(F, y1 - y0, STICK, fm, pw / 2 + F / 2, (y0 + y1) / 2, 0));
  // Mesh around the port.
  const L = -inner / 2, R = inner / 2, B = STICK, T = p.height - STICK;
  for (const m of [meshRect(L, -pw / 2 - F, B, T, mm), meshRect(pw / 2 + F, R, B, T, mm),
    meshRect(-pw / 2 - F, pw / 2 + F, B, y0 - F, mm), meshRect(-pw / 2 - F, pw / 2 + F, y1 + F, T, mm)]) if (m) g.add(m);
  feet(g, obj.params.length, frameMaterial(obj.params));
  return g;
}

export function buildWoodWall(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) g.add(box(STICK, height, STICK, "wood", x, height / 2, 0));
  g.add(box(length - 2 * STICK, height, PANEL, "plywood", 0, height / 2, 0));
  feet(g, obj.params.length, "wood");
  return g;
}

export function buildPortWall(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) g.add(box(STICK, height, STICK, "wood", x, height / 2, 0));
  const inner = length - 2 * STICK;
  const { pw, ph, pb } = fitPort(obj.params, inner, height);
  const s = new THREE.Shape();
  s.moveTo(-inner / 2, 0); s.lineTo(inner / 2, 0); s.lineTo(inner / 2, height); s.lineTo(-inner / 2, height); s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-pw / 2, pb); hole.lineTo(-pw / 2, pb + ph); hole.lineTo(pw / 2, pb + ph); hole.lineTo(pw / 2, pb); hole.closePath();
  s.holes.push(hole);
  const panel = extrude(s, PANEL, "plywood", PANEL / 2);
  // Extrude UVs are in metres; scale them so one plywood texture covers about 1.2 m.
  const uv = panel.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 1.2);
  g.add(panel);
  feet(g, obj.params.length, "wood");
  return g;
}

// A mesh doorway: end posts and a top rail, a framed door opening from the ground up to the door
// height, mesh either side and above. A wall, so it snaps to other walls.
export function buildDoorWall(obj) {
  const p = obj.params;
  const g = group(obj.id);
  const fm = frameMaterial(p), mm = meshMaterial(p);
  const L = p.length, H = p.height, F = PORT_FRAME;
  for (const x of [-L / 2 + STICK / 2, L / 2 - STICK / 2]) g.add(box(STICK, H, STICK, fm, x, H / 2, 0));
  g.add(box(L - 2 * STICK, STICK, STICK, fm, 0, H - STICK / 2, 0));
  const dw = Math.min(p.doorWidth, L - 2 * STICK - 2 * F - 0.1), dh = Math.min(p.doorHeight, H - STICK - F - 0.05);
  g.add(box(F, dh, STICK, fm, -dw / 2 - F / 2, dh / 2, 0));
  g.add(box(F, dh, STICK, fm, dw / 2 + F / 2, dh / 2, 0));
  g.add(box(dw + 2 * F, F, STICK, fm, 0, dh + F / 2, 0));
  // Bottom rails either side of the door.
  const side = (L - 2 * STICK - dw - 2 * F) / 2;
  for (const s of [-1, 1]) g.add(box(side, STICK, STICK, fm, s * (dw / 2 + F + side / 2), STICK / 2, 0));
  const inner = L / 2 - STICK;
  for (const m of [meshRect(-inner, -dw / 2 - F, STICK, H - STICK, mm), meshRect(dw / 2 + F, inner, STICK, H - STICK, mm),
    meshRect(-dw / 2 - F, dw / 2 + F, dh + F, H - STICK, mm)]) if (m) g.add(m);
  feet(g, obj.params.length, frameMaterial(obj.params));
  return g;
}

// A solid panel: a grey galvanised sheet in a pine frame, set into wall runs to block sight.
export function buildSolidWall(obj) {
  const { length: L, height: H } = obj.params;
  const g = group(obj.id);
  frame(g, L, H, "wood");
  g.add(box(L - 2 * STICK, H - 2 * STICK, 0.012, "panel-grey", 0, H / 2, 0));
  feet(g, obj.params.length, "wood");
  return g;
}
