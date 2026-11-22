// Deleting a target closes its gap: numbers below it stay, numbers above move down by as many as
// were deleted below them (a two-target array takes two). Steel, no-shoots and shooting positions
// count the same way, each in its own series; labels typed by hand stay as they are.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";

function stageWith(list) {
  const ed = createEditor();
  for (const [type, params = {}] of list) {
    ed.dispatch({ type: "place", propType: type, position: [0, 5 + ed.stage().objects.length] });
    if (Object.keys(params).length) ed.dispatch({ type: "setParams", id: ed.stage().objects.at(-1).id, params });
  }
  ed.dispatch({ type: "select", ids: [] });
  return ed;
}
const labels = (ed) => ed.stage().objects.map((o) => o.label);
const idOf = (ed, label) => ed.stage().objects.find((o) => o.label === label).id;

test("deleting T2 of T1–T4: T1 stays, T3 and T4 become T2 and T3", () => {
  const ed = stageWith([["paper-ipsc"], ["paper-ipsc"], ["paper-ipsc"], ["paper-ipsc"]]);
  assert.deepEqual(labels(ed), ["T1", "T2", "T3", "T4"]);
  ed.dispatch({ type: "delete", ids: [idOf(ed, "T2")] });
  assert.deepEqual(labels(ed), ["T1", "T2", "T3"]);
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [3, 9] });
  assert.equal(labels(ed).at(-1), "T4", "the next new target follows on");
});

test("several at once, a two-target array, and steel in its own series", () => {
  const ed = stageWith([["paper-ipsc"], ["paper-ipsc", { presentation: "two-overlap" }], ["popper"], ["paper-ipsc"], ["popper"], ["paper-ipsc"]]);
  assert.deepEqual(labels(ed), ["T1", "T2–3", "P1", "T4", "P2", "T5"]);
  ed.dispatch({ type: "delete", ids: [idOf(ed, "T2–3")] });
  assert.deepEqual(labels(ed), ["T1", "P1", "T2", "P2", "T3"], "two numbers deleted: the ones above move down by two");
  ed.dispatch({ type: "delete", ids: [idOf(ed, "T1"), idOf(ed, "P1")] });
  assert.deepEqual(labels(ed), ["T1", "P1", "T2"]);
});

test("labels typed by hand stay; undo brings the old numbers back; cut closes the gap too", () => {
  const ed = stageWith([["paper-ipsc"], ["paper-ipsc"], ["paper-ipsc"]]);
  ed.dispatch({ type: "setLabel", id: idOf(ed, "T3"), text: "Bonus" });
  ed.dispatch({ type: "delete", ids: [idOf(ed, "T1")] });
  assert.deepEqual(labels(ed), ["T1", "Bonus"]);
  ed.dispatch({ type: "undo" });
  assert.deepEqual(labels(ed), ["T1", "T2", "Bonus"]);
  ed.dispatch({ type: "cut", ids: [idOf(ed, "T1")] });
  assert.deepEqual(labels(ed), ["T1", "Bonus"]);
});

test("shooting positions close up the same way", () => {
  const ed = stageWith([["shooting-position"], ["shooting-position"], ["shooting-position"]]);
  assert.deepEqual(labels(ed), ["1", "2", "3"]);
  ed.dispatch({ type: "delete", ids: [idOf(ed, "1")] });
  assert.deepEqual(labels(ed), ["1", "2"]);
});
