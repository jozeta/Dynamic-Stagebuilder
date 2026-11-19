// The prop catalogue and the scoring constants: every v1 prop exists with real-world dimensions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PROPS, getProp, defaultParams, dimensionsOf, TARGET_SIZES } from "../js/model/props.js";
import { SCORING } from "../js/model/scoring-rules.js";

const TYPES = ["paper-ipsc", "paper-mini", "popper", "mini-popper",
  "plate-round", "plate-square", "wall-mesh", "wall-mesh-port", "wall-wood", "wall-port", "barrel", "tyre", "tyre-stack", "crate", "plant-palm",
  "wall-door", "wall-solid", "ramp", "platform", "car", "table", "chair", "pallet", "sandbags", "cone",
  "swinger", "drop-turner", "clamshell", "mover", "texas-star", "plate-rack", "dueling-tree", "shooting-position"];

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
const obj = (type, params = {}) => ({ type, params: { ...defaultParams(type), ...params } });

test("every v1 prop type exists with a category", () => {
  for (const t of TYPES) {
    assert.ok(PROPS[t], t);
    assert.ok(["marking", "paper", "steel", "moving", "wall", "structure", "obstacle"].includes(PROPS[t].category), t);
  }
  assert.equal(Object.keys(PROPS).length, TYPES.length);
});

test("getProp rejects unknown types", () => {
  assert.throws(() => getProp("nope"), /Unknown prop type: nope/);
});

test("scoring kinds", () => {
  assert.equal(getProp("paper-mini").scoring, "paper");
  assert.equal(getProp("plate-round").scoring, "steel");
  assert.equal(getProp("barrel").scoring, null);
});

test("default params of a mesh wall", () => {
  assert.deepEqual(defaultParams("wall-mesh"), { length: 2, height: 2, mesh: "orange", frame: "wood" });
});

test("paper target height is mount height plus the target", () => {
  const d = dimensionsOf(obj("paper-ipsc"));
  near(d.h, 0.7 + TARGET_SIZES.ipsc.h);
  near(d.w, TARGET_SIZES.ipsc.w);
  near(dimensionsOf(obj("paper-ipsc", { mountHeight: 0.5 })).h, 0.5 + TARGET_SIZES.ipsc.h);
});

test("wall with a port is as big as the wall", () => {
  const d = dimensionsOf(obj("wall-port", { length: 2.5, height: 1.8 }));
  near(d.w, 2.5);
  near(d.h, 1.8);
});

test("tyre stack grows with the count", () => {
  near(dimensionsOf(obj("tyre-stack", { count: 4 })).h, 4 * dimensionsOf(obj("tyre")).h);
});

test("scoring constants are frozen and cite their rulebook", () => {
  assert.ok(Object.isFrozen(SCORING));
  assert.ok(Object.isFrozen(SCORING.courseLimits));
  assert.match(SCORING.edition, /IPSC/);
  assert.equal(SCORING.hitsPerPaper, 2);
  assert.equal(SCORING.hitsPerSteel, 1);
  assert.equal(SCORING.pointsPerPaperHit, 5);
  assert.equal(SCORING.pointsPerSteelHit, 5);
  assert.deepEqual({ ...SCORING.courseLimits }, { Short: 12, Medium: 24, Long: 32 });
  assert.equal(SCORING.typeByRoundsOnly, false);
});

test("mesh wall with port has mesh and port settings", () => {
  const p = defaultParams("wall-mesh-port");
  assert.deepEqual(Object.keys(p).sort(), ["frame", "height", "length", "mesh", "portBottom", "portHeight", "portWidth"]);
  assert.equal(getProp("wall-mesh-port").category, "wall");
});

test("steel has a paint colour; poppers default yellow, plates white", () => {
  assert.equal(defaultParams("popper").paint, "yellow");
  assert.equal(defaultParams("plate-round").paint, "white");
  assert.deepEqual([...getProp("mini-popper").params.paint.options], ["white", "yellow"]);
});

test("the potted plant is a decorative obstacle that scores nothing", () => {
  assert.equal(getProp("plant-palm").category, "obstacle");
  assert.equal(getProp("plant-palm").scoring, null);
  const d = dimensionsOf(obj("plant-palm"));
  assert.ok(d.h > 1 && d.w > 0.5);
});

test("targets stand lower: the card's bottom edge at 0.7 m by default", () => {
  assert.equal(defaultParams("paper-ipsc").mountHeight, 0.7);
  assert.equal(defaultParams("paper-mini").mountHeight, 0.7);
});

test("barrels come in four colours, black by default", () => {
  assert.deepEqual([...getProp("barrel").params.color.options], ["black", "blue", "red", "green"]);
  assert.equal(defaultParams("barrel").color, "black");
});

test("new structures and range furniture have real sizes", () => {
  near(dimensionsOf(obj("ramp", { length: 3, width: 1.2, height: 0.5 })).w, 3);
  near(dimensionsOf(obj("ramp", { length: 3, width: 1.2, height: 0.5 })).h, 0.5);
  near(dimensionsOf(obj("ramp", { length: 3, width: 1.2, height: 0.5 })).d, 1.2);
  near(dimensionsOf(obj("platform")).h, 0.6);
  const car = dimensionsOf(obj("car"));
  assert.ok(car.w > 4 && car.w < 5 && car.h > 1.3 && car.h < 1.6 && car.d > 1.6 && car.d < 2, JSON.stringify(car));
  near(dimensionsOf(obj("sandbags", { rows: 3 })).h, 3 * dimensionsOf(obj("sandbags", { rows: 1 })).h);
  near(dimensionsOf(obj("pallet", { count: 4 })).h, 4 * dimensionsOf(obj("pallet", { count: 1 })).h);
  assert.equal(getProp("ramp").category, "structure");
  assert.equal(getProp("car").category, "obstacle");
  assert.equal(getProp("wall-door").category, "wall");
  assert.ok(defaultParams("wall-door").doorWidth >= 0.7);
});

test("the solid panel is a wall (it snaps); walls stand on feet 40 cm deep", () => {
  assert.equal(getProp("wall-solid").category, "wall");
  assert.deepEqual(defaultParams("wall-solid"), { length: 1, height: 2 });
  near(dimensionsOf(obj("wall-mesh")).d, 0.4);
});

test("mesh walls default to orange safety netting in a light pine frame", () => {
  assert.equal(defaultParams("wall-mesh").mesh, "orange");
  assert.deepEqual([...getProp("wall-mesh").params.mesh.options], ["orange", "black", "blue"]);
  assert.equal(defaultParams("wall-mesh-port").mesh, "orange");
  assert.equal(defaultParams("wall-door").frame, "wood");
});
