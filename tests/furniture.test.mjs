// Home and office furniture: bed, sofa, office desk with chair, dining table with chairs, coffee
// table. Real sizes, shape and size options, colour options, drawn at their real size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { getProp, defaultParams, dimensionsOf } from "../js/model/props.js";
import { buildProp } from "../js/render/builders/index.js";
import { LIBRARY_GROUPS } from "../js/model/visibility.js";

const obj = (type, params = {}) => ({ id: `f-${type}`, type, position: [0, 10], rotation: 0, params: { ...defaultParams(type), ...params } });
const near = (a, b, msg) => assert.ok(Math.abs(a - b) <= 0.01, `${msg}: ${a.toFixed(3)} vs ${b.toFixed(3)}`);

test("a Furniture group with the five new props and their options", () => {
  const g = LIBRARY_GROUPS.find((x) => x.id === "furniture");
  assert.ok(g, "a Furniture group");
  assert.deepEqual(g.items, ["bed", "sofa", "office-desk", "dining-set", "coffee-table"]);
  assert.deepEqual(getProp("bed").params.size.options, ["single", "double"]);
  assert.deepEqual(getProp("sofa").params.shape.options, ["1", "2", "3", "l-left", "l-right", "u", "corner"]);
  assert.deepEqual(getProp("dining-set").params.seats.options, ["2", "4", "6", "8"]);
  assert.deepEqual(getProp("coffee-table").params.shape.options, ["rect", "round"]);
  for (const t of g.items) assert.ok(Object.values(getProp(t).params).some((p) => p.options && p.options.length >= 3), `${t} has colour or finish options`);
});

test("real sizes: a single bed is 90 cm wide, a double 160 cm, both 2 m mattresses", () => {
  assert.ok(dimensionsOf(obj("bed", { size: "single" })).w < 1.05);
  assert.ok(dimensionsOf(obj("bed", { size: "double" })).w > 1.6);
  assert.ok(dimensionsOf(obj("bed")).d > 2 && dimensionsOf(obj("bed")).d < 2.2);
  assert.ok(dimensionsOf(obj("sofa", { shape: "3" })).w > dimensionsOf(obj("sofa", { shape: "2" })).w);
  assert.ok(dimensionsOf(obj("sofa", { shape: "l-left" })).d > 1.4, "an L reaches back");
  assert.ok(dimensionsOf(obj("dining-set", { seats: "8" })).w > dimensionsOf(obj("dining-set", { seats: "4" })).w);
});

const VARIANTS = [
  ["bed", { size: "single" }], ["bed", { size: "double" }],
  ...["1", "2", "3", "l-left", "l-right", "u", "corner"].map((shape) => ["sofa", { shape }]),
  ["office-desk", { size: "small" }], ["office-desk", { size: "large" }],
  ...["2", "4", "6", "8"].map((seats) => ["dining-set", { seats }]),
  ["coffee-table", { shape: "rect" }], ["coffee-table", { shape: "round" }],
];
for (const [type, p] of VARIANTS) {
  test(`${type} ${JSON.stringify(p)} is drawn at its real size, on the ground`, () => {
    const o = obj(type, p), g = buildProp(o), b = new Box3().setFromObject(g), s = b.getSize(new Vector3()), d = dimensionsOf(o);
    near(s.x, d.w, `${type} width`); near(s.y, d.h, `${type} height`); near(s.z, d.d, `${type} depth`);
    near(b.min.y, 0, `${type} on the ground`);
  });
}

test("dining chairs are tucked in: each seat is half under the table, clear of the legs", () => {
  for (const seats of ["2", "4", "6", "8"]) {
    const g = buildProp(obj("dining-set", { seats }));
    g.updateMatrixWorld(true);
    const boxes = []; g.traverse((c) => { if (c.isMesh) boxes.push(new Box3().setFromObject(c)); });
    const top = boxes.reduce((a, b) => (b.max.y > 0.74 && b.max.y - b.min.y < 0.06 && (!a || b.max.x - b.min.x > a.max.x - a.min.x) ? b : a), null);
    const seatsFound = boxes.filter((b) => Math.abs(b.min.y - 0.43) < 0.005 && Math.abs(b.max.y - 0.47) < 0.005);
    assert.equal(seatsFound.length, Number(seats), `${seats}: one seat per chair`);
    for (const s of seatsFound) {
      const depth = s.max.z - s.min.z, under = Math.max(0, Math.min(s.max.z, top.max.z) - Math.max(s.min.z, top.min.z));
      assert.ok(Math.abs(under / depth - 0.5) < 0.08, `${seats}: ${Math.round((100 * under) / depth)} % of the seat under the table`);
      const legs = boxes.filter((b) => b.min.y < 0.01 && b.max.y > 0.68 && b.max.x - b.min.x < 0.1 && b.max.z - b.min.z < 0.1);
      assert.equal(legs.length, 4, `${seats}: four table legs`);
      for (const l of legs) assert.ok(!l.intersectsBox(s), `${seats}: a seat runs into a table leg`);
    }
  }
});
