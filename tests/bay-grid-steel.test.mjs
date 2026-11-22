// Whole-metre bays, a grid lined up with the bay's edges, one popper with a choice, and plates in
// their two standard sizes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PROPS, upgradeProp, defaultParams, dimensionsOf } from "../js/model/props.js";
import { snapPoint, gridOrigin, gridPhase } from "../js/model/snap.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { cleanLook, LOOK_DEFAULTS, lookDefaults } from "../js/model/look.js";
import { validateStage } from "../js/model/schema.js";

test("one popper prop: IPSC or mini, older mini poppers open as a mini popper", () => {
  assert.equal(PROPS["mini-popper"], undefined);
  assert.deepEqual(PROPS.popper.params.kind.options, ["ipsc", "mini"]);
  assert.equal(defaultParams("popper").kind, "ipsc");
  assert.deepEqual(upgradeProp("mini-popper", { baseHeight: 0.5 }), { type: "popper", params: { baseHeight: 0.5, kind: "mini" } });
  const big = dimensionsOf({ type: "popper", params: { ...defaultParams("popper") } });
  const mini = dimensionsOf({ type: "popper", params: { ...defaultParams("popper"), kind: "mini" } });
  assert.ok(mini.h < big.h, "a mini popper is shorter");
});

test("plates come in their standard sizes: round Ø 20 or 30 cm, square 15 or 30 cm", () => {
  assert.deepEqual(PROPS["plate-round"].params.size.options, [0.2, 0.3]);
  assert.deepEqual(PROPS["plate-square"].params.size.options, [0.15, 0.3]);
  assert.equal(defaultParams("plate-round").size, 0.2);
  assert.equal(defaultParams("plate-square").size, 0.15);
  // A size saved before (any value) opens as the nearest standard size.
  assert.equal(upgradeProp("plate-round", { size: 0.27 }).params.size, 0.3);
  assert.equal(upgradeProp("plate-square", { size: 0.18 }).params.size, 0.15);
  const s = { ...createStage("Plates"), objects: [{ id: "o1", type: "plate-round", position: [0, 5], rotation: 0, label: "S1", params: { size: 0.22, baseHeight: 1, paint: "white" } }] };
  const r = validateStage(JSON.parse(JSON.stringify(s)));
  assert.ok(r.ok, JSON.stringify(r.errors));
  assert.equal(r.stage.objects[0].params.size, 0.2);
});

test("the grid starts at the bay's left edge and the up-range edge", () => {
  assert.deepEqual(gridOrigin({ width: 21, depth: 30 }), [-10.5, 0]);
  assert.deepEqual(snapPoint([0.2, 3.4], 1, [-10.5, 0]), [0.5, 3]);
  assert.deepEqual(snapPoint([0.2, 3.4], 1), [0, 3], "no origin: whole metres as before");
  // A texture whose tiles start at −span/2 (x) lines up with the bay: one tile = tile metres.
  const [ox] = gridPhase({ width: 21, depth: 30 }, 900, 1);
  assert.ok(Math.abs(ox - 0.5) < 1e-9);
  const [ox2] = gridPhase({ width: 20, depth: 30 }, 900, 1);
  assert.ok(Math.abs(ox2) < 1e-9);
});

test("the bay is sized in whole metres, and props snap to the grid that lines up with it", () => {
  const ed = createEditor(createStage("Grid"));
  ed.dispatch({ type: "setBay", width: 20.6, depth: 29.4 });
  assert.equal(ed.stage().bay.width, 21);
  assert.equal(ed.stage().bay.depth, 29);
  ed.dispatch({ type: "setSetting", key: "grid", value: 1 });
  ed.dispatch({ type: "place", propType: "barrel", position: [0.2, 5.1] });
  const o = ed.stage().objects.at(-1);
  assert.deepEqual(o.position, [0.5, 5]);
});

test("the grid can be turned off in Blueprint and Technical, and on in Industrial", () => {
  assert.equal(LOOK_DEFAULTS.gridShown, true);
  assert.equal(cleanLook({ gridShown: false }).gridShown, false);
  assert.equal(cleanLook({ gridShown: "no" }).gridShown, true);
  assert.equal(lookDefaults("industrial").outdoorGrid, false, "Industrial's line grid starts off");
});
