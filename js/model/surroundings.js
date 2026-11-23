// Your own surroundings: a plan image (a blueprint or site drawing) laid on the ground at its true
// scale, and building pieces (walls, pillars, berms…) that rebuild the range on it. Saved as a
// template ("custom:<id>") that any stage can choose in Settings. Pure: no DOM, no Three.js.
// Templates come from browser storage, so cleanTemplate() checks everything before use.
import { PROPS, upgradeProp } from "./props.js";
import { addObject } from "./stage.js";
import { cleanDrawing } from "./plan-draw.js";

export const CUSTOM_PREFIX = "custom:";
const ID = /^[A-Za-z0-9-]{1,64}$/;
export const isCustomEnv = (name) => typeof name === "string" && name.startsWith(CUSTOM_PREFIX) && ID.test(name.slice(CUSTOM_PREFIX.length));
export const customEnv = (id) => `${CUSTOM_PREFIX}${id}`;
export const customId = (name) => (isCustomEnv(name) ? name.slice(CUSTOM_PREFIX.length) : null);

export const BUILDING_TYPES = Object.freeze(Object.values(PROPS).filter((p) => p.category === "building").map((p) => p.type));
const LIMITS = { name: 60, pieces: 2000, px: 20000, mpp: [0.0005, 2], offset: 500 };

/**
 * Metres per pixel from two points on the plan (image pixels) and the real distance between them.
 * Throws a readable error when the points are too close or the length is off.
 */
export function scaleFromReference(a, b, metres) {
  const px = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (!(px >= 10)) throw new Error("Pick two points farther apart on the plan.");
  if (!(Number.isFinite(metres) && metres >= 0.1 && metres <= 1000)) throw new Error("Type the real length in metres (0.1–1000).");
  return metres / px;
}

/** The plan's size on the ground in metres. */
export function planSize(plan) {
  const r = (v) => Math.round(v * 1e6) / 1e6;
  return { w: r(plan.width * plan.metresPerPixel), d: r(plan.height * plan.metresPerPixel) };
}

const num = (v, lo, hi) => (typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi ? v : null);

function cleanPiece(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.type !== "string") return null;
  const u = upgradeProp(raw.type, raw.params && typeof raw.params === "object" ? raw.params : {});   // a round column is a round pillar now
  const p = { ...raw, type: u.type, params: u.params };
  if (!BUILDING_TYPES.includes(p.type)) return null;
  const pos = Array.isArray(p.position) && p.position.length === 2 ? p.position.map((v) => num(v, -LIMITS.offset, LIMITS.offset)) : [null];
  if (pos.some((v) => v === null)) return null;
  const params = {};
  const src = p.params && typeof p.params === "object" ? p.params : {};
  for (const [k, spec] of Object.entries(PROPS[p.type].params)) {
    const v = src[k];
    params[k] = spec.options ? (spec.options.includes(v) ? v : spec.default) : (num(v, spec.min, spec.max) ?? spec.default);
  }
  return { type: p.type, position: pos, rotation: num(p.rotation, -1e6, 1e6) ?? 0, params };
}

/** A clean template { id, name, plan | null, pieces }, or null when it can't be used. */
export function cleanTemplate(t) {
  if (!t || typeof t !== "object" || typeof t.id !== "string" || !ID.test(t.id)) return null;
  const name = typeof t.name === "string" && t.name.trim() ? t.name.trim().slice(0, LIMITS.name) : "My surroundings";
  let plan = null;
  const p = t.plan;
  if (p && typeof p === "object") {
    const width = num(p.width, 1, LIMITS.px), height = num(p.height, 1, LIMITS.px), mpp = num(p.metresPerPixel, ...LIMITS.mpp);
    if (width && height && mpp) {
      plan = { width, height, metresPerPixel: mpp, x: num(p.x, -LIMITS.offset, LIMITS.offset) ?? 0, z: num(p.z, -LIMITS.offset, LIMITS.offset) ?? 0,
        rotation: num(p.rotation, -360, 360) ?? 0, opacity: num(p.opacity, 0.1, 1) ?? 1, wallOpacity: num(p.wallOpacity, 0.1, 1) ?? 1 };
    }
  }
  const pieces = (Array.isArray(t.pieces) ? t.pieces.slice(0, LIMITS.pieces) : []).map(cleanPiece).filter(Boolean);
  // Walls, doors and windows drawn on the plan (model/plan-draw.js), with their heights and cut.
  const drawing = plan && t.drawing ? cleanDrawing(t.drawing) : null;
  return { id: t.id, name, plan, pieces, ...(drawing ? { drawing } : {}) };
}

/** Save to the template: the stage without its building pieces, and the pieces (plain copies). */
export function takeBuildingPieces(stage) {
  const pieces = stage.objects.filter((o) => BUILDING_TYPES.includes(o.type))
    .map((o) => ({ type: o.type, position: [o.position[0], o.position[1]], rotation: o.rotation, params: { ...o.params } }));
  return { stage: { ...stage, objects: stage.objects.filter((o) => !BUILDING_TYPES.includes(o.type)) }, pieces };
}

/** Edit the template: its pieces back on the stage as ordinary props (new ids). */
export function putBackPieces(stage, pieces) {
  let s = stage;
  for (const p of pieces) s = addObject(s, p.type, p.position, p.rotation, p.params).stage;
  return s;
}

/** Are My surroundings (and New from a plan) offered with these surroundings? Not on Outdoor, Blueprint, Industrial, Indoor range or Urban. */
export const offersPlans = (environment) => !["outdoor", "blueprint", "industrial", "indoor", "urban"].includes(environment);

/**
 * A point on the plan image (pixels: x right, y down) on the ground ([x, z] metres), placed as the
 * plan image is laid (render/environments/custom.js): centred at the plan's x/z, its top toward
 * down range, turned by plan.rotation.
 */
export function planToWorld(plan, [u, v]) {
  const { w, d } = planSize(plan);
  const lx = (u / plan.width - 0.5) * w, ly = (0.5 - v / plan.height) * d;
  const t = Math.PI - (plan.rotation * Math.PI) / 180;
  const X = lx * Math.cos(t) - ly * Math.sin(t), Y = lx * Math.sin(t) + ly * Math.cos(t);
  const r = (n) => Math.round(n * 1e6) / 1e6 + 0;
  return [r(plan.x + X), r(plan.z - Y)];
}
