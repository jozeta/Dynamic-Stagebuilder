// 3D builders draw every prop at its real size, standing on the ground, sharing materials.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3, Raycaster } from "three";
import { buildProp } from "../js/render/builders/index.js";
import { defaultParams, dimensionsOf } from "../js/model/props.js";

const obj = (type, params = {}) => ({ id: `id-${type}`, type, params: { ...defaultParams(type), ...params } });
const size = (g) => new Box3().setFromObject(g).getSize(new Vector3());
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a.toFixed(4)} vs ${b.toFixed(4)}`);

function checkSize(type, params) {
  const o = obj(type, params);
  const g = buildProp(o);
  const s = size(g);
  const d = dimensionsOf(o);
  near(s.x, d.w, 0.01, `${type} width`);
  near(s.y, d.h, 0.01, `${type} height`);
  near(s.z, d.d, 0.01, `${type} depth`);
  near(new Box3().setFromObject(g).min.y, 0, 0.001, `${type} stands on the ground`);
  assert.equal(g.userData.id, o.id);
}

for (const type of ["paper-ipsc", "paper-mini", "noshoot", "noshoot-mini", "popper", "mini-popper", "plate-round", "plate-square"]) {
  test(`${type} is drawn at its real size`, () => checkSize(type));
}

test("raised targets keep their real size", () => {
  checkSize("paper-ipsc", { mountHeight: 1.5 });
  checkSize("popper", { baseHeight: 0.5 });
  checkSize("plate-round", { size: 0.3 });
});

test("two targets share one material", () => {
  const mats = (g) => { const m = []; g.traverse((c) => c.material && m.push(c.material)); return m; };
  const a = mats(buildProp(obj("paper-ipsc")));
  const b = mats(buildProp(obj("paper-ipsc")));
  assert.ok(a.length > 0);
  assert.ok(a.some((m) => b.includes(m)));
});

