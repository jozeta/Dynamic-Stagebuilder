// Shooter's eye: the move arrows step a shooting position relative to the way it faces, and the
// camera view is remembered across reloads (validated before use).
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepFrom, STEP } from "../js/model/positions.js";
import { cleanCameraView } from "../js/model/camera-view.js";
import { createEditor } from "../js/editor.js";
import { createStage, addObject } from "../js/model/stage.js";

const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

test("forward is the way the shooter faces; left is the shooter's left", () => {
  assert.ok(near(stepFrom([0, 5], 0, "forward"), [0, 5 + STEP]));
  assert.ok(near(stepFrom([0, 5], 0, "back"), [0, 5 - STEP]));
  assert.ok(near(stepFrom([0, 5], 0, "left"), [STEP, 5]), "+x is the shooter's left looking down range");
  assert.ok(near(stepFrom([0, 5], 0, "right"), [-STEP, 5]));
  assert.ok(near(stepFrom([0, 5], 90, "forward"), [-STEP, 5]));
  assert.ok(near(stepFrom([0, 5], 90, "left"), [0, 5 + STEP]));
});

test("stepping a shooting position is one undo step, unsnapped, and stays in the bay", () => {
  let s = createStage({ width: 10, depth: 10 });
  const r = addObject(s, "shooting-position", [4.9, 5], 0);
  const ed = createEditor({ stage: r.stage });
  ed.dispatch({ type: "stepPosition", id: r.id, dir: "back", step: 0.1 });
  assert.deepEqual(ed.stage().objects[0].position.map((v) => +v.toFixed(6)), [4.9, 4.9], "no grid snap");
  ed.dispatch({ type: "stepPosition", id: r.id, dir: "left" });
  assert.ok(ed.stage().objects[0].position[0] <= 5, "clamped to the bay");
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().objects[0].position.map((v) => +v.toFixed(6)), [4.9, 4.9]);
  const n = ed.stage();
  ed.dispatch({ type: "stepPosition", id: "nope", dir: "left" });
  ed.dispatch({ type: "stepPosition", id: r.id, dir: "up" });
  assert.equal(ed.stage(), n, "unknown position or direction: no change");
});

test("a remembered camera view is used only if it is well formed", () => {
  const v = { position: [1, 2, 3], target: [0, 0, 5], fov: 35 };
  assert.deepEqual(cleanCameraView(v), v);
  assert.deepEqual(cleanCameraView(JSON.parse(JSON.stringify({ ...v, extra: "x" }))), v, "extra fields dropped");
  for (const bad of [null, "x", {}, { ...v, position: [1, 2] }, { ...v, target: [0, "a", 1] }, { ...v, fov: 500 }, { ...v, position: [1e9, 0, 0] }, { ...v, position: [1, 2, 3], target: [1, 2, 3] }]) {
    assert.equal(cleanCameraView(bad), null, JSON.stringify(bad));
  }
});
