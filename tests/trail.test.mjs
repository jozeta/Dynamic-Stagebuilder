// Where you are, for the left panel's breadcrumb: Projects › folders › a match › a stage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { trail } from "../js/model/trail.js";

const match = { id: "m1", name: "Club match", stageIds: ["a", "b"] };

test("nothing open: just Projects, where you are", () => {
  assert.deepEqual(trail({}), [{ kind: "home", text: "Projects", here: true }]);
});

test("a stage on its own: Projects › the stage", () => {
  assert.deepEqual(trail({ stage: { id: "s", name: "Bill drill" } }), [
    { kind: "home", text: "Projects", here: false },
    { kind: "stage", id: "s", text: "Bill drill", here: true },
  ]);
});

test("a match's page: Projects › the match", () => {
  assert.deepEqual(trail({ match, page: "match" }).map((c) => [c.kind, c.text, c.here]), [["home", "Projects", false], ["match", "Club match", true]]);
});

test("a stage of a match: Projects › the match › Stage n: name", () => {
  const t = trail({ match, stage: { id: "b", name: "" } });
  assert.deepEqual(t.map((c) => [c.kind, c.text, c.here]), [["home", "Projects", false], ["match", "Club match", false], ["stage", "Stage 2: Untitled stage", true]]);
  assert.equal(t[1].id, "m1");
});

test("a match that doesn't hold the stage is left out", () => {
  assert.deepEqual(trail({ match, stage: { id: "x", name: "Other" } }).map((c) => c.kind), ["home", "stage"]);
});

test("folders sit between Projects and what is in them", () => {
  const t = trail({ folders: [{ id: "f1", name: "2026" }, { id: "f2", name: "Club" }], match, stage: { id: "a", name: "One" } });
  assert.deepEqual(t.map((c) => [c.kind, c.text]), [["home", "Projects"], ["folder", "2026"], ["folder", "Club"], ["match", "Club match"], ["stage", "Stage 1: One"]]);
  assert.equal(t[2].id, "f2");
});
