// Shooting positions: numbered points (1, 2, 3…) where the shooter shoots from, each with a facing
// (the object's rotation: 0 looks down range), a look-up/down angle (pitch, degrees) and a stance.
// The shooter's-eye camera steps through them. Pure: no DOM, no Three.js.

// Stance: eye height (m) and a skeleton (joint points, facing +z = down range; +x is the shooter's
// left), from which figureParts() makes a man at real size: muscled, tapered limbs, a torso lofted
// through hip, waist, chest and shoulder sections, a head with cap, shooting glasses and ear muffs,
// shoes, and both hands round a pistol (slide, frame, angled grip, trigger guard, sights).
// Parts: { kind: "limb", a, b, prof: [[t, r], …] } (round, radius r at t along a→b),
// { kind: "loft", sections: [{ c, rx, rz, X, V }] } (ellipses across the spine),
// { kind: "ellipsoid", c, r: [rx, ry, rz] } and { kind: "box", c, s: [w, h, d], tilt } (about x).
const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
const unit = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const PROF = {
  upperArm: [[0, 0.05], [0.3, 0.048], [0.7, 0.04], [1, 0.036]],
  forearm: [[0, 0.037], [0.25, 0.041], [0.7, 0.031], [1, 0.026]],
  thigh: [[0, 0.084], [0.3, 0.08], [0.75, 0.06], [1, 0.052]],
  shin: [[0, 0.05], [0.25, 0.056], [0.6, 0.044], [1, 0.033]],
};
// [t along the spine (0 = below the hips, 1 = the shoulder line, past 1 = up to the neck), half width, half depth]
const TORSO = [[0, 0.135, 0.09], [0.08, 0.165, 0.11], [0.2, 0.163, 0.105], [0.4, 0.138, 0.09], [0.6, 0.155, 0.105],
  [0.75, 0.172, 0.118], [0.88, 0.182, 0.112], [0.96, 0.17, 0.1], [1.02, 0.13, 0.082], [1.08, 0.085, 0.065], [1.12, 0.06, 0.055]];
const limb = (a, b, prof) => ({ kind: "limb", a, b, prof });
const ball = (c, r) => ({ kind: "ellipsoid", c, r: Array.isArray(r) ? r : [r, r, r] });
const box = (c, s, tilt = 0) => ({ kind: "box", c, s, tilt });

