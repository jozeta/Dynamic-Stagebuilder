// Side panels: what brings the inspector into view.
import { test } from "node:test";
import assert from "node:assert/strict";

test("a new selection reveals the inspector; the same selection or clearing it doesn't", async () => {
  const { revealOnSelect } = await import("../js/model/layout.js");
  assert.equal(revealOnSelect([], ["a"]), true);
  assert.equal(revealOnSelect(["a"], ["b"]), true);
  assert.equal(revealOnSelect(["a"], ["a", "b"]), true);
  assert.equal(revealOnSelect(["a"], ["a"]), false, "unchanged: you can fold it away while it's selected");
  assert.equal(revealOnSelect(["a"], []), false);
  assert.equal(revealOnSelect(["a", "b"], ["b", "a"]), false, "same items in another order");
});
