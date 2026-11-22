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
// Each card: kind, x and y in card widths/heights from the main card's bottom centre, and its layer:
// main (on the main stand's sticks), front (stapled on the cards behind it: only where they back at
// least half of it), fore (on its own stand in front, toward the shooter) or back (its own stand
// behind). Cards that only overlap an edge stand on their own sticks, as on a real range.
export const PRESENTATIONS = Object.freeze([
  { id: "target", name: "Target", cards: [[T, 0, 0]] },
  { id: "noshoot", name: "No-shoot", cards: [[N, 0, 0]] },
  { id: "ns-lower", name: "Target, no-shoot over the lower half", cards: [[T, 0, 0.5], [N, 0, 0, "front"]] },
  { id: "ns-left", name: "Target, no-shoot over the left side", cards: [[T, 0, 0], [N, 0.55, 0, "fore"]] },
  { id: "ns-right", name: "Target, no-shoot over the right side", cards: [[T, 0, 0], [N, -0.55, 0, "fore"]] },
  { id: "ns-flank", name: "Target between two no-shoots", cards: [[T, 0, 0], [N, 0.6, 0, "fore"], [N, -0.6, 0, "fore"]] },
  { id: "ns-behind", name: "Target in front of a no-shoot", cards: [[T, 0, 0], [N, 0.55, 0.1, "back"]] },
  { id: "two-overlap", name: "Two overlapping targets", cards: [[T, 0.35, 0], [T, -0.35, 0, "fore"]] },
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
  if (obj.type === "mover") return { paper: Math.max(1, Math.min(4, Math.round(obj.params?.targets ?? 1))), noshoot: 0 };   // cards on one carrier
  const cards = presentation(obj.params?.presentation).cards;
  return { paper: cards.filter((c) => c[0] === T).length, noshoot: cards.filter((c) => c[0] === N).length };
}

// How far a card's own stand stands in front of (fore) or behind (back) the main stand: more than a
// stand's depth (26 cm), so the stands never touch.
export const STAND_SPACING = 0.32;
const LAYER_DEPTH = { fore: -STAND_SPACING, main: 0, back: STAND_SPACING };
/** How far in z (− toward the shooter) a layer's stand stands from the main one; stapled cards sit on the main one. */
export const layerZ = (layer) => LAYER_DEPTH[layer] ?? 0;

/**
 * Where the stands go: one under each card (or column of stacked cards) on its own sticks, centred
 * under it: [{ x, z, layer }] in metres, before the array is centred on the prop.
 */
export function arrayStands(obj) {
  const seen = new Map();
  for (const c of arrayCards(obj)) if (c.layer !== "front") seen.set(`${c.x}|${c.layer}`, { x: c.x, z: layerZ(c.layer), layer: c.layer });
  return [...seen.values()];
}

/**
 * The array's extent in metres: { minX, maxX } across the cards and stands (standWidth wide), and
 * top, the highest card edge above the stand height.
 */
export function arrayExtent(obj, standWidth = 0, standDepth = 0) {
  const { w, h } = paperSize(obj);
  const cards = arrayCards(obj), stands = arrayStands(obj);
  const xs = [...cards.flatMap((c) => [c.x - w / 2, c.x + w / 2]), ...stands.flatMap((s) => [s.x - standWidth / 2, s.x + standWidth / 2])];
  const zs = stands.flatMap((s) => [s.z - standDepth / 2, s.z + standDepth / 2]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs), top: Math.max(...cards.map((c) => c.y + h)) };
}

/**
 * The stand height that keeps the array's top within the IPSC limit: the current one when it fits,
 * else lowered (in 5 cm steps, not below 10 cm).
 */
export function fitStand(obj, rules = TARGET_ARRAY_RULES) {
  const max = rules.maxTop[isMini(obj.type) ? "mini" : "ipsc"];
  const mount = obj.params?.mountHeight ?? 0;
  const top = arrayExtent(obj).top;
  if (mount + top <= max + 1e-9) return mount;
  return Math.max(0.1, Math.floor(((max - top) / 0.05) + 1e-9) * 0.05);
}

/** Rule problems with the array, as sentences citing the rule (empty when fine). */
export function arrayIssues(obj, rules = TARGET_ARRAY_RULES) {
  const mini = isMini(obj.type);
  const max = rules.maxTop[mini ? "mini" : "ipsc"];
  const top = (obj.params?.mountHeight ?? 0) + arrayExtent(obj).top;
  if (top <= max + 1e-9) return [];
  return [`The top is at ${top.toFixed(2)} m: ${mini ? "mini targets" : "IPSC targets"} must not be higher than ${max} m (${rules.edition}, ${rules.heightRule}).`];
}
