// Paper target presentations ("arrays"): one prop is a target, a no-shoot, or a common competition
// combination of them, with optional painted hard cover. Pure data: no DOM, no Three.js.
//
// The combinations follow the IPSC Target Array Handbook (January 2019 Edition, see
// scoring-rules.js): no-shoots overlap the lower part or the sides of a target, never its top
// (2.1); overlapping arrays are two targets, or two targets with a no-shoot between them (2.4);
// hard cover is painted on the lower part, one side or a lower diagonal (1.2).
import { TARGET_ARRAY_RULES } from "./scoring-rules.js";

// Card sizes per style: the octagonal Classic 45 × 57 cm (mini 30 × 37.5 cm) and the tall target
// with a head 46 × 76 cm (mini 31 × 51 cm).
export const PAPER_SIZES = Object.freeze({
  classic: Object.freeze({ ipsc: Object.freeze({ w: 0.45, h: 0.57 }), mini: Object.freeze({ w: 0.3, h: 0.375 }) }),
  head: Object.freeze({ ipsc: Object.freeze({ w: 0.46, h: 0.76 }), mini: Object.freeze({ w: 0.31, h: 0.51 }) }),
});
export const TARGET_STYLES = ["classic", "head"];

const isMini = (type) => type.endsWith("mini");
/** The card size { w, h } of a paper target, for its style. */
export function paperSize(obj) {
  const style = obj.params?.style === "head" ? "head" : "classic";
  return PAPER_SIZES[style][isMini(obj.type) ? "mini" : "ipsc"];
}

const STACK_GAP = 0.02;   // between stacked cards (m)
const T = "target", N = "noshoot";
// Each card: kind, x and y in card widths/heights from the main card's bottom centre, and its layer
// (front: stapled in front, toward the shooter; back: behind on its own sticks).
export const PRESENTATIONS = Object.freeze([
  { id: "target", name: "Target", cards: [[T, 0, 0]] },
  { id: "noshoot", name: "No-shoot", cards: [[N, 0, 0]] },
  { id: "ns-lower", name: "Target, no-shoot over the lower half", cards: [[T, 0, 0.5], [N, 0, 0, "front"]] },
  { id: "ns-left", name: "Target, no-shoot over the left side", cards: [[T, 0, 0], [N, 0.55, 0, "front"]] },
  { id: "ns-right", name: "Target, no-shoot over the right side", cards: [[T, 0, 0], [N, -0.55, 0, "front"]] },
  { id: "ns-flank", name: "Target between two no-shoots", cards: [[T, 0, 0], [N, 0.6, 0, "front"], [N, -0.6, 0, "front"]] },
  { id: "ns-behind", name: "Target in front of a no-shoot", cards: [[T, 0, 0], [N, 0.55, 0.1, "back"]] },
  { id: "two-overlap", name: "Two overlapping targets", cards: [[T, 0.35, 0], [T, -0.35, 0, "front"]] },
  { id: "two-ns-between", name: "Two targets, no-shoot between", cards: [[T, 0.6, 0], [T, -0.6, 0], [N, 0, 0.15, "front"]] },
  { id: "stacked", name: "Two targets, one above the other", cards: [[T, 0, 0], [T, 0, "up"]] },
  { id: "stacked-ns", name: "Target above a no-shoot", cards: [[N, 0, 0], [T, 0, "up"]] },
].map((p) => Object.freeze(p)));

export const HARD_COVERS = Object.freeze([
  { id: "none", name: "None" },
  { id: "lower-1/4", name: "Lower ¼" },
  { id: "lower-1/3", name: "Lower ⅓" },
  { id: "lower-1/2", name: "Lower ½" },
  { id: "left-1/2", name: "Left ½" },
  { id: "right-1/2", name: "Right ½" },
  { id: "diagonal", name: "Lower diagonal" },
].map((c) => Object.freeze(c)));

const presentation = (id) => PRESENTATIONS.find((p) => p.id === id) || PRESENTATIONS[0];

/**
 * The cards of a paper target prop in metres: { kind, x, y, layer, cover }, x across the card face
 * (+x the shooter's left, as in the world), y the card's bottom above the stand height (the
 * lowest card is at 0). Hard cover goes on the first card only.
 */
export function arrayCards(obj) {
  const { w, h } = paperSize(obj);
  const raw = presentation(obj.params?.presentation).cards.map(([kind, x, y, layer = "main"]) =>
    ({ kind, x: x * w, y: y === "up" ? h + STACK_GAP : y * h, layer }));
  const low = Math.min(...raw.map((c) => c.y));
  const cover = HARD_COVERS.some((c) => c.id === obj.params?.hardCover) ? obj.params.hardCover : "none";
  return raw.map((c, i) => ({ ...c, y: c.y - low, cover: i === 0 ? cover : "none" }));
}

/** How many scoring targets and no-shoots the prop is. */
export function arrayCounts(obj) {
  const cards = presentation(obj.params?.presentation).cards;
  return { paper: cards.filter((c) => c[0] === T).length, noshoot: cards.filter((c) => c[0] === N).length };
}

/** Where the stands go: one under each card that isn't stapled in front (distinct x, in metres). */
export function arrayStands(obj) {
  return [...new Set(arrayCards(obj).filter((c) => c.layer !== "front").map((c) => c.x))];
}

/**
 * The array's extent in metres: { minX, maxX } across the cards and stands (standWidth wide), and
 * top, the highest card edge above the stand height.
 */
export function arrayExtent(obj, standWidth = 0) {
  const { w, h } = paperSize(obj);
  const cards = arrayCards(obj);
  const xs = [...cards.flatMap((c) => [c.x - w / 2, c.x + w / 2]), ...arrayStands(obj).flatMap((x) => [x - standWidth / 2, x + standWidth / 2])];
  return { minX: Math.min(...xs), maxX: Math.max(...xs), top: Math.max(...cards.map((c) => c.y + h)) };
}

/** Rule problems with the array, as sentences citing the rule (empty when fine). */
export function arrayIssues(obj, rules = TARGET_ARRAY_RULES) {
  const mini = isMini(obj.type);
  const max = rules.maxTop[mini ? "mini" : "ipsc"];
  const top = (obj.params?.mountHeight ?? 0) + arrayExtent(obj).top;
  if (top <= max + 1e-9) return [];
  return [`The top is at ${top.toFixed(2)} m: ${mini ? "mini targets" : "IPSC targets"} must not be higher than ${max} m (${rules.edition}, ${rules.heightRule}).`];
}
