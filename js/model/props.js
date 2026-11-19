// The v1 prop catalogue: every prop's type, category, scoring kind and parameters, and its overall
// real-world size in metres. Pure data: no DOM, no Three.js.
//
// Target outlines: IPSC Target ≈ 46 × 58 cm and Mini Target ≈ 2/3 of that (Appendix B2/B3 drawings);
// IPSC Popper 85 cm tall with a 30 cm head, Mini Popper 2/3 of that (Appendix C2); plates 15–30 cm
// (Appendix C3a). The appendix drawings are images, so these are the commonly published sizes.

import { PAPER_SIZES, TARGET_STYLES, PRESENTATIONS, HARD_COVERS, paperSize, arrayExtent } from "./arrays.js";
export { PAPER_SIZES, TARGET_STYLES, paperSize };

export const TARGET_SIZES = Object.freeze({
  ipsc: PAPER_SIZES.classic.ipsc,
  mini: PAPER_SIZES.classic.mini,
  popper: Object.freeze({ w: 0.30, h: 0.85, d: 0.30 }),
  miniPopper: Object.freeze({ w: 0.20, h: 0.57, d: 0.25 }),
});

export const STICK = 0.045;        // wall frame section (m): 45 mm pine slats, as on DIY range walls
export const WALL_FOOT = 0.4;      // depth of the feet a wall stands on (m)
export const TARGET_STICK = 0.03;  // wooden target stick section (m)
export const STAND = Object.freeze({ w: 0.36, d: 0.26, h: 0.04 });   // blue steel target base
export const PLATE_FOOT = 0.30;    // footprint of a plate stand (m)
export const PLANT = Object.freeze({ diameter: 0.9, height: 1.5 });
export const CAR = Object.freeze({ length: 4.4, height: 1.45, width: 1.8 });
export const CHAIR = Object.freeze({ w: 0.46, h: 0.86, d: 0.5 });
export const CONE = Object.freeze({ diameter: 0.36, height: 0.7 });
export const PALLET = Object.freeze({ length: 1.2, height: 0.144, width: 0.8 });
export const SANDBAG = Object.freeze({ height: 0.13, depth: 0.4 });
export const TABLE = Object.freeze({ height: 0.75, depth: 0.75 });
export const TYRE = Object.freeze({ diameter: 0.65, height: 0.22 });
export const BARREL = Object.freeze({ diameter: 0.58, height: 0.88 });

// Moving and reactive targets (metres). Texas star: 5 plates of 20 cm on arms 55 cm from a hub
// 1.25 m up (10 with a second ring at 33 cm); plate rack plates 20 cm on a 30 cm pitch; dueling
// tree with 15 cm paddles on 35 cm arms.
export const MOVING = deepFreeze({
  star: { hub: 1.25, arm: 0.55, inner: 0.33, plate: 0.2, base: 1.0, depth: 0.8 },
  rack: { pitch: 0.3, plate: 0.2, centre: 1.0, depth: 0.6 },
  tree: { post: 1.8, arm: 0.35, paddle: 0.15, base: 0.8, left: [1.0, 1.25, 1.5], right: [1.12, 1.37, 1.62] },
  swinger: { frame: 0.9, pivot: 0.9, cardBottom: 1.05, depth: 0.6 },
  turner: { frame: 0.8, post: 1.6, cardBottom: 0.6, depth: 0.6 },
  clam: { cardBottom: 0.8, depth: 0.6 },
  mover: { cardBottom: 0.7, depth: 0.4 },
});

/** The Texas star's plate centres [x, y] (one arm points straight up). */
export function starPlates(plates) {
  const s = MOVING.star, out = [];
  for (let k = 0; k < 5; k++) {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / 5;
    out.push([s.arm * Math.cos(a), s.hub + s.arm * Math.sin(a)]);
    if (plates > 5) out.push([s.inner * Math.cos(a + 0.63), s.hub + s.inner * Math.sin(a + 0.63)]);
  }
  return out;
}

