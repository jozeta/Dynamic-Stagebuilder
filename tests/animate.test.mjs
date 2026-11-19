// Moving props can be animated: each has an Animate switch, and one global play/pause button moves
// only the props whose switch is on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Group } from "three";
import { PROPS, defaultParams } from "../js/model/props.js";
import { ANIMATED_TYPES } from "../js/model/animation.js";
import { createStage, addObject } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";
import { createEditor } from "../js/editor.js";
import { createStageView } from "../js/render/stage-view.js";
import { createAnimator } from "../js/render/animate.js";

test("every moving prop has an Animate switch, off by default", () => {
  assert.deepEqual(ANIMATED_TYPES, ["swinger", "drop-turner", "clamshell", "mover", "texas-star", "plate-rack", "dueling-tree", "popper", "mini-popper"]);
  for (const t of ANIMATED_TYPES) {
    assert.equal(PROPS[t].params.animate?.bool, true, t);
    assert.equal(defaultParams(t).animate, false, t);
  }
  assert.equal(PROPS["paper-ipsc"].params.animate, undefined);
});

test("the switch is saved with the stage and is an undoable edit", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "texas-star", position: [0, 10] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setParams", id, params: { animate: true } });
  assert.equal(ed.stage().objects[0].params.animate, true);
  ed.dispatch({ type: "setParams", id, params: { animate: "yes" } });
  assert.equal(ed.stage().objects[0].params.animate, true, "only true/false are taken");
  assert.ok(validateStage(JSON.parse(JSON.stringify(ed.stage()))).ok);
  const bad = JSON.parse(JSON.stringify(ed.stage()));
  bad.objects[0].params.animate = "yes";
  assert.equal(validateStage(bad).ok, false);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[0].params.animate, false);
});

test("the animator moves only the props whose switch is on, and only while playing", () => {
  let s = createStage();
  const ids = {};
  for (const t of ANIMATED_TYPES) {
    const r = addObject(s, t, [ANIMATED_TYPES.indexOf(t) - 4, 10], 0, { animate: t !== "popper" });
    s = r.stage; ids[t] = r.id;
  }
  const group = new Group();
  const view = createStageView(group);
  view.sync(s);
  const animator = createAnimator(group);
  animator.sync(s);
  assert.equal(animator.count(), ANIMATED_TYPES.length - 1, "the popper's switch is off");
  const pose = () => { const out = {}; group.traverse((c) => { if (c.userData.anim) out[c.uuid] = [c.rotation.x, c.rotation.y, c.rotation.z, c.position.x].map((v) => v.toFixed(4)).join(); }); return out; };
  const a = pose();
  animator.update(1.3);
  const b = pose();
  const changed = Object.keys(a).filter((k) => a[k] !== b[k]).length;
  assert.ok(changed >= ANIMATED_TYPES.length - 1, `${changed} moving parts changed`);
  animator.setPlaying(false);
  animator.update(2.6);
  assert.deepEqual(pose(), b, "paused: nothing moves");
  assert.equal(animator.active(), false);
  animator.setPlaying(true);
  assert.equal(animator.active(), true);
});

test("dueling-tree paddles swing round the post, behind it, at the same height (not up over the top)", async () => {
  const { Vector3 } = await import("three");
  let s = createStage();
  s = addObject(s, "dueling-tree", [0, 10], 0, { animate: true }).stage;
  const group = new Group();
  createStageView(group).sync(s);
  const animator = createAnimator(group);
  animator.sync(s);
  const paddles = [];
  group.traverse((c) => { if (c.userData.part === "plate") paddles.push(c); });
  const at = (p) => p.getWorldPosition(new Vector3());
  const rest = paddles.map(at);
  animator.update(0.25);                      // the first paddle is part way across
  const mid = at(paddles[0]);
  assert.ok(Math.abs(mid.y - rest[0].y) < 1e-6, `height kept: ${mid.y} vs ${rest[0].y}`);
  assert.ok(mid.z > 10 + 0.05, `swings behind the post (z ${mid.z.toFixed(3)})`);
  assert.ok(Math.abs(mid.x) < Math.abs(rest[0].x), "on its way to the other side");
  animator.update(1.5);                       // the first paddle has crossed over
  const done = at(paddles[0]);
  assert.ok(Math.sign(done.x) === -Math.sign(rest[0].x) && Math.abs(Math.abs(done.x) - Math.abs(rest[0].x)) < 1e-3, "now on the other side");
});
