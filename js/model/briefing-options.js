// Common choices for Written Stage Briefing fields, offered as a list next to free text. They are
// starting points in the usual WSB wording, not rules; a stage builder can always type their own.
export const BRIEFING_OPTIONS = Object.freeze({
  scoring: Object.freeze([
    "Comstock",
    "Comstock, unlimited time, stops on the last shot",
    "Comstock, best 2 hits per paper target, steel must fall to score",
    "Comstock, best 2 hits per paper target, steel must fall, no-shoots and misses penalised",
  ]),
  startSignal: Object.freeze(["Audible", "Visual", "Audible and visual"]),
  startPosition: Object.freeze([
    "Standing in the start box, heels touching the marks, wrists above the shoulders",
    "Standing in the start box, arms hanging naturally at the sides",
    "Standing in the start box, facing up range, arms hanging naturally",
    "Standing in the start box, hands touching the marks on the wall",
    "Seated on the chair, hands flat on the thighs",
    "Kneeling in the start box, hands on the knees",
    "Standing anywhere in the shooting area, wrists above the shoulders",
  ]),
  gunCondition: Object.freeze([
    "Loaded and holstered, ready condition",
    "Unloaded and holstered",
    "Loaded, on the table, muzzle toward the berm, hammer down",
    "Unloaded on the table, slide forward, magazines in the pouches",
    "Unloaded in the box, slide locked back, magazines in the pouches",
  ]),
  stopTime: Object.freeze(["Last shot", "Last shot as recorded by the timer"]),
  procedure: Object.freeze([
    "On the start signal, engage all targets from within the shooting area.",
    "On the start signal, engage all targets as they become visible, from within the shooting areas.",
    "On the start signal, engage the targets through the ports only.",
    "On the start signal, activate the popper, then engage all targets from within the shooting area.",
    "On the start signal, pick up the handgun from the table and engage all targets from within the shooting area.",
  ]),
});

/** How a saved value shows in a field's list: one of its choices, nothing yet, or custom text. */
export function choiceFor(key, value) {
  const v = String(value ?? "").trim();
  if (!v) return { choice: "", custom: false };
  return (BRIEFING_OPTIONS[key] || []).includes(v) ? { choice: v, custom: false } : { choice: "custom", custom: true };
}
