// The stage library's ⓘ details (fewest and most shots, course length) and its folders.
import { test } from "node:test";
import assert from "node:assert/strict";
import { STAGE_LIBRARY, LIBRARY_CATEGORIES, libraryInfo, libraryFolders } from "../js/model/stage-library.js";

const byId = (id) => STAGE_LIBRARY.find((s) => s.id === id);

test("a drill fires a fixed number of shots: the fewest and the most are the same", () => {
  const i = libraryInfo(byId("bill-drill"));
  assert.equal(i.minShots, 6);
  assert.equal(i.maxShots, 6);
  assert.equal(i.course, "Short");
  assert.equal(i.shotsText, "Shots: 6 (fixed by the procedure)");
  assert.equal(i.courseText, "Short course length (up to 12 rounds)");
});

test("a Comstock stage has a minimum and no maximum", () => {
  const spec = STAGE_LIBRARY.find((s) => s.category === "medium");
  const i = libraryInfo(spec);
  assert.ok(i.minShots > 12 && i.minShots <= 24, String(i.minShots));
  assert.equal(i.maxShots, null);
  assert.equal(i.course, "Medium");
  assert.equal(i.shotsText, `Shots: ${i.minShots} minimum, no maximum (Comstock: make-up shots allowed)`);
  assert.equal(i.courseText, "Medium course (13 to 24 rounds)");
});

test("long courses say so", () => {
  const i = libraryInfo(STAGE_LIBRARY.find((s) => s.category === "long"));
  assert.equal(i.course, "Long");
  assert.match(i.courseText, /^Long course \(25 to 32 rounds\)$/);
});

test("the library is sorted into folders, one per category, each with its stages", () => {
  const f = libraryFolders(STAGE_LIBRARY);
  assert.deepEqual(f.map((x) => x.id), LIBRARY_CATEGORIES.map((c) => c.id));
  assert.equal(f.reduce((n, x) => n + x.stages.length, 0), STAGE_LIBRARY.length);
  assert.ok(f.every((x) => x.stages.length > 0));
});

test("the library has the researched practice drills and the new stages", () => {
  for (const id of ["blake-drill", "accelerator", "four-aces", "the-heads", "distance-changeup", "exit-drill", "doubles", "coffee-break", "off-hand", "box-to-box"]) assert.ok(byId(id), id);
  assert.equal(byId("blake-drill").category, "practice");
  assert.equal(libraryInfo(byId("accelerator")).minShots, 12);
  assert.equal(libraryInfo(byId("four-aces")).minShots, 4);
});
