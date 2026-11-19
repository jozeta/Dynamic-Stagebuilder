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
