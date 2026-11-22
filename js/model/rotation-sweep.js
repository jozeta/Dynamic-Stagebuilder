// The turn indicator shown on the ground while a prop is turned with the rotate ring: a line from
// the prop's centre for the angle it started at, one for the angle now, the arc between them (filled
// in the view), and how far it has turned. Pure geometry in stage coordinates ([x, z], metres).

const STEP = 5;          // degrees per arc segment
const LABEL_GAP = 0.45;  // metres from the circle to the text

/** The signed turn from one angle to another, the short way round: (−180, 180]. */
export function turnBy(from, to) {
  let d = (((to - from) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return Math.round(d * 1e9) / 1e9;
}

/** "+30°", "−45°" or "0°" (whole degrees; signed like the inspector's rotate buttons). */
export function turnText(delta) {
  const n = Math.round(delta);
  return n > 0 ? `+${n}°` : n < 0 ? `−${-n}°` : "0°";
}

/** The direction a prop faces at a rotation on the ground: 0° up range (−z), 90° the shooter's left (+x). */
export const groundDir = (deg) => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), -Math.cos(r)];
};

/** The circle's radius for a prop of footprint { w, d }: a little past its widest half, at least 0.6 m. */
export const sweepRadius = ({ w, d }) => Math.max(0.6, Math.max(w, d) / 2 + 0.4);

/**
 * The indicator for a turn from `from` to `to` degrees round `centre`: start and end, the ends of
 * the two lines on the circle; arc, points on the circle from start to end (empty with no turn);
 * delta and text, the turn; labelAt, where the text goes (`gap` outside the circle, mid-way round).
 */
export function sweepOf({ centre: [cx, cz], radius, from, to, gap = LABEL_GAP }) {
  const delta = turnBy(from, to);
  const at = (deg, r = radius) => { const [x, z] = groundDir(deg); return [cx + x * r, cz + z * r]; };
  const n = Math.ceil(Math.abs(delta) / STEP);
  const arc = n ? Array.from({ length: n + 1 }, (_, i) => at(from + (delta * i) / n)) : [];
  return { start: at(from), end: at(from + delta), arc, delta, text: turnText(delta), labelAt: at(from + delta / 2, radius + gap) };
}
