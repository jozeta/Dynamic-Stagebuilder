// Fixes from the 0.7.0 bug check.
import { test } from "node:test";
import assert from "node:assert/strict";
const { createEditor } = await import("../js/editor.js");
const { insideBay, cellAt } = await import("../js/model/bay.js");
const notch = { width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 8, notchDepth: 10 };

test("mirroring the whole stage keeps props on the floor of an asymmetric bay", () => {
  const ed = createEditor();
  ed.dispatch({ type: "setBay", ...notch });
  ed.dispatch({ type: "setSetting", key: "grid", value: 0 });
  ed.dispatch({ type: "place", propType: "barrel", position: [-6, 25] });     // back right: floor
  ed.dispatch({ type: "select", ids: [] });
  ed.dispatch({ type: "mirror", ids: [] });
  const p = ed.stage().objects[0].position;
  assert.deepEqual(p, [6, 25], `mirrored to the back left, which is the cut corner: ended at ${p}`);
  assert.ok(insideBay(p, ed.stage().bay), "…and the bay should mirror with it");
});

test("align keeps props on the floor", () => {
  const ed = createEditor();
  ed.dispatch({ type: "setBay", ...notch });
  ed.dispatch({ type: "setSetting", key: "grid", value: 0 });
  ed.dispatch({ type: "place", propType: "barrel", position: [-6, 25] });
  ed.dispatch({ type: "place", propType: "barrel", position: [6, 10] });
  const ids = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "align", ids, edge: "back" });
  for (const o of ed.stage().objects) assert.ok(insideBay(o.position, ed.stage().bay), `off the floor at ${o.position}`);
});

test("changing a drawn bay's width in the inspector keeps the drawing under the props", () => {
  const ed = createEditor();
  const rows = Array.from({ length: 10 }, () => "1111100000");          // shooter's left half raised
  ed.dispatch({ type: "setBay", width: 10, depth: 10, shape: "drawn", name: "Half", rows });
  const before = cellAt(ed.stage().bay, 2, 5);
  ed.dispatch({ type: "setBay", width: 14, depth: 10 });
  assert.equal(cellAt(ed.stage().bay, 2, 5), before, "the same ground under x = 2");
});

test("a loaded or imported stage has its props on the floor", async () => {
  const { parseStageFile } = await import("../js/storage/files.js");
  const { createStage, addObject } = await import("../js/model/stage.js");
  const rows = Array.from({ length: 10 }, () => "1111100000");
  let s = { ...createStage(), bay: { width: 10, depth: 10, shape: "drawn", name: "Half", rows } };
  s = addObject(s, "barrel", [3, 5]).stage;
  const r = parseStageFile(JSON.stringify(s));
  assert.ok(insideBay(r.stage.objects[0].position, r.stage.bay), `on the floor: ${r.stage.objects[0].position}`);
  const ed = createEditor();
  ed.dispatch({ type: "load", stage: s });
  assert.ok(insideBay(ed.stage().objects[0].position, ed.stage().bay), "and when a saved project opens");
});

test("mirroring the stage mirrors every one-sided bay shape and a drawing", async () => {
  const { mirrorBay } = await import("../js/model/bay.js");
  assert.equal(mirrorBay({ width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 6, notchDepth: 8 }).notchSide, "right");
  assert.equal(mirrorBay({ width: 20, depth: 30, shape: "l", legWidth: 6, footDepth: 8 }).shape, "l-reverse");
  assert.equal(mirrorBay({ width: 20, depth: 30, shape: "dogleg-reverse", partWidth: 12, splitDepth: 8 }).shape, "dogleg");
  assert.deepEqual(mirrorBay({ width: 3, depth: 1, shape: "drawn", name: "x", rows: ["110"] }).rows, ["011"]);
  const t = { width: 20, depth: 30, shape: "t", stemWidth: 6, stemDepth: 10 };
  assert.deepEqual(mirrorBay(t), t, "symmetric shapes stay");
});

test("the database flushes the pending save before another tab's upgrade reloads this one", async () => {
  const { openStore } = await import("../js/storage/db.js");
  const calls = [];
  const db = { objectStoreNames: { contains: () => true }, close: () => calls.push("close"), transaction: () => ({}) };
  const req = { result: db };
  globalThis.indexedDB = { open: () => { setTimeout(() => req.onsuccess?.(), 0); return req; } };
  const reload = globalThis.location;
  try {
    await openStore({ beforeClose: async () => { calls.push("flush"); }, reload: () => calls.push("reload") });
    await db.onversionchange();
    assert.deepEqual(calls, ["flush", "close", "reload"]);
  } finally { delete globalThis.indexedDB; globalThis.location = reload; }
});

test("Technical builds no walls round a drawn bay: its raised ground is the boundary", async () => {
  const { technical } = await import("../js/render/environments/technical.js");
  const { drawnBay } = await import("../js/model/bay.js");
  const env = technical(drawnBay({ width: 10, depth: 10, name: "x", rows: [] }));
  assert.equal(env.group.getObjectByName("walls").children.length, 0);
});
