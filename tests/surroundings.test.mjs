// Your own surroundings: a plan image measured to scale, building pieces to rebuild the range on it,
// saved as a template that any stage can use.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import {
  scaleFromReference, planSize, cleanTemplate, isCustomEnv, customEnv, customId,
  takeBuildingPieces, putBackPieces, BUILDING_TYPES,
} from "../js/model/surroundings.js";
import { PROPS, defaultParams, dimensionsOf } from "../js/model/props.js";
import { createStage, addObject } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";
import { lookDefaults, TECHNICAL_LOOK } from "../js/model/look.js";
import { stageStats } from "../js/model/stats.js";
import { buildProp } from "../js/render/builders/index.js";

const near = (a, b, t = 1e-6, m = "") => assert.ok(Math.abs(a - b) <= t, `${m} ${a} vs ${b}`);

test("a known length on the plan sets its scale", () => {
  near(scaleFromReference([100, 100], [620, 100], 5.2), 0.01);          // 520 px = 5.2 m → 1 cm per px
  near(scaleFromReference([0, 0], [300, 400], 10), 0.02);               // 500 px diagonal
  assert.throws(() => scaleFromReference([10, 10], [12, 10], 5), /farther apart/);
  assert.throws(() => scaleFromReference([0, 0], [500, 0], 0), /length/);
  assert.throws(() => scaleFromReference([0, 0], [500, 0], 5000), /length/);
  const s = planSize({ width: 2000, height: 1000, metresPerPixel: 0.02 });
  assert.deepEqual(s, { w: 40, d: 20 });
});

test("custom surroundings are named custom:<id>; the stage file accepts them", () => {
  assert.equal(customEnv("abc-123"), "custom:abc-123");
  assert.ok(isCustomEnv("custom:abc-123") && !isCustomEnv("outdoor"));
  assert.equal(customId("custom:abc-123"), "abc-123");
  const s = { ...createStage(), settings: { ...createStage().settings, environment: "custom:abc-123" } };
  assert.ok(validateStage(JSON.parse(JSON.stringify(s))).ok);
  const bad = { ...s, settings: { ...s.settings, environment: "custom:<script>" } };
  assert.equal(validateStage(JSON.parse(JSON.stringify(bad))).ok, false);
  assert.deepEqual(lookDefaults("custom:abc-123"), TECHNICAL_LOOK);
});

test("building pieces: walls, pillars, columns, berms, containers, fences and barriers", () => {
  assert.deepEqual(BUILDING_TYPES, ["building-wall", "pillar", "berm", "container", "fence", "barrier"]);
  for (const t of BUILDING_TYPES) {
    assert.equal(PROPS[t].category, "building", t);
    assert.equal(PROPS[t].scoring, null, t);
  }
  assert.equal(defaultParams("building-wall").length, 5);
  assert.ok(PROPS["building-wall"].params.length.max >= 20);
  assert.deepEqual(dimensionsOf({ type: "container", params: { ...defaultParams("container"), size: "40ft" } }), { w: 12.19, h: 2.59, d: 2.44 });
});

for (const t of ["building-wall", "pillar", "berm", "container", "fence", "barrier"]) {
  test(`${t} is drawn at its real size`, () => {
    for (const extra of [{}, t === "building-wall" ? { material: "brick", length: 12, height: 4 } : t === "container" ? { size: "40ft", color: "rust" } : {}]) {
      const o = { id: "b", type: t, position: [0, 0], rotation: 0, params: { ...defaultParams(t), ...extra } };
      const built = buildProp(o);
      const b = new Box3().setFromObject(built.getObjectByName("berm-earth") ?? built);     // a berm's plants may stand above its earth
      const s = b.getSize(new Vector3()), d = dimensionsOf(o);
      near(s.x, d.w, 0.01, `${t} width`); near(s.y, d.h, 0.01, `${t} height`); near(s.z, d.d, 0.01, `${t} depth`);
      near(b.min.y, 0, 0.002, `${t} on the ground`);
    }
  });
}

test("saving pieces moves them off the stage into the template; editing puts them back", () => {
  let s = createStage();
  s = addObject(s, "building-wall", [0, 20], 90).stage;
  s = addObject(s, "pillar", [3, 10]).stage;
  s = addObject(s, "paper-ipsc", [0, 8]).stage;
  const { stage, pieces } = takeBuildingPieces(s);
  assert.deepEqual(stage.objects.map((o) => o.type), ["paper-ipsc"]);
  assert.deepEqual(pieces.map((p) => p.type), ["building-wall", "pillar"]);
  assert.deepEqual(pieces[0].position, [0, 20]);
  assert.equal(pieces[0].rotation, 90);
  assert.equal(stageStats(stage).paper, 1);
  const back = putBackPieces(stage, pieces);
  assert.deepEqual(back.objects.map((o) => o.type).sort(), ["building-wall", "paper-ipsc", "pillar"]);
  assert.equal(new Set(back.objects.map((o) => o.id)).size, 3, "fresh ids");
});

test("stored templates are cleaned: bad names, scales and pieces are dropped", () => {
  const t = cleanTemplate({
    id: "t1", name: "x".repeat(200), extra: 1,
    plan: { width: 2000, height: 1000, metresPerPixel: 0.02, x: 1, z: 15, rotation: 90, opacity: 0.8 },
    pieces: [
      { type: "pillar", position: [2, 3], rotation: 0, params: { size: 0.5, height: 3, material: "brick" } },
      { type: "paper-ipsc", position: [0, 0], rotation: 0, params: {} },
      { type: "pillar", position: ["a", 3], rotation: 0, params: {} },
      { type: "__proto__", position: [0, 0] },
    ],
  });
  assert.equal(t.name.length, 60);
  assert.equal(Object.hasOwn(t, "extra"), false);
  assert.equal(t.pieces.length, 1, "only valid building pieces");
  assert.equal(t.pieces[0].params.material, "brick");
  assert.equal(t.plan.metresPerPixel, 0.02);
  assert.equal(cleanTemplate({ id: "t2", name: "n", plan: { width: 10, height: 10, metresPerPixel: -1 } }).plan, null);
  assert.equal(cleanTemplate({ id: "../x", name: "n" }), null, "ids are plain");
  assert.equal(cleanTemplate("nope"), null);
});

test("a custom surroundings shows its plan and pieces, never touching the stage", async () => {
  const { createEnvironment, setTemplate } = await import("../js/render/environments/index.js");
  const { everyPropStage } = await import("./fixtures.mjs");
  const stage = everyPropStage();
  const before = structuredClone(stage);
  setTemplate(cleanTemplate({ id: "t9", name: "Club bay 3", plan: { width: 2000, height: 1500, metresPerPixel: 0.02, x: 0, z: 15, rotation: 0, opacity: 1 },
    pieces: [{ type: "building-wall", position: [-11, 15], rotation: 90, params: { length: 30, height: 3 } }, { type: "berm", position: [0, 32], rotation: 0, params: {} }] }));
  const env = createEnvironment("custom:t9", stage.bay);
  const plan = env.group.children.find((c) => c.userData.plan);
  assert.ok(plan, "the plan lies on the ground");
  const s = new Box3().setFromObject(plan).getSize(new Vector3());
  near(s.x, 40, 0.01, "plan width"); near(s.z, 30, 0.01, "plan depth");
  assert.equal(env.group.children.filter((c) => c.userData.piece).length, 2);
  env.dispose();
  const plain = createEnvironment("custom:gone", stage.bay);
  assert.ok(plain.missing && plain.group.children.length >= 1, "an unknown template still gives a floor");
  plain.dispose();
  assert.deepEqual(stage, before);
});
