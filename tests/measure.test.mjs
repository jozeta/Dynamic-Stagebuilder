// The measuring tool: two points on the ground, snapped to props, the distance between them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, setStart } from "../js/model/stage.js";
import { createEditor } from "../js/editor.js";
import { snapMeasure, measureText, distance } from "../js/model/measure.js";

test("a point near a prop (or the start) snaps to its centre; Shift-free points elsewhere stay put", () => {
  let s = setStart(createStage({ width: 20, depth: 20 }), [0, 1], 0);
  const r = addObject(s, "paper-ipsc", [3, 10]); s = r.stage;
  assert.deepEqual(snapMeasure(s, [3.2, 10.1]), { point: [3, 10], on: r.id });
  assert.deepEqual(snapMeasure(s, [0.1, 1.2]), { point: [0, 1], on: "start" });
  assert.deepEqual(snapMeasure(s, [6, 6]), { point: [6, 6], on: null });
  assert.deepEqual(snapMeasure(s, [3.2, 10.1], { fine: true }), { point: [3.2, 10.1], on: null }, "Shift: no snapping");
});

test("distances read in metres, to the centimetre", () => {
  assert.equal(distance([0, 0], [3, 4]), 5);
  assert.equal(measureText([0, 0], [3, 4]), "5.00 m");
  assert.equal(measureText([0, 0], [0, 12.345]), "12.35 m");
});

test("measuring: two taps make a measurement; more can follow; Clear and Escape remove them; the stage never changes", () => {
  let s = createStage({ width: 20, depth: 20 });
  s = addObject(s, "paper-ipsc", [3, 10]).stage;
  const ed = createEditor({ stage: s });
  const before = ed.stage();
  ed.dispatch({ type: "beginMeasure" });
  assert.ok(ed.state.mode.measure);
  ed.dispatch({ type: "addMeasurePoint", point: [0, 2] });
  assert.deepEqual(ed.state.mode.from, [0, 2]);
  ed.dispatch({ type: "addMeasurePoint", point: [3.1, 9.9] });
  assert.deepEqual(ed.state.measures, [{ a: [0, 2], b: [3, 10] }], "the second point snapped to the target");
  assert.equal(ed.state.mode.from, null, "ready for the next one");
  ed.dispatch({ type: "addMeasurePoint", point: [5, 5] });
  ed.dispatch({ type: "addMeasurePoint", point: [5, 8] });
  assert.equal(ed.state.measures.length, 2);
  assert.equal(ed.stage(), before, "measuring isn't an edit");
  ed.dispatch({ type: "clearMeasures" });
  assert.deepEqual(ed.state.measures, []);
  ed.dispatch({ type: "addMeasurePoint", point: [1, 1] });
  ed.dispatch({ type: "addMeasurePoint", point: [1, 4] });
  ed.dispatch({ type: "cancel" });
  assert.equal(ed.state.mode, "select");
  assert.deepEqual(ed.state.measures, [], "Escape leaves measuring and clears it");
});
