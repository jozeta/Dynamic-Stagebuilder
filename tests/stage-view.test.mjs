// The stage view keeps the Three.js scene in step with the stage data, rebuilding only what changed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Group } from "three";
import { createStage, addObject, addLine, updateObject, removeObjects, setStart } from "../js/model/stage.js";
import { createStageView } from "../js/render/stage-view.js";

function sample() {
  let s = createStage();
  const ids = [];
  for (const t of ["paper-ipsc", "wall-mesh", "barrel"]) { const r = addObject(s, t, [ids.length, 5], 90); s = r.stage; ids.push(r.id); }
  const l = addLine(s, "fault-line", [[0, 1], [2, 1]], false);
  return { stage: l.stage, ids: [...ids, l.id] };
}

test("sync builds one child per object and line, mapped both ways", () => {
  const group = new Group();
  const view = createStageView(group);
  const { stage, ids } = sample();
  view.sync(stage);
  assert.equal(group.children.length, 4);
  for (const id of ids) assert.equal(view.idFor(view.objectFor(id)), id);
  const wall = view.objectFor(ids[1]);
  assert.equal(wall.position.x, 1);
  assert.equal(wall.position.z, 5);
  assert.ok(Math.abs(wall.rotation.y + Math.PI / 2) < 1e-9);
});

test("idFor finds the object from any of its meshes", () => {
  const view = createStageView(new Group());
  const { stage, ids } = sample();
  view.sync(stage);
  const mesh = view.objectFor(ids[0]).children[0];
  assert.equal(view.idFor(mesh), ids[0]);
});

test("moving one object rebuilds only that object", () => {
  const group = new Group();
  const view = createStageView(group);
  const { stage, ids } = sample();
  view.sync(stage);
  const before = ids.map((id) => view.objectFor(id));
  view.sync(updateObject(stage, ids[1], { position: [4, 4] }));
  assert.equal(view.objectFor(ids[0]), before[0]);
  assert.equal(view.objectFor(ids[2]), before[2]);
  assert.equal(view.objectFor(ids[1]).position.x, 4);
});

test("removing an object removes its child; a start marker appears with the start", () => {
  const group = new Group();
  const view = createStageView(group);
  const { stage, ids } = sample();
  view.sync(stage);
  view.sync(removeObjects(stage, [ids[2]]));
  assert.equal(view.objectFor(ids[2]), undefined);
  assert.equal(group.children.length, 3);
  view.sync(setStart(removeObjects(stage, [ids[2]]), [0, 1], 0));
  assert.equal(group.children.length, 4);
  assert.equal(view.idFor(view.objectFor("start")), "start");
});

test("labels are added above scoring targets only", () => {
  const made = [];
  const view = createStageView(new Group(), { labelFactory: (text) => { const g = new Group(); g.userData.label = text; made.push(text); return g; } });
  const { stage } = sample();
  view.sync({ ...stage, objects: stage.objects.map((o, i) => (i === 0 ? { ...o, label: "T1" } : o)) });
  assert.deepEqual(made, ["T1"]);
});