const CARNIVAL = "USPSA and club matches; not allowed in IPSC matches (IPSC Target Array Handbook, January 2019 Edition, 4.1).";

// Paper targets: the stand height (how high the sticks hold the card's bottom edge) and the style.
// presentation: the target, a no-shoot or a combination (model/arrays.js); hardCover: painted cover.
const mount = {
  presentation: { default: "target", options: PRESENTATIONS.map((p) => p.id) },
  hardCover: { default: "none", options: HARD_COVERS.map((c) => c.id) },
  mountHeight: { default: 0.7, min: 0.1, max: 2.0, step: 0.05 },
  style: { default: "classic", options: TARGET_STYLES },
};
const paint = (d) => ({ paint: { default: d, options: ["white", "yellow"] } });
const meshLook = { mesh: { default: "orange", options: ["orange", "black", "blue"] }, frame: { default: "wood", options: ["wood", "black"] } };
const port = {
  portWidth: { default: 0.4, min: 0.2, max: 1.5, step: 0.05 },
  portHeight: { default: 0.4, min: 0.2, max: 1.5, step: 0.05 },
  portBottom: { default: 1.0, min: 0.1, max: 2.0, step: 0.05 },
};
const wallSize = {
  length: { default: 2, min: 0.5, max: 4, step: 0.1 },
  height: { default: 2, min: 0.5, max: 2.5, step: 0.1 },
};

