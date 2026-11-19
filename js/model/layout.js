// Side panel sizes (px), chosen by dragging their edges: kept within limits so the 3D view always
// keeps at least 360 px. Pure.
export const DEFAULT_SIZES = Object.freeze({ library: 232, inspector: 280, inspectorHeight: 300 });
export const PANEL_LIMITS = Object.freeze({ library: [180, 440], inspector: [240, 520], inspectorHeight: [160, 1e9] });
const MIN_VIEW = 360;

/** A panel size clamped to its limits; `room` is the window width (or height for inspectorHeight). */
export function clampPanel(name, px, room, other = null) {
  const [lo, hi0] = PANEL_LIMITS[name];
  if (!Number.isFinite(px)) return DEFAULT_SIZES[name];
  let hi = hi0;
  if (name === "inspectorHeight") hi = Math.round(room * 0.6);
  else hi = Math.min(hi0, Math.max(lo, room - MIN_VIEW - (other ?? DEFAULT_SIZES[name === "library" ? "inspector" : "library"])));
  return Math.round(Math.min(hi, Math.max(lo, px)));
}
