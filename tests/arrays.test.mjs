// Paper target presentations: one prop per array (target, no-shoot, combinations, stacked), hard
// cover, the cards each array is made of, what it counts as, and the IPSC height limit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESENTATIONS, HARD_COVERS, arrayCards, arrayCounts, arrayIssues } from "../js/model/arrays.js";
import { PROPS, defaultParams, dimensionsOf, paperSize } from "../js/model/props.js";
import { stageStats } from "../js/model/stats.js";
import { labelPrefix } from "../js/model/numbering.js";
import { validateStage } from "../js/model/schema.js";
import { createStage } from "../js/model/stage.js";

const obj = (type, params = {}) => ({ id: "a", type, position: [0, 5], rotation: 0, label: null, params: { ...defaultParams(type), ...params } });

test("the separate no-shoot props are gone; targets choose a presentation and a hard cover", () => {
  assert.equal(Object.hasOwn(PROPS, "noshoot"), false);
  assert.equal(Object.hasOwn(PROPS, "noshoot-mini"), false);
  for (const t of ["paper-ipsc", "paper-mini"]) {
    assert.deepEqual(PROPS[t].params.presentation.options, PRESENTATIONS.map((p) => p.id));
    assert.deepEqual(PROPS[t].params.hardCover.options, HARD_COVERS.map((c) => c.id));
    assert.equal(defaultParams(t).presentation, "target");
    assert.equal(defaultParams(t).hardCover, "none");
  }
  for (const id of ["target", "noshoot", "ns-lower", "ns-left", "ns-right", "ns-flank", "ns-behind", "two-overlap", "two-ns-between", "stacked", "stacked-ns"])
    assert.ok(PRESENTATIONS.some((p) => p.id === id), id);
  for (const id of ["none", "lower-1/4", "lower-1/3", "lower-1/2", "left-1/2", "right-1/2", "diagonal"])
    assert.ok(HARD_COVERS.some((c) => c.id === id), id);
});

test("each presentation counts its scoring targets and no-shoots", () => {
  const c = (presentation) => arrayCounts(obj("paper-ipsc", { presentation }));
  assert.deepEqual(c("target"), { paper: 1, noshoot: 0 });
  assert.deepEqual(c("noshoot"), { paper: 0, noshoot: 1 });
  assert.deepEqual(c("ns-flank"), { paper: 1, noshoot: 2 });
  assert.deepEqual(c("two-ns-between"), { paper: 2, noshoot: 1 });
  assert.deepEqual(c("stacked"), { paper: 2, noshoot: 0 });
  const stage = { objects: [obj("paper-ipsc", { presentation: "stacked" }), obj("paper-mini", { presentation: "ns-flank" }), obj("popper")] };
  const s = stageStats(stage);
  assert.equal(s.paper, 3);
  assert.equal(s.noShoots, 2);
  assert.equal(s.steel, 1);
  assert.equal(s.minRounds, 7);
});

test("cards: the lowest card sits on the stand height, stacked targets one above the other", () => {
  const o = obj("paper-ipsc", { presentation: "stacked", mountHeight: 0.3 });
  const { w, h } = paperSize(o);
  const cards = arrayCards(o);
  assert.equal(cards.length, 2);
  assert.ok(cards.every((k) => k.kind === "target"));
  assert.equal(Math.min(...cards.map((k) => k.y)), 0);
  assert.ok(cards[1].y >= h, "the upper target sits above the lower one");
  assert.ok(Math.abs(cards[1].x - cards[0].x) < 1e-9);
  const d = dimensionsOf(o);
  assert.ok(Math.abs(d.h - (0.3 + cards[1].y + h)) < 1e-6, `height ${d.h}`);
  const flank = arrayCards(obj("paper-ipsc", { presentation: "ns-flank" }));
  assert.equal(flank.filter((k) => k.layer === "front" && k.kind === "noshoot").length, 2);
  const fw = dimensionsOf(obj("paper-ipsc", { presentation: "ns-flank" })).w;
  assert.ok(fw > 2 * w, `the flanked array is wider than two cards (${fw})`);
});

test("hard cover goes on the first card of the array only", () => {
  const cards = arrayCards(obj("paper-ipsc", { presentation: "two-overlap", hardCover: "lower-1/3" }));
  assert.equal(cards[0].cover, "lower-1/3");
  assert.equal(cards[1].cover, "none");
});

