// The earth berm's shape: how high the ground of a berm is at a point in its own frame (u along its
// length, v across; metres from its centre). A plain berm is a mound with a flat top a third of its
// depth, sloping sides and sloping ends; a drawn one raises the black squares of its outline (1 m
// squares, at most OUTLINE_MAX × OUTLINE_MAX m) to its height, with a slope at their edges. In the
// outline, column 0 is on the berm's + u side and row 0 on its − v side, as in the bay drawings.
// Pure: no DOM, no Three.js.
export const OUTLINE_MAX = 10;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); };
const r3 = (v) => Math.round(v * 1000) / 1000 + 0;

/** A drawn outline, checked ({ width, depth, rows } in whole metres), or null. */
export function cleanOutline(v) {
  if (!v || typeof v !== "object") return null;
  const n = (x) => clamp(Math.round(Number.isFinite(x) ? x : 1), 1, OUTLINE_MAX);
  const width = n(v.width), depth = n(v.depth);
  const src = Array.isArray(v.rows) ? v.rows : [];
  const rows = Array.from({ length: depth }, (_, r) => Array.from({ length: width }, (_, c) => (typeof src[r] === "string" && src[r][c] === "1" ? "1" : "0")).join(""));
  return { width, depth, rows };
}

/** The berm's footprint [along, across] in metres. */
export const bermSize = (obj) => (obj.outline ? [obj.outline.width, obj.outline.depth] : [obj.params.length, obj.params.depth]);

// How far a drawn berm's slope runs in from the edge of its squares.
const slopeRun = (h) => clamp(h * 0.75, 0.5, 1.5);

/** The berm's height at (u, v) in its own frame (0 off it). */
export function bermHeight(obj, u, v) {
  const H = obj.params.height;
  const o = obj.outline;
  if (!o) {
    const { length: L, depth: D } = obj.params;
    const side = smooth((D / 2 - Math.abs(v)) / (D / 2 - D / 6));
    const end = smooth((L / 2 - Math.abs(u)) / (D / 3));
    return r3(H * side * end);
  }
  const raised = (c, r) => r >= 0 && r < o.depth && c >= 0 && c < o.width && o.rows[r][c] === "1";
  const c0 = Math.floor(o.width / 2 - u), r0 = Math.floor(v + o.depth / 2);
  if (!raised(c0, r0)) return 0;
  const run = slopeRun(H), k = Math.ceil(run) + 1;
  let d = run;
  for (let r = r0 - k; r <= r0 + k; r++) for (let c = c0 - k; c <= c0 + k; c++) {
    if (raised(c, r)) continue;
    const u0 = o.width / 2 - c - 1, v0 = r - o.depth / 2;
    const qu = clamp(u, u0, u0 + 1), qv = clamp(v, v0, v0 + 1);
    d = Math.min(d, Math.hypot(u - qu, v - qv));
  }
  return r3(H * smooth(d / run));
}
