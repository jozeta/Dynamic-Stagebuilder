// Mesh and wooden walls are one prop each with a Type (wall, wall with port, doorway), 1 m wide by
// default, a port that can sit anywhere in the wall; tyres are one prop with a count. Stages saved
// with the old separate props open as the new ones, at their old sizes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { PROPS, defaultParams, dimensionsOf, upgradeProp } from "../js/model/props.js";
import { portRect } from "../js/model/wall-port.js";
import { createStage, addObject } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";
import { blockers } from "../js/model/planner.js";
import { buildProp } from "../js/render/builders/index.js";

const obj = (type, params = {}) => ({ id: `w-${type}`, type, position: [0, 10], rotation: 0, params: { ...defaultParams(type), ...params } });

test("one mesh wall and one wooden wall, each with a Type, 1 m wide by default; one Tyres prop", () => {
  for (const t of ["wall-mesh", "wall-wood"]) {
    assert.deepEqual(PROPS[t].params.variant.options, ["wall", "port", "doorway"]);
    assert.equal(PROPS[t].params.variant.default, "wall");
    assert.equal(PROPS[t].params.length.default, 1);
    for (const k of ["portWidth", "portHeight", "portBottom", "portOffset"]) assert.deepEqual(PROPS[t].params[k].when, { variant: "port" }, `${t} ${k} shows with a port`);
    for (const k of ["doorWidth", "doorHeight"]) assert.deepEqual(PROPS[t].params[k].when, { variant: "doorway" }, `${t} ${k} shows with a doorway`);
  }
  for (const gone of ["wall-mesh-port", "wall-door", "wall-port", "tyre-stack"]) assert.equal(PROPS[gone], undefined, `${gone} is merged`);
  assert.equal(PROPS.tyre.name, "Tyres");
  assert.equal(PROPS.tyre.params.count.default, 1);
});

test("old props open as the new ones, keeping their sizes", () => {
  assert.deepEqual(upgradeProp("wall-mesh-port", { portWidth: 0.5 }), { type: "wall-mesh", params: { length: 2, height: 2, portWidth: 0.5, variant: "port" } });
  assert.deepEqual(upgradeProp("wall-port", { length: 3 }), { type: "wall-wood", params: { length: 3, height: 2, variant: "port" } });
  assert.deepEqual(upgradeProp("wall-door", {}), { type: "wall-mesh", params: { length: 1.5, height: 2.2, variant: "doorway" } });
  assert.deepEqual(upgradeProp("tyre-stack", { count: 3 }), { type: "tyre", params: { count: 3 } });
  assert.deepEqual(upgradeProp("wall-mesh", { length: 2 }), { type: "wall-mesh", params: { length: 2 } }, "current props pass through");
  const s = addObject(createStage(), "wall-door", [0, 5], 0, {}).stage;
  assert.equal(s.objects[0].type, "wall-mesh"); assert.equal(s.objects[0].params.variant, "doorway"); assert.equal(s.objects[0].params.length, 1.5);
  const v = validateStage({ ...createStage(), objects: [{ id: "a", type: "wall-port", position: [0, 5], rotation: 0, params: { length: 2, height: 2, portWidth: 0.4, portHeight: 0.4, portBottom: 1 } },
    { id: "b", type: "tyre-stack", position: [1, 5], rotation: 0, params: { count: 4 } }] });
  assert.ok(v.ok, v.errors?.join("; "));
  assert.equal(v.stage.objects[0].type, "wall-wood"); assert.equal(v.stage.objects[0].params.variant, "port");
  assert.equal(v.stage.objects[1].type, "tyre"); assert.equal(v.stage.objects[1].params.count, 4);
});

test("the port moves left/right and up/down, always inside the wall", () => {
  const p = { ...defaultParams("wall-mesh"), variant: "port", length: 2, height: 2, portWidth: 0.4, portHeight: 0.4, portBottom: 1, portOffset: 0.5 };
  const r = portRect(p);
  assert.ok(Math.abs((r.x0 + r.x1) / 2 - 0.5) < 1e-9 && Math.abs(r.y0 - 1) < 1e-9 && Math.abs(r.y1 - 1.4) < 1e-9);
  const far = portRect({ ...p, portOffset: 5, portBottom: 5 });
  assert.ok(far.x1 <= 1 - 0.05 && far.y1 <= 2 - 0.05, "kept inside the frame");
  const sight = blockers({ objects: [{ ...obj("wall-mesh", p), position: [0, 5] }] })[0];
  const hole = sight.openings[0];
  assert.ok(Math.abs((hole.u0 + hole.u1) / 2 - 0.5) < 1e-9, "sight lines pass through the moved port");
  assert.ok(blockers({ objects: [obj("wall-wood", { variant: "doorway" })] })[0].openings[0].walk, "a doorway can be walked through");
});

const near = (a, b, msg) => assert.ok(Math.abs(a - b) <= 0.011, `${msg}: ${a.toFixed(3)} vs ${b.toFixed(3)}`);
for (const type of ["wall-mesh", "wall-wood"]) for (const variant of ["wall", "port", "doorway"]) {
  test(`${type} ${variant}: drawn at its real size, the port where it was put`, () => {
    const o = obj(type, { variant, length: 1.5, portOffset: 0.2 }), g = buildProp(o), b = new Box3().setFromObject(g), s = b.getSize(new Vector3()), d = dimensionsOf(o);
    near(s.x, d.w, "width"); near(s.y, d.h, "height");
    let port = null;
    g.traverse((c) => { if (c.userData.port) port = c.userData.port; });
    if (variant === "port") assert.ok(port && Math.abs((port.x0 + port.x1) / 2 - 0.2) < 1e-9, "the port is 20 cm to the left");
    else assert.equal(port, null);
  });
}
for (const n of [1, 4]) test(`tyres: ${n} drawn ${n} high`, () => near(new Box3().setFromObject(buildProp(obj("tyre", { count: n }))).getSize(new Vector3()).y, dimensionsOf(obj("tyre", { count: n })).h, "height"));
