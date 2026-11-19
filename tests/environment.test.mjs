// Switching surroundings never changes the stage: not the data, not the stage's 3D objects.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Group } from "three";
import { createStageView } from "../js/render/stage-view.js";
import { createEnvironment, ENVIRONMENT_NAMES } from "../js/render/environments/index.js";
import { everyPropStage } from "./fixtures.mjs";

const snapshot = (group) => group.children.map((c) => ({ id: c.userData.id, p: c.position.toArray(), r: c.rotation.toArray(), n: c.children.length }));

test("three surroundings exist", () => {
  assert.deepEqual(ENVIRONMENT_NAMES, ["technical", "outdoor", "blueprint"]);
});

test("Blueprint: an endless blue drafting ground with no bay floor or walls, fading into the distance", async () => {
  const { Box3, Vector3 } = await import("three");
  const env = createEnvironment("blueprint", { width: 20, depth: 30 });
  const ground = env.group.children.find((c) => c.userData.ground);
  assert.ok(ground, "a ground to place props on");
  const size = new Box3().setFromObject(ground).getSize(new Vector3());
  assert.ok(size.x >= 2000 && size.z >= 2000, `ground ${size.x} × ${size.z} m`);
  let tallest = 0;
  env.group.traverse((c) => { if (c.isMesh && !c.userData.ground) tallest = Math.max(tallest, new Box3().setFromObject(c).getSize(new Vector3()).y); });
  assert.ok(tallest < 0.05, `nothing stands up out of the drawing (tallest ${tallest} m)`);
  let notes = 0;
  env.group.traverse((c) => { if (c.userData.blueprint) notes++; });
  assert.ok(notes >= 6, `drafting details: ${notes}`);
  assert.ok(env.fog && env.fog.color.getHex() === env.background.getHex(), "the ground fades into the background colour");
  env.dispose();
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

import { applyLook } from "../js/render/environments/common.js";
import { LOOK_DEFAULTS } from "../js/model/look.js";

test("the look moves the sun with the hour and switches shadows, never touching the stage", () => {
  const stage = everyPropStage();
  const before = structuredClone(stage);
  for (const name of ENVIRONMENT_NAMES) {
    const env = createEnvironment(name, stage.bay);
    applyLook(env, { ...LOOK_DEFAULTS, hour: 13 }, stage.bay);
    const noonY = env.sunLight.position.y;
    applyLook(env, { ...LOOK_DEFAULTS, hour: 19, shadows: false, haze: 0 }, stage.bay);
    assert.ok(env.sunLight.position.y < noonY, name);
    assert.equal(env.sunLight.castShadow, false);
    assert.equal(env.fog, name === "blueprint" ? env.baseFog : null, "no haze: only Blueprint's distance fade");
    env.dispose();
  }
  assert.deepEqual(stage, before);
});

test("haze thickens the air at stage distances and shadow strength lightens shadows", () => {
  const env = createEnvironment("outdoor", { width: 20, depth: 30 });
  const fogAt = (haze, d) => { applyLook(env, { ...LOOK_DEFAULTS, haze }, { width: 20, depth: 30 }); return env.fog ? 1 - Math.exp(-((env.fog.density * d) ** 2)) : 0; };
  assert.equal(fogAt(0, 60), 0);
  assert.ok(fogAt(0.2, 60) > 0.05 && fogAt(0.2, 60) < 0.3, `light haze ${fogAt(0.2, 60)}`);
  assert.ok(fogAt(1, 60) > 0.4, `thick haze ${fogAt(1, 60)}`);
  applyLook(env, { ...LOOK_DEFAULTS, shadowStrength: 0.4 }, { width: 20, depth: 30 });
  assert.equal(env.sunLight.shadow.intensity, 0.4);
  env.dispose();
});

test("the Outdoor ground can be switched without touching the stage", async () => {
  const { LOOK_DEFAULTS } = await import("../js/model/look.js");
  const stage = everyPropStage();
  const before = structuredClone(stage);
  const env = createEnvironment("outdoor", stage.bay);
  assert.equal(typeof env.setGround, "function");
  for (const ground of ["dark-sand", "gravel", "sand"]) {
    applyLook(env, { ...LOOK_DEFAULTS, ground }, stage.bay);
    assert.equal(env.ground, ground);
  }
  env.dispose();
  assert.deepEqual(stage, before);
});

test("Blueprint: a worn drafting sheet with comments, arrows and marks round the stage, keeping the bay clear", async () => {
  const { Box3, Vector3 } = await import("three");
  const { sheetMarks } = await import("../js/render/environments/blueprint.js");
  const bay = { width: 20, depth: 30 };
  const env = createEnvironment("blueprint", bay);
  const sheet = env.group.children.find((c) => c.userData.sheet);
  assert.ok(sheet, "a drawing sheet lies on the paper");
  const s = new Box3().setFromObject(sheet).getSize(new Vector3());
  assert.ok(s.x >= 80 && s.z >= 80, `sheet ${s.x} × ${s.z} m`);
  env.dispose();
  const marks = sheetMarks(bay, 7);
  assert.ok(marks.length >= 30, `${marks.length} marks`);
  const kinds = new Set(marks.map((m) => m.kind));
  for (const k of ["note", "arrow", "cloud", "callout", "stamp", "scribble", "stain", "dimension"]) assert.ok(kinds.has(k), k);
  assert.equal(kinds.has("plan"), false, "no house plans");
  for (const m of marks) {
    const out = m.x < -bay.width / 2 - 3 || m.x > bay.width / 2 + 3 || m.z < -3 || m.z > bay.depth + 3;
    assert.ok(out, `${m.kind} at ${m.x.toFixed(1)}, ${m.z.toFixed(1)} stays out of the bay`);
  }
});