// A pistol held in both hands; G = the middle of the grip. Points down range.
function pistol([, gy, gz]) {
  const at = (y, z, x = 0) => [x, gy + y, gz + z];
  const parts = [
    box(at(-0.012, -0.008), [0.028, 0.105, 0.048], 0.33),        // grip, raked back
    box(at(-0.068, -0.027), [0.031, 0.012, 0.054], 0.33),        // magazine base plate
    box(at(0.054, 0.045), [0.026, 0.022, 0.15]),                 // frame / dust cover
    box(at(0.08, 0.04), [0.025, 0.03, 0.19]),                    // slide
    limb(at(0.083, 0.135), at(0.083, 0.142), [[0, 0.0065], [1, 0.0065]]),   // barrel / muzzle
    box(at(0.098, 0.124), [0.004, 0.006, 0.008]),                // front sight
    box(at(0.098, -0.046), [0.018, 0.007, 0.01]),                // rear sight
    limb(at(0.044, 0.056), at(0.012, 0.05), [[0, 0.004], [1, 0.004]]),      // trigger guard
    limb(at(0.012, 0.05), at(0.012, 0.012), [[0, 0.004], [1, 0.004]]),
    box(at(0.03, 0.028), [0.006, 0.022, 0.006], 0.25),          // trigger
  ];
  for (let i = 0; i < 4; i++) parts.push(box(at(0.08, -0.05 + i * 0.008), [0.0275, 0.022, 0.0028]));   // slide serrations
  return parts;
}
// Both hands round the grip: the strong (right, −x) hand high on the backstrap, the support hand
// wrapped over it, thumbs forward along the frame, the trigger finger on the trigger.
function grip([, gy, gz]) {
  const at = (x, y, z) => [x, gy + y, gz + z];
  return [
    ball(at(-0.014, 0.004, -0.012), [0.031, 0.05, 0.045]),
    ball(at(0.016, -0.004, 0.0), [0.03, 0.048, 0.044]),
    limb(at(-0.018, 0.045, -0.012), at(-0.018, 0.05, 0.04), [[0, 0.0105], [1, 0.008]]),
    limb(at(0.018, 0.043, -0.004), at(0.018, 0.048, 0.05), [[0, 0.0105], [1, 0.008]]),
    limb(at(-0.016, 0.04, -0.004), at(-0.006, 0.032, 0.028), [[0, 0.009], [1, 0.007]]),
  ];
}
// The head with a cap, shooting glasses and ear muffs; H = its centre.
function head([hx, hy, hz]) {
  const at = (x, y, z) => [hx + x, hy + y, hz + z];
  return [
    ball(at(0, 0.01, -0.005), [0.078, 0.1, 0.095]),              // skull
    ball(at(0, -0.045, 0.03), [0.062, 0.058, 0.065]),            // jaw and chin
    limb(at(0, 0.005, 0.088), at(0, -0.028, 0.104), [[0, 0.008], [1, 0.014]]),   // nose
    ball(at(0, 0.045, -0.005), [0.083, 0.07, 0.1]),              // cap crown
    box(at(0, 0.04, 0.11), [0.15, 0.008, 0.08]),                 // cap brim
    box(at(0, 0.0, 0.092), [0.15, 0.024, 0.01]),                 // shooting glasses
    ball(at(0.08, -0.005, -0.005), [0.024, 0.042, 0.036]),       // ear muffs
    ball(at(-0.08, -0.005, -0.005), [0.024, 0.042, 0.036]),
    limb(at(0.07, 0.02, -0.005), at(0, 0.115, -0.01), [[0, 0.009], [1, 0.009]]),  // the muffs' band
    limb(at(-0.07, 0.02, -0.005), at(0, 0.115, -0.01), [[0, 0.009], [1, 0.009]]),
  ];
}
// A shoe from a foot box [x, y, z, w, h, d]: a sole and a rounded upper.
const shoe = ([x, y, z, w, h, d]) => [box([x, y - h / 2 + 0.012, z], [w, 0.024, d]), ball([x, y - h / 2 + 0.045, z - d * 0.06], [w / 2, Math.min(0.04, h / 2 + 0.01), d * 0.44])];

/**
 * A man from a skeleton p: { pelvis, chest, head, shoulder: [y, z], legs, feet } and either
 * hand: [y, z] (a pistol held out in both hands) or arms: { left, right } each { elbow, wrist,
 * hand: [x, y, z], palm: [rx, ry, rz] } (open hands, no pistol), plus extra parts (a holster…).
 */
export function figureParts(p) {
  const pelvis = p.pelvis, chest = p.chest, d = unit(chest.map((v, i) => v - pelvis[i]));
  const V = unit([0, -d[2], d[1]]), X = [1, 0, 0];
  const s0 = add(pelvis, d, -0.08), s1 = add(chest, d, 0.02);
  const torso = { kind: "loft", sections: TORSO.map(([t, rx, rz]) => ({ c: s0.map((v, i) => v + (s1[i] - v) * t), rx, rz, X, V })) };
  const G = p.hand ? [0, ...p.hand] : null;
  const parts = [torso, limb(add(chest, d, -0.03), add(p.head, [0, -0.07, -0.01]), [[0, 0.06], [1, 0.05]]), ...head(p.head)];
  for (const side of [1, -1]) {
    const sh = [0.19 * side, ...p.shoulder];
    if (p.arms) {
      const arm = p.arms[side > 0 ? "left" : "right"];
      parts.push(ball([0.18 * side, sh[1] - 0.01, sh[2]], [0.058, 0.055, 0.058]),
        limb(sh, arm.elbow, PROF.upperArm), ball(arm.elbow, 0.037), limb(arm.elbow, arm.wrist, PROF.forearm), ball(arm.hand, arm.palm));
      continue;
    }
    const el = [0.12 * side, ...p.elbow];
    const wrist = side > 0 ? [0.03, p.hand[0], p.hand[1] - 0.02] : [-0.026, p.hand[0] + 0.005, p.hand[1] - 0.034];
    parts.push(ball([0.18 * side, sh[1] - 0.01, sh[2]], [0.058, 0.055, 0.058]),       // shoulder (deltoid)
      limb(sh, el, PROF.upperArm), ball(el, 0.037), limb(el, wrist, PROF.forearm));
  }
  for (let i = 0; i < p.legs.length; i += 2) {
    const thigh = p.legs[i], shin = p.legs[i + 1];
    parts.push(limb(thigh.a, thigh.b, PROF.thigh), ball(thigh.b, 0.053), limb(shin.a, shin.b, PROF.shin), ball(shin.b, 0.034));
  }
  parts.push(...p.feet.flatMap(shoe));
  if (G) parts.push(...grip(G), ...pistol(G));
  if (p.extra) parts.push(...p.extra);
  return parts;
}

