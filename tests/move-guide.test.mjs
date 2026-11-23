// While a prop is dragged: its starting spot marked, a line to where it is now, and how far it has
// moved (metres, one decimal) beside the line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { moveOf } from "../js/model/move-guide.js";

test("the distance moved, in metres with one decimal, and where the text goes", () => {
  const m = moveOf([0, 5], [3, 9]);
  assert.equal(m.distance, 5);
  assert.equal(m.text, "5.0 m");
  assert.deepEqual(m.labelAt, [1.5, 7]);
  assert.equal(moveOf([1, 1], [1.04, 1]).text, "0.0 m");
  assert.equal(moveOf([0, 0], [0.26, 0]).text, "0.3 m");
  assert.equal(moveOf([0, 0], [-2.25, 0]).text, "2.3 m");
});

// Alignment guides: while dragging, a thin line to every other prop that shares the dragged prop's
// x (a line down range) or z (a line across), within 1 cm.
import { alignGuides } from "../js/model/move-guide.js";

test("no guide when nothing is in line", () => {
  assert.deepEqual(alignGuides([2, 5], [[0, 0], [3, 7]]), []);
});

test("a prop with the same x gives a line down range between them", () => {
  assert.deepEqual(alignGuides([2, 5], [[2, 9], [4, 1]]), [{ axis: "z", from: [2, 5], to: [2, 9] }]);
});

test("a prop with the same z gives a line across", () => {
  assert.deepEqual(alignGuides([2, 5], [[-3, 5]]), [{ axis: "x", from: [-3, 5], to: [2, 5] }]);
});

test("one line per axis spans every prop in line, on both sides", () => {
  const g = alignGuides([0, 5], [[0, 1], [0, 9], [0, 3], [6, 5]]);
  assert.deepEqual(g, [{ axis: "z", from: [0, 1], to: [0, 9] }, { axis: "x", from: [0, 5], to: [6, 5] }]);
});

test("within 1 cm counts as in line; 2 cm does not", () => {
  assert.equal(alignGuides([1, 1], [[1.009, 4]]).length, 1);
  assert.equal(alignGuides([1, 1], [[1.02, 4]]).length, 0);
});

test("a prop at the same spot is not a line", () => {
  assert.deepEqual(alignGuides([1, 1], [[1, 1]]), []);
});
