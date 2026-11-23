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
  const start = pairs.find((p) => p.a.id === "start" || p.b.id === "start");
  assert.equal(start.metres, 8);
  assert.deepEqual([start.a.name, start.b.name].sort(), ["Start", "T1"]);
});

test("each line is straight: down range first, then across, each leg with its own length", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 10] });
  ed.dispatch({ type: "place", propType: "barrel", position: [3, 14] });
  const [p] = distancePairs(ed.stage());
  assert.deepEqual(p.legs, [
    { axis: "z", from: [0, 10], to: [0, 14], metres: 4, text: "4.0 m" },
    { axis: "x", from: [0, 14], to: [3, 14], metres: 3, text: "3.0 m" },
  ]);
  assert.equal(p.text, "4.0 m down range, 3.0 m across");
  assert.equal(p.metres, 7);
});

test("props in line get one leg, not a zero-length one", () => {
  const legs = distancePairs(stage()).map((p) => p.legs.length);
  assert.deepEqual(legs, [1, 1, 1, 1]);
  const t1t2 = distancePairs(stage()).find((p) => p.metres === 3);
  assert.equal(t1t2.text, "3.0 m across");
});

test("leg lengths are rounded to one decimal", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 10] });
  ed.dispatch({ type: "place", propType: "barrel", position: [1.26, 11.04] });
  const [p] = distancePairs(ed.stage());
  assert.deepEqual(p.legs.map((l) => l.text), ["1.0 m", "1.3 m"]);
  assert.equal(p.a.name, "Barrel (200 l) 1");
});

test("nothing to join: no lines", () => {
  assert.deepEqual(distancePairs(createStage()), []);
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 10] });
  assert.deepEqual(distancePairs(ed.stage()), []);
});

test("the map with distances draws only straight lines, with a label on each", () => {
  const ed = createEditor({ stage: createStage() });
  ed.dispatch({ type: "setStart", position: [0, 2], facing: 0 });
  for (const p of [[2, 10], [5, 13]]) ed.dispatch({ type: "place", propType: "paper-ipsc", position: p });
  const m = mapModel(ed.stage(), { width: 186, height: 160, region: "content", distances: true });
  const lines = m.items.filter((i) => i.kind === "distance");
  assert.equal(lines.length, 4);
  for (const { points: [[x1, y1], [x2, y2]] } of lines) assert.ok(Math.abs(x1 - x2) < 1e-9 || Math.abs(y1 - y2) < 1e-9, "not diagonal");
  const texts = m.items.filter((i) => i.kind === "distance-label").map((i) => i.text).sort();
  assert.deepEqual(texts, ["2.0 m", "3.0 m", "3.0 m", "8.0 m"]);
  assert.equal(mapModel(ed.stage(), { width: 186, height: 160 }).items.filter((i) => i.kind === "distance").length, 0);
});

test("unlabelled props with the same name are numbered, so the list can tell them apart", () => {
  const ed = createEditor({ stage: createStage() });
  for (const p of [[0, 10], [2, 10], [5, 10]]) ed.dispatch({ type: "place", propType: "barrel", position: p });
  const names = new Set(distancePairs(ed.stage()).flatMap((p) => [p.a.name, p.b.name]));
  assert.deepEqual([...names].sort(), ["Barrel (200 l) 1", "Barrel (200 l) 2", "Barrel (200 l) 3"]);
});
