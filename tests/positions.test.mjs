// Shooting positions: numbered points where the shooter stands (or kneels, sits, lies), each with
// a facing, a look-up/down angle and a stance; the shooter's-eye camera steps through them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { STANCES, eyeHeight, viewFromPosition, anglesFromView, shootingPositions } from "../js/model/positions.js";
import { PROPS, defaultParams, dimensionsOf } from "../js/model/props.js";
import { createStage, addObject } from "../js/model/stage.js";
import { assignLabels, renumber } from "../js/model/numbering.js";
import { stageStats } from "../js/model/stats.js";
import { validateStage } from "../js/model/schema.js";
import { mapModel } from "../js/model/map.js";
import { buildProp } from "../js/render/builders/index.js";
import { createEditor } from "../js/editor.js";

const near = (a, b, t = 1e-6, m = "") => assert.ok(Math.abs(a - b) <= t, `${m} ${a} vs ${b}`);
const pos = (params = {}, rotation = 0, at = [0, 5]) => ({ id: "sp", type: "shooting-position", position: at, rotation, params: { ...defaultParams("shooting-position"), ...params } });

test("a shooting position is a stage marking with a stance and a look angle", () => {
  const def = PROPS["shooting-position"];
  assert.equal(def.category, "marking");
  assert.deepEqual(def.params.stance.options, STANCES.map((s) => s.id));
  assert.deepEqual(STANCES.map((s) => s.id), ["standing", "crouching", "kneeling", "sitting", "prone"]);
  assert.equal(defaultParams("shooting-position").stance, "standing");
  assert.equal(defaultParams("shooting-position").pitch, 0);
});

test("eye heights follow the stance", () => {
  assert.equal(eyeHeight("standing"), 1.6);
  assert.ok(eyeHeight("crouching") < 1.3 && eyeHeight("crouching") > eyeHeight("kneeling"));
  assert.ok(eyeHeight("prone") < 0.4);
});

test("the view from a position looks the way it faces; the angles round-trip", () => {
  const v = viewFromPosition(pos({}, 0, [2, 5]));
  assert.deepEqual(v.eye, [2, 1.6, 5]);
  assert.ok(v.target[2] > 5 && Math.abs(v.target[0] - 2) < 1e-9, "rotation 0 looks down range");
  for (const [r, p] of [[0, 0], [90, -10], [215, 12], [330, -30]]) {
    const view = viewFromPosition(pos({ pitch: p }, r));
    const a = anglesFromView(view.eye, view.target);
    near(a.rotation, r, 1e-6, "rotation");
    near(a.pitch, p, 1e-6, "pitch");
  }
});

test("positions are numbered 1, 2, 3 and kept in that order; they are not targets", () => {
  let s = createStage();
  for (const x of [0, 1, 2]) s = addObject(s, "shooting-position", [x, 3]).stage;
  s = addObject(s, "paper-ipsc", [0, 10]).stage;
  s = assignLabels(s);
  assert.deepEqual(s.objects.map((o) => o.label), ["1", "2", "3", "T1"]);
  assert.deepEqual(renumber(s).objects.map((o) => o.label), ["1", "2", "3", "T1"]);
  assert.deepEqual(shootingPositions(s).map((o) => o.label), ["1", "2", "3"]);
  const st = stageStats(s);
  assert.equal(st.paper, 1);
  assert.equal(st.minRounds, 2);
  assert.ok(validateStage(JSON.parse(JSON.stringify(s))).ok);
  const labels = mapModel(s, { width: 186, height: 120, region: "content" }).items.filter((i) => i.kind === "label").map((i) => i.text);
  assert.ok(labels.includes("2"), "positions appear on the map");
});

for (const stance of ["standing", "crouching", "kneeling", "sitting", "prone"]) {
  test(`a ${stance} shooting position is drawn at its real size`, () => {
    const o = pos({ stance });
    const b = new Box3().setFromObject(buildProp(o));
    const s = b.getSize(new Vector3()), d = dimensionsOf(o);
    near(s.x, d.w, 0.01, "width"); near(s.y, d.h, 0.01, "height"); near(s.z, d.d, 0.01, "depth");
    near(b.min.y, 0, 0.002, "on the ground");
  });
}

test("Save view stores the facing and look angle in one undo step", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "shooting-position", position: [0, 4] });
  const id = ed.stage().objects[0].id;
  const steps = ed.state.history.past.length;
  ed.dispatch({ type: "setView", id, rotation: 30, pitch: -8 });
  const o = ed.stage().objects[0];
  assert.equal(o.rotation, 30);
  assert.equal(o.params.pitch, -8);
  assert.equal(ed.state.history.past.length, steps + 1);
});
