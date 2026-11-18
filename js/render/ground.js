// Where a ray (origin, direction) meets the ground plane y = 0, as [x, z]; null if it never does.
export function groundPoint(origin, dir) {
  if (dir[1] >= -1e-9) return null;
  const t = -origin[1] / dir[1];
  if (t < 0) return null;
  return [origin[0] + dir[0] * t, origin[2] + dir[2] * t];
}
