// Project records: what's saved in the browser, how they're sorted, and the "not exported" hint.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage } from "../js/model/stage.js";
import { projectRecord, sortProjects, nextProjectAfterDelete, exportAge } from "../js/storage/projects.js";

const H = 3600e3, D = 24 * H;

test("a record carries the stage's id and name", () => {
  const s = createStage({ name: "Bay 3" });
  const r = projectRecord(s, { now: 1000 });
  assert.deepEqual(r, { id: s.id, name: "Bay 3", modified: 1000, exportedAt: null, stage: s });
});

test("newest first, and the next project after a delete", () => {
  const recs = [{ id: "a", modified: 1 }, { id: "b", modified: 3 }, { id: "c", modified: 2 }];
  assert.deepEqual(sortProjects(recs).map((r) => r.id), ["b", "c", "a"]);
  assert.deepEqual(recs.map((r) => r.id), ["a", "b", "c"], "input untouched");
  assert.equal(nextProjectAfterDelete(recs, "b"), "c");
  assert.equal(nextProjectAfterDelete([{ id: "a", modified: 1 }], "a"), null);
});

test("export hint", () => {
  const now = 10 * D;
  assert.equal(exportAge({ modified: now - H, exportedAt: null }, now), "Not exported yet");
  assert.equal(exportAge({ modified: now - H, exportedAt: now - 30 * 60e3 }, now), null);
  assert.equal(exportAge({ modified: now - 60e3, exportedAt: now - 5 * 60e3 }, now), "Changed since the last export 5 minutes ago");
  assert.equal(exportAge({ modified: now, exportedAt: now - 2 * H }, now), "Changed since the last export 2 hours ago");
  assert.equal(exportAge({ modified: now, exportedAt: now - 3 * D }, now), "Changed since the last export 3 days ago");
  assert.equal(exportAge({ modified: now, exportedAt: now - D }, now), "Changed since the last export 1 day ago");
});
