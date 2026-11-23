// The move indicator shown while a prop is dragged: its starting spot, a line to where it is now,
// and how far it has moved. Pure geometry in stage coordinates ([x, z], metres).

/** How far `to` is from `from`: distance (m), text ("2.3 m", one decimal), labelAt (the line's middle). */
export function moveOf([x0, z0], [x1, z1]) {
  const distance = Math.hypot(x1 - x0, z1 - z0);
  return { distance, text: `${distance.toFixed(1)} m`, labelAt: [(x0 + x1) / 2, (z0 + z1) / 2] };
}

export const ALIGN_TOLERANCE = 0.01;      // metres: closer than this counts as in line

/**
 * Alignment guides for a prop at `at` ([x, z]) among the `others` (their [x, z] centres): one line
 * per axis through every prop that shares its x (axis "z": the line runs down range) or its z (axis
 * "x": the line runs across), from the lowest to the highest of them, the dragged prop included.
 * Props at the same spot are skipped (no line to draw).
 */
export function alignGuides([x, z], others, tol = ALIGN_TOLERANCE) {
  const guides = [];
  const span = (axis, shared, values) => {
    if (!values.length) return;
    const lo = Math.min(...values, axis === "z" ? z : x), hi = Math.max(...values, axis === "z" ? z : x);
    guides.push(axis === "z" ? { axis, from: [shared, lo], to: [shared, hi] } : { axis, from: [lo, shared], to: [hi, shared] });
  };
  const apart = (p) => Math.abs(p[0] - x) > tol || Math.abs(p[1] - z) > tol;
  span("z", x, others.filter((p) => apart(p) && Math.abs(p[0] - x) <= tol).map((p) => p[1]));
  span("x", z, others.filter((p) => apart(p) && Math.abs(p[1] - z) <= tol).map((p) => p[0]));
  return guides;
}
