// Angle snap applies while turning a prop with the rotate ring, not only when it is let go; Shift
// turns freely (as it moves freely off the grid).
import { test } from "node:test";
import assert from "node:assert/strict";
import { rotationSnap } from "../js/model/snap.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";

test("the rotate ring turns in the stage's angle steps (radians), freely with Shift or snap off", () => {
  assert.ok(Math.abs(rotationSnap(15) - Math.PI / 12) < 1e-12);
  assert.equal(rotationSnap(15, true), null);
  assert.equal(rotationSnap(0), null);
});

test("letting the ring go snaps to the angle step; with Shift (fine) it keeps the exact angle", () => {
  const ed = createEditor(createStage("R"));
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 5] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setRotation", id, value: 22 });
  assert.equal(ed.stage().objects[0].rotation, 15);
  ed.dispatch({ type: "setRotation", id, value: 22, fine: true });
  assert.equal(ed.stage().objects[0].rotation, 22);
});
