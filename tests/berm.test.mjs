// The earth berm: a mound with sloping sides and ends, on the ground's own surface (sand, gravel…),
// with plants, and optionally a drawn outline (1 m squares, at most 10 × 10 m) at its set height.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bermHeight, cleanOutline, OUTLINE_MAX, bermSize } from "../js/model/berm.js";
import { getProp, defaultParams } from "../js/model/props.js";

const berm = (params = {}, outline) => ({ type: "berm", params: { ...defaultParams("berm"), ...params }, ...(outline ? { outline } : {}) });

test("the berm's options: its surface follows the Outdoor grounds, and plants", () => {
  const p = getProp("berm").params;
  assert.deepEqual(p.ground.options, ["sand", "light-sand", "dark-sand", "red-dirt", "gravel"]);
  assert.deepEqual(p.plants.options, ["mixed", "grass", "none"]);
  assert.equal(p.plants.default, "mixed");
});

test("a plain berm: full height along its middle, sloping sides and sloping ends", () => {
  const b = berm({ length: 10, height: 2.5, depth: 6 });
  assert.equal(bermHeight(b, 0, 0), 2.5);
  assert.equal(bermHeight(b, 0, 3.01), 0, "past the foot of the side");
  const side = bermHeight(b, 0, 2);
  assert.ok(side > 0.1 && side < 2.4, `on the side slope: ${side}`);
  const end = bermHeight(b, 4.5, 0);
  assert.ok(end > 0 && end < 2.5, `the end slopes too: ${end}`);
  assert.equal(bermHeight(b, 5.01, 0), 0);
  assert.deepEqual(bermSize(b), [10, 6]);
});

test("a drawn outline: raised squares at the berm's height, a slope at their edges, at most 10 × 10 m", () => {
  assert.equal(OUTLINE_MAX, 10);
  const o = cleanOutline({ width: 14, depth: 4, rows: ["1111", "1111", "1111", "1111"] });
  assert.equal(o.width, 10, "at most 10 m");
  assert.equal(cleanOutline("junk"), null);
  const b = berm({ height: 2 }, cleanOutline({ width: 6, depth: 6, rows: ["000000", "011110", "011110", "011110", "011110", "000000"] }));
  assert.deepEqual(bermSize(b), [6, 6]);
  assert.equal(bermHeight(b, 0, 0), 2, "the middle is at full height");
  assert.equal(bermHeight(b, 2.6, 0), 0, "outside the drawn squares");
  const edge = bermHeight(b, 1.8, 0);
  assert.ok(edge > 0 && edge < 2, `a slope at the edge: ${edge}`);
});

test("a stage file keeps a berm's outline; the editor sets and clears it as one undo step", async () => {
  const { createEditor } = await import("../js/editor.js");
  const { validateStage } = await import("../js/model/schema.js");
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "berm", position: [0, 15] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setOutline", id, outline: { width: 4, depth: 3, rows: ["0110", "1111", "0110"] } });
  assert.deepEqual(ed.stage().objects[0].outline.rows, ["0110", "1111", "0110"]);
  const r = validateStage(JSON.parse(JSON.stringify(ed.stage())));
  assert.equal(r.ok, true, r.errors?.join());
  assert.deepEqual(r.stage.objects[0].outline, ed.stage().objects[0].outline);
  ed.dispatch({ type: "setOutline", id, outline: null });
  assert.equal(ed.stage().objects[0].outline, undefined);
  ed.dispatch({ type: "undo" });
  assert.ok(ed.stage().objects[0].outline);
});

test("the 3D berm: a lumpy mound at the berm's height, on its ground's surface, with plants as chosen", async () => {
  const { buildProp } = await import("../js/render/builders/index.js");
  const obj = (params, outline) => ({ id: "b1", type: "berm", label: null, position: [0, 10], rotation: 0, params: { ...defaultParams("berm"), ...params }, ...(outline ? { outline } : {}) });
  const g = buildProp(obj({ length: 8, height: 2, depth: 4, ground: "red-dirt", plants: "mixed" }));
  const earth = g.getObjectByName("berm-earth");
  assert.ok(earth, "the earth mesh");
  const pos = earth.geometry.attributes.position;
  let top = 0, minX = Infinity, maxX = -Infinity;
  for (let i = 0; i < pos.count; i++) { top = Math.max(top, pos.getY(i)); if (pos.getY(i) > 0.01) { minX = Math.min(minX, pos.getX(i)); maxX = Math.max(maxX, pos.getX(i)); } }
  assert.ok(top > 1.9 && top < 2.3, `about 2 m high (with lumps): ${top}`);
  assert.ok(maxX - minX <= 8.01 && maxX - minX > 7, "along its 8 m length");
  assert.match(earth.material.name, /red-dirt/, "the chosen surface");
  const plants = g.getObjectByName("berm-plants");
  assert.ok(plants && plants.children.length >= 2, "grass and bushes");
  assert.equal(buildProp(obj({ plants: "none" })).getObjectByName("berm-plants"), undefined);
  const grassOnly = buildProp(obj({ plants: "grass" })).getObjectByName("berm-plants");
  assert.equal(grassOnly.children.length, 1);
  const drawn = buildProp(obj({ height: 1.5 }, { width: 3, depth: 3, rows: ["010", "111", "010"] })).getObjectByName("berm-earth");
  assert.ok(drawn, "a drawn berm");
});
