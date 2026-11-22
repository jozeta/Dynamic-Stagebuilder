// Walls: wire mesh in a pine (or black) frame with a post about every metre, and plywood between two
// posts; each a plain wall, a wall with a port (anywhere in it) or a doorway (props Type). Centred on the origin, length along
// x, thickness along z. Ports are real openings.
import * as THREE from "three";
import { STICK, WALL_FOOT } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, extrude, group } from "./parts.js";
import { portRect, doorRect, PORT_FRAME } from "../../model/wall-port.js";

const MESH_TILE = 0.5;    // one texture tile of wire mesh (5 × 5 holes of 10 cm), in metres
const PANEL = 0.018;

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
const frameMaterial = (p) => (p.frame === "black" ? "frame-black" : "wood");
const meshMaterial = (p) => `mesh-${p.mesh === "blue" || p.mesh === "black" ? p.mesh : "orange"}`;
// An invisible marker of where the port is (for checks; never drawn or picked).
function portMark(g, r) { const m = new THREE.Group(); m.userData.port = r; g.add(m); }

/** Mesh wall: Type (model/props.js) picks a plain wall, a wall with a port, or a doorway. */
export function buildMeshWall(obj) {
  const p = obj.params;
  if (p.variant === "port") return buildMeshPortWall(obj);
  if (p.variant === "doorway") return buildDoorWall(obj);
  const g = group(obj.id);
  frame(g, p.length, p.height, frameMaterial(p));
  gussets(g, p.length, p.height, frameMaterial(p));
  feet(g, p.length, frameMaterial(p));
  // The netting covers the whole frame front, edge to edge.
  const m = meshRect(-p.length / 2, p.length / 2, 0, p.height, meshMaterial(p));
  if (m) g.add(m);
  return g;
}

// A mesh wall with a framed port where Port puts it (model/wall-port.js), mesh all round it.
function buildMeshPortWall(obj) {
  const p = obj.params;
  const g = group(obj.id);
  const fm = frameMaterial(p), mm = meshMaterial(p);
  // End posts and rails only (no middle post through the port).
  for (const x of [-p.length / 2 + STICK / 2, p.length / 2 - STICK / 2]) g.add(box(STICK, p.height, STICK, fm, x, p.height / 2, 0));
  const inner = p.length - 2 * STICK;
  g.add(box(inner, STICK, STICK, fm, 0, STICK / 2, 0));
  g.add(box(inner, STICK, STICK, fm, 0, p.height - STICK / 2, 0));
  const r = portRect(p), F = PORT_FRAME, cx = (r.x0 + r.x1) / 2, pw = r.x1 - r.x0;
  // Port frame.
  g.add(box(pw + 2 * F, F, STICK, fm, cx, r.y0 - F / 2, 0));
  g.add(box(pw + 2 * F, F, STICK, fm, cx, r.y1 + F / 2, 0));
  g.add(box(F, r.y1 - r.y0, STICK, fm, r.x0 - F / 2, (r.y0 + r.y1) / 2, 0));
  g.add(box(F, r.y1 - r.y0, STICK, fm, r.x1 + F / 2, (r.y0 + r.y1) / 2, 0));
  // Mesh around the port.
  const L = -inner / 2, R = inner / 2, B = STICK, T = p.height - STICK;
  for (const m of [meshRect(L, r.x0 - F, B, T, mm), meshRect(r.x1 + F, R, B, T, mm),
    meshRect(r.x0 - F, r.x1 + F, B, r.y0 - F, mm), meshRect(r.x0 - F, r.x1 + F, r.y1 + F, T, mm)]) if (m) g.add(m);
  feet(g, p.length, fm);
  portMark(g, r);
  return g;
}

// A mesh doorway: end posts and a top rail, a framed door opening from the ground up to the door
// height, mesh either side and above. A wall, so it snaps to other walls.
function buildDoorWall(obj) {
  const p = obj.params;
  const g = group(obj.id);
  const fm = frameMaterial(p), mm = meshMaterial(p);
  const L = p.length, H = p.height, F = PORT_FRAME;
  for (const x of [-L / 2 + STICK / 2, L / 2 - STICK / 2]) g.add(box(STICK, H, STICK, fm, x, H / 2, 0));
  g.add(box(L - 2 * STICK, STICK, STICK, fm, 0, H - STICK / 2, 0));
  const d = doorRect(p), dw = d.x1 - d.x0, dh = d.y1;
  g.add(box(F, dh, STICK, fm, -dw / 2 - F / 2, dh / 2, 0));
  g.add(box(F, dh, STICK, fm, dw / 2 + F / 2, dh / 2, 0));
  g.add(box(dw + 2 * F, F, STICK, fm, 0, dh + F / 2, 0));
  // Bottom rails either side of the door.
  const side = (L - 2 * STICK - dw - 2 * F) / 2;
  if (side > 0.001) for (const s of [-1, 1]) g.add(box(side, STICK, STICK, fm, s * (dw / 2 + F + side / 2), STICK / 2, 0));
  const inner = L / 2 - STICK;
  for (const m of [meshRect(-inner, -dw / 2 - F, STICK, H - STICK, mm), meshRect(dw / 2 + F, inner, STICK, H - STICK, mm),
    meshRect(-dw / 2 - F, dw / 2 + F, dh + F, H - STICK, mm)]) if (m) g.add(m);
  feet(g, L, fm);
  return g;
}

