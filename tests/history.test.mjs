// Undo/redo history over immutable stage snapshots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHistory, commit, undo, redo, canUndo, canRedo } from "../js/model/history.js";

const s = (n) => ({ n });

test("undo and redo round trip", () => {
  let h = commit(commit(createHistory(s(0)), s(1)), s(2));
  h = undo(h);
  assert.deepEqual(h.present, s(1));
  h = redo(h);
  assert.deepEqual(h.present, s(2));
});

test("undo with no past and redo with no future change nothing", () => {
  const h = createHistory(s(0));
  assert.equal(undo(h), h);
  assert.equal(redo(h), h);
  assert.equal(canUndo(h), false);
  assert.equal(canRedo(h), false);
});

test("a new edit after undo clears redo", () => {
  let h = undo(commit(createHistory(s(0)), s(1)));
  assert.equal(canRedo(h), true);
  h = commit(h, s(9));
  assert.equal(canRedo(h), false);
});

test("committing the same stage is a no-op", () => {
  const h = createHistory(s(0));
  assert.equal(commit(h, h.present), h);
});

test("history keeps at most 200 steps", () => {
  let h = createHistory(s(0));
  for (let i = 1; i <= 205; i++) h = commit(h, s(i));
  assert.equal(h.past.length, 200);
  assert.deepEqual(h.present, s(205));
});
