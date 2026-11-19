// Where a ray (origin, direction) meets the ground plane y = 0, as [x, z]; null if it never does.
export function groundPoint(origin, dir) {
  if (dir[1] >= -1e-9) return null;
  const t = -origin[1] / dir[1];
  if (t < 0) return null;
  return [origin[0] + dir[0] * t, origin[2] + dir[2] * t];
}

// Fine moves: while Shift is held, pointer movement counts a fifth. The tracker re-anchors whenever
// Shift is pressed or released, so the object never jumps.
export const FINE_FACTOR = 0.2;

export function createDragTracker() {
  let anchorRaw = [0, 0], anchorOut = [0, 0], fine = false, last = [0, 0];
  return {
    update(raw, shift) {
      if (shift !== fine) { anchorRaw = raw; anchorOut = last; fine = shift; }
      const k = fine ? FINE_FACTOR : 1;
      last = [anchorOut[0] + (raw[0] - anchorRaw[0]) * k, anchorOut[1] + (raw[1] - anchorRaw[1]) * k];
      return last;
    },
  };
}
