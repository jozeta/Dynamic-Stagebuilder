// Walls, doors and windows drawn on a plan image. Points are in the plan's pixels (x right, y down),
// so the drawing stays on the plan however it is scaled or placed; `tol` is the snapping distance in
// pixels. Walls snap to each other's ends and onto walls (T-junctions) and straighten when nearly
// level or upright; doors and windows are set into the wall they are drawn on (and anchor to its ends
// when close), or fill a gap between two walls' ends. layout() turns it into 3D parts with heights,
// cut at a height for the kinds chosen. Pure: no DOM, no Three.js.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const round = (p) => [Math.round(p[0] * 10) / 10 + 0, Math.round(p[1] * 10) / 10 + 0];
const STRAIGHT = (6 * Math.PI) / 180;                // within 6° of level or upright: straightened
const MAX = { items: 2000 };

export const HEIGHT_LIMITS = Object.freeze({ wall: [0.5, 6], door: [1.5, 3], sill: [0, 2], head: [0.5, 3], thickness: [0.05, 0.6], cut: [0.1, 6] });
// How the walls are finished in 3D, and whether doors have their leaf (closed or standing open).
export const WALL_SURFACES = Object.freeze(["concrete", "block", "brick", "plaster", "wood", "metal"]);
export const DOOR_LEAVES = Object.freeze(["none", "closed", "open"]);
export function emptyDrawing() {
  return { walls: [], doors: [], windows: [], heights: { wall: 2.4, door: 2.1, sill: 0.9, head: 2.1, thickness: 0.2 },
    cut: { on: false, height: 1.2, walls: true, doors: true, windows: true }, style: { wall: "concrete", leaf: "none" } };
}
const END_SNAP = 0.3;                              // ends snap from a third of the way: walls near an end stay on the line

