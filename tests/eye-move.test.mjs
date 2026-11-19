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

test("a figure fades out as the camera comes close, and is gone inside it", async () => {
  const { figureFade, distanceToFigure, FADE_LEVELS } = await import("../js/model/positions.js");
  assert.equal(figureFade(0), 0);
  assert.equal(figureFade(0.3), 0, "inside or touching: gone");
  assert.equal(figureFade(2), 1, "a step away: fully shown");
  const mid = figureFade(0.8);
  assert.ok(mid > 0 && mid < 1);
  for (let d = 0; d < 2; d += 0.05) assert.ok(figureFade(d + 0.05) >= figureFade(d), "fades smoothly with distance");
  assert.equal(distanceToFigure([0, 1.6, 0], [0, 0], 1.8), 0, "the eye at his head: inside");
  assert.ok(Math.abs(distanceToFigure([3, 1, 4], [0, 0], 1.8) - 5) < 1e-9, "beside him: across");
  assert.ok(Math.abs(distanceToFigure([0, 3.8, 0], [0, 0], 1.8) - 2) < 1e-9, "above his head");
  assert.ok(FADE_LEVELS >= 8, "enough steps that the fade looks smooth");
});

test("the walking speed is one of a few named paces, sprint by default", async () => {
  const { WALK_SPEEDS, walkSpeed } = await import("../js/model/route.js");
  assert.deepEqual(WALK_SPEEDS.map((s) => s.id), ["slow", "walk", "quick", "sprint"]);
  assert.equal(walkSpeed("quick").pace, 3.4);
  assert.equal(walkSpeed(undefined).id, "sprint");
  assert.equal(walkSpeed("warp").id, "sprint", "unknown: the default");
  for (let i = 1; i < WALK_SPEEDS.length; i++) assert.ok(WALK_SPEEDS[i].pace > WALK_SPEEDS[i - 1].pace);
});
