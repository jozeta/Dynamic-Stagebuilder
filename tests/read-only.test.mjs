// A view link opens the stage read-only: looking around (select, measure, the look and surroundings)
// works; every edit is ignored, so the stage stays as it was shared.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { createStage, addObject } from "../js/model/stage.js";

test("read-only: edits do nothing, looking around still works", () => {
  const { stage, id } = addObject(createStage(), "barrel", [0, 5]);
  const ed = createEditor({ stage });
  ed.setReadOnly(true);
  const before = ed.stage();
  ed.dispatch({ type: "select", ids: [id] });
  assert.deepEqual(ed.state.selection, [id]);
  for (const a of [{ type: "delete" }, { type: "move", id, position: [3, 3] }, { type: "place", propType: "barrel", position: [1, 1] },
    { type: "rename", name: "X" }, { type: "dragStart", ids: [id] }, { type: "dragMove", delta: [1, 1] }, { type: "dragEnd" }, { type: "setBriefing", patch: { notes: "x" } }])
    ed.dispatch(a);
  assert.equal(ed.stage(), before, "the stage is untouched");
  ed.dispatch({ type: "setLook", patch: { hour: 19 } });
  assert.equal(ed.stage().settings.look.hour, 19, "the look is a view choice");
  ed.dispatch({ type: "beginMeasure" });
  assert.ok(ed.state.mode.measure);
});

test("leaving read-only lets edits through again", () => {
  const ed = createEditor({ stage: createStage() });
  ed.setReadOnly(true);
  ed.dispatch({ type: "rename", name: "No" });
  ed.setReadOnly(false);
  ed.dispatch({ type: "rename", name: "Yes" });
  assert.equal(ed.stage().name, "Yes");
  assert.equal(ed.readOnly, false);
});
