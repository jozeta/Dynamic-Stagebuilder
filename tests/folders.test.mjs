// Folders for sorting stages and matches (and folders in folders): what's in each, moving things in
// and out, and deleting a folder without losing what it holds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createFolder, cleanFolder, folderOf, moveInto, removeFolder, pathTo, contents, canMoveFolder, renameFolder } from "../js/model/folders.js";

const setup = () => {
  const a = createFolder({ name: "2026", now: 1 });
  const b = createFolder({ name: "Club", parent: a.id, now: 2 });
  return { a, b, all: [a, b] };
};

test("a new folder has a name, a parent and nothing in it", () => {
  const f = createFolder({ name: "  Club matches  ", now: 5 });
  assert.equal(f.kind, "folder");
  assert.equal(f.name, "Club matches");
  assert.equal(f.parent, null);
  assert.deepEqual(f.items, []);
  assert.equal(f.created, 5);
  assert.equal(createFolder({ name: "" }).name, "New folder");
});

test("a stored folder is checked before use", () => {
  assert.equal(cleanFolder(null), null);
  assert.equal(cleanFolder({ kind: "match", id: "x" }), null);
  const f = cleanFolder({ kind: "folder", id: "f", name: "x".repeat(300), parent: 7, items: ["stage:a", 3, "bad", "match:m", "stage:a"] });
  assert.equal(f.name.length, 120);
  assert.equal(f.parent, null);
  assert.deepEqual(f.items, ["stage:a", "match:m"]);
});

test("moving a stage into a folder takes it out of any other", () => {
  const { a, b, all } = setup();
  let next = moveInto(all, "stage:s1", a.id);
  assert.equal(folderOf(next, "stage:s1"), a.id);
  next = moveInto(next, "stage:s1", b.id);
  assert.equal(folderOf(next, "stage:s1"), b.id);
  assert.deepEqual(next.find((f) => f.id === a.id).items, []);
  next = moveInto(next, "stage:s1", null);                 // back to the top
  assert.equal(folderOf(next, "stage:s1"), null);
});

test("what is in a folder: its folders, then its stages and matches", () => {
  const { a, b, all } = setup();
  let next = moveInto(all, "stage:s1", a.id);
  next = moveInto(next, "match:m1", a.id);
  const keys = ["stage:s1", "stage:s2", "match:m1", "match:m2"];
  assert.deepEqual(contents(next, a.id, keys), { folders: [b.id], keys: ["stage:s1", "match:m1"] });
  assert.deepEqual(contents(next, null, keys), { folders: [a.id], keys: ["stage:s2", "match:m2"] });
  assert.deepEqual(contents(next, b.id, keys), { folders: [], keys: [] });
});

test("a folder moves into another, but never into itself or one inside it", () => {
  const { a, b, all } = setup();
  const c = createFolder({ name: "Other" });
  const three = [...all, c];
  assert.equal(canMoveFolder(three, a.id, b.id), false);
  assert.equal(canMoveFolder(three, a.id, a.id), false);
  assert.equal(canMoveFolder(three, c.id, b.id), true);
  const moved = moveInto(three, `folder:${c.id}`, b.id);
  assert.equal(moved.find((f) => f.id === c.id).parent, b.id);
  assert.deepEqual(pathTo(moved, c.id).map((f) => f.name), ["2026", "Club", "Other"]);
  assert.equal(moveInto(three, `folder:${a.id}`, b.id), three);       // refused: unchanged
});

test("deleting a folder moves what it holds up a level", () => {
  const { a, b, all } = setup();
  let next = moveInto(all, "stage:s1", b.id);
  next = removeFolder(next, b.id);
  assert.equal(next.length, 1);
  assert.equal(folderOf(next, "stage:s1"), a.id);
  const c = createFolder({ name: "Inner", parent: a.id });
  next = removeFolder([...next, c], a.id);
  assert.equal(next.find((f) => f.id === c.id).parent, null);
  assert.equal(folderOf(next, "stage:s1"), null);
});

test("renaming keeps a name", () => {
  const { a, all } = setup();
  assert.equal(renameFolder(all, a.id, " Season ").find((f) => f.id === a.id).name, "Season");
  assert.equal(renameFolder(all, a.id, "").find((f) => f.id === a.id).name, "2026");
});
