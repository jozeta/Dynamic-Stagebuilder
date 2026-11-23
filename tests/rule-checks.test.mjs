// Rule checks for a stage and a match (IPSC Handgun Competition Rules, January 2026 Edition): each
// check names its rule, and a failed one lists the props or lines to show on the stage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, addLine, setBriefing, setStart } from "../js/model/stage.js";
import { stageChecks, matchChecks, RULES_EDITION } from "../js/model/rule-checks.js";

const byId = (checks, id) => checks.find((c) => c.id === id);
const filledBriefing = (s) => setBriefing(s, { startPosition: "Standing in the start box", gunCondition: "Loaded and holstered, ready condition", startSignal: "Audible", procedure: "Engage all targets." });

function stage(targets = [["paper-ipsc", [0, 10]]]) {
  let s = filledBriefing(createStage());
  s = addLine(s, "shooting-area", [[-1, 1], [1, 1], [1, 3], [-1, 3]], true).stage;
  for (const [type, pos, params] of targets) s = addObject(s, type, pos, 0, params).stage;
  return s;
}

test("every check names its rule and the edition is the January 2026 rulebook", () => {
  assert.match(RULES_EDITION, /January 2026/);
  for (const c of stageChecks(stage())) {
    assert.ok(["ok", "warn", "bad"].includes(c.level), c.id);
    assert.match(c.rule, /^\d+(\.\d+)+$|^Appendix/, c.id);
    assert.ok(c.text.length > 10, c.id);
  }
});

test("a plain stage passes", () => {
  const bad = stageChecks(stage()).filter((c) => c.level !== "ok");
  assert.deepEqual(bad, []);
});

test("round limits: over 32 rounds fails 1.2.1.3; over the chosen course type's limit fails too", () => {
  const many = stage(Array.from({ length: 17 }, (_, i) => ["paper-ipsc", [i - 8, 12]]));         // 34 rounds
  const c = byId(stageChecks(many), "rounds");
  assert.equal(c.level, "bad");
  assert.equal(c.rule, "1.2.1.3");
  const short = setBriefing(stage(Array.from({ length: 7 }, (_, i) => ["paper-ipsc", [i - 3, 12]])), { stageType: "Short" });   // 14 rounds
  const s = byId(stageChecks(short), "rounds");
  assert.equal(s.level, "bad");
  assert.equal(s.rule, "1.2.1.1");
  assert.match(s.text, /14 rounds.*12.*Short/);
});

test("plates only fails 4.3.3.3; a popper or a paper target makes it pass", () => {
  const plates = stage([["plate-round", [0, 12]], ["plate-round", [2, 12]]]);
  assert.equal(byId(stageChecks(plates), "plates-only").level, "bad");
  assert.equal(byId(stageChecks(stage([["plate-round", [0, 12]], ["popper", [2, 12]]])), "plates-only").level, "ok");
  assert.equal(byId(stageChecks(stage([["plate-round", [0, 12]], ["paper-ipsc", [2, 12]]])), "plates-only").level, "ok");
});

test("steel closer than 7 m to where the shooter stands fails 2.1.3, listing the steel", () => {
  const s = stage([["popper", [0, 8]]]);           // 5 m from the shooting area's far edge (z 3)
  const c = byId(stageChecks(s), "steel-distance");
  assert.equal(c.level, "bad");
  assert.equal(c.rule, "2.1.3");
  assert.equal(c.ids.length, 1);
  assert.equal(byId(stageChecks(stage([["popper", [0, 10.5]]])), "steel-distance").level, "ok");
  // The start box and shooting positions count as places the shooter stands.
  let p = setStart(stage([["popper", [8, 3]]]), [6, 2], 0);
  assert.equal(byId(stageChecks(p), "steel-distance").level, "bad");
  p = addObject(stage([["popper", [-8, 14]]]), "shooting-position", [-8, 9]).stage;
  assert.equal(byId(stageChecks(p), "steel-distance").level, "bad");
});

test("a fault line closer than 8 m to steel is a warning (2.1.3)", () => {
  let s = stage([["popper", [0, 11]]]);
  s = addLine(s, "fault-line", [[-2, 4], [2, 4]], false).stage;      // 7 m from the popper
  const c = byId(stageChecks(s), "fault-line-steel");
  assert.equal(c.level, "warn");
  assert.equal(c.ids.length, 1);
});

