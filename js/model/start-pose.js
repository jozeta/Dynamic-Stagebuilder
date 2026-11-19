// The shooter at the start position, posed as the briefing's start position says (hands up, arms
// hanging, hands on the head, palms on the wall, seated, kneeling), with the pistol in its holster
// when the gun condition says holstered (or says nothing). The start's facing is the box's arrow;
// "facing up range" in the text turns him round when the arrow looks down range. Looking around
// in Shooter's eye at the start saves start.view ({ yaw, pitch }). Pure: no DOM, no Three.js.
import { figureParts, partsSize } from "./positions.js";

const STAND = {
  pelvis: [0, 0.9, 0], chest: [0, 1.36, 0], head: [0, 1.63, 0.02], shoulder: [1.38, 0],
  legs: [{ a: [0.1, 0.92, 0], b: [0.11, 0.5, 0.01] }, { a: [0.11, 0.5, 0.01], b: [0.12, 0.08, 0] },
    { a: [-0.1, 0.92, 0], b: [-0.11, 0.5, 0.01] }, { a: [-0.11, 0.5, 0.01], b: [-0.12, 0.08, 0] }],
  feet: [[0.12, 0.03, 0.05, 0.1, 0.06, 0.25], [-0.12, 0.03, 0.05, 0.1, 0.06, 0.25]],
};
const SIT = {
  pelvis: [0, 0.48, -0.02], chest: [0, 0.94, 0.0], head: [0, 1.2, 0.02], shoulder: [0.96, 0],
  legs: [{ a: [0.1, 0.5, 0], b: [0.11, 0.5, 0.42] }, { a: [0.11, 0.5, 0.42], b: [0.11, 0.08, 0.45] },
    { a: [-0.1, 0.5, 0], b: [-0.11, 0.5, 0.42] }, { a: [-0.11, 0.5, 0.42], b: [-0.11, 0.08, 0.45] }],
  feet: [[0.11, 0.03, 0.51, 0.1, 0.06, 0.25], [-0.11, 0.03, 0.51, 0.1, 0.06, 0.25]],
};
const KNEEL = {
  pelvis: [0, 0.53, 0], chest: [0, 0.99, 0.02], head: [0, 1.25, 0.04], shoulder: [1.01, 0.02],
  legs: [{ a: [0.1, 0.55, 0], b: [0.13, 0.5, 0.4] }, { a: [0.13, 0.5, 0.4], b: [0.13, 0.08, 0.42] },
    { a: [-0.1, 0.55, 0], b: [-0.12, 0.07, 0.06] }, { a: [-0.12, 0.07, 0.06], b: [-0.12, 0.07, -0.36] }],
  feet: [[0.13, 0.03, 0.48, 0.1, 0.06, 0.25], [-0.12, 0.04, -0.46, 0.1, 0.08, 0.16]],
};
const both = (f) => ({ left: f(1), right: f(-1) });
const UPRIGHT = [0.025, 0.055, 0.04], FLAT = [0.04, 0.02, 0.05], WALL = [0.045, 0.05, 0.02];

// Each pose: the words that pick it (first match wins, in this order), eye height, skeleton, arms.
export const START_POSES = Object.freeze([
  { id: "seated", name: "Seated, hands on the thighs", match: /seat|chair|sitting/i, eye: 1.17, body: SIT,
    arms: both((s) => ({ elbow: [0.2 * s, 0.72, 0.06], wrist: [0.14 * s, 0.56, 0.3], hand: [0.12 * s, 0.55, 0.36], palm: FLAT })) },
  { id: "kneeling", name: "Kneeling, hands on the knees", match: /kneel/i, eye: 1.12, body: KNEEL,
    arms: { left: { elbow: [0.22, 0.78, 0.18], wrist: [0.15, 0.6, 0.36], hand: [0.13, 0.57, 0.41], palm: FLAT },
      right: { elbow: [-0.22, 0.75, 0.05], wrist: [-0.15, 0.48, 0.13], hand: [-0.13, 0.43, 0.16], palm: UPRIGHT } } },
  { id: "hands-on-head", name: "Hands on the head", match: /on (the|his|their) head/i, eye: 1.6, body: STAND,
    arms: both((s) => ({ elbow: [0.33 * s, 1.6, 0.0], wrist: [0.12 * s, 1.74, -0.01], hand: [0.07 * s, 1.765, 0.0], palm: [0.04, 0.022, 0.05] })) },
  { id: "hands-on-wall", name: "Palms on the wall", match: /wall/i, eye: 1.6, body: STAND,
    arms: both((s) => ({ elbow: [0.21 * s, 1.33, 0.3], wrist: [0.22 * s, 1.42, 0.55], hand: [0.22 * s, 1.44, 0.6], palm: WALL })) },
  { id: "hands-up", name: "Wrists above the shoulders", match: /wrists? above|above the shoulders|surrender|hands up/i, eye: 1.6, body: STAND,
    arms: both((s) => ({ elbow: [0.31 * s, 1.47, 0.03], wrist: [0.27 * s, 1.7, 0.04], hand: [0.27 * s, 1.775, 0.04], palm: UPRIGHT })) },
  { id: "relaxed", name: "Arms hanging naturally", match: /hang|at the sides|natural|relaxed/i, eye: 1.6, body: STAND,
    arms: both((s) => ({ elbow: [0.22 * s, 1.1, -0.01], wrist: [0.235 * s, 0.85, 0.02], hand: [0.235 * s, 0.775, 0.03], palm: UPRIGHT })) },
].map((p) => Object.freeze(p)));

