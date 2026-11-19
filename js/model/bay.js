// Bay shapes. width and depth are the bay's outer rectangle (x across, centred; z down range from
// the up-range edge); the shape is the floor inside it. Each shape has a name, its size fields
// (with defaults and limits from the rectangle) and its outline. + x is the shooter's left. Seen
// from above with down range at the top, "left" is the shooter's left. Pure: no DOM, no Three.js.
const r2 = (v) => Math.round(v * 100) / 100 + 0;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, d) => (typeof v === "number" && Number.isFinite(v) ? v : d);

// Size fields: [key, label, default(bay), min(bay), max(bay)]; choice fields: [key, label, options].
const across = (k, label, part, min = () => 1, max = (b) => b.width - 1) => ({ key: k, label, def: (b) => Math.round(b.width * part), min, max });
const down = (k, label, part, min = () => 1, max = (b) => b.depth - 1) => ({ key: k, label, def: (b) => Math.round(b.depth * part), min, max });
const choice = (k, label, options) => ({ key: k, label, options });

const SPECS = [
  { id: "rect", name: "Rectangle", fields: [], outline: (w, d) => [[-w, 0], [w, 0], [w, d], [-w, d]] },
  { id: "taper", name: "Tapered", fields: [choice("narrowEnd", "Narrow end", [["back", "Back (down range)"], ["front", "Front (up range)"]]), across("narrowWidth", "Width at the narrow end (m)", 0.5)],
    outline: (w, d, b) => { const n = b.narrowWidth / 2; return b.narrowEnd === "front" ? [[-n, 0], [n, 0], [w, d], [-w, d]] : [[-w, 0], [w, 0], [n, d], [-n, d]]; } },
  { id: "notch", name: "Corner cut away", fields: [choice("notchSide", "Cut corner", [["left", "Back left"], ["right", "Back right"]]), across("notchWidth", "Cut width (m)", 1 / 3), down("notchDepth", "Cut depth (m)", 1 / 3)],
    outline: (w, d, b) => {
      const nw = b.notchWidth, nz = d - b.notchDepth;
      return b.notchSide === "right" ? [[-w, 0], [w, 0], [w, d], [-w + nw, d], [-w + nw, nz], [-w, nz]] : [[-w, 0], [w, 0], [w, nz], [w - nw, nz], [w - nw, d], [-w, d]];
    } },
  // L: full width at the front, then the shooter's-left side carries on to the back (reverse: the right side).
  { id: "l", name: "L shape", fields: [across("legWidth", "Width of the back part (m)", 0.5), down("footDepth", "Depth of the full-width front (m)", 0.5)],
    outline: (w, d, b) => [[-w, 0], [w, 0], [w, d], [w - b.legWidth, d], [w - b.legWidth, b.footDepth], [-w, b.footDepth]] },
  { id: "l-reverse", name: "Reverse L", fields: [across("legWidth", "Width of the back part (m)", 0.5), down("footDepth", "Depth of the full-width front (m)", 0.5)],
    outline: (w, d, b) => mirrorX([[-w, 0], [w, 0], [w, d], [w - b.legWidth, d], [w - b.legWidth, b.footDepth], [-w, b.footDepth]]) },
  // T: a narrow stem at the front, centred, opening to the full width at the back.
  { id: "t", name: "T shape", fields: [across("stemWidth", "Width of the front stem (m)", 1 / 3), down("stemDepth", "Depth of the stem (m)", 0.5)],
    outline: (w, d, b) => { const s = b.stemWidth / 2, z = b.stemDepth; return [[-s, 0], [s, 0], [s, z], [w, z], [w, d], [-w, d], [-w, z], [-s, z]]; } },
  // U: full width at the front, two arms on to the back with the middle cut away (a berm juts in).
  { id: "u", name: "U shape", fields: [across("armWidth", "Width of each arm (m)", 0.25, () => 1, (b) => (b.width - 1) / 2), down("baseDepth", "Depth of the full-width front (m)", 0.5)],
    outline: (w, d, b) => { const a = b.armWidth, z = b.baseDepth; return [[-w, 0], [w, 0], [w, d], [w - a, d], [w - a, z], [-w + a, z], [-w + a, d], [-w, d]]; } },
  // Reverse U: full width at the back, two arms reaching to the front with the middle cut away.
  { id: "u-reverse", name: "Reverse U", fields: [across("armWidth", "Width of each arm (m)", 0.25, () => 1, (b) => (b.width - 1) / 2), down("armDepth", "Depth of the front arms (m)", 0.5)],
    outline: (w, d, b) => { const a = b.armWidth, z = b.armDepth; return [[-w, 0], [-w + a, 0], [-w + a, z], [w - a, z], [w - a, 0], [w, 0], [w, d], [-w, d]]; } },
  // Dogleg: the front part on the shooter's right, the back part shifted to the left (a Z seen from
  // above; reverse: an S). The parts overlap where they meet.
  { id: "dogleg", name: "Dogleg (Z)", fields: [across("partWidth", "Width of each part (m)", 0.6, (b) => b.width / 2 + 0.5), down("splitDepth", "Where it bends, down range (m)", 0.5)],
    outline: (w, d, b) => dogleg(w, d, b) },
  { id: "dogleg-reverse", name: "Reverse dogleg (S)", fields: [across("partWidth", "Width of each part (m)", 0.6, (b) => b.width / 2 + 0.5), down("splitDepth", "Where it bends, down range (m)", 0.5)],
    outline: (w, d, b) => mirrorX(dogleg(w, d, b)) },
];
function dogleg(w, d, b) {
  const p = b.partWidth, z = b.splitDepth;
  return [[-w, 0], [-w + p, 0], [-w + p, z], [w, z], [w, d], [w - p, d], [w - p, z], [-w, z]];
}
// Mirrored left to right, wound the same way round (anticlockwise seen from above).
const mirrorX = (pts) => pts.map(([x, z]) => [-x, z]).reverse();
const SPEC = Object.fromEntries(SPECS.map((s) => [s.id, s]));

