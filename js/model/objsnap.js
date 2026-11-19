// Snapping to nearby objects: a wall's end jumps onto the nearest end of another wall, so walls
// placed next to each other join edge to edge (in line or at a corner). Pure maths on stage data.
import { getProp } from "./props.js";

export const SNAP_RADIUS = 0.35;   // metres

const isWall = (o) => getProp(o.type).category === "wall";

/** The two ends of a wall at its position and rotation, as [[x, z], [x, z]]; null for other props. */
export function wallEnds(obj, position = obj.position) {
  if (!isWall(obj)) return null;
  const t = (obj.rotation * Math.PI) / 180;
  const half = obj.params.length / 2;
  const [x, z] = position;
  return [[x - half * Math.cos(t), z - half * Math.sin(t)], [x + half * Math.cos(t), z + half * Math.sin(t)]];
}

// True when two walls would lie along each other (parallel, overlapping, less than 10 cm apart):
// joining an end there would stack one wall on top of the other.
function overlaps(a, b) {
  const da = [a[1][0] - a[0][0], a[1][1] - a[0][1]], db = [b[1][0] - b[0][0], b[1][1] - b[0][1]];
  const la = Math.hypot(...da), lb = Math.hypot(...db);
  if (la < 1e-9 || lb < 1e-9) return false;
  const ua = [da[0] / la, da[1] / la];
  if (Math.abs(ua[0] * db[1] - ua[1] * db[0]) / lb > 0.17) return false;       // not parallel (> ~10°)
  const off = Math.abs((b[0][0] - a[0][0]) * ua[1] - (b[0][1] - a[0][1]) * ua[0]);
  if (off > 0.1) return false;                                                // side by side, apart
  const t = (p) => (p[0] - a[0][0]) * ua[0] + (p[1] - a[0][1]) * ua[1];
  const lo = Math.min(t(b[0]), t(b[1])), hi = Math.max(t(b[0]), t(b[1]));
  return Math.min(la, hi) - Math.max(0, lo) > 0.05;
}

/** Where `obj` should go if dropped at `position`: joined to the nearest wall end within reach. */
export function snapToObjects(stage, obj, position, radius = SNAP_RADIUS) {
  const mine = wallEnds(obj, position);
  if (!mine) return { snapped: false, position };
  const candidates = [];
  for (const other of stage.objects) {
    if (other.id === obj.id) continue;
    const ends = wallEnds(other);
    if (!ends) continue;
    for (const e of mine) for (const f of ends) {
      const d = Math.hypot(f[0] - e[0], f[1] - e[1]);
      if (d <= radius) candidates.push({ d, dx: f[0] - e[0], dz: f[1] - e[1], ends });
    }
  }
  candidates.sort((a, b) => a.d - b.d);
  for (const c of candidates) {
    const moved = mine.map(([x, z]) => [x + c.dx, z + c.dz]);
    if (overlaps(moved, c.ends)) continue;
    return { snapped: true, position: [position[0] + c.dx, position[1] + c.dz] };
  }
  return { snapped: false, position };
}
