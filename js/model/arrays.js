// Paper target arrays: one prop is one to three cards in a layout, each a target or a no-shoot with
// optional painted hard cover. Pure data: no DOM, no Three.js.
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

// A paper target prop is a LAYOUT (where its one to three cards are) and, for each card, a KIND: a
// target or a no-shoot, with or without painted hard cover. The layouts follow the IPSC Target Array
// Book (2015 and 2019 editions): a card may cover the lower part or a side of another, never its top
// (2.1); two one above the other (2.1, 35); a no-shoot in front of or behind two adjoining targets
// (2.3); two overlapping, or two with one between (2.4); nothing busier (2.5). Hard cover is painted
// on the lower part, a side or a lower diagonal of a target or a no-shoot (1.2).
//
// Each card: x and y in card widths/heights from the main card's bottom centre ("up": stacked on
// the card below), its layer: main (on the main stand's sticks), front (stapled on the cards behind
// it), fore (its own stand in front, toward the shooter) or back (its own stand behind), and the
// name of its place for the inspector. +x is the shooter's left. `swap`: the cards that change
// places in a mirrored stage; `mirror`: the mirrored layout (else itself).
const card = (name, x, y, layer = "main") => Object.freeze({ name, x, y, layer });
export const LAYOUTS = Object.freeze([
  { id: "single", name: "One card", cards: [card("Card", 0, 0)], defaults: ["target"] },
  { id: "side-by-side", name: "Two side by side", cards: [card("Left", 0.65, 0), card("Right", -0.65, 0)], defaults: ["target", "target"], swap: [0, 1] },
  { id: "stacked", name: "Two, one above the other", cards: [card("Lower", 0, 0), card("Upper", 0, "up")], defaults: ["target", "target"] },
  { id: "lower-front", name: "Two, the lower one in front over the lower half", cards: [card("Upper (behind)", 0, 0.5), card("Lower (in front)", 0, 0, "front")], defaults: ["target", "noshoot"] },
  { id: "side-left", name: "Two overlapping, the left one in front", cards: [card("Right (behind)", -0.25, 0), card("Left (in front)", 0.3, 0, "fore")], defaults: ["target", "noshoot"], mirror: "side-right" },
  { id: "side-right", name: "Two overlapping, the right one in front", cards: [card("Left (behind)", 0.25, 0), card("Right (in front)", -0.3, 0, "fore")], defaults: ["target", "noshoot"], mirror: "side-left" },
  { id: "three-side", name: "Three side by side", cards: [card("Left", 1.3, 0), card("Middle", 0, 0), card("Right", -1.3, 0)], defaults: ["target", "target", "target"], swap: [0, 2] },
  { id: "three-middle-front", name: "Three in a row, the middle one in front", cards: [card("Left", 0.6, 0), card("Middle (in front)", 0, 0.15, "fore"), card("Right", -0.6, 0)], defaults: ["target", "noshoot", "target"], swap: [0, 2] },
  { id: "three-middle-behind", name: "Three in a row, the middle one behind", cards: [card("Left (in front)", 0.62, 0), card("Middle (behind)", 0, 0.1, "back"), card("Right (in front)", -0.62, 0)], defaults: ["target", "noshoot", "target"], swap: [0, 2] },
  { id: "pyramid", name: "Two side by side, one above between them (behind)", cards: [card("Lower left", 0.52, 0), card("Lower right", -0.52, 0), card("Upper (behind)", 0, 0.6, "back")], defaults: ["target", "target", "noshoot"], swap: [0, 1] },
].map((l) => Object.freeze({ ...l, cards: Object.freeze(l.cards), defaults: Object.freeze(l.defaults) })));
export const MAX_CARDS = 3;
export const CARD_PARAMS = Object.freeze(["card1", "card2", "card3"]);

export const HARD_COVERS = Object.freeze([
  { id: "none", name: "None" },
  { id: "lower-1/4", name: "Lower ¼" },
  { id: "lower-1/3", name: "Lower ⅓" },
  { id: "lower-1/2", name: "Lower ½" },
  { id: "left-1/2", name: "Left ½" },
  { id: "right-1/2", name: "Right ½" },
  { id: "diagonal", name: "Lower diagonal" },
].map((c) => Object.freeze(c)));

// What a card can be: "target" or "noshoot", or either with a hard cover ("target:lower-1/2").
export const CARD_KINDS = Object.freeze(["target", "noshoot"].flatMap((kind) => HARD_COVERS.map((c) => Object.freeze({
  id: c.id === "none" ? kind : `${kind}:${c.id}`,
  name: `${kind === "target" ? "Target" : "No-shoot"}${c.id === "none" ? "" : `, hard cover ${c.name.charAt(0).toLowerCase()}${c.name.slice(1)}`}`,
}))));
const KIND_IDS = new Set(CARD_KINDS.map((k) => k.id));
/** { kind, cover } from a card kind id; an unknown one is a plain target. */
export function parseKind(id) {
  if (!KIND_IDS.has(id)) return { kind: "target", cover: "none" };
  const [kind, cover = "none"] = id.split(":");
  return { kind, cover };
}

