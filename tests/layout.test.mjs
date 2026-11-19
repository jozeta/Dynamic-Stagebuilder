// Resizable side panels: sizes are kept within limits so the 3D view always keeps room.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PANEL_LIMITS, clampPanel, DEFAULT_SIZES } from "../js/model/layout.js";

test("panel sizes are clamped to their limits and leave the 3D view at least 360 px", () => {
  assert.deepEqual(DEFAULT_SIZES, { library: 232, inspector: 280, inspectorHeight: 300 });
  assert.equal(clampPanel("library", 50, 1400), PANEL_LIMITS.library[0]);
  assert.equal(clampPanel("library", 2000, 1400), PANEL_LIMITS.library[1]);
  assert.equal(clampPanel("inspector", 300, 1400), 300);
  // A narrow window: the panel may not squeeze the view below 360 px (other panel at its default).
  assert.ok(clampPanel("inspector", 480, 1000) <= 1000 - 360 - DEFAULT_SIZES.library);
  assert.equal(clampPanel("library", Number.NaN, 1400), DEFAULT_SIZES.library);
  assert.equal(clampPanel("inspectorHeight", 1000, 800), Math.round(800 * 0.6));
  assert.equal(clampPanel("inspectorHeight", 50, 800), PANEL_LIMITS.inspectorHeight[0]);
});

test("a new selection reveals the inspector; the same selection or clearing it doesn't", async () => {
  const { revealOnSelect } = await import("../js/model/layout.js");
  assert.equal(revealOnSelect([], ["a"]), true);
  assert.equal(revealOnSelect(["a"], ["b"]), true);
  assert.equal(revealOnSelect(["a"], ["a", "b"]), true);
  assert.equal(revealOnSelect(["a"], ["a"]), false, "unchanged: you can fold it away while it's selected");
  assert.equal(revealOnSelect(["a"], []), false);
  assert.equal(revealOnSelect(["a", "b"], ["b", "a"]), false, "same items in another order");
});
