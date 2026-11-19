// The measuring tool: distances on the ground between two points, each snapped to the centre of a
// prop (or the start box) within reach, so position-to-target distances are exact. A view aid: never
// part of the stage. Pure: no DOM, no Three.js.
export const SNAP_REACH = 0.4;     // metres

export const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
/** "12.35 m": the distance to the centimetre. */
export const measureText = (a, b) => `${distance(a, b).toFixed(2)} m`;

/** Where a measuring tap lands: on the nearest prop's (or the start's) centre within reach, else where it is. */
export function snapMeasure(stage, p, { fine = false } = {}) {
  if (fine) return { point: [p[0], p[1]], on: null };
  let best = null, bestD = SNAP_REACH;
  for (const o of stage.objects) { const d = distance(p, o.position); if (d <= bestD) { bestD = d; best = { point: [...o.position], on: o.id }; } }
  if (stage.start) { const d = distance(p, stage.start.position); if (d <= bestD) best = { point: [...stage.start.position], on: "start" }; }
  return best || { point: [p[0], p[1]], on: null };
}
