// The printed distance sheet: every prop and the start joined by the shortest set of lines that
// connects them all, each with its length in metres (one decimal).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { distancePairs } from "../js/model/distances.js";
import { mapModel } from "../js/model/map.js";

function stage() {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "setStart", position: [0, 2], facing: 0 });
  for (const p of [[0, 10], [3, 10], [3, 14], [-6, 10]]) ed.dispatch({ type: "place", propType: "paper-ipsc", position: p });
  return ed.stage();
}

test("n items are joined by n − 1 lines, each to a near neighbour", () => {
  const pairs = distancePairs(stage());
  assert.equal(pairs.length, 4);
  const len = pairs.map((p) => p.metres).sort((a, b) => a - b);
  assert.deepEqual(len, [3, 4, 6, 8]);
  assert.ok(pairs.every((p) => p.text === `${p.metres.toFixed(1)} m`));
  const start = pairs.find((p) => p.a.id === "start" || p.b.id === "start");
  assert.equal(start.metres, 8);
  assert.deepEqual([start.a.name, start.b.name].sort(), ["Start", "T1"]);
});

test("lengths are rounded to one decimal", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 10] });
  ed.dispatch({ type: "place", propType: "barrel", position: [1, 11] });
  const [p] = distancePairs(ed.stage());
  assert.equal(p.metres, 1.4);
  assert.equal(p.text, "1.4 m");
  assert.equal(p.a.name, "Barrel (200 l) 1");
});

test("nothing to join: no lines", () => {
  assert.deepEqual(distancePairs(createStage()), []);
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 10] });
  assert.deepEqual(distancePairs(ed.stage()), []);
});

test("the map with distances draws a line and a label for each pair", () => {
  const s = stage();
  const m = mapModel(s, { width: 186, height: 160, region: "content", distances: true });
  assert.equal(m.items.filter((i) => i.kind === "distance").length, 4);
  assert.ok(m.items.some((i) => i.kind === "distance-label" && i.text === "8.0 m"));
  assert.equal(mapModel(s, { width: 186, height: 160 }).items.filter((i) => i.kind === "distance").length, 0);
});

test("unlabelled props with the same name are numbered, so the list can tell them apart", () => {
  const ed = createEditor({ stage: createStage() });
  for (const p of [[0, 10], [2, 10], [5, 10]]) ed.dispatch({ type: "place", propType: "barrel", position: p });
  const names = new Set(distancePairs(ed.stage()).flatMap((p) => [p.a.name, p.b.name]));
  assert.deepEqual([...names].sort(), ["Barrel (200 l) 1", "Barrel (200 l) 2", "Barrel (200 l) 3"]);
});