export const BAY_SHAPES = Object.freeze(SPECS.map((s) => s.id));
/** For the inspector: each shape's name and fields ({ key, label, options } or { key, label, min, max }). */
export const bayShapeFields = (bay) => SPEC[bay.shape || "rect"].fields.map((f) => (f.options ? { key: f.key, label: f.label, options: f.options }
  : { key: f.key, label: f.label, min: r2(Math.max(1, f.min(bay))), max: r2(Math.max(1, f.max(bay))) }));
export const BAY_SHAPE_NAMES = Object.freeze(SPECS.map((s) => [s.id, s.name]));

// Drawn bays: a grid of 1 m cells, one string per row ("0" floor, "1" raised ground). Row 0 is the
// up-range row; column 0 is on the shooter's left (+ x), as the drawing is seen from above with down
// range at the top. Raised ground rises over RAISE.slope metres from the floor's edge (the floor
// stays flat) to RAISE.height. Beside and behind the drawing is raised ground too; up range is open.
export const RAISE = Object.freeze({ height: 2.5, slope: 1.5 });
const DRAWN_MAX = 200;
export const isDrawn = (bay) => bay.shape === "drawn";
/** A drawn bay from its name, size and rows (cleaned). */
export const drawnBay = ({ width, depth, name, rows }) => cleanBay({ width, depth, shape: "drawn", name, rows });
function cleanDrawn(bay) {
  const cols = clamp(Math.round(num(bay.width, 20)), 1, DRAWN_MAX), n = clamp(Math.round(num(bay.depth, 30)), 1, DRAWN_MAX);
  const src = Array.isArray(bay.rows) ? bay.rows : [];
  const rows = Array.from({ length: n }, (_, r) => {
    const row = typeof src[r] === "string" ? src[r] : "";
    return Array.from({ length: cols }, (_, c) => (row[c] === "1" ? "1" : "0")).join("");
  });
  const name = (typeof bay.name === "string" ? bay.name.trim() : "").slice(0, 60) || "Drawn shape";
  const shapeId = typeof bay.shapeId === "string" && /^[\w-]{1,64}$/.test(bay.shapeId) ? { shapeId: bay.shapeId } : {};   // which of My shapes it came from
  return { width: cols, depth: n, shape: "drawn", name, rows, ...shapeId };
}

