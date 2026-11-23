// A stage made compact for a view link and its QR code: short ids, no default values, no camera.
// Loaded back through the schema, it is the same stage (only the ids differ, consistently).
import { test } from "node:test";
import assert from "node:assert/strict";
import { compactStage } from "../js/model/compact.js";
import { validateStage } from "../js/model/schema.js";
import { demoStage } from "../js/demo.js";
import { STAGE_LIBRARY, libraryStage } from "../js/model/stage-library.js";

// Ids renamed in order of first appearance, so two stages can be compared whatever their ids.
function canon(stage) {
  const map = new Map();
  const id = (x) => { if (!map.has(x)) map.set(x, `#${map.size}`); return map.get(x); };
  const rest = { ...stage };
  delete rest.camera; delete rest.id;
  return JSON.parse(JSON.stringify({
    ...rest,
    groups: stage.groups?.map((g) => ({ ...g, id: id(g.id) })),
    objects: stage.objects.map((o) => ({ ...o, id: id(o.id), ...(o.group ? { group: id(o.group) } : {}), ...(o.activatedBy ? { activatedBy: id(o.activatedBy) } : {}) })),
    lines: stage.lines.map((l) => ({ ...l, id: id(l.id) })),
  }));
}

test("the example stage comes back the same after compacting", () => {
  const s = validateStage(demoStage()).stage;
  const back = validateStage(compactStage(s));
  assert.equal(back.ok, true, back.errors?.join("; "));
  assert.deepEqual(canon(back.stage), canon(s));
});

test("every library stage comes back the same", () => {
  for (const spec of STAGE_LIBRARY) {
    const s = validateStage(libraryStage(spec)).stage;
    const back = validateStage(compactStage(s));
    assert.equal(back.ok, true, spec.id);
    assert.deepEqual(canon(back.stage), canon(s), spec.id);
  }
});

test("compact is much smaller: short ids, no defaults, no camera", () => {
  const s = validateStage(demoStage()).stage;
  const c = compactStage(s);
  assert.ok(JSON.stringify(c).length < JSON.stringify(s).length / 2, `${JSON.stringify(c).length} vs ${JSON.stringify(s).length}`);
  assert.equal(c.camera, undefined);
  assert.ok(c.objects.every((o) => o.id.length <= 2));
});
