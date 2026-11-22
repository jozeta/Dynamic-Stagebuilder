// Pillar and round column are one prop, Pillar, with a Shape (square or round). Old round columns
// (in stages and in saved surroundings) open as round pillars of the same size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { PROPS, defaultParams, dimensionsOf, upgradeProp } from "../js/model/props.js";
import { cleanTemplate, BUILDING_TYPES } from "../js/model/surroundings.js";
import { buildProp } from "../js/render/builders/index.js";

test("one Pillar with a Shape; no Round column", () => {
  assert.equal(PROPS.column, undefined);
  assert.deepEqual(PROPS.pillar.params.shape.options, ["square", "round"]);
  assert.equal(defaultParams("pillar").shape, "square");
  assert.ok(!BUILDING_TYPES.includes("column"));
});

test("an old round column opens as a round pillar of the same size", () => {
  assert.deepEqual(upgradeProp("column", { diameter: 0.6, height: 4, material: "brick" }), { type: "pillar", params: { size: 0.6, height: 4, material: "brick", shape: "round" } });
  const t = cleanTemplate({ id: "t1", name: "R", plan: null, pieces: [{ type: "column", position: [1, 2], rotation: 0, params: { diameter: 0.5, height: 3, material: "concrete" } }] });
  assert.equal(t.pieces[0].type, "pillar"); assert.equal(t.pieces[0].params.shape, "round"); assert.equal(t.pieces[0].params.size, 0.5);
});

for (const shape of ["square", "round"]) test(`a ${shape} pillar is drawn at its real size`, () => {
  const o = { id: "p", type: "pillar", params: { ...defaultParams("pillar"), shape, size: 0.5, height: 3 } };
  const s = new Box3().setFromObject(buildProp(o)).getSize(new Vector3()), d = dimensionsOf(o);
  for (const k of ["x", "y", "z"]) assert.ok(Math.abs(s[k] - { x: d.w, y: d.h, z: d.d }[k]) < 0.01, `${shape} ${k}`);
  let round = false;
  buildProp(o).traverse((c) => { if (c.geometry?.type === "CylinderGeometry") round = true; });
  assert.equal(round, shape === "round");
});