// My shapes: the drawn shapes saved in this browser, offered in the Bay shape list.
export const MAX_SHAPES = 30;
/** A stored list of drawn shapes, checked: each { id, name, width, depth, shape: "drawn", rows }. */
export function cleanShapeList(v) {
  const out = [], seen = new Set();
  for (const x of Array.isArray(v) ? v : []) {
    if (!x || typeof x !== "object" || typeof x.id !== "string" || !/^[\w-]{1,64}$/.test(x.id) || seen.has(x.id)) continue;
    seen.add(x.id);
    const b = cleanDrawn(x);
    delete b.shapeId;                                                   // the list's own id says which it is
    out.push({ id: x.id, ...b });
    if (out.length >= MAX_SHAPES) break;
  }
  return out;
}
/** 1 when the point is on a raised cell, 0 on floor or outside the grid. */
export function cellAt(bay, x, z) {
  const c = Math.floor(bay.width / 2 - x), r = Math.floor(z);
  return r >= 0 && r < bay.depth && c >= 0 && c < bay.width && bay.rows[r][c] === "1" ? 1 : 0;
}
// The ground area of cell (c, r): x from x0 to x1, z from z0 to z1.
const cellBox = (bay, c, r) => ({ x0: bay.width / 2 - c - 1, x1: bay.width / 2 - c, z0: r, z1: r + 1 });
const toBox = (p, b) => [clamp(p[0], b.x0, b.x1), clamp(p[1], b.z0, b.z1)];
// Raised ground at a point: a raised cell, or anywhere beside or behind the drawing (the area
// outside the drawn grid is raised). Up range of the bay (z < 0) is open.
function raisedAt(bay, c, r) {
  if (r < 0) return false;
  if (r >= bay.depth || c < 0 || c >= bay.width) return true;
  return bay.rows[r][c] === "1";
}
/** The height of raised ground at a point (0 on the floor): a smooth slope up from the floor's edge. */
export function raisedHeight(bay, x, z) {
  const c0 = Math.floor(bay.width / 2 - x), r0 = Math.floor(z);
  if (!raisedAt(bay, c0, r0)) return 0;
  const k = Math.ceil(RAISE.slope) + 1;
  let d = Math.min(RAISE.slope, z);                                  // the open front
  for (let r = Math.max(0, r0 - k); r <= Math.min(bay.depth - 1, r0 + k); r++) for (let c = Math.max(0, c0 - k); c <= Math.min(bay.width - 1, c0 + k); c++) {
    if (raisedAt(bay, c, r)) continue;
    const q = toBox([x, z], cellBox(bay, c, r));
    d = Math.min(d, Math.hypot(x - q[0], z - q[1]));
  }
  const t = clamp(d / RAISE.slope, 0, 1);
  return r2(RAISE.height * t * t * (3 - 2 * t) * 1000) / 1000;
}