test("the height limit: IPSC targets top at 1.8 m, mini targets at 1.6 m (Target Array Handbook 2019, 1.5)", () => {
  assert.deepEqual(arrayIssues(obj("paper-ipsc")), []);
  const tall = arrayIssues(obj("paper-ipsc", { presentation: "stacked", mountHeight: 0.7 }));
  assert.equal(tall.length, 1);
  assert.match(tall[0], /1\.8 m/);
  assert.match(tall[0], /Target Array Handbook/);
  assert.equal(arrayIssues(obj("paper-mini", { mountHeight: 1.3 })).length, 1);
});

test("labels: arrays with a scoring target are T, a lone no-shoot is NS", () => {
  assert.equal(labelPrefix(obj("paper-ipsc")), "T");
  assert.equal(labelPrefix(obj("paper-ipsc", { presentation: "noshoot" })), "NS");
  assert.equal(labelPrefix(obj("paper-mini", { presentation: "ns-flank" })), "T");
  assert.equal(labelPrefix("popper"), "P");
});

test("old stages: no-shoot props open as targets presented as no-shoots", () => {
  const s = createStage();
  const json = JSON.parse(JSON.stringify({ ...s, objects: [
    { id: "n1", type: "noshoot", label: "NS1", labelManual: false, position: [0, 5], rotation: 0, params: { mountHeight: 0.9, style: "head" } },
    { id: "n2", type: "noshoot-mini", label: "NS2", labelManual: false, position: [1, 5], rotation: 0, params: { mountHeight: 0.7 } },
  ] }));
  const r = validateStage(json);
  assert.ok(r.ok, r.errors?.join("; "));
  const [a, b] = r.stage.objects;
  assert.equal(a.type, "paper-ipsc");
  assert.deepEqual([a.params.presentation, a.params.style, a.params.mountHeight, a.params.hardCover], ["noshoot", "head", 0.9, "none"]);
  assert.equal(b.type, "paper-mini");
  assert.equal(b.params.presentation, "noshoot");
  assert.equal(a.label, "NS1");
});

test("choosing a tall presentation lowers the stand so the top stays within the IPSC limit", async () => {
  const { createEditor } = await import("../js/editor.js");
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [0, 5] });
  const id = ed.stage().objects.at(-1).id;
  ed.dispatch({ type: "setParams", id, params: { presentation: "stacked" } });
  const o = ed.stage().objects.find((x) => x.id === id);
  assert.deepEqual(arrayIssues(o), [], "no height warning after choosing stacked");
  assert.ok(o.params.mountHeight < 0.7 && o.params.mountHeight >= 0.1, `stand lowered to ${o.params.mountHeight}`);
  // A stand height you set yourself is kept (the inspector then warns).
  ed.dispatch({ type: "setParams", id, params: { mountHeight: 1.2 } });
  assert.equal(ed.stage().objects.find((x) => x.id === id).params.mountHeight, 1.2);
  assert.equal(arrayIssues(ed.stage().objects.find((x) => x.id === id)).length, 1);
});

test("an array with two targets is labelled with both numbers", async () => {
  const { addObject } = await import("../js/model/stage.js");
  const { assignLabels, renumber } = await import("../js/model/numbering.js");
  let s = createStage();
  s = addObject(s, "paper-ipsc", [0, 5]).stage;
  s = addObject(s, "paper-ipsc", [1, 5], 0, { presentation: "two-ns-between" }).stage;
  s = addObject(s, "paper-ipsc", [2, 5]).stage;
  s = assignLabels(s);
  assert.deepEqual(s.objects.map((o) => o.label), ["T1", "T2–3", "T4"]);
  assert.deepEqual(renumber(s).objects.map((o) => o.label), ["T1", "T2–3", "T4"]);
});

test("changing how many targets an array has gives it fresh numbers", async () => {
  const { createEditor } = await import("../js/editor.js");
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [0, 5] });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [1, 5] });
  const [a] = ed.stage().objects;
  ed.dispatch({ type: "setParams", id: a.id, params: { presentation: "two-overlap" } });
  const labels = ed.stage().objects.map((o) => o.label);
  assert.equal(new Set(labels).size, 2);
  assert.match(labels[0], /^T\d+–\d+$/);
  ed.dispatch({ type: "renumber" });
  assert.deepEqual(ed.stage().objects.map((o) => o.label), ["T1–2", "T3"]);
});
