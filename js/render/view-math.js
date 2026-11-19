// Camera framing maths (pure, no Three.js): the default high-oblique "drone" overview.
// Pitch 45° down, yaw 25° off the shooters' line so walls are seen at an angle, a long lens (32°)
// for little perspective distortion, and the stage filling the frame with a margin round it.
export const VIEW = Object.freeze({ fov: 32, pitch: 45, yaw: 25, margin: 2.5, eyeFov: 55 });

/** The ground area of a bay as { minX, maxX, minZ, maxZ }. */
export const bayArea = (bay) => ({ minX: -bay.width / 2, maxX: bay.width / 2, minZ: 0, maxZ: bay.depth });

/** The ground area the stage's props, lines and start cover (at least 8 m across); the bay if empty. */
export function stageArea(stage) {
  const pts = [...stage.objects.map((o) => o.position), ...stage.lines.flatMap((l) => l.points), ...(stage.start ? [stage.start.position] : [])];
  if (!pts.length) return bayArea(stage.bay);
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  let minX = Math.min(...xs) - 1, maxX = Math.max(...xs) + 1, minZ = Math.min(...zs) - 1, maxZ = Math.max(...zs) + 1;
  const grow = (lo, hi) => { const need = Math.max(0, 8 - (hi - lo)) / 2; return [lo - need, hi + need]; };
  [minX, maxX] = grow(minX, maxX);
  [minZ, maxZ] = grow(minZ, maxZ);
  return { minX, maxX, minZ, maxZ, points: pts };
}

const rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => a.map((v, i) => v - b[i]);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

/** Camera position and target for the overview of a ground area, for a viewport of the given aspect. */
export function obliqueView(area, aspect, { pitch = VIEW.pitch, yaw = VIEW.yaw, fov = VIEW.fov, margin = VIEW.margin } = {}) {
  const target = [(area.minX + area.maxX) / 2, 0, (area.minZ + area.maxZ) / 2];
  // Unit vector from the target toward the camera: up range (−z), turned by yaw, raised by pitch.
  const dir = [Math.sin(rad(yaw)) * Math.cos(rad(pitch)), Math.sin(rad(pitch)), -Math.cos(rad(yaw)) * Math.cos(rad(pitch))];
  // Fit the actual points when known (a margin round each), else the area's corners: with the
  // yaw, a rectangle's empty corners would otherwise push the camera far back.
  const corners = area.points
    ? area.points.flatMap(([x, z]) => [[x - margin, 0, z], [x + margin, 0, z], [x, 0, z - margin], [x, 0, z + margin], [x, 1.8, z]])
    : [[area.minX - margin, 0, area.minZ - margin], [area.maxX + margin, 0, area.minZ - margin], [area.minX - margin, 0, area.maxZ + margin], [area.maxX + margin, 0, area.maxZ + margin]];
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
