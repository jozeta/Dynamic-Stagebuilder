// The editor turns user actions into undoable stage edits (snapped, clamped and numbered).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditor } from "../js/editor.js";
import { canUndo } from "../js/model/history.js";

function placed(type = "paper-ipsc", position = [1, 5]) {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: type, position });
  return ed;
}

test("placing a target adds it, numbers it, selects it and can be undone", () => {
  let changes = 0;
  const ed = createEditor({ onChange: () => changes++ });
  ed.dispatch({ type: "setMode", mode: { place: "paper-ipsc" } });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [1.12, 5.13] });
  const s = ed.stage();
  assert.equal(s.objects.length, 1);
  assert.equal(s.objects[0].label, "T1");
  assert.deepEqual(s.objects[0].position, [1, 5.25]);
  assert.deepEqual(ed.state.selection, [s.objects[0].id]);
  assert.equal(ed.state.mode, "select");
  assert.ok(canUndo(ed.state.history));
  assert.ok(changes >= 2);
});

test("moving snaps to the grid and stops at the bay edge", () => {
  const ed = placed();
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "move", id, position: [11.1, 3.13] });
  assert.deepEqual(ed.stage().objects[0].position, [10, 3.25]);
  ed.dispatch({ type: "move", id, position: [0, -4] });
  assert.deepEqual(ed.stage().objects[0].position, [0, 0]);
});

test("a whole drag is one undo step", () => {
  const ed = placed();
  const id = ed.stage().objects[0].id;
  const steps = ed.state.history.past.length;
  ed.dispatch({ type: "dragStart", ids: [id] });
  ed.dispatch({ type: "dragMove", delta: [0.5, 0.5] });
  ed.dispatch({ type: "dragMove", delta: [2, 1] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(ed.stage().objects[0].position, [3, 6]);
  assert.equal(ed.state.history.past.length, steps + 1);
  ed.dispatch({ type: "undo" });
  assert.deepEqual(ed.stage().objects[0].position, [1, 5]);
});

test("rotation wraps and snaps", () => {
  const ed = placed();
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setRotation", id, value: 345 });
  ed.dispatch({ type: "rotate", by: 30 });
  assert.equal(ed.stage().objects[0].rotation, 15);
  ed.dispatch({ type: "rotate", by: -30 });
  assert.equal(ed.stage().objects[0].rotation, 345);
});

test("params are clamped to the prop's limits", () => {
  const ed = placed("wall-mesh");
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setParams", id, params: { length: 99, mesh: "blue" } });
  assert.equal(ed.stage().objects[0].params.length, 4);
  assert.equal(ed.stage().objects[0].params.mesh, "blue");
  ed.dispatch({ type: "setParams", id, params: { mesh: "pink" } });
  assert.equal(ed.stage().objects[0].params.mesh, "blue");
});

test("delete clears the selection and undo brings the target and its label back", () => {
  const ed = placed();
  ed.dispatch({ type: "delete" });
  assert.equal(ed.stage().objects.length, 0);
  assert.deepEqual(ed.state.selection, []);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[0].label, "T1");
});

test("duplicate selects the copies and numbers them", () => {
  const ed = placed();
  ed.dispatch({ type: "duplicate" });
  const s = ed.stage();
  assert.equal(s.objects.length, 2);
  assert.equal(s.objects[1].label, "T2");
  assert.deepEqual(ed.state.selection, [s.objects[1].id]);
});

test("select replaces or adds", () => {
  const ed = placed();
  ed.dispatch({ type: "place", propType: "barrel", position: [3, 3] });
  const [a, b] = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "select", ids: [a] });
  ed.dispatch({ type: "select", ids: [b], add: true });
  assert.deepEqual(ed.state.selection, [a, b]);
  ed.dispatch({ type: "select", ids: [a], add: true });
  assert.deepEqual(ed.state.selection, [b]);
  ed.dispatch({ type: "select", ids: [] });
  assert.deepEqual(ed.state.selection, []);
});

