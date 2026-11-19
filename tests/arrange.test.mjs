// Exact positions, mirroring, aligning and spreading props evenly: undoable editor actions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { mirrorStage, alignObjects, distributeObjects } from "../js/model/arrange.js";
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";

const three = () => {
  let s = createStage({ width: 20, depth: 30 });
  const ids = [];
  for (const [p, r] of [[[-4, 6], 30], [[1, 9], 0], [[5, 14], 90]]) { const a = addObject(s, "paper-ipsc", p, r); s = a.stage; ids.push(a.id); }
  return { s, ids };
};

test("a typed-in position is used exactly (no grid snap), kept inside the bay, and undoable", () => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [1, 5] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setPosition", id, x: 2.37, z: 7.11 });
  assert.deepEqual(ed.stage().objects[0].position, [2.37, 7.11]);
  ed.dispatch({ type: "setPosition", id, x: 99, z: -3 });
  assert.deepEqual(ed.stage().objects[0].position, [ed.stage().bay.width / 2, 0], "clamped to the bay");
  ed.dispatch({ type: "setPosition", id, x: "abc", z: 4 });
  assert.equal(ed.stage().objects[0].position[1], 4, "a bad number keeps the old value");
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().objects[0].position, [ed.stage().bay.width / 2, 0]);
});

test("mirroring the whole stage flips it left to right about the bay centre", () => {
  let { s, ids } = three();
  s = addLine(s, "fault-line", [[-2, 3], [3, 3]], false).stage;
  s = setStart(s, [2, 1], 20);
  s = { ...s, objects: s.objects.map((o) => (o.id === ids[0] ? { ...o, params: { ...o.params } } : o)) };
  const m = mirrorStage(s, null);
  assert.deepEqual(m.objects.map((o) => o.position), [[4, 6], [-1, 9], [-5, 14]]);
  assert.deepEqual(m.objects.map((o) => o.rotation), [330, 0, 270]);
  assert.deepEqual(m.lines[0].points, [[2, 3], [-3, 3]]);
  assert.deepEqual(m.start.position, [-2, 1]);
  assert.equal(m.start.facing, 340);
  assert.deepEqual(mirrorStage(m, null).objects.map((o) => o.position), s.objects.map((o) => o.position), "twice is the original");
});

test("mirroring a selection flips it about its own centre and swaps hinge sides", () => {
  let s = createStage();
  const a = addObject(s, "paper-ipsc", [0, 5]); s = a.stage;
  const b = addObject(s, "door", [4, 5], 0, { hinge: "left" }); s = b.stage;
  const c = addObject(s, "paper-ipsc", [8, 5]); s = c.stage;
  const m = mirrorStage(s, [a.id, b.id]);
  assert.deepEqual(m.objects.map((o) => o.position), [[4, 5], [0, 5], [8, 5]], "centre 2; the third stays");
  assert.equal(m.objects[1].params.hinge, "right");
});

test("align lines props up by their left, centre or right (x) or front, middle or back (z)", () => {
  const { s, ids } = three();
  assert.deepEqual(alignObjects(s, ids, "left").objects.map((o) => o.position[0]), [-4, -4, -4]);
  assert.deepEqual(alignObjects(s, ids, "right").objects.map((o) => o.position[0]), [5, 5, 5]);
  assert.deepEqual(alignObjects(s, ids, "front").objects.map((o) => o.position[1]), [6, 6, 6], "front = up range, nearest the shooter");
  assert.deepEqual(alignObjects(s, ids, "back").objects.map((o) => o.position[1]), [14, 14, 14]);
  assert.deepEqual(alignObjects(s, ids, "centre-x").objects.map((o) => o.position[0]), [0.5, 0.5, 0.5]);
  assert.deepEqual(alignObjects(s, ids, "middle-z").objects.map((o) => o.position[1]), [10, 10, 10]);
});

test("spreading evenly keeps the outer two and spaces the rest equally", () => {
  const { s, ids } = three();
  assert.deepEqual(distributeObjects(s, ids, "x").objects.map((o) => o.position[0]), [-4, 0.5, 5]);
  assert.deepEqual(distributeObjects(s, ids, "z").objects.map((o) => o.position[1]), [6, 10, 14]);
  assert.equal(distributeObjects(s, ids.slice(0, 2), "x"), s, "needs three or more");
});

test("the editor's arrange actions skip locked props and are one undo step each", () => {
  const ed = createEditor();
  for (const p of [[-4, 6], [1, 9], [5, 14]]) ed.dispatch({ type: "place", propType: "paper-ipsc", position: p });
  const ids = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "setLocked", ids: [ids[1]], locked: true });
  ed.dispatch({ type: "align", ids, edge: "left" });
  assert.deepEqual(ed.stage().objects.map((o) => o.position[0]), [-4, 1, -4]);
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().objects.map((o) => o.position[0]), [-4, 1, 5]);
  ed.dispatch({ type: "select", ids: [] });
  ed.dispatch({ type: "mirror" });
  assert.deepEqual(ed.stage().objects.map((o) => o.position[0]), [4, 1, -5], "the whole stage, the locked one stays");
});
