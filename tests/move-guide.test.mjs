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
