// Shooting positions: numbered points (1, 2, 3…) where the shooter shoots from, each with a facing
// (the object's rotation: 0 looks down range), a look-up/down angle (pitch, degrees) and a stance.
// The shooter's-eye camera steps through them. Pure: no DOM, no Three.js.

// Stance: eye height (m) and a simple figure for the 3D marker, as capsules
// [x, y, z, radius, length, lying] (lying = along the facing, else upright) and spheres [x, y, z, r].
export const STANCES = Object.freeze([
  { id: "standing", name: "Standing", eye: 1.6, capsules: [[0.1, 0.455, 0, 0.08, 0.75, 0], [-0.1, 0.455, 0, 0.08, 0.75, 0], [0, 1.15, 0, 0.17, 0.5, 0], [0, 1.38, 0.3, 0.06, 0.42, 1]], spheres: [[0, 1.63, 0, 0.11]] },
  { id: "crouching", name: "Crouching", eye: 1.15, capsules: [[0.1, 0.305, 0.04, 0.08, 0.45, 0], [-0.1, 0.305, 0.04, 0.08, 0.45, 0], [0, 0.78, 0.06, 0.17, 0.42, 0], [0, 0.98, 0.34, 0.06, 0.42, 1]], spheres: [[0, 1.16, 0.1, 0.11]] },
  { id: "kneeling", name: "Kneeling", eye: 0.95, capsules: [[0.1, 0.07, -0.22, 0.07, 0.4, 1], [-0.1, 0.27, 0.16, 0.08, 0.3, 0], [0, 0.6, 0, 0.17, 0.42, 0], [0, 0.8, 0.3, 0.06, 0.42, 1]], spheres: [[0, 0.95, 0, 0.11]] },
  { id: "sitting", name: "Sitting", eye: 1.15, capsules: [[0.1, 0.42, 0.2, 0.08, 0.35, 1], [-0.1, 0.42, 0.2, 0.08, 0.35, 1], [0.1, 0.2, 0.42, 0.07, 0.26, 0], [-0.1, 0.2, 0.42, 0.07, 0.26, 0], [0, 0.74, 0, 0.17, 0.42, 0], [0, 0.92, 0.32, 0.06, 0.42, 1]], spheres: [[0, 1.11, 0, 0.11]] },
  { id: "prone", name: "Prone", eye: 0.3, capsules: [[0.12, 0.08, -0.62, 0.08, 0.7, 1], [-0.12, 0.08, -0.62, 0.08, 0.7, 1], [0, 0.17, 0, 0.17, 0.5, 1], [0, 0.16, 0.8, 0.06, 0.4, 1]], spheres: [[0, 0.24, 0.52, 0.11]] },
].map((s) => Object.freeze(s)));

export const MARKER_RADIUS = 0.4;   // the ring on the ground (m)
const stance = (id) => STANCES.find((s) => s.id === id) || STANCES[0];

/** Eye height above the ground for a stance (m). */
export const eyeHeight = (id) => stance(id).eye;

/** The marker's size { w, h, d } at rotation 0: the ring and the figure. */
export function positionSize(id) {
  const st = stance(id);
  let w = MARKER_RADIUS, h = 0.01, d = MARKER_RADIUS, dMin = -MARKER_RADIUS;
  for (const [x, y, z, r, len, lying] of st.capsules) {
    const hy = lying ? r : len / 2 + r, hz = lying ? len / 2 + r : r;
    w = Math.max(w, Math.abs(x) + r); h = Math.max(h, y + hy); d = Math.max(d, z + hz); dMin = Math.min(dMin, z - hz);
  }
  for (const [x, y, z, r] of st.spheres) { w = Math.max(w, Math.abs(x) + r); h = Math.max(h, y + r); d = Math.max(d, z + r); dMin = Math.min(dMin, z - r); }
  return { w: 2 * w, h, d: d - dMin, zMin: dMin, zMax: d };
}

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/**
 * The shooter's-eye view from a position: eye point and a target point just ahead. Facing follows
 * the object's rotation like every prop (a node's rotation.y = −degrees): 0 looks down range (+z).
 */
export function viewFromPosition(o) {
  const yaw = rad(o.rotation || 0), pitch = rad(o.params?.pitch || 0);
  const eye = [o.position[0], eyeHeight(o.params?.stance), o.position[1]];
  const dir = [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
  return { eye, target: eye.map((v, i) => v + dir[i] * 0.1) };
}

/** The facing (0–360°) and pitch (degrees) of a camera at `eye` looking at `target`. */
export function anglesFromView(eye, target) {
  const dx = target[0] - eye[0], dy = target[1] - eye[1], dz = target[2] - eye[2];
  const flat = Math.hypot(dx, dz);
  const rotation = ((deg(Math.atan2(-dx, dz)) % 360) + 360) % 360;
  return { rotation: Math.abs(rotation - 360) < 1e-9 ? 0 : rotation, pitch: deg(Math.atan2(dy, flat)) };
}

/** The stage's shooting positions in number order (1, 2, 3…). */
export function shootingPositions(stage) {
  const n = (o) => (Number.isFinite(Number(o.label)) ? Number(o.label) : 1e9);
  return stage.objects.filter((o) => o.type === "shooting-position").sort((a, b) => n(a) - n(b));
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * A point on the walk from view a to view b ({ eye: [x, y, z], yaw: degrees, pitch? }) at t (0–1):
 * eased in and out, eye height blended (for a change of stance), turning the shorter way round.
 */
export function walkBetween(a, b, t) {
  const k = easeInOut(Math.min(1, Math.max(0, t)));
  const turn = ((((b.yaw - a.yaw) % 360) + 540) % 360) - 180;
  return {
    eased: k,
    eye: a.eye.map((v, i) => v + (b.eye[i] - v) * k),
    yaw: a.yaw + turn * k,
    pitch: (a.pitch ?? 0) + ((b.pitch ?? 0) - (a.pitch ?? 0)) * k,
  };
}

/** Seconds for the walk: about a brisk walking pace, between 0.8 and 3 s. */
export function walkDuration(from, to) {
  return Math.min(3, Math.max(0.8, Math.hypot(to[0] - from[0], to[2] - from[2]) / 3.5));
}
