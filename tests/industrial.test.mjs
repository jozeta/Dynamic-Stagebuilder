// Indoor industrial surroundings: a worn concrete hall round the bay, with steel columns, roof
// trusses, skylights and high-bay lamps, a rubber backstop, lit from overhead whatever the time of day.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEnvironment, ENVIRONMENT_NAMES, ENVIRONMENT_LABELS, applyLook } from "../js/render/environments/index.js";
import { lookDefaults, LOOK_DEFAULTS } from "../js/model/look.js";
import { ENVIRONMENTS } from "../js/model/schema.js";

test("Industrial is one of the surroundings, with its own light defaults", () => {
  assert.ok(ENVIRONMENT_NAMES.includes("industrial"));
  assert.equal(ENVIRONMENT_LABELS.industrial, "Industrial");
  assert.ok(ENVIRONMENTS.includes("industrial"), "stage files may use it");
  const d = lookDefaults("industrial");
  assert.notEqual(d, LOOK_DEFAULTS);
  assert.equal(d.haze < 0.15, true);
});

test("the hall: walls round the bay, columns, trusses, lamps and a backstop", () => {
  const bay = { width: 20, depth: 30 };
  const env = createEnvironment("industrial", bay);
  for (const n of ["hall-floor", "hall-walls", "hall-columns", "hall-roof", "hall-lamps", "hall-backstop"]) assert.ok(env.group.getObjectByName(n), n);
  const walls = env.group.getObjectByName("hall-walls");
  walls.updateMatrixWorld(true);
  const box = { minX: Infinity, maxX: -Infinity, maxZ: -Infinity, minZ: Infinity };
  walls.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); box.minX = Math.min(box.minX, b.min.x); box.maxX = Math.max(box.maxX, b.max.x); box.minZ = Math.min(box.minZ, b.min.z); box.maxZ = Math.max(box.maxZ, b.max.z); } });
  assert.ok(box.minX < -10 && box.maxX > 10 && box.maxZ > 30, "the hall's walls round the sides and back of the bay");
  env.dispose();
});

test("lit from overhead: the time of day doesn't move the lamps' light", () => {
  const bay = { width: 20, depth: 30 };
  const env = createEnvironment("industrial", bay);
  applyLook(env, { ...lookDefaults("industrial"), sunAuto: true, hour: 7 }, bay);
  const a = env.sunLight.position.clone();
  applyLook(env, { ...lookDefaults("industrial"), sunAuto: true, hour: 18 }, bay);
  assert.ok(a.distanceTo(env.sunLight.position) < 1e-6);
  assert.ok(env.sunLight.position.y > 8, "from above");
  env.dispose();
});

test("the hall has the fittings of a real indoor range: high windows, overhead baffles, a sand trap, clutter, light", () => {
  const bay = { width: 20, depth: 30 };
  const env = createEnvironment("industrial", bay);
  for (const n of ["hall-windows", "hall-baffles", "hall-trap", "hall-clutter", "hall-glow", "hall-shafts"]) assert.ok(env.group.getObjectByName(n), n);
  // Baffles hang above the bay, high enough to walk and shoot under.
  const baffles = env.group.getObjectByName("hall-baffles");
  baffles.updateMatrixWorld(true);
  let lowest = Infinity;
  baffles.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); lowest = Math.min(lowest, o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).min.y); } });
  assert.ok(lowest > 3.5, `baffles well overhead: ${lowest}`);
  // The clutter stands outside the bay (never in the stage).
  const clutter = env.group.getObjectByName("hall-clutter");
  clutter.updateMatrixWorld(true);
  clutter.traverse((o) => { if (o.isMesh) { const p = o.getWorldPosition(new o.position.constructor()); assert.ok(Math.abs(p.x) > bay.width / 2 + 1 || p.z > bay.depth + 1 || p.z < -1, `outside the bay: ${p.x.toFixed(1)}, ${p.z.toFixed(1)}`); } });
  env.dispose();
});

test("the roof structure, lamps and baffles hide when the camera is above the roof", () => {
  const env = createEnvironment("industrial", { width: 20, depth: 30 });
  const overhead = env.group.getObjectByName("hall-overhead");
  env.beforeRender({ position: { y: 40 } });
  assert.equal(overhead.visible, false);
  env.beforeRender({ position: { y: 1.6 } });
  assert.equal(overhead.visible, true);
  env.dispose();
});
