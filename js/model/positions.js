// Shooting positions: numbered points (1, 2, 3…) where the shooter shoots from, each with a facing
// (the object's rotation: 0 looks down range), a look-up/down angle (pitch, degrees) and a stance.
// The shooter's-eye camera steps through them. Pure: no DOM, no Three.js.

// Stance: eye height (m) and a mannequin for the 3D marker, facing +z (down range): limbs as
// segments { a: [x, y, z], b: [x, y, z], r } (capsules), the head and joints as spheres
// [x, y, z, r], and boxes [x, y, z, w, h, d] for the feet and the pistol held out in both hands.
const arms = (sh, el, hand) => [{ a: [0.19, ...sh], b: [0.12, ...el], r: 0.045 }, { a: [-0.19, ...sh], b: [-0.12, ...el], r: 0.045 },
  { a: [0.12, ...el], b: [0.03, ...hand], r: 0.038 }, { a: [-0.12, ...el], b: [-0.03, ...hand], r: 0.038 }];
const gun = (hand) => [[0, hand[0] + 0.05, hand[1] + 0.07, 0.035, 0.1, 0.19]];
const hands = (hand) => [[0, hand[0], hand[1], 0.055]];
const torso = (pelvis, chestTop, neck) => [
  { a: pelvis, b: [pelvis[0], pelvis[1] + 0.08, pelvis[2]], r: 0.14 },
  { a: [pelvis[0], pelvis[1] + 0.1, pelvis[2]], b: chestTop, r: 0.15 },
  { a: chestTop, b: neck, r: 0.05 },
];
function stance(id, name, eye, p) {
  const segs = [...torso(p.pelvis, p.chest, p.neck), ...p.legs, ...arms(p.shoulder, p.elbow, p.hand)];
  const spheres = [[...p.head, 0.11], ...hands(p.hand), ...p.joints];
  const boxes = [...p.feet, ...gun(p.hand)];
  return { id, name, eye, segments: segs, spheres, boxes };
}
const leg = (hip, knee, ankle) => [{ a: hip, b: knee, r: 0.07 }, { a: knee, b: ankle, r: 0.055 }];
export const STANCES = Object.freeze([
  stance("standing", "Standing", 1.6, {
    pelvis: [0, 0.9, 0], chest: [0, 1.36, 0.02], neck: [0, 1.5, 0.02], head: [0, 1.63, 0.03],
    shoulder: [1.38, 0.02], elbow: [1.34, 0.28], hand: [1.36, 0.52],
    legs: [...leg([0.1, 0.92, 0], [0.12, 0.5, 0.02], [0.13, 0.08, 0]), ...leg([-0.1, 0.92, 0], [-0.12, 0.5, 0.02], [-0.13, 0.08, 0])],
    joints: [[0.12, 0.5, 0.02, 0.06], [-0.12, 0.5, 0.02, 0.06]],
    feet: [[0.13, 0.03, 0.06, 0.1, 0.06, 0.25], [-0.13, 0.03, 0.06, 0.1, 0.06, 0.25]],
  }),
  stance("crouching", "Crouching", 1.15, {
    pelvis: [0, 0.6, -0.1], chest: [0, 0.97, 0.12], neck: [0, 1.07, 0.16], head: [0, 1.18, 0.19],
    shoulder: [0.96, 0.12], elbow: [0.94, 0.38], hand: [0.97, 0.6],
    legs: [...leg([0.1, 0.62, -0.1], [0.13, 0.45, 0.26], [0.13, 0.08, 0.05]), ...leg([-0.1, 0.62, -0.1], [-0.13, 0.45, 0.26], [-0.13, 0.08, 0.05])],
    joints: [[0.13, 0.45, 0.26, 0.06], [-0.13, 0.45, 0.26, 0.06]],
    feet: [[0.13, 0.03, 0.1, 0.1, 0.06, 0.25], [-0.13, 0.03, 0.1, 0.1, 0.06, 0.25]],
  }),
  stance("kneeling", "Kneeling", 0.95, {
    pelvis: [0, 0.53, 0], chest: [0, 0.86, 0.02], neck: [0, 0.98, 0.03], head: [0, 1.1, 0.04],
    shoulder: [0.86, 0.02], elbow: [0.83, 0.28], hand: [0.86, 0.52],
    // Left knee up (foot flat in front), right knee on the ground with the shin behind.
    legs: [...leg([0.1, 0.55, 0], [0.13, 0.5, 0.4], [0.13, 0.08, 0.42]), ...leg([-0.1, 0.55, 0], [-0.12, 0.07, 0.06], [-0.12, 0.07, -0.36])],
    joints: [[0.13, 0.5, 0.4, 0.06], [-0.12, 0.07, 0.06, 0.06]],
    feet: [[0.13, 0.03, 0.48, 0.1, 0.06, 0.25], [-0.12, 0.04, -0.46, 0.1, 0.08, 0.16]],
  }),
  stance("sitting", "Sitting", 1.15, {
    pelvis: [0, 0.48, -0.02], chest: [0, 0.94, 0.02], neck: [0, 1.06, 0.03], head: [0, 1.18, 0.04],
    shoulder: [0.94, 0.02], elbow: [0.9, 0.28], hand: [0.93, 0.52],
    legs: [...leg([0.1, 0.48, 0], [0.11, 0.48, 0.42], [0.11, 0.08, 0.45]), ...leg([-0.1, 0.48, 0], [-0.11, 0.48, 0.42], [-0.11, 0.08, 0.45])],
    joints: [[0.11, 0.48, 0.42, 0.06], [-0.11, 0.48, 0.42, 0.06]],
    feet: [[0.11, 0.03, 0.51, 0.1, 0.06, 0.25], [-0.11, 0.03, 0.51, 0.1, 0.06, 0.25]],
  }),
  stance("prone", "Prone", 0.3, {
    pelvis: [0, 0.15, -0.25], chest: [0, 0.17, 0.32], neck: [0, 0.2, 0.44], head: [0, 0.24, 0.55],
    shoulder: [0.17, 0.32], elbow: [0.12, 0.6], hand: [0.15, 0.86],
    legs: [...leg([0.1, 0.14, -0.28], [0.14, 0.1, -0.7], [0.16, 0.08, -1.1]), ...leg([-0.1, 0.14, -0.28], [-0.14, 0.1, -0.7], [-0.16, 0.08, -1.1])],
    joints: [[0.14, 0.1, -0.7, 0.06], [-0.14, 0.1, -0.7, 0.06]],
    feet: [[0.16, 0.04, -1.17, 0.1, 0.08, 0.12], [-0.16, 0.04, -1.17, 0.1, 0.08, 0.12]],
  }),
].map((s) => Object.freeze(s)));

