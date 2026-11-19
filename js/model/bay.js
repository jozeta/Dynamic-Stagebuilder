// Bay shapes. width and depth are the bay's outer rectangle (x across, centred; z down range from
// the up-range edge); the shape is the floor inside it: "rect" (all of it), "taper" (narrower at
// the back or the front, narrowWidth wide there) or "notch" (a back corner cut away, notchWidth ×
// notchDepth, on the shooter's left or right, as where a berm or a tree juts in). + x is the
// shooter's left. Pure: no DOM, no Three.js.
export const BAY_SHAPES = Object.freeze(["rect", "taper", "notch"]);
const r2 = (v) => Math.round(v * 100) / 100 + 0;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, d) => (typeof v === "number" && Number.isFinite(v) ? v : d);

/** A bay with only the fields its shape uses, each kept inside the rectangle. */
export function cleanBay(bay) {
  const { width, depth } = bay;
  if (bay.shape === "taper") {
    return { width, depth, shape: "taper", narrowWidth: r2(clamp(num(bay.narrowWidth, Math.round(width / 2)), 1, Math.max(1, width - 1))),
      narrowEnd: bay.narrowEnd === "front" ? "front" : "back" };
  }
  if (bay.shape === "notch") {
    return { width, depth, shape: "notch", notchSide: bay.notchSide === "right" ? "right" : "left",
      notchWidth: r2(clamp(num(bay.notchWidth, Math.round(width / 3)), 1, Math.max(1, width - 1))), notchDepth: r2(clamp(num(bay.notchDepth, Math.round(depth / 3)), 1, Math.max(1, depth - 1))) };
  }
  return { width, depth };
}

/** The floor's outline: [x, z] corners, starting at the up-range right corner, going round. */
export function bayOutline(bay) {
  const w = bay.width / 2, d = bay.depth;
  if (bay.shape === "taper") {
    const n = bay.narrowWidth / 2;
    return bay.narrowEnd === "front" ? [[-n, 0], [n, 0], [w, d], [-w, d]] : [[-w, 0], [w, 0], [n, d], [-n, d]];
  }
  if (bay.shape === "notch") {
    const nw = bay.notchWidth, nz = d - bay.notchDepth;
    return bay.notchSide === "right"
      ? [[-w, 0], [w, 0], [w, d], [-w + nw, d], [-w + nw, nz], [-w, nz]]
      : [[-w, 0], [w, 0], [w, nz], [w - nw, nz], [w - nw, d], [-w, d]];
  }
  return [[-w, 0], [w, 0], [w, d], [-w, d]];
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
  const o = bayOutline(bay);
  return inside(p, o) || nearestOnEdges(p, o).dist < 1e-6;
}
/** The nearest point on the floor (the point itself when it is on it). */
export function nearestInBay(p, bay) {
  if (insideBay(p, bay)) return p;
  return nearestOnEdges(p, bayOutline(bay)).point.map(r2);
}

/**
 * How far a point is outside the floor's sides and back (metres; negative inside). Up range of the
 * bay is open, so a point in front of it is "inside": the berms run along the sides and the back.
 */
export function outsideDistance(p, bay) {
  // The front edge replaced by lines straight up range from its two corners.
  const [o0, o1, ...rest] = bayOutline(bay);
  const open = [[o0[0], -1000], [o1[0], -1000], o1, ...rest, o0];
  const { dist } = nearestOnEdges(p, open);
  return r2(inside(p, open) ? -dist : dist);
}
