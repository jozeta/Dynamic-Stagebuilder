// Activation links: a moving target started by a popper, plate, step pad or pull lever.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { createEditor } from "../js/editor.js";
import { validateStage } from "../js/model/schema.js";
import { canBeActivated, isActivator, activatorOf, activationLinks, activationText, activatorsFor } from "../js/model/activation.js";
import { briefingRows } from "../js/model/briefing.js";

function stage() {
  let s = createStage({ width: 20, depth: 20 });
  const add = (type, pos) => { const r = addObject(s, type, pos); s = r.stage; return r.id; };
  const swinger = add("swinger", [0, 12]), popper = add("popper", [3, 10]), pad = add("step-pad", [0, 4]), wall = add("wall-wood", [5, 5]);
  const target = add("paper-ipsc", [-3, 10]);
  return { s: assignLabels(s), swinger, popper, pad, wall, target };
}

test("moving targets can be activated; poppers, plates, step pads and pull levers activate", () => {
  for (const t of ["swinger", "drop-turner", "clamshell", "mover", "bobber", "twister", "texas-star", "wall-port-shutter"]) assert.ok(canBeActivated(t), t);
  for (const t of ["paper-ipsc", "popper", "wall-wood", "door"]) assert.ok(!canBeActivated(t), t);
  for (const t of ["popper", "mini-popper", "plate-round", "plate-square", "step-pad", "pull-lever"]) assert.ok(isActivator(t), t);
  for (const t of ["paper-ipsc", "swinger", "barrel"]) assert.ok(!isActivator(t), t);
});

test("linking a swinger to a popper is one undo step; a wrong link changes nothing", () => {
  const { s, swinger, popper, pad, wall, target } = stage();
  const ed = createEditor({ stage: s });
  assert.deepEqual(activatorsFor(ed.stage(), swinger).map((o) => o.id).sort(), [pad, popper].sort());
  ed.dispatch({ type: "setActivator", id: swinger, by: popper });
  assert.equal(activatorOf(ed.stage(), ed.stage().objects.find((o) => o.id === swinger)).id, popper);
  const before = ed.stage();
  ed.dispatch({ type: "setActivator", id: swinger, by: wall });
  ed.dispatch({ type: "setActivator", id: target, by: popper });
  ed.dispatch({ type: "setActivator", id: swinger, by: "nope" });
  assert.equal(ed.stage(), before);
  ed.dispatch({ type: "setActivator", id: swinger, by: null });
  assert.equal(ed.stage().objects.find((o) => o.id === swinger).activatedBy, undefined, "unlinked");
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects.find((o) => o.id === swinger).activatedBy, popper);
});

test("deleting the activator leaves no link behind", () => {
  const { s, swinger, popper } = stage();
  const ed = createEditor({ stage: s });
  ed.dispatch({ type: "setActivator", id: swinger, by: popper });
  ed.state.selection = [popper];
  ed.dispatch({ type: "delete" });
  assert.equal(activatorOf(ed.stage(), ed.stage().objects.find((o) => o.id === swinger)), null);
  assert.deepEqual(activationLinks(ed.stage()), []);
});

test("the briefing lists what activates what", () => {
  const { s, swinger, popper, pad } = stage();
  const ed = createEditor({ stage: s });
  assert.equal(activationText(ed.stage()), "");
  assert.ok(!briefingRows(ed.stage()).some((r) => r.label === "Activated"));
  ed.dispatch({ type: "setActivator", id: swinger, by: popper });
  const sw = ed.stage().objects.find((o) => o.id === swinger), p = ed.stage().objects.find((o) => o.id === popper);
  assert.equal(activationText(ed.stage()), `${sw.label} (swinger) by ${p.label} (IPSC popper)`);
  const r = briefingRows(ed.stage()).find((x) => x.label === "Activated");
  assert.ok(r && r.counted);
  assert.ok(pad);
});

test("imported links are checked: kept when valid, dropped when they point at nothing", () => {
  const { s, swinger, popper } = stage();
  const ed = createEditor({ stage: s });
  ed.dispatch({ type: "setActivator", id: swinger, by: popper });
  const json = JSON.parse(JSON.stringify(ed.stage()));
  const ok = validateStage(json);
  assert.ok(ok.ok);
  assert.equal(ok.stage.objects.find((o) => o.id === swinger).activatedBy, popper);
  json.objects.find((o) => o.id === swinger).activatedBy = "missing-id";
  const dropped = validateStage(json);
  assert.ok(dropped.ok);
  assert.equal(dropped.stage.objects.find((o) => o.id === swinger).activatedBy, undefined);
  json.objects.find((o) => o.id === swinger).activatedBy = 42;
  assert.equal(validateStage(json).ok, false, "not a string");
});

test("in Play, an activated target waits for its activator, moves, and eases back as it resets", async () => {
  const { triggered, STAND_UP } = await import("../js/model/animation.js");
  const trig = { delay: 2, period: 6 };
  assert.deepEqual(triggered(1, trig), { local: 0, weight: 0 }, "before the popper falls: at rest");
  const a = triggered(3, trig);
  assert.equal(a.local, 1); assert.equal(a.weight, 1, "a second after it falls: moving");
  const end = triggered(2 + 6 - STAND_UP / 2, trig);
  assert.ok(end.weight > 0 && end.weight < 1, "while it stands up again, the target eases back");
  assert.equal(triggered(2 + 6, trig).local, 0, "then the next cycle starts from rest");
  assert.equal(triggered(2 + 6, trig).weight, 1);
});

test("the animator holds an activated swinger still until its popper falls", async () => {
  const THREE = await import("three");
  const { buildProp } = await import("../js/render/builders/index.js");
  const { createAnimator } = await import("../js/render/animate.js");
  const { s, swinger, popper } = stage();
  const ed = createEditor({ stage: s });
  ed.dispatch({ type: "setActivator", id: swinger, by: popper });
  ed.dispatch({ type: "setParams", id: swinger, params: { animate: true } });
  const st = ed.stage();
  const root = new THREE.Group();
  for (const o of st.objects) root.add(buildProp(o));
  const anim = createAnimator(root);
  anim.sync(st);
  let fall = null, arm = null;
  root.children.find((c) => c.userData.id === popper).traverse((c) => { if (c.userData.anim?.kind === "fall") fall = c.userData.anim; });
  root.children.find((c) => c.userData.id === swinger).traverse((c) => { if (c.userData.anim) arm = c; });
  assert.ok(fall && arm, "the popper falls and the swinger has a moving part");
  anim.update(fall.delay - 0.2);
  assert.ok(Math.abs(arm.rotation.z) < 1e-9, "still before the popper falls");
  anim.update(fall.delay + 0.7);
  assert.ok(Math.abs(arm.rotation.z) > 0.1, "swinging after it falls");
});