const defs = [
  { type: "paper-ipsc", name: "IPSC target", category: "paper", scoring: "paper", params: mount },
  { type: "paper-mini", name: "IPSC mini target", category: "paper", scoring: "paper", params: mount },
  { type: "popper", name: "IPSC popper", category: "steel", scoring: "steel",
    params: { baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "mini-popper", name: "Mini popper", category: "steel", scoring: "steel",
    params: { baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "plate-round", name: "Round plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.2, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
  { type: "plate-square", name: "Square plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.15, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
  { type: "swinger", name: "Swinger", category: "moving", scoring: "paper", params: { style: mount.style },
    note: "A paper target on a weighted arm that swings once activated (usually by a popper)." },
  { type: "drop-turner", name: "Drop turner", category: "moving", scoring: "paper", params: { style: mount.style },
    note: "Starts edge-on, drops, turns to face the shooter and turns away again once activated." },
  { type: "clamshell", name: "Clamshell", category: "moving", scoring: "paper", params: { style: mount.style },
    note: "A paper target behind a steel cover that drops away once activated." },
  { type: "mover", name: "Mover on a track", category: "moving", scoring: "paper",
    params: { style: mount.style, length: { default: 3, min: 1.5, max: 6, step: 0.5 } },
    note: "A paper target that runs across on a track once activated." },
  { type: "texas-star", name: "Texas star", category: "moving", scoring: "steel", plates: (p) => p.plates,
    params: { plates: { default: 5, min: 5, max: 10, step: 5 }, ...paint("white") }, note: `A spinning star of steel plates. ${CARNIVAL}` },
  { type: "plate-rack", name: "Plate rack", category: "moving", scoring: "steel", plates: (p) => p.plates,
    params: { plates: { default: 6, min: 4, max: 8, step: 1 }, ...paint("white") }, note: `Falling plates in a row. ${CARNIVAL}` },
  { type: "dueling-tree", name: "Dueling tree", category: "moving", scoring: "steel", plates: () => 6,
    params: { ...paint("white") }, note: `Six paddles that swing over from one side of the post to the other. ${CARNIVAL}` },
  { type: "wall-mesh", name: "Mesh wall", category: "wall", scoring: null,
    params: { ...wallSize, ...meshLook } },
  { type: "wall-mesh-port", name: "Mesh wall with port", category: "wall", scoring: null,
    params: { ...wallSize, ...meshLook, ...port } },
  { type: "wall-wood", name: "Wooden wall", category: "wall", scoring: null, params: wallSize },
  { type: "wall-port", name: "Wooden wall with port", category: "wall", scoring: null, params: { ...wallSize, ...port } },
  { type: "wall-solid", name: "Solid panel", category: "wall", scoring: null,
    params: { length: { default: 1, min: 0.5, max: 2, step: 0.1 }, height: { default: 2, min: 0.5, max: 2.5, step: 0.1 } } },
  { type: "wall-door", name: "Mesh doorway", category: "wall", scoring: null,
    params: { length: { default: 1.5, min: 1.2, max: 3, step: 0.1 }, height: { default: 2.2, min: 2, max: 2.5, step: 0.05 },
      doorWidth: { default: 0.8, min: 0.6, max: 1.2, step: 0.05 }, doorHeight: { default: 1.95, min: 1.7, max: 2.1, step: 0.05 }, ...meshLook } },
  { type: "ramp", name: "Ramp", category: "structure", scoring: null,
    params: { length: { default: 2.4, min: 1, max: 4, step: 0.1 }, width: { default: 1, min: 0.6, max: 2, step: 0.1 }, height: { default: 0.4, min: 0.1, max: 1, step: 0.05 } } },
  { type: "platform", name: "Platform", category: "structure", scoring: null,
    params: { length: { default: 2, min: 1, max: 4, step: 0.1 }, width: { default: 1.2, min: 0.8, max: 3, step: 0.1 }, height: { default: 0.6, min: 0.2, max: 1.5, step: 0.05 } } },
  { type: "barrel", name: "Barrel (200 l)", category: "obstacle", scoring: null,
    params: { color: { default: "black", options: ["black", "blue", "red", "green"] } } },
  { type: "tyre", name: "Tyre", category: "obstacle", scoring: null, params: {} },
  { type: "tyre-stack", name: "Tyre stack", category: "obstacle", scoring: null,
    params: { count: { default: 3, min: 1, max: 6, step: 1 } } },
  { type: "crate", name: "Wooden crate", category: "obstacle", scoring: null,
    params: { size: { default: 0.6, min: 0.3, max: 1.2, step: 0.05 } } },
  { type: "plant-palm", name: "Potted plant", category: "obstacle", scoring: null, params: {} },
  { type: "car", name: "Car", category: "obstacle", scoring: null,
    params: { color: { default: "white", options: ["white", "red", "blue", "grey", "rust"] } } },
  { type: "table", name: "Table", category: "obstacle", scoring: null, params: { length: { default: 1.8, min: 1, max: 2.4, step: 0.1 } } },
  { type: "chair", name: "Chair", category: "obstacle", scoring: null, params: {} },
  { type: "pallet", name: "Pallets", category: "obstacle", scoring: null, params: { count: { default: 1, min: 1, max: 6, step: 1 } } },
  { type: "sandbags", name: "Sandbag wall", category: "obstacle", scoring: null,
    params: { length: { default: 1.2, min: 0.6, max: 3, step: 0.1 }, rows: { default: 2, min: 1, max: 5, step: 1 } } },
  { type: "cone", name: "Traffic cone", category: "obstacle", scoring: null, params: {} },
];

function deepFreeze(o) {
  for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v);
  return Object.freeze(o);
}

export const PROPS = deepFreeze(Object.fromEntries(defs.map((d) => [d.type, d])));

export function getProp(type) {
  if (!Object.hasOwn(PROPS, type)) throw new Error(`Unknown prop type: ${type}`);
  return PROPS[type];
}

export function defaultParams(type) {
  const out = {};
  for (const [k, p] of Object.entries(getProp(type).params)) out[k] = p.default;
  return out;
}

const round = (v) => Math.round(v * 1e6) / 1e6;

/** Overall bounding box { w, h, d } in metres (x, y, z at rotation 0), stand and frame included. */
export function dimensionsOf(obj) {
  const p = { ...defaultParams(obj.type), ...obj.params };
  let w, h, d;
  switch (obj.type) {
    case "paper-ipsc": case "paper-mini": {
      // The builder centres the array on the object's position.
      const e = arrayExtent({ type: obj.type, params: p }, STAND.w);
      [w, h, d] = [e.maxX - e.minX, p.mountHeight + e.top, STAND.d]; break;
    }
    case "popper": {
      const s = TARGET_SIZES.popper; [w, h, d] = [s.w, p.baseHeight + s.h, s.d]; break;
    }
    case "mini-popper": {
      const s = TARGET_SIZES.miniPopper; [w, h, d] = [s.w, p.baseHeight + s.h, s.d]; break;
    }
    case "plate-round": case "plate-square":
      [w, h, d] = [Math.max(p.size, PLATE_FOOT), p.baseHeight + p.size, PLATE_FOOT]; break;
    case "wall-mesh": case "wall-mesh-port": case "wall-wood": case "wall-port": case "wall-door": case "wall-solid":
      [w, h, d] = [p.length, p.height, WALL_FOOT]; break;
    case "barrel": [w, h, d] = [BARREL.diameter, BARREL.height, BARREL.diameter]; break;
    case "tyre": [w, h, d] = [TYRE.diameter, TYRE.height, TYRE.diameter]; break;
    case "tyre-stack": [w, h, d] = [TYRE.diameter, TYRE.height * p.count, TYRE.diameter]; break;
    case "crate": [w, h, d] = [p.size, p.size, p.size]; break;
    case "plant-palm": [w, h, d] = [PLANT.diameter, PLANT.height, PLANT.diameter]; break;
    case "ramp": case "platform": [w, h, d] = [p.length, p.height, p.width]; break;
    case "car": [w, h, d] = [CAR.length, CAR.height, CAR.width]; break;
    case "table": [w, h, d] = [p.length, TABLE.height, TABLE.depth]; break;
    case "chair": [w, h, d] = [CHAIR.w, CHAIR.h, CHAIR.d]; break;
    case "pallet": [w, h, d] = [PALLET.length, PALLET.height * p.count, PALLET.width]; break;
    case "sandbags": [w, h, d] = [p.length, SANDBAG.height * p.rows, SANDBAG.depth]; break;
    case "cone": [w, h, d] = [CONE.diameter, CONE.height, CONE.diameter]; break;
    case "texas-star": {
      const s = MOVING.star, pts = starPlates(p.plates);
      w = Math.max(s.base, 2 * Math.max(...pts.map(([x]) => Math.abs(x))) + s.plate);
      [h, d] = [Math.max(...pts.map(([, y]) => y)) + s.plate / 2, s.depth]; break;
    }
    case "plate-rack": { const r = MOVING.rack; [w, h, d] = [p.plates * r.pitch + 0.1, r.centre + r.plate / 2, r.depth]; break; }
    case "dueling-tree": { const t = MOVING.tree; [w, h, d] = [Math.max(t.base, 2 * (t.arm + t.paddle / 2)), t.post, t.base]; break; }
    case "swinger": { const m = MOVING.swinger, c = paperSize({ type: obj.type, params: p }); [w, h, d] = [Math.max(m.frame, c.w), m.cardBottom + c.h, m.depth]; break; }
    case "drop-turner": { const m = MOVING.turner, c = paperSize({ type: obj.type, params: p }); [w, h, d] = [Math.max(m.frame, c.w), Math.max(m.post, m.cardBottom + c.h), m.depth]; break; }
    case "clamshell": { const m = MOVING.clam, c = paperSize({ type: obj.type, params: p }); [w, h, d] = [c.w + 0.1, m.cardBottom + c.h + 0.05, m.depth]; break; }
    case "mover": { const m = MOVING.mover, c = paperSize({ type: obj.type, params: p }); [w, h, d] = [p.length, m.cardBottom + c.h, m.depth]; break; }
    default: throw new Error(`Unknown prop type: ${obj.type}`);
  }
  return { w: round(w), h: round(h), d: round(d) };
}