test("drawing a fault line: points snap, finish adds one undoable line, Escape cancels", () => {
  const ed = createEditor();
  ed.dispatch({ type: "beginDraw", lineType: "fault-line" });
  ed.dispatch({ type: "addPoint", point: [0.1, 2.1] });
  ed.dispatch({ type: "addPoint", point: [3, 2] });
  ed.dispatch({ type: "addPoint", point: [3, 4] });
  ed.dispatch({ type: "finishDraw" });
  const s = ed.stage();
  assert.equal(s.lines.length, 1);
  assert.deepEqual(s.lines[0].points, [[0, 2], [3, 2], [3, 4]]);
  assert.equal(s.lines[0].closed, false);
  assert.equal(ed.state.mode, "select");
  ed.dispatch({ type: "beginDraw", lineType: "shooting-area" });
  ed.dispatch({ type: "addPoint", point: [0, 0] });
  ed.dispatch({ type: "addPoint", point: [1, 0] });
  ed.dispatch({ type: "finishDraw" });
  assert.equal(ed.stage().lines.length, 1, "an area needs three points");
  ed.dispatch({ type: "beginDraw", lineType: "fault-line" });
  ed.dispatch({ type: "addPoint", point: [0, 0] });
  ed.dispatch({ type: "cancel" });
  assert.equal(ed.state.mode, "select");
  assert.equal(ed.stage().lines.length, 1);
});

test("start position, renumber and labels", () => {
  const ed = placed();
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [2, 5] });
  ed.dispatch({ type: "place", propType: "paper-ipsc", position: [3, 5] });
  const [a, b] = ed.stage().objects.map((o) => o.id);
  ed.dispatch({ type: "select", ids: [b] });
  ed.dispatch({ type: "delete" });
  ed.dispatch({ type: "renumber" });
  assert.deepEqual(ed.stage().objects.map((o) => o.label), ["T1", "T2"]);
  ed.dispatch({ type: "setLabel", id: a, text: "T9" });
  assert.equal(ed.stage().objects[0].label, "T9");
  ed.dispatch({ type: "setStart", position: [0.1, 1.1], facing: 0 });
  assert.deepEqual(ed.stage().start, { position: [0, 1], facing: 0 });
});

test("switching environment changes no geometry and adds no undo step", () => {
  const ed = placed();
  ed.dispatch({ type: "beginDraw", lineType: "fault-line" });
  ed.dispatch({ type: "addPoint", point: [0, 2] });
  ed.dispatch({ type: "addPoint", point: [3, 2] });
  ed.dispatch({ type: "finishDraw" });
  const before = structuredClone(ed.stage());
  const steps = ed.state.history.past.length;
  ed.dispatch({ type: "setEnvironment", name: "outdoor" });
  const after = ed.stage();
  assert.equal(after.settings.environment, "outdoor");
  for (const k of ["bay", "objects", "lines", "start"]) assert.deepEqual(after[k], before[k], k);
  assert.equal(ed.state.history.past.length, steps);
});

test("bay size is clamped to 1–200 m and objects stay inside a smaller bay", () => {
  const ed = placed("barrel", [8, 25]);
  ed.dispatch({ type: "setBay", width: 10, depth: 500 });
  assert.deepEqual(ed.stage().bay, { width: 10, depth: 200 });
  assert.deepEqual(ed.stage().objects[0].position, [5, 25]);
});

test("the same snapped point twice in a row is stored once (double-click to finish)", () => {
  const ed = createEditor();
  ed.dispatch({ type: "beginDraw", lineType: "fault-line" });
  ed.dispatch({ type: "addPoint", point: [0, 2] });
  ed.dispatch({ type: "addPoint", point: [3, 2] });
  ed.dispatch({ type: "addPoint", point: [3.05, 2.02] });
  assert.deepEqual(ed.state.mode.points, [[0, 2], [3, 2]]);
});