export const MARKER_RADIUS = 0.4;   // the ring on the ground (m)
const stance_ = (id) => STANCES.find((s) => s.id === id) || STANCES[0];

/** Eye height above the ground for a stance (m). */
export const eyeHeight = (id) => stance_(id).eye;

/** The marker's size { w, h, d } at rotation 0: the ring and the figure. */
export function positionSize(id) {
  const st = stance_(id);
  let x0 = -MARKER_RADIUS, x1 = MARKER_RADIUS, z0 = -MARKER_RADIUS, z1 = MARKER_RADIUS, h = 0.01;
  const grow = (x, y, z, ex, ey, ez) => { x0 = Math.min(x0, x - ex); x1 = Math.max(x1, x + ex); z0 = Math.min(z0, z - ez); z1 = Math.max(z1, z + ez); h = Math.max(h, y + ey); };
  for (const { a, b, r } of st.segments) { grow(...a, r, r, r); grow(...b, r, r, r); }
  for (const [x, y, z, r] of st.spheres) grow(x, y, z, r, r, r);
  for (const [x, y, z, w, bh, d] of st.boxes) grow(x, y, z, w / 2, bh / 2, d / 2);
  // The figure is drawn centred across (x) on the marker, so the width is symmetric.
  return { w: 2 * Math.max(-x0, x1), h, d: z1 - z0, zMin: z0, zMax: z1 };
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