// The nearest point on segment a–b to p, and where along it (0…1).
function onSegment(p, a, b) {
  const v = sub(b, a), L = v[0] * v[0] + v[1] * v[1];
  const t = L ? clamp(((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L, 0, 1) : 0;
  const q = [a[0] + v[0] * t, a[1] + v[1] * t];
  return { q, t, d: dist(p, q) };
}
const ends = (d) => d.walls.flatMap((w) => [w.a, w.b]);

/** Snap a point: to a wall's end when very close, else onto a wall, else unchanged. */
export function snapPoint(d, p, tol) {
  let best = null, bd = tol * END_SNAP;
  for (const e of ends(d)) { const k = dist(p, e); if (k <= bd) { bd = k; best = e; } }
  if (best) return [...best];
  bd = tol;
  for (const w of d.walls) { const s = onSegment(p, w.a, w.b); if (s.d <= bd) { bd = s.d; best = s.q; } }
  return best ? round(best) : [...p];
}

/** Add a wall from a to b (snapped, straightened). Returns the same drawing when too short. */
export function addWall(d, a, b, tol) {
  if (d.walls.length >= MAX.items) return d;
  const A = snapPoint(d, a, tol);
  let B = snapPoint(d, b, tol);
  const snappedEnd = ends(d).some((e) => e[0] === B[0] && e[1] === B[1]);
  if (!snappedEnd) {
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const level = Math.abs(Math.sin(ang)) < Math.sin(STRAIGHT), upright = Math.abs(Math.cos(ang)) < Math.sin(STRAIGHT);
    if (level) B = [B[0], A[1]];                   // keep where it was aimed along the wall
    else if (upright) B = [A[0], B[1]];
    B = round(B);
  }
  if (dist(A, B) < tol) return d;
  return { ...d, walls: [...d.walls, { a: A, b: B }] };
}

/**
 * Add a door or window from a to b. Set into the wall it lies on (projected onto it, an end near
 * the wall's end goes to that end); or, between two walls' ends, filling the gap; else as drawn.
 */
export function addOpening(d, kind, a, b, tol) {
  const key = kind === "window" ? "windows" : "doors";
  if (d[key].length >= MAX.items) return d;
  // On a wall: both ends near the same wall's line.
  let host = null, hd = Infinity;
  for (const w of d.walls) {
    const sa = onSegment(a, w.a, w.b), sb = onSegment(b, w.a, w.b);
    const k = Math.max(sa.d, sb.d);
    if (k <= tol && k < hd && Math.abs(sa.t - sb.t) > 0) { hd = k; host = { w, sa, sb }; }
  }
  if (host) {
    const fix = (s) => (dist(s.q, host.w.a) <= tol ? [...host.w.a] : dist(s.q, host.w.b) <= tol ? [...host.w.b] : round(s.q));
    const A = fix(host.sa), B = fix(host.sb);
    if (dist(A, B) < tol / 2) return d;
    return { ...d, [key]: [...d[key], { a: A, b: B }] };
  }
  // In a gap: each end near a wall's end (anchored to it).
  const near = (p) => { let best = null, bd = tol * 2; for (const e of ends(d)) { const k = dist(p, e); if (k <= bd) { bd = k; best = e; } } return best; };
  const ea = near(a), eb = near(b);
  const A = ea ? [...ea] : round(a), B = eb ? [...eb] : round(b);
  if (dist(A, B) < tol / 2) return d;
  return { ...d, [key]: [...d[key], { a: A, b: B }] };
}

/** The wall end, door end or window end nearest p (within tol), or null. */
export function nearestAnchor(d, p, tol) {
  let best = null, bd = tol;
  for (const s of [...d.walls, ...d.doors, ...d.windows]) for (const e of [s.a, s.b]) { const k = dist(p, e); if (k <= bd) { bd = k; best = e; } }
  return best ? [...best] : null;
}
/** Move every end at `point` (joined walls, and openings ending there) by delta. */
export function moveAnchor(d, point, delta) {
  const same = (e) => Math.abs(e[0] - point[0]) < 1e-6 && Math.abs(e[1] - point[1]) < 1e-6;
  const mv = (e) => (same(e) ? round([e[0] + delta[0], e[1] + delta[1]]) : e);
  const each = (list) => list.map((s) => ({ a: mv(s.a), b: mv(s.b) }));
  return { ...d, walls: each(d.walls), doors: each(d.doors), windows: each(d.windows) };
}

/** Remove what lies under p (a door or window first, they lie on top of walls). */
export function eraseAt(d, p, tol) {
  for (const key of ["doors", "windows", "walls"]) {
    let i = -1, bd = tol;
    d[key].forEach((s, k) => { const x = onSegment(p, s.a, s.b).d; if (x <= bd) { bd = x; i = k; } });
    if (i >= 0) return { ...d, [key]: d[key].filter((_, k) => k !== i) };
  }
  return d;
}

/**
 * The 3D parts, in metres in the plan's frame ([x, y] pixels × metres per pixel), each
 * { kind: "wall" | "lintel" | "sill" | "head" | "glass" | "frame" | "leaf" | "wframe" | "ledge", a, b, y0, y1, thickness }:
 * walls round their openings, a lintel over each door, sill and head round each window and its
 * glass; an opening in a gap gets jambs (doors) or its sill and head (windows). Cut at a height for
 * the kinds chosen (walls: wall; doors: lintel, jamb; windows: sill, head, glass).
 */
export function layout(d, mpp) {
  const H = d.heights, out = [], leaf = d.style?.leaf || "none";
  const m = (p) => [Math.round(p[0] * mpp * 1e4) / 1e4 + 0, Math.round(p[1] * mpp * 1e4) / 1e4 + 0];
  const part = (kind, a, b, y0, y1, extra = {}) => { if (y1 > y0 + 1e-6 && dist(a, b) > 1e-6) out.push({ kind, a: m(a), b: m(b), y0, y1, thickness: H.thickness, ...extra }); };
  const along = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  // A door's frame (two jambs and a head, 6 cm) and, if chosen, its leaf, hinged at a.
  const doorParts = (a, b) => {
    const L = dist(a, b), f = Math.min(0.06 / mpp, L / 4) / L, top = Math.min(H.door, H.wall);
    part("frame", a, along(a, b, f), 0, top); part("frame", along(a, b, 1 - f), b, 0, top);
    part("frame", a, b, top - 0.06, top);
    if (leaf !== "none") part("leaf", along(a, b, f), along(a, b, 1 - f), 0.01, top - 0.06, { open: leaf === "open" ? 90 : 0 });
  };
  // A window's frame (stiles, rails and a centre mullion, 5 cm) and its ledge.
  const windowParts = (a, b, sill, head) => {
    const L = dist(a, b), f = Math.min(0.05 / mpp, L / 6) / L;
    part("wframe", a, along(a, b, f), sill, head); part("wframe", along(a, b, 1 - f), b, sill, head);
    part("wframe", along(a, b, 0.5 - f / 2), along(a, b, 0.5 + f / 2), sill, head);
    part("wframe", a, b, sill, sill + 0.05); part("wframe", a, b, head - 0.05, head);
    part("ledge", a, b, sill - 0.04, sill, { thickness: H.thickness + 0.1 });
  };
  const at = (w, t) => [w.a[0] + (w.b[0] - w.a[0]) * t, w.a[1] + (w.b[1] - w.a[1]) * t];
  const used = new Set();
  for (const w of d.walls) {
    // The openings on this wall, as spans along it.
    const spans = [];
    for (const [kind, list] of [["door", d.doors], ["window", d.windows]]) list.forEach((o) => {
      const sa = onSegment(o.a, w.a, w.b), sb = onSegment(o.b, w.a, w.b);
      if (sa.d < 0.5 && sb.d < 0.5 && Math.abs(sa.t - sb.t) > 1e-6) { spans.push({ kind, t0: Math.min(sa.t, sb.t), t1: Math.max(sa.t, sb.t) }); used.add(o); }
    });
    spans.sort((x, y) => x.t0 - y.t0);
    let t = 0;
    for (const s of spans) {
      if (s.t0 > t) part("wall", at(w, t), at(w, s.t0), 0, H.wall);
      const a = at(w, s.t0), b = at(w, s.t1);
      if (s.kind === "door") { part("lintel", a, b, Math.min(H.door, H.wall), H.wall); doorParts(a, b); }
      else { part("sill", a, b, 0, Math.min(H.sill, H.wall)); part("glass", a, b, H.sill, Math.min(H.head, H.wall)); part("head", a, b, Math.min(H.head, H.wall), H.wall); windowParts(a, b, H.sill, Math.min(H.head, H.wall)); }
      t = Math.max(t, s.t1);
    }
    if (t < 1) part("wall", at(w, t), w.b, 0, H.wall);
  }
  // Openings in a gap (or on their own): a door frame, or a window with its sill and head.
  for (const o of d.doors) if (!used.has(o)) { doorParts(o.a, o.b); part("lintel", o.a, o.b, H.door, Math.max(H.wall, H.door + 0.1)); }
  for (const o of d.windows) if (!used.has(o)) { part("sill", o.a, o.b, 0, H.sill); part("glass", o.a, o.b, H.sill, H.head); part("head", o.a, o.b, H.head, H.wall); windowParts(o.a, o.b, H.sill, H.head); }
  // The cut.
  const c = d.cut;
  if (!c?.on) return out;
  const group = (k) => (k === "wall" ? "walls" : k === "lintel" || k === "frame" || k === "leaf" ? "doors" : "windows");
  return out.filter((p) => !(c[group(p.kind)] && p.y0 >= c.height)).map((p) => (c[group(p.kind)] && p.y1 > c.height ? { ...p, y1: c.height } : p));
}

/** A stored drawing, checked (bad items dropped, heights kept in range). */
export function cleanDrawing(v) {
  const e = emptyDrawing();
  if (!v || typeof v !== "object") return e;
  const pt = (p) => (Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1e6) ? [p[0], p[1]] : null);
  const segs = (list) => (Array.isArray(list) ? list : []).slice(0, MAX.items).map((s) => (s && pt(s.a) && pt(s.b) ? { a: pt(s.a), b: pt(s.b) } : null)).filter(Boolean);
  const h = v.heights && typeof v.heights === "object" ? v.heights : {};
  const num = (x, [lo, hi], def) => (typeof x === "number" && Number.isFinite(x) ? clamp(x, lo, hi) : def);
  const c = v.cut && typeof v.cut === "object" ? v.cut : {};
  const bool = (x, def) => (typeof x === "boolean" ? x : def);
  return {
    walls: segs(v.walls), doors: segs(v.doors), windows: segs(v.windows),
    heights: { wall: num(h.wall, HEIGHT_LIMITS.wall, e.heights.wall), door: num(h.door, HEIGHT_LIMITS.door, e.heights.door), sill: num(h.sill, HEIGHT_LIMITS.sill, e.heights.sill),
      head: num(h.head, HEIGHT_LIMITS.head, e.heights.head), thickness: num(h.thickness, HEIGHT_LIMITS.thickness, e.heights.thickness) },
    cut: { on: bool(c.on, false), height: num(c.height, HEIGHT_LIMITS.cut, e.cut.height), walls: bool(c.walls, true), doors: bool(c.doors, true), windows: bool(c.windows, true) },
    style: { wall: WALL_SURFACES.includes(v.style?.wall) ? v.style.wall : "concrete", leaf: DOOR_LEAVES.includes(v.style?.leaf) ? v.style.leaf : "none" },
  };
}
