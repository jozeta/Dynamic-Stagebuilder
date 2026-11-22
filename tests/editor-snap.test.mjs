// Editor snapping: walls join walls, grid snap otherwise, Shift for slow fine moves, and the toggles.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";

function twoWalls() {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [0, 5] });       // 1 m walls: ends x = ±0.5
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [4, 5] });
  return { ed, a: ed.stage().objects[0].id, b: ed.stage().objects[1].id };
}
const pos = (ed, id) => ed.stage().objects.find((o) => o.id === id).position;

test("placing a wall next to another joins their ends", () => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [0, 5] });
  ed.dispatch({ type: "place", propType: "wall-mesh", position: [1.2, 5.1] });
  assert.deepEqual(ed.stage().objects[1].position, [1, 5]);
});

test("dragging one wall near another snaps it on", () => {
  const { ed, b } = twoWalls();
  ed.dispatch({ type: "select", ids: [b] });
  ed.dispatch({ type: "dragStart", ids: [b] });
  ed.dispatch({ type: "dragMove", delta: [-2.83, 0.07] });                        // to (1.17, 5.07)
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(pos(ed, b), [1, 5]);
});

test("with object snap off, the grid decides", () => {
  const { ed, b } = twoWalls();
  ed.dispatch({ type: "setSetting", key: "objectSnap", value: false });
  ed.dispatch({ type: "move", id: b, position: [2.17, 5.07] });
  assert.deepEqual(pos(ed, b), [2.25, 5]);
});

test("a fine drag (Shift) is not snapped", () => {
  const { ed, b } = twoWalls();
  ed.dispatch({ type: "dragStart", ids: [b] });
  ed.dispatch({ type: "dragMove", delta: [0.1, 0.07], fine: true });
  ed.dispatch({ type: "dragEnd" });
  const [x, z] = pos(ed, b);
  assert.ok(Math.abs(x - 4.1) < 1e-9 && Math.abs(z - 5.07) < 1e-9, `${x}, ${z}`);
});

test("the grid toggle remembers the last grid size", () => {
  const ed = createEditor();
  ed.dispatch({ type: "setSetting", key: "grid", value: 0.5 });
  ed.dispatch({ type: "toggleGrid" });
  assert.equal(ed.stage().settings.grid, 0);
  ed.dispatch({ type: "toggleGrid" });
  assert.equal(ed.stage().settings.grid, 0.5);
  const fresh = createEditor();
  fresh.dispatch({ type: "setSetting", key: "grid", value: 0 });
  fresh.dispatch({ type: "toggleGrid" });
  assert.equal(fresh.stage().settings.grid, 0.25);
});

import { createDragTracker, FINE_FACTOR } from "../js/render/ground.js";

test("Shift slows the drag to a fifth from where it was pressed, with no jump", () => {
  assert.equal(FINE_FACTOR, 0.2);
  const t = createDragTracker();
  assert.deepEqual(t.update([1, 0], false), [1, 0]);
  assert.deepEqual(t.update([1, 0], true), [1, 0]);        // pressing Shift: no jump
  const [x] = t.update([2, 0], true);                       // one more metre of pointer
  assert.ok(Math.abs(x - 1.2) < 1e-9);
  const [x2] = t.update([2, 0], false);                     // releasing Shift: no jump
  assert.ok(Math.abs(x2 - 1.2) < 1e-9);
  const [x3] = t.update([3, 0], false);
  assert.ok(Math.abs(x3 - 2.2) < 1e-9);
});

