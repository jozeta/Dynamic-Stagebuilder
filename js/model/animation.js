// Which props can move in the 3D view (each has an "Animate" switch; a global play/pause button in
// the view moves only the ones switched on). Pure data.
export const ANIMATED_TYPES = Object.freeze(["swinger", "drop-turner", "clamshell", "mover", "texas-star", "plate-rack", "dueling-tree", "popper", "mini-popper", "door", "bobber", "twister", "wobble-platform", "wall-port-shutter"]);
/** The Animate switch, a true/false parameter. */
export const ANIMATE_PARAM = Object.freeze({ animate: Object.freeze({ default: false, bool: true }) });

/** Seconds an activator takes to stand up again at the end of its cycle. */
export const STAND_UP = 0.6;
/**
 * Where an activated target is in its motion at time t, given when its activator falls ({ delay,
 * period }: first fall at `delay`, again every `period`): `local` seconds since the fall (0 before
 * the first), and `weight` 1 while it moves, easing to 0 as the activator stands up again.
 */
export function triggered(t, { delay, period }) {
  if (t < delay) return { local: 0, weight: 0 };
  const p = (t - delay) % period;
  const back = period - STAND_UP;
  if (p < back) return { local: p, weight: 1 };
  const x = (p - back) / STAND_UP;
  return { local: p, weight: 1 - x * x * (3 - 2 * x) };
}
