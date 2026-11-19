// Props from the 2012 US IPSC Nationals stage diagrams: activators (step pad, pull lever), start
// marks, a port with a shutter, hard-cover panels, raised barricades, bobbers, twisters, movers with
// several targets, a wobble platform, a balance rope, a step box, stacked barrels and table gear.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3, Group } from "three";
import { PROPS, defaultParams, dimensionsOf } from "../js/model/props.js";
import { ANIMATED_TYPES } from "../js/model/animation.js";
import { buildProp } from "../js/render/builders/index.js";
import { createStage, addObject } from "../js/model/stage.js";
import { stageStats } from "../js/model/stats.js";
import { createStageView } from "../js/render/stage-view.js";
import { createAnimator } from "../js/render/animate.js";

const NEW = ["step-pad", "pull-lever", "start-marks", "wall-port-shutter", "hardcover-panel", "raised-barricade", "bobber", "twister", "wobble-platform", "balance-rope", "step-box"];
const obj = (type, params = {}) => ({ id: `id-${type}`, type, position: [0, 0], rotation: 0, params: { ...defaultParams(type), ...params } });
function checkSize(o) {
  const b = new Box3().setFromObject(buildProp(o));
  const s = b.getSize(new Vector3()), d = dimensionsOf(o);
  for (const [k, v] of [["x", d.w], ["y", d.h], ["z", d.d]]) assert.ok(Math.abs(s[k] - v) < 0.012, `${o.type} ${JSON.stringify(o.params)} ${k}: ${s[k].toFixed(3)} vs ${v}`);
  assert.ok(Math.abs(b.min.y) < 0.003, `${o.type} on the ground (${b.min.y})`);
}

test("the new props exist in sensible groups", () => {
  for (const t of NEW) assert.ok(PROPS[t], t);
  assert.equal(PROPS["step-pad"].category, "activator");
  assert.equal(PROPS["pull-lever"].category, "activator");
  assert.equal(PROPS["start-marks"].category, "marking");
  assert.equal(PROPS.bobber.scoring, "paper");
  assert.equal(PROPS.twister.scoring, "paper");
  for (const t of ["bobber", "twister", "wobble-platform", "wall-port-shutter"]) assert.ok(ANIMATED_TYPES.includes(t), `${t} can animate`);
});

for (const t of NEW) test(`${t} is drawn at its real size`, () => {
  const variants = { "step-pad": [{ pads: 3 }], "wall-port-shutter": [{ shutter: "open" }, { shutter: "open", portHeight: 0.6 }], bobber: [{ style: "head" }], twister: [{ style: "head" }] }[t] || [];
  for (const v of [{}, ...variants]) checkSize(obj(t, v));
});

test("barrels stack two high; tables carry a pistol, magazines or a gun case; movers carry up to four targets", () => {
  checkSize(obj("barrel", { stack: 2 }));
  assert.ok(Math.abs(dimensionsOf(obj("barrel", { stack: 2 })).h - 1.76) < 1e-9);
  for (const items of ["none", "pistol", "pistol-mags", "case"]) checkSize(obj("table", { items }));
  for (const targets of [1, 2, 4]) checkSize(obj("mover", { targets, length: 5 }));
  let s = createStage();
  s = addObject(s, "mover", [0, 10], 0, { targets: 3 }).stage;
  s = addObject(s, "bobber", [2, 10]).stage;
  s = addObject(s, "twister", [-2, 10]).stage;
  const st = stageStats(s);
  assert.equal(st.paper, 5, "a mover with three cards is three targets");
});

test("bobbers rise and fall, twisters spin, the wobble platform rocks, the shutter opens", () => {
  let s = createStage();
  for (const [i, t] of ["bobber", "twister", "wobble-platform", "wall-port-shutter"].entries()) s = addObject(s, t, [i * 3 - 4, 10], 0, { animate: true }).stage;
  const group = new Group();
  createStageView(group).sync(s);
  const a = createAnimator(group);
  a.sync(s);
  assert.equal(a.count(), 4);
  const pose = () => { const o = {}; group.traverse((c) => { if (c.userData.anim) o[c.uuid] = [c.rotation.x, c.rotation.y, c.rotation.z, c.position.y].map((v) => v.toFixed(4)).join(); }); return o; };
  const p0 = pose();
  a.update(1.1);
  const p1 = pose();
  assert.ok(Object.keys(p0).filter((k) => p0[k] !== p1[k]).length >= 4);
});