const pose = (id) => START_POSES.find((p) => p.id === id) || START_POSES.find((p) => p.id === "relaxed");

/** The pose the briefing's start position describes (arms hanging when it says nothing we know). */
export function startPoseFor(briefing = {}) {
  const text = String(briefing.startPosition || "");
  return (START_POSES.find((p) => p.match.test(text)) || pose("relaxed")).id;
}

/** Is the pistol in its holster at the start? (Yes unless it starts on a table, in a box or a case.) */
export function holsteredAtStart(briefing = {}) {
  const text = String(briefing.gunCondition || "") + " " + String(briefing.startPosition || "");
  if (/holster/i.test(String(briefing.gunCondition || ""))) return true;
  return !/table|box|case|barrel|drawer/i.test(text);
}

/** Which way the man at the start faces (degrees, like a prop's rotation; 0 = down range). */
export function startFacing(stage) {
  const f = stage.start?.facing ?? 0;
  const down = Math.abs(((((f % 360) + 540) % 360) - 180)) < 90;
  return /facing up ?range/i.test(String(stage.briefing?.startPosition || "")) && down ? f + 180 : f;
}

/** Where Shooter's eye looks from the start: the saved view, else the way the man faces. */
export function startLook(stage) {
  const v = stage.start?.view;
  return v ? { yaw: v.yaw, pitch: v.pitch } : { yaw: startFacing(stage), pitch: 0 };
}

/** Eye height at the start (m), from the pose. */
export const startEye = (briefing) => pose(startPoseFor(briefing)).eye;

// A belt with the holstered pistol on the strong (right, −x) hip and magazine pouches on the left.
function belt(P) {
  const at = (x, y, z) => [P[0] + x, P[1] + y, P[2] + z];
  return [
    { kind: "loft", sections: [0, 0.045].map((dy) => ({ c: at(0, dy - 0.0, 0), rx: 0.17, rz: 0.115, X: [1, 0, 0], V: [0, 0, 1] })) },
    { kind: "box", c: at(-0.205, -0.06, -0.005), s: [0.042, 0.17, 0.085], tilt: 0.08 },            // holster
    { kind: "box", c: at(-0.205, 0.07, -0.03), s: [0.028, 0.1, 0.048], tilt: -0.33 },              // the pistol's grip
    { kind: "box", c: at(-0.205, 0.035, 0.03), s: [0.026, 0.03, 0.05], tilt: 0 },                  // the slide's back end
    { kind: "box", c: at(0.15, -0.01, 0.085), s: [0.036, 0.085, 0.028], tilt: 0 },                 // magazine pouches
    { kind: "box", c: at(0.19, -0.01, 0.05), s: [0.036, 0.085, 0.028], tilt: 0 },
  ];
}

/** The man at the start for a briefing: his parts, facing +z, standing on the ground at 0. */
export function startFigure(briefing = {}) {
  const p = pose(startPoseFor(briefing));
  return figureParts({ ...p.body, arms: p.arms, extra: holsteredAtStart(briefing) ? belt(p.body.pelvis) : [] });
}
export const startFigureSize = (briefing) => partsSize(startFigure(briefing));
