// A remembered camera view ({ position, target, fov }), read back from browser storage: anything
// malformed or out of range is dropped (null) and the app falls back to its default view.
const LIMIT = 1000;                 // metres from the stage; far beyond any real bay
const vec = (v) => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= LIMIT);

export function cleanCameraView(v) {
  if (!v || typeof v !== "object" || !vec(v.position) || !vec(v.target)) return null;
  if (typeof v.fov !== "number" || !(v.fov >= 10 && v.fov <= 120)) return null;
  if (Math.hypot(...v.position.map((p, i) => p - v.target[i])) < 1e-6) return null;
  return { position: [...v.position], target: [...v.target], fov: v.fov };
}
