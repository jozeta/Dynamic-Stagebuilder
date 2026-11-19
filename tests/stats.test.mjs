// Stage statistics: counts, minimum rounds, maximum points and the suggested course type.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject } from "../js/model/stage.js";
import { stageStats } from "../js/model/stats.js";

function withTypes(counts) {
  let stage = createStage();
  for (const [t, n] of Object.entries(counts)) for (let i = 0; i < n; i++) stage = addObject(stage, t, [0, 1]).stage;
  return stage;
}

test("6 paper and 2 steel is a 14-round medium course worth 70 points", () => {
  assert.deepEqual(stageStats(withTypes({ "paper-ipsc": 4, "paper-mini": 2, popper: 1, "plate-round": 1 })),
    { paper: 6, steel: 2, noShoots: 0, minRounds: 14, maxPoints: 70, suggestedType: "Medium", overLimit: false });
});

test("12 rounds is short, 13 medium", () => {
  assert.equal(stageStats(withTypes({ "paper-ipsc": 6 })).suggestedType, "Short");
  assert.equal(stageStats(withTypes({ "paper-ipsc": 6, popper: 1 })).suggestedType, "Medium");
});

test("over 32 rounds stays Long and flags overLimit", () => {
  const s = stageStats(withTypes({ "paper-ipsc": 17 }));
  assert.equal(s.minRounds, 34);
  assert.equal(s.suggestedType, "Long");
  assert.equal(s.overLimit, true);
});

test("no-shoots and props add no rounds or points; empty stage has no type", () => {
  const s = stageStats({ objects: [...withTypes({ "wall-mesh": 4, barrel: 1 }).objects, ...[1, 2, 3].map((i) => ({ id: `n${i}`, type: "paper-ipsc", params: { presentation: "noshoot" } }))] });
  assert.equal(s.noShoots, 3);
  assert.equal(s.minRounds, 0);
  assert.equal(s.maxPoints, 0);
  assert.equal(s.suggestedType, null);
});
