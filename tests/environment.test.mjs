// Switching surroundings never changes the stage: not the data, not the stage's 3D objects.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Group } from "three";
import { createStageView } from "../js/render/stage-view.js";
import { createEnvironment, ENVIRONMENT_NAMES } from "../js/render/environments/index.js";
import { everyPropStage } from "./fixtures.mjs";

const snapshot = (group) => group.children.map((c) => ({ id: c.userData.id, p: c.position.toArray(), r: c.rotation.toArray(), n: c.children.length }));

test("both environments exist", () => {
  assert.deepEqual(ENVIRONMENT_NAMES, ["technical", "outdoor"]);
});

test("creating and disposing environments leaves the stage and its view untouched", () => {
  const stage = everyPropStage();
  const before = structuredClone(stage);
  const stageGroup = new Group();
  const view = createStageView(stageGroup);
  view.sync(stage);
  const viewBefore = snapshot(stageGroup);
  for (let i = 0; i < 2; i++) {
    for (const name of ENVIRONMENT_NAMES) {
      const env = createEnvironment(name, stage.bay);
      assert.ok(env.group.children.length > 0, name);
      assert.ok(env.lights.length > 0, name);
      assert.equal(env.group.getObjectById(stageGroup.id), undefined);
      env.dispose();
    }
  }
  assert.deepEqual(stage, before);
  assert.deepEqual(snapshot(stageGroup), viewBefore);
});

test("unknown environment names are refused", () => {
  assert.throws(() => createEnvironment("moon", { width: 20, depth: 30 }), /Unknown environment/);
});

test("instanced vegetation is disposed with the environment", () => {
  const env = createEnvironment("outdoor", { width: 20, depth: 30 });
  let disposed = 0;
  env.group.traverse((c) => { if (c.isInstancedMesh) c.addEventListener("dispose", () => disposed++); });
  env.dispose();
  assert.ok(disposed >= 2, `instanced meshes disposed: ${disposed}`);
});
