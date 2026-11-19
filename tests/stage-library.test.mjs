// The stage library: ready-made stages and drills the user can open as a new project and edit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { STAGE_LIBRARY, LIBRARY_CATEGORIES, libraryStage, librarySummary } from "../js/model/stage-library.js";
import { validateStage } from "../js/model/schema.js";
import { stageStats } from "../js/model/stats.js";
import { SCORING } from "../js/model/scoring-rules.js";

test("the library has stages in every category, with unique ids and names", () => {
  assert.ok(STAGE_LIBRARY.length >= 25, `${STAGE_LIBRARY.length} stages`);
  assert.equal(new Set(STAGE_LIBRARY.map((s) => s.id)).size, STAGE_LIBRARY.length);
  assert.equal(new Set(STAGE_LIBRARY.map((s) => s.name)).size, STAGE_LIBRARY.length);
  for (const c of LIBRARY_CATEGORIES) assert.ok(STAGE_LIBRARY.some((s) => s.category === c.id), c.id);
});

for (const spec of STAGE_LIBRARY) {
  test(`library stage "${spec.name}" opens as a valid, editable stage`, () => {
    const stage = libraryStage(spec);
    const r = validateStage(JSON.parse(JSON.stringify(stage)));
    assert.ok(r.ok, r.errors?.join("; "));
    assert.equal(stage.name, spec.name);
    assert.ok(stage.objects.length > 0);
    for (const o of stage.objects) {
      assert.ok(Math.abs(o.position[0]) <= stage.bay.width / 2 && o.position[1] >= 0 && o.position[1] <= stage.bay.depth, `${o.type} inside the bay`);
    }
    assert.ok(stage.start, "a start position");
    assert.ok(stage.briefing.procedure.length > 20, "a procedure");
    const s = stageStats(stage);
    assert.ok(s.minRounds > 0);
    if (spec.discipline === "IPSC") {
      const limit = { short: SCORING.courseLimits.Short, medium: SCORING.courseLimits.Medium, long: SCORING.courseLimits.Long }[spec.category];
      if (limit) assert.ok(s.minRounds <= limit, `${s.minRounds} rounds for a ${spec.category} course`);
      for (const o of stage.objects) assert.ok(!["texas-star", "plate-rack", "dueling-tree"].includes(o.type), "no carnival props in IPSC stages");
    }
    // Every target gets a label.
    assert.ok(stage.objects.filter((o) => ["paper", "steel"].some((k) => o.type.startsWith("paper") || k === "steel" && /popper|plate|star|rack|tree/.test(o.type))).every((o) => o.label));
  });
}

test("opening a library stage twice gives two separate projects", () => {
  const a = libraryStage(STAGE_LIBRARY[0]), b = libraryStage(STAGE_LIBRARY[0]);
  assert.notEqual(a.id, b.id);
  a.objects[0].position[0] += 1;
  assert.notDeepEqual(a.objects[0].position, b.objects[0].position, "no shared data");
});

test("each library stage has a one-line summary with its rounds", () => {
  const s = librarySummary(STAGE_LIBRARY[0]);
  assert.match(s.rounds, /^\d+ rounds$/);
  assert.ok(s.targets.length > 0);
});
