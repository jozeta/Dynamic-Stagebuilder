// Paper targets: first a layout (where the cards are), then what each card is: a target or a
// no-shoot, each with or without painted hard cover (IPSC Target Array Book, sections 1.2 and 2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LAYOUTS, CARD_KINDS, layoutOf, arrayCards, arrayCounts, fromPresentation, mirrorPaper } from "../js/model/arrays.js";
import { PROPS, defaultParams, upgradeProp } from "../js/model/props.js";
import { createEditor } from "../js/editor.js";
import { createStage, addObject } from "../js/model/stage.js";

const obj = (params) => ({ id: "a", type: "paper-ipsc", position: [0, 5], rotation: 0, params: { ...defaultParams("paper-ipsc"), ...params } });

test("the layouts: one target, two side by side, two one above the other, three side by side and the handbook's overlaps", () => {
  const ids = LAYOUTS.map((l) => l.id);
  for (const id of ["single", "side-by-side", "stacked", "three-side"]) assert.ok(ids.includes(id), id);
  assert.ok(LAYOUTS.length >= 10);
  for (const l of LAYOUTS) {
    assert.ok(l.cards.length >= 1 && l.cards.length <= 3, l.id);
    assert.equal(l.defaults.length, l.cards.length, l.id);
    for (const c of l.cards) assert.ok(typeof c.name === "string" && c.name, `${l.id} names each place`);
  }
  assert.deepEqual(PROPS["paper-ipsc"].params.layout.options, ids);
  assert.equal(defaultParams("paper-ipsc").layout, "single");
});

test("each card is a target or a no-shoot, with or without each hard cover", () => {
  const ids = CARD_KINDS.map((k) => k.id);
  assert.ok(ids.includes("target") && ids.includes("noshoot"));
  assert.ok(ids.includes("target:lower-1/2") && ids.includes("noshoot:diagonal") && ids.includes("target:left-1/2"));
  for (const n of [1, 2, 3]) assert.deepEqual(PROPS["paper-ipsc"].params[`card${n}`].options, ids);
});

test("the cards follow the layout and each card's own kind and cover", () => {
  const cards = arrayCards(obj({ layout: "three-side", card1: "target", card2: "noshoot:lower-1/3", card3: "target:right-1/2" }));
  assert.deepEqual(cards.map((c) => [c.kind, c.cover]), [["target", "none"], ["noshoot", "lower-1/3"], ["target", "right-1/2"]]);
  assert.deepEqual(arrayCounts(obj({ layout: "three-side", card1: "target", card2: "noshoot", card3: "target" })), { paper: 2, noshoot: 1 });
  // Only as many cards as the layout has: a single target ignores card2 and card3.
  assert.equal(arrayCards(obj({ layout: "single", card2: "noshoot" })).length, 1);
  assert.ok(layoutOf({ layout: "nope" }).id === "single");
});

test("stages saved with the old presentations open as the same cards", () => {
  assert.deepEqual(fromPresentation("ns-lower", "none"), { layout: "lower-front", card1: "target", card2: "noshoot" });
  assert.deepEqual(fromPresentation("target", "lower-1/2"), { layout: "single", card1: "target:lower-1/2" });
  assert.deepEqual(fromPresentation("two-ns-between", "none"), { layout: "three-middle-front", card1: "target", card2: "noshoot", card3: "target" });
  const u = upgradeProp("paper-ipsc", { presentation: "stacked-ns", hardCover: "none", mountHeight: 0.4 });
  assert.deepEqual(u.params, { mountHeight: 0.4, layout: "stacked", card1: "noshoot", card2: "target" });
  const s = addObject(createStage(), "paper-ipsc", [0, 5], 0, { presentation: "noshoot" }).stage;
  assert.equal(s.objects[0].params.card1, "noshoot");
  assert.equal(s.objects[0].params.presentation, undefined);
});

test("choosing a layout gives its usual cards; mirroring swaps left and right", () => {
  const ed = createEditor(createStage("L"));
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [0, 5] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setParams", id, params: { layout: "lower-front" } });
  const p = ed.stage().objects[0].params;
  assert.deepEqual([p.layout, p.card1, p.card2], ["lower-front", "target", "noshoot"]);
  ed.dispatch({ type: "setParams", id, params: { card2: "noshoot:lower-1/4" } });
  assert.equal(ed.stage().objects[0].params.card2, "noshoot:lower-1/4");
  assert.deepEqual(mirrorPaper({ layout: "side-left", card1: "target:left-1/2", card2: "noshoot" }), { layout: "side-right", card1: "target:right-1/2", card2: "noshoot" });
  assert.deepEqual(mirrorPaper({ layout: "three-side", card1: "target", card2: "noshoot", card3: "target:lower-1/2" }), { layout: "three-side", card1: "target:lower-1/2", card2: "noshoot", card3: "target" });
});

test("no two layouts are the same arrangement (what each card is, is chosen per card)", () => {
  const RANK = { back: 0, main: 1, front: 2, fore: 2 };
  // Left to right: each card's depth (relative to the deepest), whether it is above, and how it meets
  // its neighbour (overlapping or apart, across and up).
  const shape = (l) => {
    const cards = l.cards.map((c) => ({ x: c.x, y: c.y === "up" ? 1.02 : c.y, r: RANK[c.layer] }));
    const low = Math.min(...cards.map((c) => c.r));
    const sorted = [...cards].sort((a, b) => b.x - a.x || a.y - b.y);
    return sorted.map((c, i) => {
      const n = sorted[i + 1];
      const across = n ? (Math.abs(c.x - n.x) < 1e-9 ? "same" : Math.abs(c.x - n.x) < 1 ? "overlap" : "apart") : "";
      const up = n ? (Math.abs(c.y - n.y) < 0.3 ? "level" : Math.abs(c.y - n.y) < 1 ? "raised" : "above") : "";
      return `${c.r - low}${across}${up}`;
    }).join("|");
  };
  const seen = new Map();
  for (const l of LAYOUTS) {
    const s = shape(l);
    assert.ok(!seen.has(s), `${l.id} is the same arrangement as ${seen.get(s)}`);
    seen.set(s, l.id);
  }
});

test("layouts saved under a name that is gone open as the same arrangement", () => {
  assert.deepEqual(upgradeProp("paper-ipsc", { layout: "between-two", card1: "noshoot", card2: "target", card3: "noshoot" }).params,
    { layout: "three-middle-behind", card1: "noshoot", card2: "target", card3: "noshoot" });
  assert.equal(upgradeProp("paper-ipsc", { layout: "two-overlap", card1: "target", card2: "target" }).params.layout, "side-right");
});