/** Where a part reaches: a list of [centre, half-extents] its box is the union of. */
export function partExtents(part) {
  switch (part.kind) {
    case "limb": {
      const dir = unit(part.b.map((v, i) => v - part.a[i]));
      return part.prof.map(([t, r]) => [part.a.map((v, i) => v + (part.b[i] - v) * t), dir.map((c) => r * Math.sqrt(Math.max(0, 1 - c * c)))]);
    }
    case "loft": return part.sections.map(({ c, rx, rz, X, V }) => [c, X.map((x, i) => Math.hypot(rx * x, rz * V[i]))]);
    case "ellipsoid": return [[part.c, part.r]];
    case "box": {
      const [w, h, dd] = part.s, c = Math.abs(Math.cos(part.tilt)), s = Math.abs(Math.sin(part.tilt));
      return [[part.c, [w / 2, (h / 2) * c + (dd / 2) * s, (h / 2) * s + (dd / 2) * c]]];
    }
    default: return [];
  }
}
const leg = (hip, knee, ankle) => [{ a: hip, b: knee }, { a: knee, b: ankle }];
function stance(id, name, eye, p) {
  return { id, name, eye, parts: Object.freeze(figureParts(p)) };
}
export const STANCES = Object.freeze([
  stance("standing", "Standing", 1.6, {
    pelvis: [0, 0.9, 0], chest: [0, 1.36, 0.02], neck: [0, 1.5, 0.02], head: [0, 1.63, 0.03],
    shoulder: [1.38, 0.02], elbow: [1.34, 0.28], hand: [1.36, 0.52],
    legs: [...leg([0.1, 0.92, 0], [0.12, 0.5, 0.02], [0.13, 0.08, 0]), ...leg([-0.1, 0.92, 0], [-0.12, 0.5, 0.02], [-0.13, 0.08, 0])],
    feet: [[0.13, 0.03, 0.06, 0.1, 0.06, 0.25], [-0.13, 0.03, 0.06, 0.1, 0.06, 0.25]],
  }),
  stance("crouching", "Crouching", 1.15, {
    pelvis: [0, 0.6, -0.1], chest: [0, 0.97, 0.12], neck: [0, 1.07, 0.16], head: [0, 1.18, 0.19],
    shoulder: [0.96, 0.12], elbow: [0.94, 0.38], hand: [0.97, 0.6],
    legs: [...leg([0.1, 0.62, -0.1], [0.13, 0.45, 0.26], [0.13, 0.08, 0.05]), ...leg([-0.1, 0.62, -0.1], [-0.13, 0.45, 0.26], [-0.13, 0.08, 0.05])],
    feet: [[0.13, 0.03, 0.1, 0.1, 0.06, 0.25], [-0.13, 0.03, 0.1, 0.1, 0.06, 0.25]],
  }),
  stance("kneeling", "Kneeling", 0.95, {
    pelvis: [0, 0.53, 0], chest: [0, 0.86, 0.02], neck: [0, 0.98, 0.03], head: [0, 1.1, 0.04],
    shoulder: [0.86, 0.02], elbow: [0.83, 0.28], hand: [0.86, 0.52],
    // Left knee up (foot flat in front), right knee on the ground with the shin behind.
    legs: [...leg([0.1, 0.55, 0], [0.13, 0.5, 0.4], [0.13, 0.08, 0.42]), ...leg([-0.1, 0.55, 0], [-0.12, 0.07, 0.06], [-0.12, 0.07, -0.36])],
    feet: [[0.13, 0.03, 0.48, 0.1, 0.06, 0.25], [-0.12, 0.04, -0.46, 0.1, 0.08, 0.16]],
  }),
  stance("sitting", "Sitting", 1.15, {
    pelvis: [0, 0.48, -0.02], chest: [0, 0.94, 0.02], neck: [0, 1.06, 0.03], head: [0, 1.18, 0.04],
    shoulder: [0.94, 0.02], elbow: [0.9, 0.28], hand: [0.93, 0.52],
    legs: [...leg([0.1, 0.48, 0], [0.11, 0.48, 0.42], [0.11, 0.08, 0.45]), ...leg([-0.1, 0.48, 0], [-0.11, 0.48, 0.42], [-0.11, 0.08, 0.45])],
    feet: [[0.11, 0.03, 0.51, 0.1, 0.06, 0.25], [-0.11, 0.03, 0.51, 0.1, 0.06, 0.25]],
  }),
  stance("prone", "Prone", 0.3, {
    pelvis: [0, 0.15, -0.25], chest: [0, 0.17, 0.32], neck: [0, 0.2, 0.44], head: [0, 0.24, 0.55],
    shoulder: [0.17, 0.32], elbow: [0.12, 0.6], hand: [0.15, 0.86],
    legs: [...leg([0.1, 0.14, -0.28], [0.14, 0.1, -0.7], [0.16, 0.08, -1.1]), ...leg([-0.1, 0.14, -0.28], [-0.14, 0.1, -0.7], [-0.16, 0.08, -1.1])],
    feet: [[0.16, 0.04, -1.17, 0.1, 0.08, 0.12], [-0.16, 0.04, -1.17, 0.1, 0.08, 0.12]],
  }),
].map((s) => Object.freeze(s)));

