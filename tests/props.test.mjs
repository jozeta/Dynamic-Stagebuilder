// The prop catalogue and the scoring constants: every v1 prop exists with real-world dimensions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PROPS, getProp, defaultParams, dimensionsOf, TARGET_SIZES } from "../js/model/props.js";
import { SCORING } from "../js/model/scoring-rules.js";

const TYPES = ["paper-ipsc", "paper-mini", "noshoot", "noshoot-mini", "popper", "mini-popper",
  "plate-round", "plate-square", "wall-mesh", "wall-mesh-port", "wall-wood", "wall-port", "barrel", "tyre", "tyre-stack", "crate", "plant-palm"];

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
const obj = (type, params = {}) => ({ type, params: { ...defaultParams(type), ...params } });

test("every v1 prop type exists with a category", () => {
  for (const t of TYPES) {
    assert.ok(PROPS[t], t);
    assert.ok(["paper", "steel", "wall", "obstacle"].includes(PROPS[t].category), t);
  }
  assert.equal(Object.keys(PROPS).length, TYPES.length);
});

test("getProp rejects unknown types", () => {
  assert.throws(() => getProp("nope"), /Unknown prop type: nope/);
});

test("scoring kinds", () => {
  assert.equal(getProp("paper-mini").scoring, "paper");
  assert.equal(getProp("plate-round").scoring, "steel");
  assert.equal(getProp("noshoot").scoring, "noshoot");
  assert.equal(getProp("barrel").scoring, null);
});

test("default params of a mesh wall", () => {
  assert.deepEqual(defaultParams("wall-mesh"), { length: 2, height: 2, mesh: "black", frame: "wood" });
});

test("paper target height is mount height plus the target", () => {
  const d = dimensionsOf(obj("paper-ipsc"));
  near(d.h, 1.0 + TARGET_SIZES.ipsc.h);
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
