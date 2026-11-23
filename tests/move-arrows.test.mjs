// The move arrows on a selected prop: dragging an arrow moves it along that axis only; the up arrow
// raises or lowers props that have a height (steel base height, a paper target's stand).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { liftParam } from "../js/model/props.js";

const one = (type, position = [0, 10]) => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: type, position });
  return { ed, id: ed.stage().objects[0].id };
};

test("an arrow drag moves the prop along that axis only, as one undo step", () => {
  const { ed, id } = one("barrel");
  ed.dispatch({ type: "dragStart", ids: [id] });
  ed.dispatch({ type: "dragMove", delta: [2.1, 3.2], axis: "x" });
  assert.deepEqual(ed.stage().objects[0].position, [2, 10]);
  ed.dispatch({ type: "dragMove", delta: [2.1, 3.2], axis: "z" });
  assert.deepEqual(ed.stage().objects[0].position, [0, 13.25]);
  ed.dispatch({ type: "dragEnd" });
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().objects[0].position, [0, 10]);
});

test("an axis drag holds the other axis even when a wall end would snap it", () => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [0, 10] });
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [3, 12] });
  const id = ed.stage().objects[1].id;
  ed.dispatch({ type: "dragStart", ids: [id] });
  ed.dispatch({ type: "dragMove", delta: [-2, -1.9], axis: "x" });
  assert.equal(ed.stage().objects[1].position[1], 12);
  ed.dispatch({ type: "dragEnd" });
});

test("which height the up arrow changes", () => {
  assert.equal(liftParam("popper"), "baseHeight");
  assert.equal(liftParam("plate-round"), "baseHeight");
  assert.equal(liftParam("paper-ipsc"), "mountHeight");
  assert.equal(liftParam("barrel"), null);
  assert.equal(liftParam("wall-mesh"), null);
});

test("the up arrow lifts steel in whole centimetres, within its limits, as one undo step", () => {
  const { ed, id } = one("plate-round");
  const was = ed.stage().objects[0].params.baseHeight;
  ed.dispatch({ type: "liftStart", id });
  ed.dispatch({ type: "liftMove", by: 0.234 });
  ed.dispatch({ type: "liftMove", by: 0.3149 });
  assert.equal(ed.stage().objects[0].params.baseHeight, Math.round((was + 0.3149) * 100) / 100);
  ed.dispatch({ type: "liftMove", by: 10 });
  assert.equal(ed.stage().objects[0].params.baseHeight, 1.5);       // the plate's highest
  ed.dispatch({ type: "liftEnd" });
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[0].params.baseHeight, was);
});

test("a prop without a height doesn't lift", () => {
  const { ed, id } = one("barrel");
  const before = ed.stage();
  ed.dispatch({ type: "liftStart", id });
  ed.dispatch({ type: "liftMove", by: 1 });
  ed.dispatch({ type: "liftEnd" });
  assert.equal(ed.stage(), before);
});
