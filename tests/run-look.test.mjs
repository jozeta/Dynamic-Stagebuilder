// Settings → View: how the shooter's run (figures, position marks, route) is drawn, part by part.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanRunLook, withRunPart, RUN_LOOK_DEFAULTS, RUN_COLORS, RUN_PARTS } from "../js/model/run-look.js";

test("figures, position marks and the route are shown in light grey by default", () => {
  const d = cleanRunLook(undefined);
  assert.deepEqual(RUN_PARTS.map((p) => p.id), ["figure", "mark", "route"]);
  for (const { id } of RUN_PARTS) assert.deepEqual(d[id], { ...RUN_LOOK_DEFAULTS[id] });
  assert.equal(RUN_COLORS[0].hex, d.figure.color);
  assert.ok(d.figure.opacity < d.mark.opacity && d.mark.opacity < d.route.opacity, "figures the most see-through");
});

test("each part has its own colour, see-through and show/hide", () => {
  let look = cleanRunLook(null);
  look = withRunPart(look, "route", { color: "#FF9A2E", show: false });
  look = withRunPart(look, "figure", { opacity: 0.8 });
  assert.deepEqual(look.route, { show: false, opacity: 0.7, color: "#ff9a2e" });
  assert.deepEqual(look.figure, { show: true, opacity: 0.8, color: "#d4d8de" });
  assert.deepEqual(look.mark, { ...RUN_LOOK_DEFAULTS.mark }, "the others are untouched");
});

test("a stored run look is checked before use", () => {
  const bad = cleanRunLook({ figure: { show: "no", opacity: 7, color: "red" }, mark: { opacity: 0 }, route: "x", extra: 1 });
  assert.deepEqual(bad.figure, { show: true, opacity: 1, color: "#d4d8de" });
  assert.equal(bad.mark.opacity, 0.1, "never fully invisible: use Show for that");
  assert.deepEqual(bad.route, { ...RUN_LOOK_DEFAULTS.route });
  assert.equal(bad.extra, undefined);
  assert.equal(cleanRunLook({ figure: { opacity: NaN } }).figure.opacity, 0.5);
});
