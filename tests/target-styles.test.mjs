// Two IPSC target versions (Classic octagon and With head), a per-target switch, a default in
// the stage settings, and an adjustable stand height.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { defaultParams, dimensionsOf, getProp, paperSize, PAPER_SIZES } from "../js/model/props.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";
import { buildProp } from "../js/render/builders/index.js";

const near = (a, b, tol = 0.006, m = "") => assert.ok(Math.abs(a - b) <= tol, `${m} ${a} ≈ ${b}`);
const obj = (type, params = {}) => ({ id: "t", type, params: { ...defaultParams(type), ...params } });

test("real sizes: Classic 45 × 57 cm (mini 30 × 37.5), With head 46 × 76 cm (mini 31 × 51)", () => {
  assert.deepEqual({ ...PAPER_SIZES.classic.ipsc }, { w: 0.45, h: 0.57 });
  assert.deepEqual({ ...PAPER_SIZES.classic.mini }, { w: 0.3, h: 0.375 });
  assert.deepEqual({ ...PAPER_SIZES.head.ipsc }, { w: 0.46, h: 0.76 });
  assert.deepEqual({ ...PAPER_SIZES.head.mini }, { w: 0.31, h: 0.51 });
  assert.deepEqual(paperSize(obj("paper-mini", { style: "head", presentation: "noshoot" })), PAPER_SIZES.head.mini);
});

test("every paper target has a style switch, Classic by default, and a stand height", () => {
  for (const t of ["paper-ipsc", "paper-mini"]) {
    assert.deepEqual([...getProp(t).params.style.options], ["classic", "head"], t);
    assert.equal(defaultParams(t).style, "classic");
    assert.ok(getProp(t).params.mountHeight.max >= 2);
  }
});

test("a target's height is the stand height plus the card for its style", () => {
  near(dimensionsOf(obj("paper-ipsc")).h, 0.7 + 0.57);
  near(dimensionsOf(obj("paper-ipsc", { style: "head", mountHeight: 1.2 })).h, 1.2 + 0.76);
});

test("both styles are drawn at their real size, and the sticks follow the stand height", () => {
  for (const style of ["classic", "head"]) for (const [t, presentation] of [["paper-ipsc", "target"], ["paper-mini", "target"], ["paper-ipsc", "noshoot"]]) {
    const o = obj(t, { style, mountHeight: 0.9, presentation });
    const s = new Box3().setFromObject(buildProp(o)).getSize(new Vector3());
    const d = dimensionsOf(o);
    near(s.y, d.h, 0.01, `${t} ${style} height`);
    near(s.x, d.w, 0.01, `${t} ${style} width`);
  }
});

test("new targets take the stage's default style; switching one target is undoable", () => {
  const ed = createEditor();
  assert.equal(ed.stage().settings.targetStyle, "classic");
  ed.dispatch({ type: "setSetting", key: "targetStyle", value: "head" });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [0, 5] });
  ed.dispatch({ type: "place", propType: "barrel", position: [2, 5] });
  const [t, b] = ed.stage().objects;
  assert.equal(t.params.style, "head");
  assert.equal(b.params.style, undefined, "non-targets get no style");
  ed.dispatch({ type: "setParams", id: t.id, params: { style: "classic" } });
  assert.equal(ed.stage().objects[0].params.style, "classic");
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[0].params.style, "head");
});

test("stage files: targetStyle defaults to classic and only accepts the two styles", () => {
  const s = createStage();
  const { targetStyle, ...rest } = s.settings;
  assert.equal(targetStyle, "classic");
  assert.equal(validateStage({ ...s, settings: rest }).stage.settings.targetStyle, "classic");
  assert.equal(validateStage({ ...s, settings: { ...s.settings, targetStyle: "head" } }).stage.settings.targetStyle, "head");
  assert.equal(validateStage({ ...s, settings: { ...s.settings, targetStyle: "zebra" } }).ok, false);
});
