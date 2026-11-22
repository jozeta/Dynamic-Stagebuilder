// Activation links: a moving target that starts when the shooter hits an activator (a popper or
// plate falls, a step pad is stepped on, a lever is pulled). Stored on the moving target as
// `activatedBy: <activator id>`; a link to something no longer on the stage counts as none.
// Pure: no DOM, no Three.js.
import { propName } from "./props.js";

const ACTIVATED = new Set(["swinger", "drop-turner", "clamshell", "mover", "bobber", "twister", "texas-star", "wall-port-shutter"]);
const ACTIVATORS = new Set(["popper", "plate-round", "plate-square", "step-pad", "pull-lever"]);

export const canBeActivated = (type) => ACTIVATED.has(type);
export const isActivator = (type) => ACTIVATORS.has(type);

/** The activators on the stage that could start object `id` (not itself). */
export const activatorsFor = (stage, id) => stage.objects.filter((o) => isActivator(o.type) && o.id !== id);

/** The activator that starts object o, or null. */
export function activatorOf(stage, o) {
  if (!o?.activatedBy || !canBeActivated(o.type)) return null;
  const a = stage.objects.find((x) => x.id === o.activatedBy);
  return a && isActivator(a.type) ? a : null;
}

/** Every live link: [{ target, activator }]. */
export function activationLinks(stage) {
  return stage.objects.map((o) => ({ target: o, activator: activatorOf(stage, o) })).filter((l) => l.activator);
}

/** How a prop is named in a sentence: its label and kind, e.g. "T5 (swinger)" or "the step pad". */
export function describe(o) {
  const kind = propName(o).split(" ").map((w) => (w === w.toUpperCase() ? w : w.toLowerCase())).join(" ");
  return o.label ? `${o.label} (${kind})` : `the ${kind}`;
}

/** The briefing line: "T5 (swinger) by P1 (popper); T6 (mover) by the step pad", or "". */
export function activationText(stage) {
  return activationLinks(stage).map(({ target, activator }) => `${describe(target)} by ${describe(activator)}`).join("; ");
}
