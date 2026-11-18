// Automatic target labels: T for paper, P for steel, NS for no-shoots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, removeObjects } from "../js/model/stage.js";
import { labelPrefix, assignLabels, renumber, setLabel, duplicateLabels } from "../js/model/numbering.js";

function build(types) {
  let stage = createStage();
  const ids = [];
  for (const t of types) { const r = addObject(stage, t, [0, 1]); stage = r.stage; ids.push(r.id); }
  return { stage: assignLabels(stage), ids };
}
const labels = (s) => s.objects.map((o) => o.label);

test("prefixes", () => {
  assert.equal(labelPrefix("paper-mini"), "T");
  assert.equal(labelPrefix("mini-popper"), "P");
  assert.equal(labelPrefix("plate-square"), "P");
  assert.equal(labelPrefix("noshoot-mini"), "NS");
  assert.equal(labelPrefix("barrel"), null);
});

test("labels follow placement order per prefix", () => {
  const { stage } = build(["paper-ipsc", "popper", "paper-ipsc", "noshoot", "barrel", "paper-mini"]);
  assert.deepEqual(labels(stage), ["T1", "P1", "T2", "NS1", null, "T3"]);
});

test("deleting keeps the gap until renumber", () => {
  let { stage, ids } = build(["paper-ipsc", "paper-ipsc", "paper-ipsc"]);
  stage = removeObjects(stage, [ids[1]]);
  stage = assignLabels(addObject(stage, "paper-ipsc", [0, 1]).stage);
  assert.deepEqual(labels(stage), ["T1", "T3", "T4"]);
  assert.deepEqual(labels(renumber(stage)), ["T1", "T2", "T3"]);
});

test("a hand-set label that collides is reported, and renumber moves the automatic one", () => {
  let { stage, ids } = build(["paper-ipsc", "paper-ipsc", "paper-ipsc"]);
  stage = setLabel(stage, ids[2], "T1");
  assert.deepEqual(duplicateLabels(stage), ["T1"]);
  stage = renumber(stage);
  assert.deepEqual(labels(stage), ["T2", "T3", "T1"]);
  assert.deepEqual(duplicateLabels(stage), []);
  assert.equal(stage.objects[2].labelManual, true);
});

test("setLabel trims, caps at 12 characters, and empty restores the automatic label", () => {
  let { stage, ids } = build(["paper-ipsc", "paper-ipsc"]);
  stage = setLabel(stage, ids[0], "  Hostage target X  ");
  assert.equal(stage.objects[0].label, "Hostage targ");
  stage = setLabel(stage, ids[0], "");
  assert.equal(stage.objects[0].labelManual, false);
  assert.equal(stage.objects[0].label, "T3");
});

test("assignLabels returns the same stage when nothing changes", () => {
  const { stage } = build(["paper-ipsc"]);
  assert.equal(assignLabels(stage), stage);
});
