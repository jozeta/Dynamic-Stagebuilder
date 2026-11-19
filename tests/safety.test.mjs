// Safety checks from IPSC CCR Jan 2024: 2.1.2 (90° muzzle angle) and 2.1.3 (7 m from steel, fault
// lines 8 m), and targets nobody can see from where a shooter may stand.
import { test } from "node:test";
import assert from "node:assert/strict";
import { stageChecks, SAFETY } from "../js/model/safety.js";
import { createStage, addObject, addLine } from "../js/model/stage.js";

const area = (s, pts) => addLine(s, "shooting-area", pts, true).stage;
const box = (z0, z1, x0 = -2, x1 = 2) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const ids = (checks, rule) => checks.filter((c) => c.rule === rule).flatMap((c) => c.ids);

test("the rules are cited with their edition", () => {
  assert.match(SAFETY.edition, /January 2024/);
  assert.equal(SAFETY.muzzleAngle, 90);
  assert.equal(SAFETY.steelMin, 7);
  assert.equal(SAFETY.faultLineMin, 8);
});

test("no shooting area, position or start: nothing to check", () => {
  const s = addObject(createStage(), "popper", [0, 3]).stage;
  assert.deepEqual(stageChecks(s), []);
});

test("steel closer than 7 m to where a shooter may stand is flagged, measured to the area's edge", () => {
  let s = area(createStage(), box(0, 3));
  const near = addObject(s, "popper", [0, 9]); s = near.stage;          // 6 m from the area's front edge
  const far = addObject(s, "popper", [3, 12]); s = far.stage;           // > 7 m
  const c = stageChecks(s);
  assert.deepEqual(ids(c, "2.1.3"), [near.id]);
  assert.equal(c.find((x) => x.rule === "2.1.3").level, "bad");
  assert.match(c.find((x) => x.rule === "2.1.3").text, /6\.0 m/);
});

test("a fault line closer than 8 m to steel is a warning", () => {
  let s = area(createStage(), box(0, 2));
  const p = addObject(s, "popper", [0, 12]); s = p.stage;
  s = addLine(s, "fault-line", [[-3, 5], [3, 5]], false).stage;        // 7 m from the popper
  const c = stageChecks(s).filter((x) => x.rule === "2.1.3 fault line");
  assert.equal(c.length, 1);
  assert.equal(c[0].level, "warn");
  assert.deepEqual(c[0].ids.length, 2, "the steel and the fault line");
});

test("a target behind the shooter (up range of where it can be shot) breaks the 90° muzzle angle", () => {
  let s = area(createStage({ depth: 30 }), box(8, 12, -6, 6));
  const front = addObject(s, "paper-ipsc", [0, 20]); s = front.stage;
  const behind = addObject(s, "paper-ipsc", [5, 4], 0); s = behind.stage;   // up range of the whole area
  const side = addObject(s, "paper-ipsc", [5, 10]); s = side.stage;        // level with part of the area
  const c = stageChecks(s);
  const bad = c.filter((x) => x.rule === "2.1.2" && x.level === "bad").flatMap((x) => x.ids);
  const warn = c.filter((x) => x.rule === "2.1.2" && x.level === "warn").flatMap((x) => x.ids);
  assert.deepEqual(bad, [behind.id], "only shootable past 90°");
  assert.deepEqual(warn, [side.id], "shootable safely from part of the area, past 90° from the rest");
  assert.ok(!c.some((x) => x.ids.includes(front.id)));
});

test("a target that can't be seen from anywhere a shooter may stand is flagged", () => {
  let s = area(createStage(), box(0, 2));
  s = addObject(s, "wall-solid", [0, 6], 0, { length: 2, height: 2.5 }).stage;
  const hidden = addObject(s, "paper-ipsc", [0, 8]); s = hidden.stage;
  const seen = addObject(s, "paper-ipsc", [6, 8]); s = seen.stage;
  const c = stageChecks(s).filter((x) => x.rule === "visibility");
  assert.deepEqual(c.flatMap((x) => x.ids), [hidden.id]);
});

test("a target seen only through a low port (kneeling) counts as seen", () => {
  let s = area(createStage(), box(0, 2));
  s = addObject(s, "wall-port", [0, 4], 0, { length: 2, height: 1.6, portWidth: 0.5, portHeight: 0.45, portBottom: 0.7 }).stage;
  s = addObject(s, "wall-solid", [-2, 4], 0, { length: 2, height: 2.5 }).stage;
  s = addObject(s, "wall-solid", [2, 4], 0, { length: 2, height: 2.5 }).stage;
  const t = addObject(s, "paper-ipsc", [0, 9]); s = t.stage;
  assert.ok(!stageChecks(s).some((c) => c.rule === "visibility"));
});

test("no library stage breaks a safety rule (warnings are allowed)", async () => {
  const { STAGE_LIBRARY, libraryStage } = await import("../js/model/stage-library.js");
  for (const spec of STAGE_LIBRARY) {
    const bad = stageChecks(libraryStage(spec)).filter((c) => c.level === "bad" || c.rule === "visibility");
    assert.deepEqual(bad.map((c) => c.text), [], spec.id);
  }
});
