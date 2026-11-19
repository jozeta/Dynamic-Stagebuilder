// The man at the start position: posed from the briefing, holstered or not, facing, and the view.
import { test } from "node:test";
import assert from "node:assert/strict";
import { startPoseFor, holsteredAtStart, startFacing, startLook, startEye, startFigureSize } from "../js/model/start-pose.js";
import { BRIEFING_OPTIONS } from "../js/model/briefing-options.js";
import { createEditor } from "../js/editor.js";
import { createStage, setStart } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";

test("every briefing start position gets the pose it describes", () => {
  const want = {
    "Standing in the start box, heels touching the marks, wrists above the shoulders": "hands-up",
    "Standing in the start box, arms hanging naturally at the sides": "relaxed",
    "Standing in the start box, facing up range, arms hanging naturally": "relaxed",
    "Standing in the start box, hands touching the marks on the wall": "hands-on-wall",
    "Seated on the chair, hands flat on the thighs": "seated",
    "Kneeling in the start box, hands on the knees": "kneeling",
    "Standing anywhere in the shooting area, wrists above the shoulders": "hands-up",
    "Standing with toes touching the X marks, hands on the head": "hands-on-head",
    "Standing with heels touching the X marks, facing up range, arms hanging naturally": "relaxed",
    "Standing with palms touching the X marks on the wall": "hands-on-wall",
    "Seated on the chair, pistol in the closed gun case on the table, hands flat on the thighs": "seated",
  };
  for (const text of BRIEFING_OPTIONS.startPosition) assert.equal(startPoseFor({ startPosition: text }), want[text], text);
  assert.equal(startPoseFor({}), "relaxed");
  assert.equal(startPoseFor({ startPosition: "Something new" }), "relaxed");
});

test("the pistol is holstered unless it starts on a table, in a box or a case", () => {
  assert.equal(holsteredAtStart({}), true);
  assert.equal(holsteredAtStart({ gunCondition: "Loaded and holstered, ready condition" }), true);
  assert.equal(holsteredAtStart({ gunCondition: "Unloaded on the table, slide forward, magazines in the pouches" }), false);
  assert.equal(holsteredAtStart({ gunCondition: "Unloaded in the closed gun case on the table, magazines in the pouches" }), false);
});

test("a man stands on the ground, at his height; seated and kneeling are lower", () => {
  const up = startFigureSize({ startPosition: "wrists above the shoulders" });
  assert.ok(up.h > 1.8 && up.h < 1.86, `hands up: ${up.h}`);
  assert.ok(startFigureSize({ startPosition: "Seated on the chair" }).h < 1.35);
  assert.ok(startEye({ startPosition: "Kneeling" }) < 1.3 && startEye({}) === 1.6);
});

test("facing up range in the text turns him round; a saved view wins for Shooter's eye", () => {
  let s = setStart(createStage(), [0, 1], 0);
  assert.equal(startFacing(s), 0);
  s = { ...s, briefing: { ...s.briefing, startPosition: "Standing, facing up range, arms hanging naturally" } };
  assert.equal(startFacing(s), 180);
  assert.equal(startFacing({ ...s, start: { ...s.start, facing: 180 } }), 180, "already facing up range");
  assert.deepEqual(startLook(s), { yaw: 180, pitch: 0 });
  assert.deepEqual(startLook({ ...s, start: { ...s.start, view: { yaw: 20, pitch: -5 } } }), { yaw: 20, pitch: -5 });
});

test("looking around at the start saves the view in one undo step, kept by moves, valid on import", () => {
  const ed = createEditor({ stage: setStart(createStage(), [0, 1], 0) });
  ed.dispatch({ type: "setStartView", rotation: 30, pitch: -4 });
  assert.deepEqual(ed.stage().start.view, { yaw: 30, pitch: -4 });
  ed.dispatch({ type: "setStart", position: [1, 1], facing: 0 });
  assert.deepEqual(ed.stage().start.view, { yaw: 30, pitch: -4 }, "moving the box keeps the view");
  ed.dispatch({ type: "undo" }); ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().start.view, undefined);
  ed.dispatch({ type: "setStartView", rotation: 30, pitch: -4 });
  const r = validateStage(JSON.parse(JSON.stringify(ed.stage())));
  assert.ok(r.ok);
  assert.deepEqual(r.stage.start.view, { yaw: 30, pitch: -4 });
  const bad = validateStage({ ...JSON.parse(JSON.stringify(ed.stage())), start: { position: [0, 1], facing: 0, view: { yaw: "x", pitch: 0 } } });
  assert.equal(bad.ok, false);
});
