// Which library groups and props are shown (Settings → Props). A per-browser preference, not stage
// data: hiding a prop never touches stages that use it. Pure: no DOM.
import { PROPS } from "./props.js";

const CATEGORY_NAMES = [["paper", "Paper"], ["steel", "Steel"], ["moving", "Moving and reactive"], ["wall", "Walls"],
  ["structure", "Structures"], ["obstacle", "Obstacles and range furniture"], ["building", "Buildings and surroundings"]];

// The stage markings (drawn on the ground) come first; then the prop categories.
export const MARKINGS = Object.freeze([
  Object.freeze({ id: "fault-line", name: "Fault line" }),
  Object.freeze({ id: "shooting-area", name: "Shooting area" }),
  Object.freeze({ id: "start", name: "Start position" }),
  Object.freeze({ id: "shooting-position", name: "Shooting position" }),
]);

export const LIBRARY_GROUPS = Object.freeze([
  Object.freeze({ id: "markings", name: "Stage markings", items: Object.freeze(MARKINGS.map((m) => m.id)) }),
  ...CATEGORY_NAMES.map(([id, name]) => Object.freeze({ id, name, items: Object.freeze(Object.values(PROPS).filter((p) => p.category === id).map((p) => p.type)) })),
]);

const GROUP_IDS = new Set(LIBRARY_GROUPS.map((g) => g.id));
const ITEM_IDS = new Set(LIBRARY_GROUPS.flatMap((g) => g.items));

/** A clean { categories, props } from anything (stored values are untrusted). */
export function cleanHidden(value) {
  const list = (v, known) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === "string" && known.has(x)))] : []);
  const src = value && typeof value === "object" ? value : {};
  return { categories: list(src.categories, GROUP_IDS), props: list(src.props, ITEM_IDS) };
}

/** Is a group (or one item in it) shown? */
export function isShown(hidden, group, item) {
  if (hidden.categories.includes(group)) return false;
  return item === undefined || !hidden.props.includes(item);
}

/** A copy with one group ("category") or item ("prop") shown or hidden. */
export function setShown(hidden, kind, id, shown) {
  const key = kind === "category" ? "categories" : "props";
  const rest = hidden[key].filter((x) => x !== id);
  return { ...hidden, [key]: shown ? rest : [...rest, id] };
}
