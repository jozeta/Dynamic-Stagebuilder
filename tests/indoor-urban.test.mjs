// Two more surroundings: an indoor club range (a small, low range built tight round the bay) and an
// urban block (a street, buildings, containers and fences round the bay). Like the others, they never
// touch the stage, keep everything outside the bay, and have their own light defaults.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { createEnvironment, ENVIRONMENT_NAMES, ENVIRONMENT_LABELS, applyLook } from "../js/render/environments/index.js";
import { lookDefaults, LOOK_DEFAULTS, cleanLook } from "../js/model/look.js";
import { ENVIRONMENTS } from "../js/model/schema.js";
import { offersPlans } from "../js/model/surroundings.js";

const bay = { width: 20, depth: 30 };
const boxOf = (o) => { o.updateMatrixWorld(true); return new Box3().setFromObject(o); };
// Every mesh in `part` stands outside the bay's footprint (with a margin), never in the stage.
function outsideBay(part, margin = 0.5) {
  part.updateMatrixWorld(true);
  part.traverse((o) => {
    if (!o.isMesh) return;
    const b = new Box3().setFromObject(o);
    const inside = b.max.x > -bay.width / 2 + margin && b.min.x < bay.width / 2 - margin && b.max.z > margin && b.min.z < bay.depth - margin;
    assert.ok(!inside, `${part.name}/${o.name || o.type} stands in the bay: x ${b.min.x.toFixed(1)}…${b.max.x.toFixed(1)}, z ${b.min.z.toFixed(1)}…${b.max.z.toFixed(1)}`);
  });
}

test("Indoor range and Urban are surroundings, usable in stage files, with their own light defaults", () => {
  for (const [name, label] of [["indoor", "Indoor range"], ["urban", "Urban"]]) {
    assert.ok(ENVIRONMENT_NAMES.includes(name), name);
    assert.equal(ENVIRONMENT_LABELS[name], label);
    assert.ok(ENVIRONMENTS.includes(name), `stage files may use ${name}`);
    const d = lookDefaults(name);
    assert.notEqual(d, LOOK_DEFAULTS, name);
    assert.deepEqual(cleanLook(d), d, `${name}'s defaults are valid look values`);
    assert.equal(offersPlans(name), false, "built-in surroundings: no plan drawing");
  }
});

test("Indoor range: a low ceiling, walls round the bay, baffles overhead, a bullet trap behind, a gallery behind the shooters", () => {
  const env = createEnvironment("indoor", bay);
  for (const n of ["indoor-floor", "indoor-walls", "indoor-ceiling", "indoor-lights", "indoor-baffles", "indoor-trap", "indoor-gallery"]) assert.ok(env.group.getObjectByName(n), n);
  const walls = boxOf(env.group.getObjectByName("indoor-walls"));
  assert.ok(walls.min.x < -bay.width / 2 && walls.max.x > bay.width / 2 && walls.max.z > bay.depth, "walls round the sides and back");
  assert.ok(walls.max.x < bay.width / 2 + 4, "built tight round the bay");
  const ceiling = boxOf(env.group.getObjectByName("indoor-ceiling"));
  assert.ok(ceiling.min.y > 3.2 && ceiling.min.y < 5, `a low ceiling: ${ceiling.min.y.toFixed(2)} m`);
  const baffles = boxOf(env.group.getObjectByName("indoor-baffles"));
  assert.ok(baffles.min.y > 2.6, `baffles overhead, room to move under them: ${baffles.min.y.toFixed(2)} m`);
  assert.ok(boxOf(env.group.getObjectByName("indoor-trap")).min.z > bay.depth, "the trap behind the bay");
  assert.ok(boxOf(env.group.getObjectByName("indoor-gallery")).max.z < 0, "the gallery behind the shooters");
  for (const n of ["indoor-walls", "indoor-trap", "indoor-gallery"]) outsideBay(env.group.getObjectByName(n));
  env.dispose();
});

test("Indoor range: lit from the ceiling whatever the hour; ceiling and walls hide for a camera outside", () => {
  const env = createEnvironment("indoor", bay);
  applyLook(env, { ...lookDefaults("indoor"), sunAuto: true, hour: 7 }, bay);
  const a = env.sunLight.position.clone();
  applyLook(env, { ...lookDefaults("indoor"), sunAuto: true, hour: 18 }, bay);
  assert.ok(a.distanceTo(env.sunLight.position) < 1e-6, "the light doesn't follow the sun");
  const overhead = env.group.getObjectByName("indoor-overhead");
  env.beforeRender({ position: { x: 0, y: 30, z: -10 } });
  assert.equal(overhead.visible, false, "seen from above the ceiling: no ceiling");
  env.beforeRender({ position: { x: 0, y: 1.6, z: 1 } });
  assert.equal(overhead.visible, true);
  env.beforeRender({ position: { x: 40, y: 8, z: 10 } });
  assert.equal(env.group.getObjectByName("indoor-side-left").visible, false, "the wall in the way hides");
  assert.equal(env.group.getObjectByName("indoor-side-right").visible, true);
  applyLook(env, { ...lookDefaults("indoor"), roof: false }, bay);
  assert.equal(env.group.getObjectByName("indoor-ceiling").visible, false, "Show roof off hides the ceiling");
  env.dispose();
});

test("Urban: a street, buildings, containers, fences and street furniture round the bay, under the sun", () => {
  const env = createEnvironment("urban", bay);
  for (const n of ["urban-ground", "urban-street", "urban-buildings", "urban-containers", "urban-fences", "urban-furniture"]) assert.ok(env.group.getObjectByName(n), n);
  for (const n of ["urban-street", "urban-buildings", "urban-containers", "urban-fences", "urban-furniture"]) outsideBay(env.group.getObjectByName(n));
  const ground = env.group.getObjectByName("urban-ground");
  assert.ok(ground.userData.ground, "props stand on it");
  const g = boxOf(ground).getSize(new Vector3());
  assert.ok(g.x > bay.width + 40 && g.z > bay.depth + 40, "the ground runs well past the bay");
  const tallest = boxOf(env.group.getObjectByName("urban-buildings")).max.y;
  assert.ok(tallest > 6, `buildings of a few storeys: ${tallest.toFixed(1)} m`);
  // The sun follows the time of day here (it is outdoors).
  applyLook(env, { ...lookDefaults("urban"), sunAuto: true, hour: 8 }, bay);
  const a = env.sunLight.position.clone();
  applyLook(env, { ...lookDefaults("urban"), sunAuto: true, hour: 17 }, bay);
  assert.ok(a.distanceTo(env.sunLight.position) > 1, "the sun moves with the hour");
  env.dispose();
});

test("Urban: nothing stands between the shooters' side and the stage (the overview from behind sees in)", () => {
  const env = createEnvironment("urban", bay);
  env.group.updateMatrixWorld(true);
  env.group.traverse((o) => {
    if (!o.isMesh || o.name === "urban-ground" || o.parent?.name === "urban-ground") return;
    const b = new Box3().setFromObject(o);
    if (b.max.z < -2 && b.max.x > -bay.width / 2 && b.min.x < bay.width / 2) assert.ok(b.max.y < 1.3, `low in front of the bay: ${o.name || o.type} ${b.max.y.toFixed(1)} m`);
  });
  env.dispose();
});
