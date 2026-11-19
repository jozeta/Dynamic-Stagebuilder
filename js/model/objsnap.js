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

/** Where `obj` should go if dropped at `position`: joined to the nearest wall end within reach. */
export function snapToObjects(stage, obj, position, radius = SNAP_RADIUS) {
  const mine = wallEnds(obj, position);
  if (!mine) return { snapped: false, position };
  let best = null;
  for (const other of stage.objects) {
    if (other.id === obj.id) continue;
    const ends = wallEnds(other);
    if (!ends) continue;
    for (const e of mine) for (const f of ends) {
      const d = Math.hypot(f[0] - e[0], f[1] - e[1]);
      if (d <= radius && (!best || d < best.d)) best = { d, dx: f[0] - e[0], dz: f[1] - e[1] };
    }
  }
  if (!best) return { snapped: false, position };
  return { snapped: true, position: [position[0] + best.dx, position[1] + best.dz] };
}
