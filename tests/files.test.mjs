// Stage files: export names, and importing untrusted files safely (never overwriting a project).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject } from "../js/model/stage.js";
import { exportFileName, stageToJson, parseStageFile } from "../js/storage/files.js";

test("file names", () => {
  assert.equal(exportFileName(createStage({ name: "Stage 1 – Pistol!" })), "stage-stage-1-pistol.json");
  assert.equal(exportFileName(createStage({ name: "" })), "stage-stage.json");
  assert.equal(exportFileName(createStage({ name: "Å".repeat(10) + " x".repeat(40) })).length <= 52, true);
});

test("a stage round-trips and gets a new id", () => {
  const s = addObject(createStage({ name: "Bay 2" }), "barrel", [1, 2]).stage;
  const r = parseStageFile(stageToJson(s));
  assert.equal(r.ok, true, r.error);
  assert.notEqual(r.stage.id, s.id);
  assert.deepEqual({ ...r.stage, id: s.id }, s);
  assert.match(stageToJson(s), /\n {2}"schema": 1/);
});

test("bad files give a readable error", () => {
  assert.match(parseStageFile("not json").error, /not a stage file/i);
  assert.match(parseStageFile(JSON.stringify({ ...createStage(), schema: 2 })).error, /schema/);
  assert.match(parseStageFile("x".repeat(6_000_000)).error, /too large/i);
  assert.match(parseStageFile("[]").error, /stage/);
});

test("__proto__ in a file does not pollute objects", () => {
  const text = stageToJson(createStage()).replace('"schema": 1', '"__proto__": {"hacked": true}, "schema": 1');
  const r = parseStageFile(text);
  assert.equal(r.ok, true, r.error);
  assert.equal(({}).hacked, undefined);
});

test("a match file holds the match name and its stages in order; importing gives every stage a new id", async () => {
  const { matchToJson, parseFile, matchFileName } = await import("../js/storage/files.js");
  const a = addObject(createStage({ name: "A" }), "barrel", [1, 2]).stage, b = createStage({ name: "B" });
  const text = matchToJson({ name: "Spring Cup" }, [a, b]);
  assert.equal(matchFileName({ name: "Spring Cup" }), "match-spring-cup.json");
  const r = parseFile(text);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.kind, "match");
  assert.equal(r.name, "Spring Cup");
  assert.deepEqual(r.stages.map((s) => s.name), ["A", "B"]);
  assert.ok(r.stages.every((s, i) => s.id !== [a, b][i].id));
  const one = parseFile(stageToJson(a));
  assert.equal(one.kind, "stage");
  assert.equal(one.stage.name, "A");
});

test("a broken match file is refused with the stage that has problems", async () => {
  const { parseFile } = await import("../js/storage/files.js");
  const bad = JSON.stringify({ kind: "dynamic-stagebuilder-match", version: 1, name: "M", stages: [createStage({ name: "ok" }), { schema: 1, name: "bad" }] });
  const r = parseFile(bad);
  assert.equal(r.ok, false);
  assert.match(r.error, /Stage 2/);
  assert.equal(parseFile(JSON.stringify({ kind: "dynamic-stagebuilder-match", version: 1, name: "M", stages: [] })).ok, false, "no stages");
  assert.equal(parseFile(JSON.stringify({ kind: "dynamic-stagebuilder-match", version: 1, name: "M", stages: Array(101).fill(createStage()) })).ok, false, "too many");
});
