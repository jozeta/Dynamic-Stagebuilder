// The Written Stage Briefing: free text from the designer, counted values from the stage itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, setBriefing } from "../js/model/stage.js";
import { stageStats } from "../js/model/stats.js";
import { targetsText, briefingRows, briefingText } from "../js/model/briefing.js";
import { createEditor } from "../js/editor.js";

const stats = (o) => ({ paper: 0, steel: 0, noShoots: 0, ...o });
function stageWith(types) {
  let s = createStage({ name: "Hostage" });
  for (const t of types) s = addObject(s, t, [0, 5]).stage;
  return s;
}
const row = (rows, label) => rows.find((r) => r.label === label);

test("targetsText counts each kind", () => {
  assert.equal(targetsText(stats({})), "None");
  assert.equal(targetsText(stats({ paper: 1 })), "1 paper");
  assert.equal(targetsText(stats({ paper: 8, steel: 2, noShoots: 1 })), "8 paper, 2 steel, 1 no-shoot");
  assert.equal(targetsText(stats({ steel: 1, noShoots: 3 })), "1 steel, 3 no-shoots");
});

test("briefing rows come in WSB order with counted values from the stage", () => {
  let s = stageWith(["paper-ipsc", "paper-ipsc", "popper"]);
  s = setBriefing(s, { matchName: "Club match", stageNumber: 3, designer: "RO team", gunCondition: "Loaded, holstered" });
  const rows = briefingRows(s);
  assert.deepEqual(rows.map((r) => r.label), ["Match", "Stage", "Designer", "Stage type", "Scoring", "Targets",
    "Minimum rounds", "Maximum points", "Start signal", "Start position", "Gun condition", "Stop time"]);
  assert.equal(row(rows, "Stage").value, "3 – Hostage");
  assert.equal(row(rows, "Minimum rounds").value, "5");
  assert.equal(row(rows, "Maximum points").value, "25");
  assert.equal(row(rows, "Targets").value, "2 paper, 1 steel");
  assert.equal(row(rows, "Minimum rounds").counted, true);
  assert.equal(row(rows, "Gun condition").counted, false);
  assert.equal(row(rows, "Start signal").value, "Audible");
  const more = addObject(s, "paper-ipsc", [1, 5]).stage;
  assert.equal(row(briefingRows(more), "Minimum rounds").value, String(stageStats(more).minRounds));
});

test("stage type uses the designer's choice, else the suggestion", () => {
  const s = stageWith(["paper-ipsc"]);
  assert.equal(row(briefingRows(s), "Stage type").value, "Short (suggested)");
  assert.equal(row(briefingRows(setBriefing(s, { stageType: "Medium" })), "Stage type").value, "Medium");
  assert.equal(row(briefingRows(createStage()), "Stage type").value, "–");
});

test("empty text fields show a dash; procedure and notes are separate", () => {
  const s = setBriefing(createStage(), { procedure: "Engage all targets.", notes: "" });
  assert.equal(row(briefingRows(s), "Designer").value, "–");
  assert.deepEqual(briefingText(s), { procedure: "Engage all targets.", notes: "" });
});

test("rename trims to 120 characters and can be undone", () => {
  const ed = createEditor();
  ed.dispatch({ type: "rename", name: `  ${"x".repeat(130)}  ` });
  assert.equal(ed.stage().name.length, 120);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().name, "Stage 1");
});

test("setBriefing keeps text within the file limits and ignores unknown fields", () => {
  const ed = createEditor();
  ed.dispatch({ type: "setBriefing", patch: { procedure: "p".repeat(5000), stageNumber: "7", bogus: 1, stageType: "Long" } });
  const b = ed.stage().briefing;
  assert.equal(b.procedure.length, 4000);
  assert.equal(b.stageNumber, 7);
  assert.equal(b.stageType, "Long");
  assert.equal(Object.hasOwn(b, "bogus"), false);
  ed.dispatch({ type: "setBriefing", patch: { stageType: "Huge", stageNumber: -4 } });
  assert.equal(ed.stage().briefing.stageType, "Long");
  assert.equal(ed.stage().briefing.stageNumber, 0);
});
