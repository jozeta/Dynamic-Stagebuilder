// The start position on the ground is something you can select ("start"), drag, turn and type in,
// a new stage has one already, and shooting positions are placed one tap after another.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { createStage, newStage, pruneSelection, START_ID } from "../js/model/stage.js";
import { selectionCentre } from "../js/model/camera-move.js";

const withStart = () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "setStart", position: [0, 2], facing: 0 });
  return ed;
};

test("a new stage starts with the start position on the ground, up range in the middle", () => {
  const s = newStage({ name: "Fresh" });
  assert.equal(s.name, "Fresh");
  assert.deepEqual(s.start.position, [0, 1.5]);
  assert.equal(s.start.facing, 0);
  assert.equal(createStage().start, null);       // the plain model still starts empty
});

test("the start can be selected, and stays selected only while there is one", () => {
  const ed = withStart();
  ed.dispatch({ type: "select", ids: [START_ID] });
  assert.deepEqual(ed.state.selection, [START_ID]);
  assert.deepEqual(pruneSelection([START_ID], createStage()), []);
  assert.deepEqual(pruneSelection([START_ID], ed.stage()), [START_ID]);
});

test("dragging the start moves it on the grid, inside the bay, as one undo step", () => {
  const ed = withStart();
  ed.dispatch({ type: "select", ids: [START_ID] });
  ed.dispatch({ type: "dragStart", ids: [START_ID] });
  ed.dispatch({ type: "dragMove", delta: [1.13, 3.04] });
  ed.dispatch({ type: "dragMove", delta: [2.12, 4.1] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(ed.stage().start.position, [2, 6]);
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().start.position, [0, 2]);
  ed.dispatch({ type: "redo" });
  ed.dispatch({ type: "dragStart", ids: [START_ID] });
  ed.dispatch({ type: "dragMove", delta: [-100, -100] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(ed.stage().start.position, [-10, 0]);
});

test("the start moves with props selected with it", () => {
  const ed = withStart();
  ed.dispatch({ type: "place", propType: "barrel", position: [3, 5] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "select", ids: [START_ID, id] });
  ed.dispatch({ type: "dragStart", ids: ed.state.selection });
  ed.dispatch({ type: "dragMove", delta: [1, 1] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(ed.stage().start.position, [1, 3]);
  assert.deepEqual(ed.stage().objects[0].position, [4, 6]);
});

test("the start is turned by the rotate ring, the rotate buttons and a typed angle", () => {
  const ed = withStart();
  ed.dispatch({ type: "select", ids: [START_ID] });
  ed.dispatch({ type: "setRotation", id: START_ID, value: 92 });
  assert.equal(ed.stage().start.facing, 90);              // 15° angle snap
  ed.dispatch({ type: "setRotation", id: START_ID, value: 92, fine: true });
  assert.equal(ed.stage().start.facing, 92);
  ed.dispatch({ type: "rotate", by: 15 });
  assert.equal(ed.stage().start.facing, 105);
  ed.dispatch({ type: "rotate", by: 300 });
  assert.equal(ed.stage().start.facing, 45);              // kept in 0–359
});

test("a typed start position is used exactly, inside the bay", () => {
  const ed = withStart();
  ed.dispatch({ type: "setPosition", id: START_ID, x: "1.23", z: "4.56" });
  assert.deepEqual(ed.stage().start.position, [1.23, 4.56]);
  ed.dispatch({ type: "setPosition", id: START_ID, x: "99", z: "" });
  assert.deepEqual(ed.stage().start.position, [10, 4.56]);
});

test("deleting the selected start removes it (undo brings it back)", () => {
  const ed = withStart();
  ed.dispatch({ type: "select", ids: [START_ID] });
  ed.dispatch({ type: "delete" });
  assert.equal(ed.stage().start, null);
  assert.deepEqual(ed.state.selection, []);
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().start.position, [0, 2]);
});

test("the camera centres on the start when it is selected", () => {
  const ed = withStart();
  assert.deepEqual(selectionCentre(ed.stage(), [START_ID]), [0, 0.8, 2]);
});

test("shooting positions are placed one tap after another until Esc or Enter (cancel)", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "setMode", mode: { place: "shooting-position" } });
  ed.dispatch({ type: "place", propType: "shooting-position", position: [0, 5] });
  ed.dispatch({ type: "place", propType: "shooting-position", position: [3, 8] });
  ed.dispatch({ type: "place", propType: "shooting-position", position: [-3, 11] });
  assert.equal(ed.stage().objects.length, 3);
  assert.deepEqual(ed.stage().objects.map((o) => o.label), ["1", "2", "3"]);
  assert.deepEqual(ed.state.mode, { place: "shooting-position" });     // still placing
  ed.dispatch({ type: "cancel" });
  assert.equal(ed.state.mode, "select");
  // Other props are placed one at a time, as before.
  ed.dispatch({ type: "setMode", mode: { place: "barrel" } });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 9] });
  assert.equal(ed.state.mode, "select");
});
