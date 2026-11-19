// Grid and angle snapping and bay clamping. Bay coordinates: x ∈ [−width/2, width/2], z ∈ [0, depth].
import { isRect, nearestInBay } from "./bay.js";
const clean = (v) => {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
};

export function snapValue(v, step) {
  if (!step) return v;
  return clean(Math.round(v / step) * step);
}

export function snapPoint([x, z], step) {
  return [snapValue(x, step), snapValue(z, step)];
}

export function normalizeAngle(deg) {
  const a = clean(((deg % 360) + 360) % 360);
  return a === 360 ? 0 : a;
}

export function snapAngle(deg, step) {
  return normalizeAngle(step ? Math.round(deg / step) * step : deg);
}

export function clampToBay([x, z], bay, margin = 0) {
  const half = bay.width / 2 - margin;
  const p = [clean(Math.min(half, Math.max(-half, x))), clean(Math.min(bay.depth - margin, Math.max(margin, z)))];
  // A tapered or notched bay: onto the nearest edge of its floor.
  return isRect(bay) ? p : nearestInBay(p, bay).map(clean);
}
