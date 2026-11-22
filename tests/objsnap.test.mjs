// Snapping a wall's end onto the nearest end of another wall, so walls join edge to edge.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject } from "../js/model/stage.js";
import { wallEnds, snapToObjects, SNAP_RADIUS } from "../js/model/objsnap.js";

const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);
const wall = (position, rotation = 0, length = 2, type = "wall-mesh") => ({ id: "m", type, position, rotation, params: { length } });

test("wall ends lie half a length either side along the wall", () => {
  const [a, b] = wallEnds(wall([0, 5], 0, 2));
  assert.ok(near(a, [-1, 5]) && near(b, [1, 5]));
  const [c, d] = wallEnds(wall([0, 5], 90, 2));
  assert.ok(near(c, [0, 4]) && near(d, [0, 6]));
  assert.equal(wallEnds({ type: "barrel", position: [0, 0], params: {} }), null);
});

test("a wall dropped near another wall's end joins it exactly", () => {
  const s = addObject(createStage(), "wall-mesh", [0, 5], 0, { length: 2 }).stage;   // ends at x = ±1
  const r = snapToObjects(s, wall([2.2, 5.1], 0), [2.2, 5.1]);        // moving wall's left end at 1.2
  assert.equal(r.snapped, true);
  assert.ok(near(r.position, [2, 5]), String(r.position));
});

test("walls at an angle join at the corner", () => {
  const s = addObject(createStage(), "wall-mesh", [0, 5], 0, { length: 2 }).stage;   // right end (1, 5)
  const r = snapToObjects(s, wall([1.1, 6.1], 90), [1.1, 6.1]);       // its lower end (1.1, 5.1)
  assert.ok(near(r.position, [1, 6]), String(r.position));
});

test("nothing within reach, other props, and the wall itself don't snap", () => {
  const { stage: s, id } = addObject(createStage(), "wall-mesh", [0, 5], 0, { length: 2 });
  assert.equal(snapToObjects(s, wall([3, 5]), [3, 5]).snapped, false);
  assert.ok(SNAP_RADIUS >= 0.3 && SNAP_RADIUS <= 0.4);
  assert.equal(snapToObjects(s, { id: "b", type: "barrel", position: [1.1, 5], rotation: 0, params: {} }, [1.1, 5]).snapped, false);
  assert.equal(snapToObjects(s, { ...s.objects[0], id }, [0.1, 5]).snapped, false);
});

test("a mesh wall with port and wooden walls snap too", () => {
  const s = addObject(createStage(), "wall-wood", [0, 5], 0, { length: 2 }).stage;
  assert.equal(snapToObjects(s, { ...wall([2.1, 5], 0, 2), params: { length: 2, variant: "port" } }, [2.1, 5]).snapped, true);
});

test("a parallel wall close behind another does not jump onto it", () => {
  const s = addObject(createStage(), "wall-mesh", [0, 5], 0, { length: 2 }).stage;
  assert.equal(snapToObjects(s, wall([0.1, 5.3]), [0.1, 5.3]).snapped, false);
  assert.equal(snapToObjects(s, wall([0, 5.2], 0, 1.8), [0, 5.2]).snapped, false);
});

test("a smaller reach leaves a gap open", () => {
  const s = addObject(createStage(), "wall-mesh", [0, 5], 0, { length: 2 }).stage;   // right end x = 1
  assert.equal(snapToObjects(s, wall([2.25, 5]), [2.25, 5], 0.25 * 0.8).snapped, false);   // 25 cm gap
  assert.equal(snapToObjects(s, wall([2.1, 5]), [2.1, 5], 0.25 * 0.8).snapped, true);
});
