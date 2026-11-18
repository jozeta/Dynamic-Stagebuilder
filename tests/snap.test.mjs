// Grid and angle snapping, and keeping objects inside the bay.
import { test } from "node:test";
import assert from "node:assert/strict";
import { snapValue, snapPoint, normalizeAngle, snapAngle, clampToBay } from "../js/model/snap.js";

test("snapValue rounds to the grid", () => {
  assert.equal(snapValue(0.3, 0.25), 0.25);
  assert.equal(snapValue(0.13, 0.25), 0.25);
  assert.equal(snapValue(-0.13, 0.25), -0.25);
  assert.equal(snapValue(0.37, 0), 0.37);
  assert.equal(snapValue(0.1 + 0.2, 0.1), 0.3);
});

test("snapPoint snaps both axes", () => {
  assert.deepEqual(snapPoint([1.12, 3.13], 0.25), [1, 3.25]);
});

test("angles wrap into [0, 360)", () => {
  assert.equal(normalizeAngle(-15), 345);
  assert.equal(normalizeAngle(360), 0);
  assert.equal(snapAngle(345 + 30, 15), 15);
  assert.equal(snapAngle(-15, 15), 345);
  assert.equal(snapAngle(7, 15), 0);
  let a = 0;
  for (let i = 0; i < 24; i++) a = snapAngle(a + 15, 15);
  assert.equal(a, 0);
  assert.equal(snapAngle(-0.0001, 0), 359.9999);
});

test("clampToBay keeps points inside the bay", () => {
  const bay = { width: 20, depth: 30 };
  assert.deepEqual(clampToBay([12, -1], bay), [10, 0]);
  assert.deepEqual(clampToBay([0, 31], bay, 0.5), [0, 29.5]);
  assert.deepEqual(clampToBay([-3, 4], bay), [-3, 4]);
});
