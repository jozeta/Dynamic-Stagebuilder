// The v1 prop catalogue: every prop's type, category, scoring kind and parameters, and its overall
// real-world size in metres. Pure data: no DOM, no Three.js.
//
// Target outlines: IPSC Target ≈ 46 × 58 cm and Mini Target ≈ 2/3 of that (Appendix B2/B3 drawings);
// IPSC Popper 85 cm tall with a 30 cm head, Mini Popper 2/3 of that (Appendix C2); plates 15–30 cm
// (Appendix C3a). The appendix drawings are images, so these are the commonly published sizes.
import { bermSize } from "./berm.js";

import { PAPER_SIZES, TARGET_STYLES, PRESENTATIONS, HARD_COVERS, paperSize, arrayExtent } from "./arrays.js";
import { STANCES, positionSize } from "./positions.js";
import { ANIMATE_PARAM } from "./animation.js";
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
// Car models: overall size (m) and the side-profile curves the 3D body is lofted from. Curves are
// [u, metres] with u from the rear (0) to the front (1): belt = top of the body side (bonnet, boot
// and bed deck), roof = top of the cabin (equal to belt where there is none), half = half width,
// sill = underside. wheels = axle x (m from the centre), screens = u ranges of windscreen and rear
// glass, windows = u ranges of side glass, seams = u of door gaps, handles = x of door handles.
export const CAR_MODELS = deepFreeze({
  sedan: { name: "Saloon", length: 4.6, width: 1.8, height: 1.45, wheels: [-1.38, 1.36], tyre: 0.31, tyreWidth: 0.2, arch: 0.39, roofHalf: 0.66,
    belt: [[0, 0.6], [0.025, 0.84], [0.1, 0.93], [0.3, 0.96], [0.7, 0.9], [0.9, 0.83], [0.975, 0.74], [1, 0.58]],
    roof: [[0, 0.6], [0.025, 0.84], [0.1, 0.94], [0.17, 0.98], [0.3, 1.39], [0.38, 1.44], [0.55, 1.45], [0.6, 1.42], [0.74, 0.92], [0.9, 0.84], [0.975, 0.75], [1, 0.58]],
    half: [[0, 0.74], [0.04, 0.85], [0.15, 0.9], [0.85, 0.9], [0.96, 0.84], [1, 0.72]],
    sill: [[0, 0.34], [0.06, 0.25], [0.94, 0.25], [1, 0.32]],
    screens: [[0.17, 0.3], [0.6, 0.74]], windows: [[0.3, 0.475], [0.49, 0.6]], seams: [0.285, 0.48, 0.665], handles: [0.0, -0.88], bed: 0 },
  hatchback: { name: "Hatchback", length: 4.1, width: 1.75, height: 1.48, wheels: [-1.25, 1.27], tyre: 0.3, tyreWidth: 0.19, arch: 0.38, roofHalf: 0.64,
    belt: [[0, 0.66], [0.03, 0.9], [0.1, 0.95], [0.65, 0.9], [0.88, 0.83], [0.97, 0.75], [1, 0.58]],
    roof: [[0, 0.66], [0.03, 0.92], [0.06, 1.2], [0.12, 1.44], [0.5, 1.48], [0.6, 1.4], [0.74, 0.93], [0.88, 0.84], [0.97, 0.76], [1, 0.58]],
    half: [[0, 0.74], [0.04, 0.84], [0.15, 0.875], [0.85, 0.875], [0.96, 0.82], [1, 0.7]],
    sill: [[0, 0.34], [0.06, 0.25], [0.94, 0.25], [1, 0.32]],
    screens: [[0.03, 0.12], [0.6, 0.74]], windows: [[0.13, 0.33], [0.35, 0.59]], seams: [0.317, 0.488, 0.683], handles: [0.1, -0.62], bed: 0 },
  pickup: { name: "Pickup", length: 5.3, width: 1.9, height: 1.8, wheels: [-1.7, 1.6], tyre: 0.39, tyreWidth: 0.26, arch: 0.47, roofHalf: 0.76,
    belt: [[0, 0.92], [0.02, 1.06], [0.08, 1.1], [0.7, 1.1], [0.88, 1.06], [0.97, 0.98], [1, 0.72]],
    roof: [[0, 0.92], [0.02, 1.07], [0.08, 1.11], [0.4, 1.11], [0.42, 1.72], [0.45, 1.78], [0.61, 1.8], [0.7, 1.16], [0.88, 1.07], [0.97, 0.99], [1, 0.72]],
    half: [[0, 0.88], [0.03, 0.94], [0.1, 0.95], [0.9, 0.95], [0.97, 0.9], [1, 0.8]],
    sill: [[0, 0.5], [0.04, 0.42], [0.96, 0.42], [1, 0.5]],
    screens: [[0.4, 0.44], [0.61, 0.7]], windows: [[0.45, 0.535], [0.55, 0.62]], seams: [0.41, 0.49, 0.62], handles: [0.0, -0.75], bed: 0.405 },
  van: { name: "Van", length: 4.9, width: 1.95, height: 1.95, wheels: [-1.45, 1.55], tyre: 0.32, tyreWidth: 0.21, arch: 0.4, roofHalf: 0.88,
    belt: [[0, 0.6], [0.015, 1.0], [0.05, 1.04], [0.78, 1.04], [0.9, 1.0], [0.97, 0.9], [1, 0.6]],
    roof: [[0, 0.62], [0.012, 1.84], [0.04, 1.95], [0.75, 1.95], [0.86, 1.25], [0.92, 1.05], [0.97, 0.92], [1, 0.6]],
    half: [[0, 0.9], [0.03, 0.975], [0.95, 0.975], [0.99, 0.9], [1, 0.85]],
    sill: [[0, 0.36], [0.04, 0.3], [0.96, 0.3], [1, 0.34]],
    screens: [[0, 0.013], [0.75, 0.86]], windows: [[0.64, 0.79]], seams: [0.44, 0.56, 0.725], handles: [0.42, -0.25], bed: 0 },
});
/** Kept for older code: the saloon's size. */
export const CAR = Object.freeze({ length: CAR_MODELS.sedan.length, height: CAR_MODELS.sedan.height, width: CAR_MODELS.sedan.width });
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

