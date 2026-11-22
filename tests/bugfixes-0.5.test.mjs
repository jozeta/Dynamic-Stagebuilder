// Fixes from the 0.5.0 bug check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { alignObjects, mirrorStage } from "../js/model/arrange.js";
import { createStage, addObject } from "../js/model/stage.js";
import { createEditor } from "../js/editor.js";
import { createMatch, addStages, dropStageEverywhere, inOtherMatches } from "../js/model/match.js";

test("align left goes to the shooter's left (+x), right to the shooter's right", () => {
  let s = createStage(); const a = addObject(s, "barrel", [-4, 5]); s = a.stage; const b = addObject(s, "barrel", [3, 5]); s = b.stage;
  assert.deepEqual(alignObjects(s, [a.id, b.id], "left").objects.map((o) => o.position[0]), [3, 3]);
  assert.deepEqual(alignObjects(s, [a.id, b.id], "right").objects.map((o) => o.position[0]), [-4, -4]);
});

test("mirroring swaps left and right no-shoots and hard cover", () => {
  const a = addObject(createStage(), "paper-ipsc", [2, 8], 0, { layout: "side-left", card1: "target:left-1/2", card2: "noshoot" });
  const p = mirrorStage(a.stage, null).objects[0].params;
  assert.equal(p.layout, "side-right");
  assert.equal(p.card1, "target:right-1/2");
});

test("a match's name and number on the open stage are not undo steps, and undo keeps them", () => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 5] });
  ed.dispatch({ type: "applyMatch", patch: { matchName: "Spring Cup", stageNumber: 3 } });
  assert.equal(ed.stage().briefing.matchName, "Spring Cup");
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects.length, 0, "the undo undid the barrel");
  assert.equal(ed.stage().briefing.matchName, "Spring Cup", "…not the match");
  assert.equal(ed.stage().briefing.stageNumber, 3);
  ed.dispatch({ type: "redo" });
  assert.equal(ed.stage().briefing.stageNumber, 3);
});

test("a group drag in a notched bay stops as a whole at the floor's edge", () => {
  const ed = createEditor();
  ed.dispatch({ type: "setBay", width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 8, notchDepth: 10 });
  ed.dispatch({ type: "setSetting", key: "grid", value: 0 });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 18] });
  ed.dispatch({ type: "place", propType: "barrel", position: [2, 18] });
  const ids = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "dragStart", ids });
  ed.dispatch({ type: "dragMove", delta: [6, 8] });
  ed.dispatch({ type: "dragEnd" });
  const [a, b] = ed.stage().objects.map((o) => o.position);
  assert.ok(Math.abs((b[0] - a[0]) - 2) < 1e-6 && Math.abs(b[1] - a[1]) < 1e-6, `the group keeps its shape: ${JSON.stringify([a, b])}`);
});

test("matches: which stages are in other matches, and a deleted stage leaves every match", () => {
  const m1 = addStages(createMatch({ name: "A", now: 1 }), ["s1", "s2"], 1);
  const m2 = addStages(createMatch({ name: "B", now: 1 }), ["s3"], 1);
  assert.deepEqual([...inOtherMatches([m1, m2], m1.id)], [["s3", "B"]]);
  const changed = dropStageEverywhere([m1, m2], "s1", 5);
  assert.deepEqual(changed.map((m) => [m.name, m.stageIds]), [["A", ["s2"]]], "only the matches it was in");
});

test("opening the store reports a blocked upgrade instead of waiting forever", async () => {
  const { openStore } = await import("../js/storage/db.js");
  const req = {};
  globalThis.indexedDB = { open: () => { setTimeout(() => req.onblocked?.({}), 0); return req; } };
  try { await assert.rejects(openStore(), (e) => e.name === "BlockedError"); }
  finally { delete globalThis.indexedDB; }
});