test("an open fault line shorter than 1.5 m is a warning (2.2.1.4)", () => {
  let s = stage();
  s = addLine(s, "fault-line", [[3, 2], [4, 2]], false).stage;
  const c = byId(stageChecks(s), "fault-line-length");
  assert.equal(c.level, "warn");
  assert.equal(c.rule, "2.2.1.4");
  s = addLine(stage(), "fault-line", [[3, 2], [4.6, 2]], false).stage;
  assert.equal(byId(stageChecks(s), "fault-line-length").level, "ok");
});

test("a platform over 1 m needs scaling aids (2.2.2)", () => {
  const s = stage([["paper-ipsc", [0, 10]], ["platform", [4, 5], { height: 1.2 }]]);
  const c = byId(stageChecks(s), "obstacle-height");
  assert.equal(c.level, "warn");
  assert.equal(c.rule, "2.2.2");
  assert.equal(byId(stageChecks(stage([["paper-ipsc", [0, 10]], ["platform", [4, 5], { height: 0.6 }]])), "obstacle-height").level, "ok");
});

test("the briefing must give the start position, gun condition, start signal and procedure (3.2.1)", () => {
  const s = setBriefing(stage(), { startSignal: "", procedure: " " });
  const c = byId(stageChecks(s), "briefing");
  assert.equal(c.level, "warn");
  assert.equal(c.rule, "3.2.1");
  assert.match(c.text, /start signal/i);
  assert.match(c.text, /procedure/i);
});

test("a stage with no targets yet: only the briefing and layout checks, no round check failure", () => {
  const c = byId(stageChecks(filledBriefing(createStage())), "rounds");
  assert.equal(c.level, "ok");
});

// Match checks.
const stageOf = (rounds, gunCondition = "Loaded and holstered, ready condition") => {
  let s = setBriefing(createStage(), { gunCondition });
  for (let i = 0; i < rounds / 2; i++) s = addObject(s, "paper-ipsc", [i - 8, 12]).stage;
  return s;
};

test("a 12-stage match with 6 short, 4 medium, 2 long matches the approved ratios (1.2.1.4, Appendix A4)", () => {
  const stages = [...Array(6).fill(10), ...Array(4).fill(20), ...Array(2).fill(30)].map((r) => stageOf(r));
  const c = byId(matchChecks(stages), "ratio");
  assert.equal(c.level, "ok");
  assert.equal(c.rule, "1.2.1.4");
});

test("a 12-stage match with another split is a warning (sanctioned matches need it), naming the approved one", () => {
  const stages = [...Array(8).fill(10), ...Array(2).fill(20), ...Array(2).fill(30)].map((r) => stageOf(r));
  const c = byId(matchChecks(stages), "ratio");
  assert.equal(c.level, "warn");
  assert.match(c.text, /8 short, 2 medium, 2 long/);
  assert.match(c.text, /6 short, 4 medium, 2 long/);
});

test("a small club match only gets the 3:2:1 balance as advice", () => {
  const c = byId(matchChecks([stageOf(10), stageOf(10), stageOf(20)]), "ratio");
  assert.equal(c.level, "ok");
  assert.match(c.text, /3:2:1/);
});

test("more than 25 % empty-chamber starts is a warning (1.2.1.5)", () => {
  const stages = [stageOf(10, "Unloaded and holstered"), stageOf(10, "Unloaded on the table, slide forward, magazines in the pouches"), stageOf(10), stageOf(10)];
  const c = byId(matchChecks(stages), "empty-chamber");
  assert.equal(c.level, "warn");
  assert.equal(c.rule, "1.2.1.5");
  assert.match(c.text, /2 of 4/);
  assert.equal(byId(matchChecks([stageOf(10, "Unloaded and holstered"), stageOf(10), stageOf(10), stageOf(10)]), "empty-chamber").level, "ok");
});

test("the briefing's own stage type wins over the one suggested from the rounds", () => {
  const s = setBriefing(stageOf(10), { stageType: "Medium" });
  const stages = [...Array(5).fill(10).map((r) => stageOf(r)), s, ...Array(4).fill(20).map((r) => stageOf(r)), stageOf(30), stageOf(30)];
  assert.match(byId(matchChecks(stages), "ratio").text, /5 short, 5 medium, 2 long/);
});