export const MARKER_RADIUS = 0.4;   // the ring on the ground (m)
const stance_ = (id) => STANCES.find((s) => s.id === id) || STANCES[0];

/** Eye height above the ground for a stance (m). */
export const eyeHeight = (id) => stance_(id).eye;

/** The marker's size { w, h, d } at rotation 0: the ring and the figure. */
export function positionSize(id) { return partsSize(stance_(id).parts); }

/** The size of a figure (with its 0.4 m ring) from its parts. */
export function partsSize(figure) {
  let x0 = -MARKER_RADIUS, x1 = MARKER_RADIUS, z0 = -MARKER_RADIUS, z1 = MARKER_RADIUS, h = 0.01;
  const grow = (x, y, z, ex, ey, ez) => { x0 = Math.min(x0, x - ex); x1 = Math.max(x1, x + ex); z0 = Math.min(z0, z - ez); z1 = Math.max(z1, z + ez); h = Math.max(h, y + ey); };
  for (const part of figure) for (const [c, e] of partExtents(part)) grow(...c, ...e);
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

/** How far one press of a Shooter's eye move arrow steps a shooting position (metres). */
export const STEP = 0.25;
/**
 * Where a step takes a position at `pos` facing `rotation` degrees: forward is the way it faces
 * (the same direction viewFromPosition looks), left is the shooter's left. null for an unknown dir.
 */
export function stepFrom(pos, rotation, dir, step = STEP) {
  const y = ((rotation || 0) * Math.PI) / 180;
  const f = [-Math.sin(y), Math.cos(y)], l = [Math.cos(y), Math.sin(y)];
  const v = { forward: f, back: [-f[0], -f[1]], left: l, right: [-l[0], -l[1]] }[dir];
  return v ? [pos[0] + v[0] * step, pos[1] + v[1] * step] : null;
}