/** The paint bucket: fill the area of one colour connected (edge to edge) to cell (c, r) with v. */
export function floodFill(rows, c, r, v) {
  const n = rows.length, w = rows[0]?.length ?? 0;
  if (r < 0 || r >= n || c < 0 || c >= w) return rows;
  const from = rows[r][c];
  if (from === v) return rows;
  const grid = rows.map((row) => row.split(""));
  const stack = [[c, r]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (y < 0 || y >= n || x < 0 || x >= w || grid[y][x] !== from) continue;
    grid[y][x] = v;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return grid.map((row) => row.join(""));
}

/** A bay with only the fields its shape uses, each kept inside the rectangle. */
export function cleanBay(bay) {
  if (bay.shape === "drawn") return cleanDrawn(bay);
  const { width, depth } = bay;
  const spec = SPEC[bay.shape];
  if (!spec || spec.id === "rect") return { width, depth };
  const out = { width, depth, shape: spec.id };
  for (const f of spec.fields) {
    if (f.options) out[f.key] = f.options.some(([v]) => v === bay[f.key]) ? bay[f.key] : f.options[0][0];
    else { const lo = Math.max(1, f.min(out)), hi = Math.max(lo, f.max(out)); out[f.key] = r2(clamp(num(bay[f.key], f.def(out)), lo, hi)); }
  }
  return out;
}

/** The floor's outline: [x, z] corners, anticlockwise seen from above, starting up range. */
export function bayOutline(bay) {
  const spec = (!isDrawn(bay) && SPEC[bay.shape]) || SPEC.rect;          // a drawn bay: its outer rectangle
  return spec.outline(bay.width / 2, bay.depth, bay).map(([x, z]) => [r2(x), r2(z)]);
}
export const isRect = (bay) => !bay.shape || bay.shape === "rect";

function inside(p, poly) {
  let on = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > p[1]) !== (zj > p[1]) && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) on = !on;
  }
  return on;
}
function nearestOnEdges(p, poly) {
  let best = null, bd = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], v = [b[0] - a[0], b[1] - a[1]], L = v[0] * v[0] + v[1] * v[1];
    const k = L ? clamp(((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L, 0, 1) : 0;
    const q = [a[0] + v[0] * k, a[1] + v[1] * k], dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (dist < bd) { bd = dist; best = q; }
  }
  return { point: best, dist: bd };
}

/** Is a point on the floor (edges included)? */
export function insideBay(p, bay) {
  if (isDrawn(bay)) {
    const [x, z] = p;
    if (Math.abs(x) > bay.width / 2 + 1e-6 || z < -1e-6 || z > bay.depth + 1e-6) return false;
    // On a floor cell, or on the edge of one.
    for (const [dx, dz] of [[0, 0], [1e-6, 0], [-1e-6, 0], [0, 1e-6], [0, -1e-6]]) {
      const q = [clamp(x + dx, -bay.width / 2 + 1e-9, bay.width / 2 - 1e-9), clamp(z + dz, 1e-9, bay.depth - 1e-9)];
      if (!cellAt(bay, q[0], q[1])) return true;
    }
    return false;
  }
  const o = bayOutline(bay);
  return inside(p, o) || nearestOnEdges(p, o).dist < 1e-6;
}
/** The nearest point on the floor (the point itself when it is on it). */
export function nearestInBay(p, bay) {
  if (insideBay(p, bay)) return p;
  if (isDrawn(bay)) {
    let best = null, bd = Infinity;
    for (let r = 0; r < bay.depth; r++) for (let c = 0; c < bay.width; c++) {
      if (bay.rows[r][c] === "1") continue;
      const q = toBox(p, cellBox(bay, c, r)), d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (d < bd) { bd = d; best = q; }
    }
    return (best || [clamp(p[0], -bay.width / 2, bay.width / 2), clamp(p[1], 0, bay.depth)]).map(r2);
  }
  return nearestOnEdges(p, bayOutline(bay)).point.map(r2);
}

/** Is the edge from a to b on the up-range edge of the bay (where the shooters come in)? */
export const isFrontEdge = (a, b) => a[1] === 0 && b[1] === 0;

/**
 * How far a point is outside the floor's sides and back (metres; negative inside). Up range of the
 * bay's front edges is open, so a point in front of them is "inside": the berms run along the sides
 * and the back (and round any part the shape cuts away).
 */
export function outsideDistance(p, bay) {
  // Each front edge is replaced by lines straight up range from its two corners.
  const o = bayOutline(bay), open = [];
  for (let i = 0; i < o.length; i++) {
    const a = o[i], b = o[(i + 1) % o.length];
    open.push(a);
    if (isFrontEdge(a, b)) open.push([a[0], -1000], [b[0], -1000]);
  }
  const { dist } = nearestOnEdges(p, open);
  return r2(inside(p, open) ? -dist : dist);
}
