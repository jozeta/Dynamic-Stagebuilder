// The view pad's moves on a camera view ({ position, target } as [x, y, z] arrays, metres). Plain
// maths, no Three.js. Looking down range (+ z), + x is to the left, so a positive pan turns left.
//   pan   degrees: turn the look left (+) or right (−) about the camera
//   tilt  degrees: look up (+) or down (−), held within ±85° of level
//   rise  metres:  lift (+) or lower (−) the camera and its look together, never below 10 cm
//   dolly metres:  move forward (+) or back (−) along the ground the way the camera looks
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
