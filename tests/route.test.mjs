// The shooter's route: from the start through shooting positions 1, 2, 3…, bending at grab points
// the user adds on the line; drawn on the ground (or a ramp or platform) and walked in Shooter's eye.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, setStart } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { validateStage } from "../js/model/schema.js";
import { createEditor } from "../js/editor.js";
import { surfaceHeight, routeLegs, densify, pointAlong, insertIndex, legLength } from "../js/model/route.js";

const near = (a, b, t = 1e-6, m = "") => assert.ok(Math.abs(a - b) <= t, `${m} ${a} vs ${b}`);
function stage() {
  let s = setStart(createStage(), [0, 2], 0);
  s = addObject(s, "shooting-position", [0, 8]).stage;
  s = addObject(s, "shooting-position", [4, 12]).stage;
  return assignLabels(s);
}

test("the ground is 0, ramps slope up their length, platforms and step boxes are flat on top", () => {
  let s = createStage();
  s = addObject(s, "ramp", [0, 10], 0, { length: 2.4, width: 1, height: 0.4 }).stage;
  s = addObject(s, "platform", [5, 10], 0, { length: 2, width: 1.2, height: 0.6 }).stage;
  s = addObject(s, "ramp", [-5, 10], 90, { length: 2, width: 1, height: 0.5 }).stage;
  near(surfaceHeight(s, 0, 2), 0, 1e-9, "open ground");
  near(surfaceHeight(s, -1.2, 10), 0, 1e-9, "the low end of the ramp (local −x is the shooter's right, world −x)");
  near(surfaceHeight(s, 0, 10), 0.2, 1e-9, "half way up");
  near(surfaceHeight(s, 1.19, 10), 0.4 * (2.39 / 2.4), 1e-9, "near the top");
  near(surfaceHeight(s, 5.5, 10.3), 0.6, 1e-9, "on the platform");
  near(surfaceHeight(s, 0, 11), 0, 1e-9, "beside the ramp");
  // A ramp turned 90°: its length runs down range.
  assert.ok(surfaceHeight(s, -5, 10.9) > 0.4 && surfaceHeight(s, -5, 9.1) < 0.1, "turned ramp rises down range");
});

test("legs run start → 1 → 2, through each position's grab points", () => {
  let s = stage();
  const [p1, p2] = s.objects;
  s = { ...s, objects: s.objects.map((o) => (o.id === p2.id ? { ...o, via: [[2, 9], [3, 11]] } : o)) };
  const legs = routeLegs(s);
  assert.equal(legs.length, 2);
  assert.deepEqual(legs[0], { to: p1.id, from: "start", points: [[0, 2], [0, 8]] });
  assert.deepEqual(legs[1].points, [[0, 8], [2, 9], [3, 11], [4, 12]]);
  assert.equal(legs[1].to, p2.id);
  near(legLength(legs[0].points), 6);
  assert.deepEqual(pointAlong(legs[0].points, 0.5), [0, 5]);
  assert.deepEqual(insertIndex(legs[1].points, [3.6, 11.6]), 2, "a click near the last stretch goes after the second grab point");
  assert.deepEqual(insertIndex(legs[1].points, [1, 8.5]), 0);
  const d = densify([[0, 0], [0, 1]], 0.25);
  assert.equal(d.length, 5);
});

test("grab points: add, drag (one undo step), remove; saved with the stage and checked on load", () => {
  const ed = createEditor({ stage: stage() });
  const p2 = ed.stage().objects[1].id;
  ed.dispatch({ type: "addVia", id: p2, index: 0, point: [2, 9] });
  ed.dispatch({ type: "addVia", id: p2, index: 1, point: [3, 11] });
  assert.deepEqual(ed.stage().objects[1].via, [[2, 9], [3, 11]]);
  const steps = ed.state.history.past.length;
  ed.dispatch({ type: "viaDragStart", id: p2, index: 0 });
  ed.dispatch({ type: "viaDragMove", point: [1.5, 9.5] });
  ed.dispatch({ type: "viaDragMove", point: [1, 10] });
  ed.dispatch({ type: "viaDragEnd" });
  assert.deepEqual(ed.stage().objects[1].via[0], [1, 10]);
  assert.equal(ed.state.history.past.length, steps + 1, "the drag is one undo step");
  ed.dispatch({ type: "removeVia", id: p2, index: 1 });
  assert.deepEqual(ed.stage().objects[1].via, [[1, 10]]);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[1].via.length, 2);
  const json = JSON.parse(JSON.stringify(ed.stage()));
  assert.ok(validateStage(json).ok);
  assert.deepEqual(validateStage(json).stage.objects[1].via, [[1, 10], [3, 11]]);
  json.objects[1].via = [[1, "x"]];
  assert.equal(validateStage(json).ok, false, "bad grab points are refused");
  json.objects[1].via = Array.from({ length: 300 }, () => [0, 5]);
  assert.equal(validateStage(json).ok, false, "too many grab points are refused");
});
