// The v1 prop catalogue: every prop's type, category, scoring kind and parameters, and its overall
// real-world size in metres. Pure data: no DOM, no Three.js.
//
// Target outlines: IPSC Target ≈ 46 × 58 cm and Mini Target ≈ 2/3 of that (Appendix B2/B3 drawings);
// IPSC Popper 85 cm tall with a 30 cm head, Mini Popper 2/3 of that (Appendix C2); plates 15–30 cm
// (Appendix C3a). The appendix drawings are images, so these are the commonly published sizes.

export const TARGET_SIZES = Object.freeze({
  ipsc: Object.freeze({ w: 0.46, h: 0.58 }),
  mini: Object.freeze({ w: 0.31, h: 0.39 }),
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

const mount = { mountHeight: { default: 0.7, min: 0.1, max: 2.0, step: 0.05 } };
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
  { type: "noshoot", name: "No-shoot", category: "paper", scoring: "noshoot", params: mount },
  { type: "noshoot-mini", name: "Mini no-shoot", category: "paper", scoring: "noshoot", params: mount },
  { type: "popper", name: "IPSC popper", category: "steel", scoring: "steel",
    params: { baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "mini-popper", name: "Mini popper", category: "steel", scoring: "steel",
    params: { baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "plate-round", name: "Round plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.2, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
  { type: "plate-square", name: "Square plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.15, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
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
    case "paper-ipsc": case "noshoot":
      [w, h, d] = [Math.max(TARGET_SIZES.ipsc.w, STAND.w), p.mountHeight + TARGET_SIZES.ipsc.h, STAND.d]; break;
    case "paper-mini": case "noshoot-mini":
      [w, h, d] = [Math.max(TARGET_SIZES.mini.w, STAND.w), p.mountHeight + TARGET_SIZES.mini.h, STAND.d]; break;
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
    default: throw new Error(`Unknown prop type: ${obj.type}`);
  }
  return { w: round(w), h: round(h), d: round(d) };
}