// A plywood sheet between two posts, its outline `pts` (with an optional hole), UVs so one plywood
// texture covers about 1.2 m.
function plywood(pts, hole = null) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  if (hole) {
    const h = new THREE.Path();
    hole.forEach(([x, y], i) => (i ? h.lineTo(x, y) : h.moveTo(x, y)));
    h.closePath();
    s.holes.push(h);
  }
  const panel = extrude(s, PANEL, "plywood", PANEL / 2);
  const uv = panel.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 1.2);
  return panel;
}

/** Wooden wall: Type picks a plain plywood wall, one with a port cut where Port puts it, or a doorway. */
export function buildWoodWall(obj) {
  const p = obj.params, { length, height } = p;
  const g = group(obj.id);
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) g.add(box(STICK, height, STICK, "wood", x, height / 2, 0));
  const i = (length - 2 * STICK) / 2;
  if (p.variant === "port") {
    const r = portRect(p);
    g.add(plywood([[-i, 0], [i, 0], [i, height], [-i, height]], [[r.x0, r.y0], [r.x0, r.y1], [r.x1, r.y1], [r.x1, r.y0]]));
    portMark(g, r);
  } else if (p.variant === "doorway") {
    // The sheet cut round the door from the ground up, a lintel rail over the opening.
    const d = doorRect(p);
    g.add(plywood([[-i, 0], [d.x0, 0], [d.x0, d.y1], [d.x1, d.y1], [d.x1, 0], [i, 0], [i, height], [-i, height]]));
    g.add(box(d.x1 - d.x0 + 0.1, STICK, STICK, "wood", 0, d.y1 + STICK / 2, PANEL / 2 + STICK / 2));
  } else {
    g.add(box(length - 2 * STICK, height, PANEL, "plywood", 0, height / 2, 0));
  }
  feet(g, length, "wood");
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

// A wooden door in a pine frame on feet. The leaf hangs on the left or right post (as the shooter
// sees it), opens away from or toward the shooter, and stands `open` degrees open; with Animate on
// it opens and shuts.
export function buildDoor(obj) {
  const p = obj.params;
  const g = group(obj.id);
  const dw = p.doorWidth, H = p.height, L = dw + 2 * STICK + 0.02;
  for (const x of [-L / 2 + STICK / 2, L / 2 - STICK / 2]) g.add(box(STICK, H, STICK, "wood", x, H / 2, 0));
  g.add(box(L - 2 * STICK, STICK, STICK, "wood", 0, H - STICK / 2, 0));
  feet(g, L, "wood");
  const side = p.hinge === "right" ? -1 : 1;                 // the shooter's left is +x
  const hinge = new THREE.Group();
  hinge.position.set(side * (dw / 2), 0, 0);
  const sign = side * (p.swing === "toward" ? -1 : 1);
  hinge.rotation.y = (sign * p.open * Math.PI) / 180;
  hinge.userData.anim = { kind: "door", sign, rest: (p.open * Math.PI) / 180 };
  const leafH = H - STICK - 0.02;
  hinge.add(box(dw - 0.01, leafH, 0.04, "plywood", -side * (dw / 2), leafH / 2 + 0.01, 0));
  hinge.add(box(0.12, 0.03, 0.06, "chrome", -side * (dw - 0.12), 1.0, 0));       // the handle
  g.add(hinge);
  return g;
}

// A wooden wall with a port that has a shutter: closed, the plate covers the port; open, it hangs
// down flat toward the shooter from a hinge at the port's foot. Animate opens and closes it.
export function buildPortShutterWall(obj) {
  const g = buildWoodWall({ ...obj, params: { ...obj.params, variant: "port", portOffset: 0 } });
  const r = portRect({ ...obj.params, portOffset: 0 }), pw = r.x1 - r.x0, ph = r.y1 - r.y0;
  const hinge = new THREE.Group();
  hinge.position.set(0, r.y0, -PANEL / 2 - 0.008);
  hinge.userData.anim = { kind: "shutter" };
  hinge.add(box(pw, ph, 0.012, "steel-dark", 0, ph / 2, 0));
  if (obj.params.shutter === "open") hinge.rotation.x = -Math.PI / 2;
  g.add(hinge);
  return g;
}

// A black hard-cover panel on feet.
export function buildHardcoverPanel(obj) {
  const { length: L, height: H } = obj.params;
  const g = group(obj.id);
  g.add(box(L, H, 0.02, "hard-cover", 0, H / 2, 0));
  feet(g, L, "frame-black");
  return g;
}

// A barricade raised on posts: a plywood panel with an open gap underneath.
export function buildRaisedBarricade(obj) {
  const { length: L, panelHeight: ph, gap } = obj.params;
  const g = group(obj.id), H = gap + ph;
  for (const x of [-L / 2 + STICK / 2, L / 2 - STICK / 2]) g.add(box(STICK, H, STICK, "wood", x, H / 2, 0));
  g.add(box(L - 2 * STICK, ph, PANEL, "plywood", 0, gap + ph / 2, 0));
  feet(g, L, "wood");
  return g;
}
