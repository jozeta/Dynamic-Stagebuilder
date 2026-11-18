// Regression tests for the whole-branch review findings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Object3D } from "three";
import { yawDegrees } from "../js/render/rotation.js";
import { createEditor } from "../js/editor.js";
import { createAutosave } from "../js/storage/autosave.js";
import { memoryStore } from "../js/storage/db.js";
import { createStage } from "../js/model/stage.js";

test("C1: the rotate ring reads angles beyond ±90° correctly", () => {
  for (const deg of [0, 45, 100, 150, 200, 270, 345]) {
    const o = new Object3D();
    o.rotation.y = (-deg * Math.PI) / 180;
    o.updateMatrix();
    o.quaternion.setFromEuler(o.rotation);
    o.rotation.setFromQuaternion(o.quaternion);   // what TransformControls leaves behind (XYZ order)
    assert.ok(Math.abs(((yawDegrees(o) - deg + 540) % 360) - 180) < 1e-6, `${deg} → ${yawDegrees(o)}`);
  }
});

function editorWith(positions) {
  const ed = createEditor();
  for (const p of positions) ed.dispatch({ type: "place", propType: "paper-ipsc", position: p });
  return ed;
}

test("I1: a group dragged into the bay edge stops as a whole", () => {
  const ed = editorWith([[8, 5], [9, 5]]);
  const ids = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "dragStart", ids });
  ed.dispatch({ type: "dragMove", delta: [5, 0] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(ed.stage().objects.map((o) => o.position), [[9, 5], [10, 5]]);
});

test("I2: a copy made at the bay edge stays inside the bay", () => {
  const ed = editorWith([[10, 30]]);
  ed.dispatch({ type: "duplicate" });
  assert.deepEqual(ed.stage().objects[1].position, [10, 30]);
});

test("I3: undo and redo keep the surroundings the user chose", () => {
  const ed = editorWith([[0, 5]]);
  ed.dispatch({ type: "setEnvironment", name: "outdoor" });
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects.length, 0);
  assert.equal(ed.stage().settings.environment, "outdoor");
  ed.dispatch({ type: "setEnvironment", name: "technical" });
  ed.dispatch({ type: "redo" });
  assert.equal(ed.stage().objects.length, 1);
  assert.equal(ed.stage().settings.environment, "technical");
});

test("C2: opening the app without editing saves nothing", async () => {
  const store = memoryStore();
  let stage = createStage();
  const auto = createAutosave({ store, getStage: () => stage, delay: 5 });
  auto.markSaved(stage);
  await auto.flush();
  assert.equal((await store.list()).length, 0);
  stage = { ...stage, name: "Edited" };
  await auto.flush();
  assert.equal((await store.list()).length, 1);
});

test("I4: a pending autosave can't bring back a deleted project", async () => {
  const store = memoryStore();
  let stage = createStage();
  const auto = createAutosave({ store, getStage: () => stage, delay: 20 });
  await auto.flush();                       // first save
  stage = { ...stage, name: "Edited" };
  auto.schedule();                          // pending save
  auto.cancel();
  auto.markSaved(stage);
  await store.remove(stage.id);
  await new Promise((r) => setTimeout(r, 40));
  assert.equal((await store.list()).length, 0);
});
