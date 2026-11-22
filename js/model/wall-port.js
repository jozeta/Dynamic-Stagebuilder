// Where a wall's port and doorway are, in the wall's own frame (x across it from its centre, + the
// wall's left seen from the front; y up from the ground), fitted inside its frame: the 3D builder
// draws them there and the sight-line planner sees through them there. Pure: no DOM, no Three.js.
import { STICK } from "./props.js";

export const PORT_FRAME = 0.035;                   // the slats framing a port or door opening (m)
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** The port: { x0, x1, y0, y1 } in metres, moved by portOffset (left/right) and portBottom (up/down), never outside the frame. */
export function portRect(p) {
  const inner = p.length - 2 * STICK;
  const pw = clamp(p.portWidth, 0.05, inner - 2 * PORT_FRAME - 0.02);
  const ph = clamp(p.portHeight, 0.05, p.height - 2 * STICK - 2 * PORT_FRAME);
  const reach = Math.max(0, inner / 2 - PORT_FRAME - pw / 2);
  const x = clamp(Number.isFinite(p.portOffset) ? p.portOffset : 0, -reach, reach);
  const y0 = clamp(p.portBottom, STICK + PORT_FRAME, p.height - STICK - PORT_FRAME - ph);
  return { x0: x - pw / 2, x1: x + pw / 2, y0, y1: y0 + ph };
}

/** The doorway: { x0, x1, y0: 0, y1 } in metres, centred, fitted inside the frame. */
export function doorRect(p) {
  const dw = clamp(p.doorWidth, 0.3, p.length - 2 * STICK - 2 * PORT_FRAME - 0.1);
  const dh = clamp(p.doorHeight, 0.5, p.height - STICK - PORT_FRAME - 0.05);
  return { x0: -dw / 2, x1: dw / 2, y0: 0, y1: dh };
}
