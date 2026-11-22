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

/** A point on the grid; the grid's lines run through `origin` (default: whole metres from 0). */
export function snapPoint([x, z], step, [x0, z0] = [0, 0]) {
  return [clean(x0 + snapValue(x - x0, step)), clean(z0 + snapValue(z - z0, step))];
}

/** Where the bay's grid starts: its left edge (across) and its up-range edge, so grid and bay line up
 * whatever the width (an odd width puts the edges on half metres, and the grid with them). */
export const gridOrigin = (bay) => [-bay.width / 2, 0];

/**
 * The texture offset ([u, v], in tiles) that lines a repeating grid texture up with the bay: for a
 * ground plane `span` metres a side centred on the bay's middle (common.js ground), with one texture
 * tile every `tile` metres.
 */
export function gridPhase(bay, span, tile) {
  const frac = (v) => { const f = ((v % 1) + 1) % 1; return f > 1 - 1e-9 ? 0 : clean(f); };
  return [frac((bay.width - span) / (2 * tile)), frac(-(bay.depth / 2 + span / 2) / tile)];
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
