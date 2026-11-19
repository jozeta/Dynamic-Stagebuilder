// Hiding prop categories and single props from the library (Settings → Props).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanHidden, isShown, setShown, LIBRARY_GROUPS } from "../js/model/visibility.js";
import { PROPS } from "../js/model/props.js";

test("the library groups: stage markings first, then every prop category in order", () => {
  assert.deepEqual(LIBRARY_GROUPS.map((g) => g.id), ["markings", "paper", "steel", "moving", "wall", "structure", "obstacle", "building"]);
  const listed = LIBRARY_GROUPS.flatMap((g) => g.items);
  for (const t of Object.keys(PROPS)) assert.ok(listed.includes(t), t);
  assert.deepEqual(LIBRARY_GROUPS[0].items, ["fault-line", "shooting-area", "start", "shooting-position"]);
});

test("a hidden category hides all its props; a hidden prop hides only itself", () => {
  let h = cleanHidden(null);
  assert.deepEqual(h, { categories: [], props: [] });
  assert.ok(isShown(h, "steel", "popper"));
  h = setShown(h, "category", "steel", false);
  assert.equal(isShown(h, "steel", "popper"), false);
  assert.equal(isShown(h, "steel"), false);
  h = setShown(h, "prop", "barrel", false);
  assert.equal(isShown(h, "obstacle", "barrel"), false);
  assert.ok(isShown(h, "obstacle", "tyre"));
  h = setShown(setShown(h, "category", "steel", true), "prop", "barrel", true);
  assert.deepEqual(h, { categories: [], props: [] });
});

test("stored values are cleaned: unknown names, duplicates and junk are dropped", () => {
  const h = cleanHidden({ categories: ["steel", "steel", "nope", 3], props: ["barrel", "__proto__", "car"], extra: 1 });
  assert.deepEqual(h, { categories: ["steel"], props: ["barrel", "car"] });
  assert.deepEqual(cleanHidden("x"), { categories: [], props: [] });
});
