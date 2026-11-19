// Camera framing maths (pure, no Three.js): the default high-oblique "drone" overview.
// Pitch 45° down, yaw 25° off the shooters' line so walls are seen at an angle, a long lens (32°)
// for little perspective distortion, and the whole bay plus its berm edges in frame.
export const VIEW = Object.freeze({ fov: 32, pitch: 45, yaw: 25, margin: 3, eyeFov: 55 });

const rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => a.map((v, i) => v - b[i]);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

/** Camera position and target for the overview of a bay, for a viewport of the given aspect. */
export function obliqueView(bay, aspect, { pitch = VIEW.pitch, yaw = VIEW.yaw, fov = VIEW.fov, margin = VIEW.margin } = {}) {
  const target = [0, 0, bay.depth / 2];
  // Unit vector from the target toward the camera: up range (−z), turned by yaw, raised by pitch.
  const dir = [Math.sin(rad(yaw)) * Math.cos(rad(pitch)), Math.sin(rad(pitch)), -Math.cos(rad(yaw)) * Math.cos(rad(pitch))];
  const hw = bay.width / 2 + margin;
  const corners = [[-hw, 0, -margin], [hw, 0, -margin], [-hw, 0, bay.depth + margin], [hw, 0, bay.depth + margin]];
  const tanV = Math.tan(rad(fov) / 2), tanH = tanV * aspect;
  const fits = (d) => {
    const pos = target.map((t, i) => t + dir[i] * d);
    const fwd = norm(sub(target, pos));
    const right = norm(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);
    return corners.every((c) => {
      const v = sub(c, pos);
      const z = dot(v, fwd);
      return z > 0 && Math.abs(dot(v, right) / z) <= tanH * 0.96 && Math.abs(dot(v, up) / z) <= tanV * 0.96;
    });
  };
  let lo = 1, hi = 400;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return { position: target.map((t, i) => t + dir[i] * hi), target };
}
