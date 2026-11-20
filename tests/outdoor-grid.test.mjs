// The Outdoor ground grid: 1 m squares (bold every 5 m) lying on the ground, off by default, with
// its own transparency. A look setting: saved with the stage, never an undo step.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOK_DEFAULTS, cleanLook } from "../js/model/look.js";

test("the grid is off by default and its transparency is kept between 0 and 1", () => {
  assert.equal(LOOK_DEFAULTS.outdoorGrid, false);
  assert.equal(LOOK_DEFAULTS.outdoorGridOpacity, 0.35);
  assert.equal(cleanLook({ outdoorGrid: true, outdoorGridOpacity: 3 }).outdoorGridOpacity, 1);
  assert.equal(cleanLook({ outdoorGrid: "yes" }).outdoorGrid, false);
});

test("Outdoor draws the grid over the bay when it is on, at the chosen transparency, lying on the ground", async () => {
  const { outdoor } = await import("../js/render/environments/outdoor.js");
  const { applyLook } = await import("../js/render/environments/common.js");
  const env = outdoor({ width: 10, depth: 12 });
  const grid = env.group.getObjectByName("ground-grid");
  assert.ok(grid, "a grid");
  assert.equal(grid.visible, false, "off by default");
  applyLook(env, { ...LOOK_DEFAULTS, outdoorGrid: true, outdoorGridOpacity: 0.6 }, { width: 10, depth: 12 });
  assert.equal(grid.visible, true);
  const mats = new Set();
  grid.traverse((o) => { if (o.material) mats.add(o.material); });
  assert.ok([...mats].some((m) => Math.abs(m.opacity - 0.6) < 1e-9), "the fine lines at the chosen opacity");
  let minY = Infinity;
  grid.traverse((o) => { const p = o.geometry?.attributes?.position; if (p) for (let i = 0; i < p.count; i++) minY = Math.min(minY, p.getY(i)); });
  assert.ok(minY > 0 && minY < 0.1, "just above the floor");
});
