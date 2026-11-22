// Stages saved before props were merged (wall-door, tyre-stack, column…) still sit in storage under
// their old names. Reading them for the Projects panel must not break it: they are upgraded on read,
// and the statistics skip anything they don't know instead of throwing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { stageStats } from "../js/model/stats.js";
import { upgradeRecord } from "../js/storage/projects.js";

const old = { schema: 1, id: "old-1", name: "Old stage", bay: { width: 20, depth: 30 },
  settings: { grid: 0.25, angleSnap: 15, environment: "outdoor", objectSnap: true, look: {}, targetStyle: "classic" },
  objects: [{ id: "w1", type: "wall-door", label: null, labelManual: false, position: [0, 5], rotation: 0, params: { length: 1.5 } },
    { id: "t1", type: "tyre-stack", label: null, labelManual: false, position: [2, 6], rotation: 0, params: { count: 3 } },
    { id: "p1", type: "paper-ipsc", label: "T1", labelManual: false, position: [0, 9], rotation: 0, params: {} }],
  lines: [], start: null, briefing: {}, camera: null };

test("statistics skip a prop type they don't know instead of throwing", () => {
  const st = stageStats({ ...old, objects: [...old.objects, { id: "x", type: "no-such-prop", position: [0, 0], params: {} }] });
  assert.equal(st.paper, 1);
});

test("a stored record with old prop names reads as today's props, same id", () => {
  const r = upgradeRecord({ id: "old-1", name: "Old stage", modified: 1, stage: old });
  assert.equal(r.stage.id, "old-1");
  assert.deepEqual(r.stage.objects.map((o) => o.type), ["wall-mesh", "tyre", "paper-ipsc"]);
  assert.equal(r.stage.objects[0].params.variant, "doorway");
  assert.equal(upgradeRecord(null), null);
  const broken = { id: "b", stage: { nonsense: true } };
  assert.equal(upgradeRecord(broken), broken, "a record that can't be read is left as it is");
});
