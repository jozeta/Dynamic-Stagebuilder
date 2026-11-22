// Matches: a named set of one or more stages, in order, each getting the match name and its number.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMatch, addStages, removeStage, moveStage, renameMatch, matchSummary, briefingFor, cleanMatch } from "../js/model/match.js";
import { createStage, addObject } from "../js/model/stage.js";

const stageWith = (n) => { let s = createStage({ name: `S${n}` }); for (let i = 0; i < n; i++) s = addObject(s, "paper-ipsc", [i, 10]).stage; return s; };

test("a new match has a name and no stages; stages are added once each, in order", () => {
  const m = createMatch({ name: "Club match", now: 1000 });
  assert.equal(m.name, "Club match");
  assert.deepEqual(m.stageIds, []);
  const m2 = addStages(m, ["a", "b", "a", "c"], 2000);
  assert.deepEqual(m2.stageIds, ["a", "b", "c"], "no stage twice");
  assert.equal(m2.modified, 2000);
  assert.deepEqual(addStages(m2, ["b"], 3000).stageIds, ["a", "b", "c"]);
});

test("stages can be moved up and down and taken out of the match", () => {
  let m = addStages(createMatch({ name: "M", now: 1 }), ["a", "b", "c"], 1);
  m = moveStage(m, "c", -1, 2);
  assert.deepEqual(m.stageIds, ["a", "c", "b"]);
  assert.deepEqual(moveStage(m, "a", -1, 3).stageIds, ["a", "c", "b"], "the first can't go further up");
  m = removeStage(m, "c", 4);
  assert.deepEqual(m.stageIds, ["a", "b"]);
  assert.equal(renameMatch(m, "  Regional 2027 ", 5).name, "Regional 2027");
  assert.equal(renameMatch(m, "   ", 5).name, "M", "a blank name is ignored");
});

test("each stage in a match gets the match name and its stage number in the briefing", () => {
  const m = addStages(createMatch({ name: "Spring Cup", now: 1 }), ["x", "y"], 1);
  assert.deepEqual(briefingFor(m, "y"), { matchName: "Spring Cup", stageNumber: 2 });
  assert.equal(briefingFor(m, "z"), null, "not in the match");
});

test("the match summary adds up stages, rounds and points (missing stages are skipped)", () => {
  const a = { ...stageWith(2), id: "a" }, b = { ...stageWith(3), id: "b" };
  const m = addStages(createMatch({ name: "M", now: 1 }), ["a", "b", "gone"], 1);
  const s = matchSummary(m, [a, b]);
  assert.equal(s.stages, 2);
  assert.equal(s.minRounds, 10, "2 hits per paper target");
  assert.equal(s.maxPoints, 50);
  assert.deepEqual(s.missing, ["gone"]);
});

test("a stored match is checked before use", () => {
  const ok = cleanMatch({ kind: "match", id: "m1", name: "X", stageIds: ["a", "a", 3, "b"], created: 1, modified: 2 });
  assert.deepEqual(ok.stageIds, ["a", "b"]);
  assert.equal(cleanMatch({ kind: "match", id: "", name: "X", stageIds: [] }), null, "no id");
  assert.equal(cleanMatch("nope"), null);
  assert.equal(cleanMatch({ kind: "match", id: "m", name: "x".repeat(500), stageIds: [] }).name.length, 120);
  assert.equal(cleanMatch({ kind: "match", id: "m", name: "X", stageIds: Array.from({ length: 300 }, (_, i) => `s${i}`) }).stageIds.length, 100, "at most 100 stages");
});

test("adding a stage that is in another match moves it: it leaves the other match, which closes up", async () => {
  const { createMatch, addStages, takeFromOthers } = await import("../js/model/match.js");
  const a = addStages(createMatch({ name: "A" }), ["s1", "s2", "s3"]), b = addStages(createMatch({ name: "B" }), ["s9"]);
  const changed = takeFromOthers([a, b], b.id, ["s2", "s9"]);
  assert.equal(changed.length, 1, "only the match that loses a stage changes");
  assert.deepEqual(changed[0].stageIds, ["s1", "s3"]);
  assert.deepEqual(takeFromOthers([a, b], b.id, ["s7"]), [], "stages in no other match: nothing changes");
});

test("the match window's list: add once, move up and down, remove", async () => {
  const { draftAdd, draftMove, draftRemove } = await import("../js/model/match.js");
  let d = [];
  d = draftAdd(d, { key: "own:a", name: "A" });
  d = draftAdd(d, { key: "lib:x", name: "X" });
  d = draftAdd(d, { key: "own:a", name: "A" });
  assert.deepEqual(d.map((x) => x.key), ["own:a", "lib:x"], "each stage once");
  assert.deepEqual(draftMove(d, 1, -1).map((x) => x.key), ["lib:x", "own:a"]);
  assert.deepEqual(draftMove(d, 0, -1), d, "the first can't go up");
  assert.deepEqual(draftRemove(d, 0).map((x) => x.key), ["lib:x"]);
});
