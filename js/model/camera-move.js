// The view pad's moves on a camera view ({ position, target } as [x, y, z] arrays, metres). Plain
// maths, no Three.js. Looking down range (+ z), + x is to the left, so a positive pan turns left.
//   pan   degrees: turn the look left (+) or right (−) about the camera
//   tilt  degrees: look up (+) or down (−), held within ±85° of level
//   rise  metres:  lift (+) or lower (−) the camera and its look together, never below 10 cm
//   dolly metres:  move forward (+) or back (−) along the ground the way the camera looks
import { dimensionsOf } from "./props.js";
const MAX_PITCH = 85, MIN_Y = 0.1, RAD = Math.PI / 180;

/** `maxPitch` (degrees) caps how far up a tilt may look (the orbit view never looks above level). */
export function moveView(view, move, amount, { maxPitch = MAX_PITCH } = {}) {
  const p = [...view.position], t = [...view.target];
  if (!Number.isFinite(amount)) return { position: p, target: t };
  const d = [t[0] - p[0], t[1] - p[1], t[2] - p[2]];
  const dist = Math.hypot(...d) || 1, flat = Math.hypot(d[0], d[2]);
  if (move === "pan") {
    const a = amount * RAD, c = Math.cos(a), s = Math.sin(a);
    return { position: p, target: [p[0] + d[0] * c + d[2] * s, t[1], p[2] - d[0] * s + d[2] * c] };
  }
  if (move === "tilt") {
    const pitch = Math.max(-MAX_PITCH, Math.min(maxPitch, Math.atan2(d[1], flat) / RAD + amount)) * RAD;
    const hx = flat > 1e-9 ? d[0] / flat : 0, hz = flat > 1e-9 ? d[2] / flat : 1;   // straight up or down: face down range
    return { position: p, target: [p[0] + hx * Math.cos(pitch) * dist, p[1] + Math.sin(pitch) * dist, p[2] + hz * Math.cos(pitch) * dist] };
  }
  if (move === "rise") {
    const dy = Math.max(MIN_Y, p[1] + amount) - p[1];
    return { position: [p[0], p[1] + dy, p[2]], target: [t[0], t[1] + dy, t[2]] };
  }
  if (move === "dolly") {
    const hx = flat > 1e-6 ? d[0] / flat : 0, hz = flat > 1e-6 ? d[2] / flat : 1;
    const dx = hx * amount, dz = hz * amount;
    return { position: [p[0] + dx, p[1], p[2] + dz], target: [t[0] + dx, t[1], t[2] + dz] };
  }
  return { position: p, target: t };
}

/**
 * The view pad with something selected: pan circles the camera round `centre` (a turn left moves the
 * camera so the view swings left), tilt raises or lowers it round `centre` (between 3° and 85° above
 * it), both still looking at it; rise and dolly move the whole view as moveView does.
 */
export function orbitView(view, centre, move, amount) {
  if (!centre || (move !== "pan" && move !== "tilt") || !Number.isFinite(amount)) return moveView(view, move, amount);
  const p = view.position, c = centre;
  const o = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
  const dist = Math.hypot(...o) || 1, flat = Math.hypot(o[0], o[2]);
  if (move === "pan") {
    const a = amount * RAD, cs = Math.cos(a), sn = Math.sin(a);
    return { position: [c[0] + o[0] * cs + o[2] * sn, p[1], c[2] - o[0] * sn + o[2] * cs], target: [...c] };
  }
  const el = Math.max(3, Math.min(85, Math.atan2(o[1], flat) / RAD - amount)) * RAD;   // tilt up: the camera goes down
  const hx = flat > 1e-9 ? o[0] / flat : 0, hz = flat > 1e-9 ? o[2] / flat : -1;
  return { position: [c[0] + hx * Math.cos(el) * dist, c[1] + Math.sin(el) * dist, c[2] + hz * Math.cos(el) * dist], target: [...c] };
}

/** The middle of the selected props, half way up them ([x, y, z]), or null when none are selected. */
export function selectionCentre(stage, ids) {
  const picked = (stage?.objects || []).filter((o) => ids?.includes(o.id));
  if (!picked.length) return null;
  const xs = picked.map((o) => o.position[0]), zs = picked.map((o) => o.position[1]);
  const mid = (v) => (Math.min(...v) + Math.max(...v)) / 2;
  const h = Math.max(...picked.map((o) => { try { return dimensionsOf(o).h; } catch { return 0; } }));
  return [mid(xs), h / 2, mid(zs)];
}

/** Slide the whole view so it looks at `centre`: camera and target move together (no zoom, no turn). */
export function panToView(view, centre) {
  if (!centre) return { position: [...view.position], target: [...view.target] };
  const d = [centre[0] - view.target[0], centre[1] - view.target[1], centre[2] - view.target[2]];
  return { position: view.position.map((v, i) => v + d[i]), target: [...centre] };
}