// Layouts that turned out to be the same arrangement as another (cards in the same order).
export const LAYOUT_ALIASES = Object.freeze({ "between-two": "three-middle-behind", "two-overlap": "side-right" });
/** The layout of a paper target's params (an old name opens as its arrangement; an unknown one is one card). */
export const layoutOf = (params = {}) => LAYOUTS.find((l) => l.id === (LAYOUT_ALIASES[params.layout] ?? params.layout)) || LAYOUTS[0];

// The presentations stages were saved with before layouts: the same cards as a layout and kinds.
const OLD = {
  target: ["single", ["target"]], noshoot: ["single", ["noshoot"]],
  "ns-lower": ["lower-front", ["target", "noshoot"]], "ns-left": ["side-left", ["target", "noshoot"]], "ns-right": ["side-right", ["target", "noshoot"]],
  "ns-flank": ["three-middle-behind", ["noshoot", "target", "noshoot"]], "ns-behind": ["side-left", ["noshoot", "target"], 1],
  "two-overlap": ["side-right", ["target", "target"]], "two-ns-between": ["three-middle-front", ["target", "noshoot", "target"]],
  stacked: ["stacked", ["target", "target"]], "stacked-ns": ["stacked", ["noshoot", "target"]],
};
/** { layout, card1… } for an old presentation and hard cover (the cover was on its first card). */
export function fromPresentation(presentation, hardCover = "none") {
  const [layout, kinds, coverOn = 0] = OLD[presentation] || OLD.target;
  const cover = HARD_COVERS.some((c) => c.id === hardCover) && hardCover !== "none" ? hardCover : null;
  const out = { layout };
  kinds.forEach((k, i) => { out[CARD_PARAMS[i]] = cover && i === coverOn ? `${k}:${cover}` : k; });
  return out;
}
// Params as layout and cards: the old presentation turned into them when that's all there is.
const current = (params = {}) => (params.layout === undefined && params.presentation !== undefined ? { ...params, ...fromPresentation(params.presentation, params.hardCover) } : params);

/** The kinds of a paper target's cards, one per card of its layout (a missing one: the layout's usual). */
export function cardKinds(params = {}) {
  const p = current(params), l = layoutOf(p);
  return l.cards.map((_, i) => (KIND_IDS.has(p[CARD_PARAMS[i]]) ? p[CARD_PARAMS[i]] : l.defaults[i]));
}

/** The params a layout starts with: the layout and its usual cards. */
export function layoutDefaults(id) {
  const l = layoutOf({ layout: id });
  return Object.fromEntries([["layout", l.id], ...l.defaults.map((k, i) => [CARD_PARAMS[i], k])]);
}

const MIRROR_COVER = { "left-1/2": "right-1/2", "right-1/2": "left-1/2" };
/** A paper target's params mirrored left to right: the layout, which card is where, and side covers. */
export function mirrorPaper(params) {
  const p = current(params), l = layoutOf(p);
  const kinds = cardKinds(p).map((id) => { const { kind, cover } = parseKind(id); return MIRROR_COVER[cover] ? `${kind}:${MIRROR_COVER[cover]}` : id; });
  if (l.swap) { const [a, b] = l.swap; [kinds[a], kinds[b]] = [kinds[b], kinds[a]]; }
  const out = { ...p, layout: l.mirror || l.id };
  delete out.presentation; delete out.hardCover;
  kinds.forEach((k, i) => { out[CARD_PARAMS[i]] = k; });
  return out;
}

/**
 * The cards of a paper target prop in metres: { kind, x, y, layer, cover }, x across the card face
 * (+x the shooter's left, as in the world), y the card's bottom above the stand height (the
 * lowest card is at 0).
 */
export function arrayCards(obj) {
  const { w, h } = paperSize(obj);
  const p = current(obj.params), kinds = cardKinds(p);
  const raw = layoutOf(p).cards.map((c, i) => ({ ...parseKind(kinds[i]), x: c.x * w, y: c.y === "up" ? h + STACK_GAP : c.y * h, layer: c.layer }));
  const low = Math.min(...raw.map((c) => c.y));
  return raw.map((c) => ({ kind: c.kind, x: c.x, y: c.y - low, layer: c.layer, cover: c.cover }));
}

/** How many scoring targets and no-shoots the prop is. */
export function arrayCounts(obj) {
  if (obj.type === "mover") return { paper: Math.max(1, Math.min(4, Math.round(obj.params?.targets ?? 1))), noshoot: 0 };   // cards on one carrier
  const kinds = cardKinds(obj.params).map((k) => parseKind(k).kind);
  return { paper: kinds.filter((k) => k === "target").length, noshoot: kinds.filter((k) => k === "noshoot").length };
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
