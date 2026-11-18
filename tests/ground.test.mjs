// Where a pointer ray meets the ground (y = 0).
import { test } from "node:test";
import assert from "node:assert/strict";
import { groundPoint } from "../js/render/ground.js";

test("straight down hits right below", () => assert.deepEqual(groundPoint([0, 10, 0], [0, -1, 0]), [0, 0]));
test("a level ray never hits the ground", () => assert.equal(groundPoint([0, 1.6, 0], [0, 0, 1]), null));
test("a ray pointing up never hits the ground", () => assert.equal(groundPoint([0, 1, 0], [0, 1, 1]), null));
test("a 45° ray from 2 m lands 2 m away", () => {
  const [x, z] = groundPoint([1, 2, 3], [0, -Math.SQRT1_2, Math.SQRT1_2]);
  assert.ok(Math.abs(x - 1) < 1e-9 && Math.abs(z - 5) < 1e-9);
});
