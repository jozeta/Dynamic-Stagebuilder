// The shooter's route: from the start through shooting positions 1, 2, 3…, bending at grab points.
// Each shooting position keeps the grab points of the stretch that leads to it (`via`, [[x, z], …]).
// The route follows what the shooter walks on: the ground, ramps, platforms, step boxes. Pure.
import { shootingPositions } from "./positions.js";

// Walkable tops: { type → (params, localX, localZ) → height | null } in the prop's own frame.
const SURFACES = {
  ramp: (p, x, z) => (Math.abs(x) <= p.length / 2 && Math.abs(z) <= p.width / 2 ? ((x + p.length / 2) / p.length) * p.height : null),
  platform: (p, x, z) => (Math.abs(x) <= p.length / 2 && Math.abs(z) <= p.width / 2 ? p.height : null),
  "wobble-platform": (p, x, z) => (Math.abs(x) <= 0.8 && Math.abs(z) <= 0.6 ? 0.25 : null),
  "step-box": (p, x, z) => (Math.abs(x) <= 0.3 && Math.abs(z) <= 0.15 ? 0.2 : null),
};
export const WALKABLE = Object.freeze(Object.keys(SURFACES));

/** The height the shooter stands at, at world (x, z): the highest walkable top there, else 0. */
export function surfaceHeight(stage, x, z) {
  let h = 0;
  for (const o of stage.objects) {
    const f = SURFACES[o.type];
    if (!f) continue;
    const a = ((o.rotation || 0) * Math.PI) / 180, dx = x - o.position[0], dz = z - o.position[1];
    const lx = dx * Math.cos(a) + dz * Math.sin(a), lz = -dx * Math.sin(a) + dz * Math.cos(a);
    const v = f(o.params, lx, lz);
    if (v !== null && v > h) h = v;
  }
  return h;
}

/** The legs of the route: { from: "start" | id, to: id, points: [[x, z], …] } (ends included). */
export function routeLegs(stage) {
  const ps = shootingPositions(stage);
  const legs = [];
  let from = stage.start ? { id: "start", at: stage.start.position } : null;
  for (const o of ps) {
    if (from) legs.push({ from: from.id, to: o.id, points: [[from.at[0], from.at[1]], ...(o.via || []).map((v) => [v[0], v[1]]), [o.position[0], o.position[1]]] });
    from = { id: o.id, at: o.position };
  }
  return legs;
}

export const legLength = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** The point a fraction t (0–1) of the way along a polyline. */
export function pointAlong(pts, t) {
  const total = legLength(pts);
  let left = Math.min(1, Math.max(0, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (left <= seg || i === pts.length - 1) {
      const k = seg ? Math.min(1, left / seg) : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    }
    left -= seg;
  }
  return [pts[0][0], pts[0][1]];
}

/** A polyline with extra points every `step` metres (so the line can follow ramps). */
export function densify(pts, step = 0.25) {
  const out = [[pts[0][0], pts[0][1]]];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

/** Where a new grab point at `p` goes in the leg's `via` list: the index of the nearest stretch. */
export function insertIndex(pts, p) {
  let best = 0, bestD = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]], vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz || 1;
    const k = Math.min(1, Math.max(0, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / L2));
    const d = Math.hypot(p[0] - (a[0] + vx * k), p[1] - (a[1] + vz * k));
    if (d < bestD) { bestD = d; best = i - 1; }
  }
  return best;
}

/** The part of a polyline from `a` metres after its start to `b` metres before its end ([] if none). */
export function trimPolyline(pts, a, b) {
  const total = legLength(pts);
  if (total - a - b <= 0.05) return [];
  const out = [pointAlong(pts, a / total)];
  let run = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (run > a && run < total - b) out.push([pts[i][0], pts[i][1]]);
  }
  out.push(pointAlong(pts, (total - b) / total));
  return out;
}

const turnTo = (a, b, w) => a + ((((b - a) % 360) + 540) % 360 - 180) * w;
const smooth = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

/**
 * Where the shooter looks at fraction k (0–1) of a walk along route `pts`, from view `from` to view
 * `to` ({ yaw, pitch } in degrees, the shooting-position convention): turning into the way they walk
 * over the first metre or so, looking level along the route (a metre ahead, so bends turn smoothly),
 * then turning to the position's own view over the last stretch. Returns { yaw, pitch }.
 */
export function walkLook(pts, k, from, to) {
  const total = legLength(pts);
  if (total < 0.05) return { yaw: turnTo(from.yaw, to.yaw, smooth(k)), pitch: from.pitch + (to.pitch - from.pitch) * smooth(k) };
  const s = k * total;
  const here = pointAlong(pts, k);
  let ahead = pointAlong(pts, Math.min(1, (s + 1) / total));
  let dir = [ahead[0] - here[0], ahead[1] - here[1]];
  if (Math.hypot(...dir) < 1e-6) { const a = pts.at(-2), b = pts.at(-1); dir = [b[0] - a[0], b[1] - a[1]]; }
  const heading = (Math.atan2(-dir[0], dir[1]) * 180) / Math.PI;
  const tIn = Math.min(1.2, total * 0.25), tOut = Math.min(1.5, total * 0.3);
  const wIn = smooth(s / tIn), wOut = smooth((s - (total - tOut)) / tOut);
  const yaw = turnTo(turnTo(from.yaw, heading, wIn), to.yaw, wOut);
  const pitch = (from.pitch + (0 - from.pitch) * wIn) * (1 - wOut) + to.pitch * wOut;
  return { yaw, pitch };
}