// From the 2012 US IPSC Nationals stage diagrams: activators, start marks, a port with a shutter,
// hard-cover panels, raised barricades, bobbers, twisters, a wobble platform, a balance rope, a step box.
export const ACTIVATORS = deepFreeze({ pad: 0.5, lever: { base: 0.3, pivot: 1.0, top: 1.52 } });
const TABLE_ITEMS = { none: 0, pistol: 0.03, "pistol-mags": 0.03, case: 0.12 };
const X_MARK = (0.26 + 0.03) / Math.SQRT2;

// Building pieces, to rebuild your own range on a plan (Settings → Surroundings → New from a plan).
const MATERIAL = { material: { default: "concrete", options: ["concrete", "brick", "wood", "metal"] } };
export const CONTAINERS = deepFreeze({ "20ft": { length: 6.06, width: 2.44, height: 2.59 }, "40ft": { length: 12.19, width: 2.44, height: 2.59 } });
export const BARRIER = Object.freeze({ height: 0.81, base: 0.6 });

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
  { type: "shooting-position", name: "Shooting position", category: "marking", scoring: "position",
    params: { stance: { default: "standing", options: STANCES.map((s) => s.id) }, pitch: { default: 0, min: -45, max: 30, step: 1 } },
    note: "A place the shooter shoots from. Shooter's eye steps through the positions in number order." },
  { type: "paper-ipsc", name: "IPSC target", category: "paper", scoring: "paper", params: mount },
  { type: "paper-mini", name: "IPSC mini target", category: "paper", scoring: "paper", params: mount },
  { type: "popper", name: "IPSC popper", category: "steel", scoring: "steel",
    params: { ...ANIMATE_PARAM, baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "mini-popper", name: "Mini popper", category: "steel", scoring: "steel",
    params: { ...ANIMATE_PARAM, baseHeight: { default: 0, min: 0, max: 1.5, step: 0.05 }, ...paint("yellow") } },
  { type: "plate-round", name: "Round plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.2, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
  { type: "plate-square", name: "Square plate", category: "steel", scoring: "steel",
    params: { size: { default: 0.15, min: 0.15, max: 0.3, step: 0.01 }, baseHeight: { default: 1.0, min: 0.2, max: 1.5, step: 0.05 }, ...paint("white") } },
  { type: "swinger", name: "Swinger", category: "moving", scoring: "paper", params: { ...ANIMATE_PARAM, style: mount.style },
    note: "A paper target on a weighted arm that swings once activated (usually by a popper)." },
  { type: "drop-turner", name: "Drop turner", category: "moving", scoring: "paper", params: { ...ANIMATE_PARAM, style: mount.style },
    note: "Starts edge-on, drops, turns to face the shooter and turns away again once activated." },
  { type: "clamshell", name: "Clamshell", category: "moving", scoring: "paper", params: { ...ANIMATE_PARAM, style: mount.style },
    note: "A paper target behind a steel cover that drops away once activated." },
  { type: "mover", name: "Mover on a track", category: "moving", scoring: "paper",
    params: { ...ANIMATE_PARAM, style: mount.style, length: { default: 3, min: 1.5, max: 8, step: 0.5 }, targets: { default: 1, min: 1, max: 4, step: 1 } },
    note: "A paper target that runs across on a track once activated." },
  { type: "texas-star", name: "Texas star", category: "moving", scoring: "steel", plates: (p) => p.plates,
    params: { ...ANIMATE_PARAM, plates: { default: 5, min: 5, max: 10, step: 5 }, ...paint("white") }, note: `A spinning star of steel plates. ${CARNIVAL}` },
  { type: "plate-rack", name: "Plate rack", category: "moving", scoring: "steel", plates: (p) => p.plates,
    params: { ...ANIMATE_PARAM, plates: { default: 6, min: 4, max: 8, step: 1 }, ...paint("white") }, note: `Falling plates in a row. ${CARNIVAL}` },
  { type: "dueling-tree", name: "Dueling tree", category: "moving", scoring: "steel", plates: () => 6,
    params: { ...ANIMATE_PARAM, ...paint("white") }, note: `Six paddles that swing over from one side of the post to the other. ${CARNIVAL}` },
  { type: "step-pad", name: "Step pad", category: "activator", scoring: null, params: { pads: { default: 1, min: 1, max: 3, step: 2 } },
    note: "A pressure pad the shooter steps on to start a moving target (one pad, or a cluster of three)." },
  { type: "pull-lever", name: "Pull lever", category: "activator", scoring: null, params: {},
    note: "A lever on a post the shooter pulls to open a shutter or release a target." },
  { type: "start-marks", name: "Start marks (X)", category: "marking", scoring: null, params: {},
    note: "Two X marks for toes, heels or palms at the start." },
  { type: "wall-port-shutter", name: "Wall with shuttered port", category: "wall", scoring: null,
    params: { ...ANIMATE_PARAM, ...wallSize, ...port, shutter: { default: "closed", options: ["closed", "open"] } },
    note: "A wooden wall whose port has a shutter that drops open (by a lever, rope or popper)." },
  { type: "hardcover-panel", name: "Hard cover panel", category: "wall", scoring: null,
    params: { length: { default: 1, min: 0.5, max: 1.5, step: 0.1 }, height: { default: 1.8, min: 0.9, max: 2.2, step: 0.1 } },
    note: "A black panel that hits don't go through; moving targets swing or turn behind it." },
  { type: "raised-barricade", name: "Raised barricade", category: "wall", scoring: null,
    params: { length: { default: 3, min: 2, max: 4, step: 0.1 }, panelHeight: { default: 0.9, min: 0.5, max: 1.2, step: 0.05 }, gap: { default: 0.5, min: 0.2, max: 1, step: 0.05 } },
    note: "A panel on posts with an open gap underneath, to shoot under or over." },
  { type: "bobber", name: "Bobber", category: "moving", scoring: "paper", params: { ...ANIMATE_PARAM, style: mount.style },
    note: "A paper target that rises into view behind hard cover and drops out of sight again." },
  { type: "twister", name: "Twister", category: "moving", scoring: "paper", params: { ...ANIMATE_PARAM, style: mount.style },
    note: "A paper target that spins on a vertical post, showing its face and its edge in turn." },
  { type: "wobble-platform", name: "Wobble platform", category: "structure", scoring: null, params: { ...ANIMATE_PARAM },
    note: "A deck on a pivot that moves under the shooter." },
  { type: "balance-rope", name: "Balance rope", category: "structure", scoring: null, params: {},
    note: "A rope hanging from a frame, to steady yourself on a wobble platform." },
  { type: "step-box", name: "Step box", category: "structure", scoring: null, params: {} },
  { type: "building-wall", name: "Building wall", category: "building", scoring: null,
    params: { length: { default: 5, min: 0.5, max: 30, step: 0.1 }, height: { default: 3, min: 0.5, max: 8, step: 0.1 },
      thickness: { default: 0.25, min: 0.1, max: 0.8, step: 0.05 }, ...MATERIAL } },
  { type: "pillar", name: "Pillar", category: "building", scoring: null,
    params: { size: { default: 0.4, min: 0.15, max: 1.5, step: 0.05 }, height: { default: 3, min: 0.5, max: 8, step: 0.1 }, ...MATERIAL } },
  { type: "column", name: "Round column", category: "building", scoring: null,
    params: { diameter: { default: 0.4, min: 0.15, max: 1.5, step: 0.05 }, height: { default: 3, min: 0.5, max: 8, step: 0.1 }, ...MATERIAL } },
  { type: "berm", name: "Earth berm", category: "building", scoring: null,
    params: { length: { default: 10, min: 2, max: 60, step: 0.5 }, height: { default: 2.5, min: 0.5, max: 8, step: 0.1 }, depth: { default: 5, min: 1, max: 16, step: 0.5 },
      ground: { default: "sand", options: ["sand", "light-sand", "dark-sand", "red-dirt", "gravel"] }, plants: { default: "mixed", options: ["mixed", "grass", "none"] } },
    note: "An earth bank on the ground's own surface, with grass and bushes. Draw the outline… gives it any shape up to 10 × 10 m." },
  { type: "container", name: "Shipping container", category: "building", scoring: null,
    params: { size: { default: "20ft", options: ["20ft", "40ft"] }, color: { default: "blue", options: ["blue", "red", "green", "grey", "rust"] } } },
  { type: "fence", name: "Chain-link fence", category: "building", scoring: null,
    params: { length: { default: 5, min: 1, max: 30, step: 0.5 }, height: { default: 2, min: 1, max: 4, step: 0.1 } } },
  { type: "barrier", name: "Concrete barrier", category: "building", scoring: null,
    params: { length: { default: 2, min: 1, max: 4, step: 0.5 } } },
  { type: "wall-mesh", name: "Mesh wall", category: "wall", scoring: null,
    params: { ...wallSize, ...meshLook } },
  { type: "wall-mesh-port", name: "Mesh wall with port", category: "wall", scoring: null,
    params: { ...wallSize, ...meshLook, ...port } },
  { type: "wall-wood", name: "Wooden wall", category: "wall", scoring: null, params: wallSize },
  { type: "wall-port", name: "Wooden wall with port", category: "wall", scoring: null, params: { ...wallSize, ...port } },
  { type: "wall-solid", name: "Solid panel", category: "wall", scoring: null,
    params: { length: { default: 1, min: 0.5, max: 2, step: 0.1 }, height: { default: 2, min: 0.5, max: 2.5, step: 0.1 } } },
  { type: "door", name: "Door", category: "wall", scoring: null,
    params: { ...ANIMATE_PARAM, doorWidth: { default: 0.9, min: 0.6, max: 1.2, step: 0.05 }, height: { default: 2.2, min: 2, max: 2.5, step: 0.05 },
      open: { default: 0, min: 0, max: 90, step: 5 }, hinge: { default: "left", options: ["left", "right"] }, swing: { default: "away", options: ["away", "toward"] } },
    note: "A wooden door in a frame. Open sets how far it stands open; Animate opens and shuts it." },
  { type: "wall-door", name: "Mesh doorway", category: "wall", scoring: null,
    params: { length: { default: 1.5, min: 1.2, max: 3, step: 0.1 }, height: { default: 2.2, min: 2, max: 2.5, step: 0.05 },
      doorWidth: { default: 0.8, min: 0.6, max: 1.2, step: 0.05 }, doorHeight: { default: 1.95, min: 1.7, max: 2.1, step: 0.05 }, ...meshLook } },
  { type: "ramp", name: "Ramp", category: "structure", scoring: null,
    params: { length: { default: 2.4, min: 1, max: 4, step: 0.1 }, width: { default: 1, min: 0.6, max: 2, step: 0.1 }, height: { default: 0.4, min: 0.1, max: 1, step: 0.05 } } },
  { type: "platform", name: "Platform", category: "structure", scoring: null,
    params: { length: { default: 2, min: 1, max: 4, step: 0.1 }, width: { default: 1.2, min: 0.8, max: 3, step: 0.1 }, height: { default: 0.6, min: 0.2, max: 1.5, step: 0.05 } } },
  { type: "barrel", name: "Barrel (200 l)", category: "obstacle", scoring: null,
    params: { color: { default: "black", options: ["black", "blue", "red", "green"] }, stack: { default: 1, min: 1, max: 2, step: 1 } } },
  { type: "tyre", name: "Tyre", category: "obstacle", scoring: null, params: {} },
  { type: "tyre-stack", name: "Tyre stack", category: "obstacle", scoring: null,
    params: { count: { default: 3, min: 1, max: 6, step: 1 } } },
  { type: "crate", name: "Wooden crate", category: "obstacle", scoring: null,
    params: { size: { default: 0.6, min: 0.3, max: 1.2, step: 0.05 } } },
  { type: "plant-palm", name: "Potted plant", category: "obstacle", scoring: null, params: {} },
  { type: "car", name: "Car", category: "obstacle", scoring: null,
    params: { model: { default: "sedan", options: ["sedan", "hatchback", "pickup", "van"] }, color: { default: "white", options: ["white", "red", "blue", "grey", "rust"] } } },
  { type: "table", name: "Table", category: "obstacle", scoring: null, params: { items: { default: "none", options: ["none", "pistol", "pistol-mags", "case"] }, length: { default: 1.8, min: 1, max: 2.4, step: 0.1 } } },
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
    case "barrel": [w, h, d] = [BARREL.diameter, BARREL.height * (p.stack || 1), BARREL.diameter]; break;
    case "tyre": [w, h, d] = [TYRE.diameter, TYRE.height, TYRE.diameter]; break;
    case "tyre-stack": [w, h, d] = [TYRE.diameter, TYRE.height * p.count, TYRE.diameter]; break;
    case "crate": [w, h, d] = [p.size, p.size, p.size]; break;
    case "plant-palm": [w, h, d] = [PLANT.diameter, PLANT.height, PLANT.diameter]; break;
    case "ramp": case "platform": [w, h, d] = [p.length, p.height, p.width]; break;
    case "car": { const m = CAR_MODELS[p.model] || CAR_MODELS.sedan; [w, h, d] = [m.length, m.height, m.width]; break; }
    case "table": [w, h, d] = [p.length, TABLE.height + (TABLE_ITEMS[p.items] ?? 0), TABLE.depth]; break;
    case "chair": [w, h, d] = [CHAIR.w, CHAIR.h, CHAIR.d]; break;
    case "pallet": [w, h, d] = [PALLET.length, PALLET.height * p.count, PALLET.width]; break;
    case "sandbags": [w, h, d] = [p.length, SANDBAG.height * p.rows, SANDBAG.depth]; break;
    case "cone": [w, h, d] = [CONE.diameter, CONE.height, CONE.diameter]; break;
    case "door": {
      // The frame stands on feet 40 cm deep; an open leaf reaches out on one side.
      const a = (p.open * Math.PI) / 180, leaf = (p.doorWidth - 0.005) * Math.sin(a) + 0.02 * Math.cos(a);   // the leaf's far edge
      [w, h, d] = [p.doorWidth + 2 * STICK + 0.02, p.height, WALL_FOOT / 2 + Math.max(WALL_FOOT / 2, leaf)]; break;
    }
    case "building-wall": [w, h, d] = [p.length, p.height, p.thickness]; break;
    case "step-pad": [w, h, d] = p.pads > 1 ? [1.2, 0.05, 1.2] : [0.5, 0.05, 0.5]; break;
    case "pull-lever": [w, h, d] = [ACTIVATORS.lever.base, ACTIVATORS.lever.top, ACTIVATORS.lever.base]; break;
    case "start-marks": [w, h, d] = [0.3 + X_MARK, 0.004, X_MARK]; break;
    case "wall-port-shutter": {
      const ph = Math.min(p.portHeight, p.height - 0.1);           // the port as fitted into the wall
      [w, h, d] = [p.length, p.height, WALL_FOOT / 2 + (p.shutter === "open" ? Math.max(WALL_FOOT / 2, ph + 0.023) : WALL_FOOT / 2)]; break;
    }
    case "hardcover-panel": [w, h, d] = [p.length, p.height, WALL_FOOT]; break;
    case "raised-barricade": [w, h, d] = [p.length, p.gap + p.panelHeight, WALL_FOOT]; break;
    case "bobber": { const c = paperSize({ type: obj.type, params: p }); [w, h, d] = [Math.max(0.6, c.w), 1.0 + c.h, 0.5]; break; }
    case "twister": { const c = paperSize({ type: obj.type, params: p }); [w, h, d] = [Math.max(0.5, c.w), 0.9 + c.h, 0.5]; break; }
    case "wobble-platform": [w, h, d] = [1.6, 0.25, 1.2]; break;
    case "balance-rope": [w, h, d] = [0.8, 2.4, 0.5]; break;
    case "step-box": [w, h, d] = [0.6, 0.2, 0.3]; break;
    case "pillar": [w, h, d] = [p.size, p.height, p.size]; break;
    case "column": [w, h, d] = [p.diameter, p.height, p.diameter]; break;
    case "berm": { const [bl, bd] = bermSize(obj); [w, h, d] = [bl, p.height, bd]; break; }
    case "container": { const c = CONTAINERS[p.size] || CONTAINERS["20ft"]; [w, h, d] = [c.length, c.height, c.width]; break; }
    case "fence": [w, h, d] = [p.length, p.height, 0.5]; break;
    case "barrier": [w, h, d] = [p.length, BARRIER.height, BARRIER.base]; break;
    case "shooting-position": { const s = positionSize(p.stance); [w, h, d] = [s.w, s.h, s.d]; break; }
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
    case "mover": { const m = MOVING.mover, c = paperSize({ type: obj.type, params: p }); [w, h, d] = [Math.max(p.length, ((p.targets || 1) - 1) * 0.7 + c.w), m.cardBottom + c.h, m.depth]; break; }
    default: throw new Error(`Unknown prop type: ${obj.type}`);
  }
  return { w: round(w), h: round(h), d: round(d) };
}
