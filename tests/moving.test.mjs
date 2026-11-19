// Moving and reactive targets: swinger, drop turner, clamshell, mover, Texas star, plate rack and
// dueling tree. Real sizes, what they count as, and the IPSC note on "carnival" arrays.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { PROPS, defaultParams, dimensionsOf } from "../js/model/props.js";
import { stageStats } from "../js/model/stats.js";
import { labelPrefix } from "../js/model/numbering.js";
import { buildProp } from "../js/render/builders/index.js";

const MOVING = ["swinger", "drop-turner", "clamshell", "mover", "texas-star", "plate-rack", "dueling-tree"];
const obj = (type, params = {}) => ({ id: `id-${type}`, type, params: { ...defaultParams(type), ...params } });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a.toFixed(3)} vs ${b.toFixed(3)}`);

test("the moving and reactive targets are in their own library group", () => {
  for (const t of MOVING) assert.equal(PROPS[t]?.category, "moving", t);
  for (const t of ["swinger", "drop-turner", "clamshell", "mover"]) assert.equal(PROPS[t].scoring, "paper", t);
  for (const t of ["texas-star", "plate-rack", "dueling-tree"]) {
    assert.equal(PROPS[t].scoring, "steel", t);
    assert.match(PROPS[t].note, /not allowed in IPSC/i);
    assert.match(PROPS[t].note, /Target Array Handbook/);
  }
});

test("multi-plate steel counts every plate; moving paper counts as one target", () => {
  const s = stageStats({ objects: [obj("texas-star"), obj("plate-rack"), obj("dueling-tree"), obj("swinger"), obj("mover")] });
  assert.equal(s.steel, 5 + 6 + 6);
  assert.equal(s.paper, 2);
  assert.equal(stageStats({ objects: [obj("texas-star", { plates: 10 })] }).steel, 10);
  assert.equal(labelPrefix("texas-star"), "P");
  assert.equal(labelPrefix("swinger"), "T");
});

for (const t of MOVING) {
  test(`${t} is drawn at its real size, standing on the ground`, () => {
    const variants = t === "texas-star" ? [{}, { plates: 10 }] : t === "plate-rack" ? [{}, { plates: 8 }] : t === "mover" ? [{}, { length: 5 }] : [{}, { style: "head" }].filter((v) => !v.style || PROPS[t].params.style);
    for (const v of variants) {
      const o = obj(t, v);
      const b = new Box3().setFromObject(buildProp(o));
      const s = b.getSize(new Vector3()), d = dimensionsOf(o);
      near(s.x, d.w, 0.01, `${t} width`);
      near(s.y, d.h, 0.01, `${t} height`);
      near(s.z, d.d, 0.01, `${t} depth`);
      near(b.min.y, 0, 0.001, `${t} on the ground`);
    }
  });
}

test("the Texas star has its plates on five arms; the plate rack and tree count their plates in 3D", () => {
  const plates = (o) => { let n = 0; buildProp(o).traverse((c) => { if (c.userData.part === "plate") n++; }); return n; };
  assert.equal(plates(obj("texas-star")), 5);
  assert.equal(plates(obj("texas-star", { plates: 10 })), 10);
  assert.equal(plates(obj("plate-rack")), 6);
  assert.equal(plates(obj("dueling-tree")), 6);
});
