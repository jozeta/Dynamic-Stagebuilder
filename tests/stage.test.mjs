// The stage model: pure functions that return a new stage and never change their input.
import { test } from "node:test";
import { LOOK_DEFAULTS } from "../js/model/look.js";
import assert from "node:assert/strict";
import { createStage, addObject, updateObject, removeObjects, duplicateObjects, addLine, updateLine,
  setStart, setSetting, setBay, pruneSelection } from "../js/model/stage.js";

test("createStage defaults", () => {
  const s = createStage();
  assert.equal(s.schema, 1);
  assert.equal(s.name, "Stage 1");
  assert.deepEqual(s.bay, { width: 20, depth: 30 });
  assert.deepEqual(s.settings, { grid: 0.25, angleSnap: 15, environment: "outdoor", objectSnap: true, look: { ...LOOK_DEFAULTS } });
  assert.deepEqual(s.objects, []);
  assert.deepEqual(s.lines, []);
  assert.equal(s.start, null);
  assert.equal(s.camera, null);
  assert.equal(s.briefing.startSignal, "Audible");
  assert.equal(s.briefing.stopTime, "Last shot");
  assert.equal(s.briefing.scoring, "Comstock");
  assert.equal(s.briefing.stageNumber, 1);
  assert.equal(typeof s.id, "string");
});

test("addObject returns a new stage and leaves the input alone", () => {
  const s = createStage();
  const before = structuredClone(s);
  const { stage, id } = addObject(s, "wall-mesh", [1, 2], 30);
  assert.deepEqual(s, before);
  const o = stage.objects[0];
  assert.equal(o.id, id);
  assert.deepEqual(o.position, [1, 2]);
  assert.equal(o.rotation, 30);
  assert.deepEqual(o.params, { length: 2, height: 2, mesh: "black", frame: "wood" });
  assert.equal(o.label, null);
  assert.equal(o.labelManual, false);
});

test("updateObject merges params", () => {
  const { stage, id } = addObject(createStage(), "wall-mesh", [0, 0]);
  const next = updateObject(stage, id, { params: { length: 3 }, rotation: 90 });
  assert.equal(next.objects[0].params.length, 3);
  assert.equal(next.objects[0].params.mesh, "black");
  assert.equal(next.objects[0].rotation, 90);
  assert.equal(stage.objects[0].params.length, 2);
});

test("removeObjects removes objects and lines by id", () => {
  let { stage, id } = addObject(createStage(), "barrel", [0, 1]);
  const l = addLine(stage, "fault-line", [[0, 0], [1, 0]], false);
  stage = removeObjects(l.stage, [id, l.id]);
  assert.equal(stage.objects.length, 0);
  assert.equal(stage.lines.length, 0);
});

test("duplicateObjects gives fresh ids, offset positions and no labels", () => {
  let { stage, id } = addObject(createStage(), "paper-ipsc", [1, 1]);
  stage = { ...stage, objects: [{ ...stage.objects[0], label: "T1", labelManual: true }] };
  const d = duplicateObjects(stage, [id]);
  assert.equal(d.stage.objects.length, 2);
  assert.notEqual(d.ids[0], id);
  assert.deepEqual(d.stage.objects[1].position, [1.5, 1.5]);
  assert.equal(d.stage.objects[1].label, null);
  assert.equal(d.stage.objects[1].labelManual, false);
});

test("lines, start, settings and bay", () => {
  let { stage, id } = addLine(createStage(), "shooting-area", [[0, 0], [1, 0], [1, 1]], true);
  assert.equal(stage.lines[0].closed, true);
  stage = updateLine(stage, id, [[0, 0], [2, 0]]);
  assert.deepEqual(stage.lines[0].points, [[0, 0], [2, 0]]);
  stage = setStart(stage, [0, 1], 0);
  assert.deepEqual(stage.start, { position: [0, 1], facing: 0 });
  stage = setSetting(stage, "environment", "outdoor");
  assert.equal(stage.settings.environment, "outdoor");
  assert.throws(() => setSetting(stage, "bogus", 1));
  stage = setBay(stage, 15, 25);
  assert.deepEqual(stage.bay, { width: 15, depth: 25 });
});

test("pruneSelection drops ids that no longer exist", () => {
  const { stage, id } = addObject(createStage(), "barrel", [0, 1]);
  assert.deepEqual(pruneSelection([id, "gone"], stage), [id]);
  assert.deepEqual(pruneSelection([id], removeObjects(stage, [id])), []);
});
