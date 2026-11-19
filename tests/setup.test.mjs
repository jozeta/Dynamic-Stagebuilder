// The setup sheet: where each prop goes, measured from the bay's up-range corners and edges.
import { test } from "node:test";
import assert from "node:assert/strict";
import { setupRows, setupLines } from "../js/model/setup.js";
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";

test("each prop: from the left side line, down range, and to both up-range corners; nearest first", () => {
  let s = createStage({ width: 20, depth: 30 });
  s = addObject(s, "paper-ipsc", [4, 12], 30).stage;          // + x is the shooter's left
  s = addObject(s, "barrel", [-6, 3]).stage;
  s = addObject(s, "shooting-position", [0, 2]).stage;
  s = setStart(s, [0, 1], 0);
  const rows = setupRows(assignLabels(s));
  assert.deepEqual(rows.map((r) => r.name), ["Start box", "Barrel (200 l)", "IPSC target"], "by distance down range; plan markers left out");
  const t = rows[2];
  assert.equal(t.label, "T1");
  assert.equal(t.fromLeft, 6);
  assert.equal(t.downRange, 12);
  assert.equal(t.toLeftCorner, 13.42);
  assert.equal(t.toRightCorner, 18.44);
  assert.equal(t.rotation, 30);
});

test("fault lines and shooting areas list their corner points the same way", () => {
  let s = createStage({ width: 20, depth: 30 });
  s = addLine(s, "fault-line", [[10, 5], [-10, 5]], false).stage;
  const l = setupLines(s);
  assert.equal(l.length, 1);
  assert.equal(l[0].name, "Fault line");
  assert.deepEqual(l[0].points, [[0, 5], [20, 5]]);
});

test("rotations read 0–359° as in the inspector", () => {
  const s = addObject(createStage(), "paper-ipsc", [0, 5], -40).stage;
  assert.equal(setupRows(s)[0].rotation, 320);
});
