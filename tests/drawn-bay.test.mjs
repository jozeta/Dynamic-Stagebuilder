// Drawn bay shapes: a grid of 1 m cells (black = raised ground, white = floor), a slope where they
// meet, saved by name in this browser and carried by the stage that uses it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanBay, insideBay, nearestInBay, raisedHeight, cellAt, RAISE, drawnBay, isDrawn } from "../js/model/bay.js";
import { clampToBay } from "../js/model/snap.js";

// 6 m wide, 4 m deep; row 0 is the up-range row, column 0 the shooter's left (+ x).
const rows = ["000000", "000000", "000111", "000111"];
const bay = () => cleanBay({ width: 6, depth: 4, shape: "drawn", name: "Pit", rows });

test("a drawn bay keeps its name and grid; bad grids become an empty floor of the right size", () => {
  const b = bay();
  assert.equal(isDrawn(b), true);
  assert.equal(b.name, "Pit");
  assert.deepEqual(b.rows, rows);
  const bad = cleanBay({ width: 3.6, depth: 2.2, shape: "drawn", name: 7, rows: ["01x", 5] });
  assert.deepEqual([bad.width, bad.depth], [4, 2], "whole metres");
  assert.deepEqual(bad.rows, ["0100", "0000"], "unknown characters are floor, short rows padded");
  assert.equal(bad.name, "Drawn shape");
  assert.equal(cleanBay({ width: 500, depth: 3, shape: "drawn", rows: [] }).width, 200);
});

test("cells map to the ground: column 0 on the shooter's left, row 0 up range", () => {
  const b = bay();
  assert.equal(cellAt(b, 2.5, 0.5), 0, "front left cell");
  assert.equal(cellAt(b, -2.5, 3.5), 1, "back right cell is raised");
  assert.equal(cellAt(b, 2.5, 3.5), 0);
  assert.equal(cellAt(b, 9, 1), 0, "outside the grid is not raised");
});

test("raised cells are off the floor; props are moved onto the nearest floor", () => {
  const b = bay();
  assert.equal(insideBay([2, 3], b), true);
  assert.equal(insideBay([-2, 3], b), false);
  assert.deepEqual(nearestInBay([-2, 3.5], b), [-2, 2], "the nearest floor is in front of the raised block");
  assert.deepEqual(clampToBay([-2.6, 2.9], b), [-2.6, 2], "the nearer edge is the front of the raised block");
});

test("the ground rises over a slope inside the raised area, the floor stays flat", () => {
  const b = drawnBay({ width: 12, depth: 12, name: "Block", rows: Array.from({ length: 12 }, (_, r) => (r >= 6 ? "000000111111" : "000000000000")) });
  assert.equal(raisedHeight(b, 3, 3), 0, "floor");
  assert.equal(raisedHeight(b, -0.01, 5.99), 0, "at the edge");
  const mid = raisedHeight(b, -RAISE.slope / 2, 9);
  assert.ok(mid > 0.2 && mid < RAISE.height - 0.2, `half way up the slope: ${mid}`);
  assert.equal(raisedHeight(b, -4.5, 10.5), RAISE.height, "on top");
});

test("the Outdoor ground rises on the raised cells, with the banks' earth colour, and stays flat on the floor", async () => {
  const { heightAt, bankBlend } = await import("../js/render/environments/terrain.js");
  const b = drawnBay({ width: 20, depth: 30, name: "Mound", rows: Array.from({ length: 30 }, (_, r) => (r >= 10 && r < 16 ? "00000000111111000000" : "0".repeat(20))) });
  assert.ok(heightAt(-1, 13, b) > 2, "on the mound");
  assert.equal(heightAt(-1, 5, b), 0, "the floor in front of it");
  assert.ok(bankBlend(-1, 13, b) > 0.8, "earth on the mound");
  assert.ok(heightAt(15, 15, b) > 1, "the side banks still run round the bay");
});

test("raised ground gets grass, bushes and stones, but no trees on the drawn area", async () => {
  const { buildFoliage } = await import("../js/render/environments/foliage.js");
  const rows = Array.from({ length: 30 }, (_, r) => (r >= 8 && r < 20 ? "0000" + "1".repeat(12) + "0000" : "0".repeat(20)));
  const b = drawnBay({ width: 20, depth: 30, name: "Hill", rows });
  const g = buildFoliage(b, "nordic");
  const onMound = [];
  g.traverse((o) => { if (o.isInstancedMesh) { const m = new (o.matrix.constructor)(); for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); const x = m.elements[12], z = m.elements[14]; if (Math.abs(x) < 6 && z > 9 && z < 19) onMound.push(1); } } });
  assert.ok(onMound.length > 20, `grass and bushes on the mound: ${onMound.length}`);
  const trees = g.children.filter((c) => !c.isInstancedMesh && Math.abs(c.position.x) <= 10 && c.position.z >= 0 && c.position.z <= 30);
  assert.equal(trees.length, 0, "no trees on the drawn area");
});

test("Technical and Blueprint show the raised ground as a relief at the same heights", async () => {
  const { technical } = await import("../js/render/environments/technical.js");
  const { blueprint } = await import("../js/render/environments/blueprint.js");
  const rows = Array.from({ length: 10 }, (_, r) => (r >= 5 ? "0000011111" : "0000000000"));
  const b = drawnBay({ width: 10, depth: 10, name: "Step", rows });
  for (const env of [technical(b), blueprint(b)]) {
    const relief = env.group.getObjectByName("relief");
    assert.ok(relief, "a relief mesh");
    const pos = relief.geometry.attributes.position;
    let top = 0;
    for (let i = 0; i < pos.count; i++) top = Math.max(top, pos.getY(i));
    assert.ok(Math.abs(top - 2.5) < 0.01, `up to 2.5 m: ${top}`);
  }
  assert.equal(technical({ width: 10, depth: 10 }).group.getObjectByName("relief"), undefined, "none for a plain bay");
});

test("the printed map shades the raised cells, one strip per run of a row", async () => {
  const { mapModel } = await import("../js/model/map.js");
  const { createStage } = await import("../js/model/stage.js");
  const b = drawnBay({ width: 6, depth: 2, name: "Steps", rows: ["110011", "000000"] });
  const raised = mapModel({ ...createStage(), bay: b }, { width: 180, height: 240 }).items.filter((i) => i.kind === "raised");
  assert.equal(raised.length, 2);
  assert.ok(raised.every((r) => r.w > 0 && r.h > 0));
});

test("my shapes: a checked list (at most 30), each with an id; a stage's drawn bay remembers which one it came from", async () => {
  const { cleanShapeList, MAX_SHAPES } = await import("../js/model/bay.js");
  assert.equal(MAX_SHAPES, 30);
  const list = cleanShapeList([{ id: "a", name: "Pit", width: 4, depth: 2, rows: ["0110", "0000"] }, { id: "", name: "x" }, "junk", { id: "a", name: "dupe", width: 2, depth: 2 }]);
  assert.deepEqual(list.map((s) => [s.id, s.name, s.shape]), [["a", "Pit", "drawn"]]);
  assert.equal(cleanShapeList(Array.from({ length: 40 }, (_, i) => ({ id: `s${i}`, name: "n", width: 2, depth: 2 }))).length, 30);
  assert.equal(cleanShapeList(null).length, 0);
  assert.equal(cleanBay({ width: 4, depth: 2, shape: "drawn", shapeId: "a", rows: [] }).shapeId, "a");
});

test("the paint bucket fills the connected area of one colour, like other paint apps", async () => {
  const { floodFill } = await import("../js/model/bay.js");
  const rows = ["0010", "0010", "1110", "0000"];
  assert.deepEqual(floodFill(rows, 0, 0, "1"), ["1110", "1110", "1110", "0000"], "the pocket behind the wall");
  assert.deepEqual(floodFill(rows, 3, 3, "1"), ["0011", "0011", "1111", "1111"], "edge neighbours only: the corner gap doesn't leak");
  assert.deepEqual(floodFill(rows, 2, 0, "0"), ["0000", "0000", "0000", "0000"], "the wall's cells all join up");
  assert.equal(floodFill(rows, 0, 0, "0"), rows, "already that colour: nothing changes");
  assert.equal(floodFill(rows, 9, 9, "1"), rows, "outside the sheet");
});

test("outside the drawn area is raised ground at the sides and back; the front stays open", () => {
  const b = drawnBay({ width: 10, depth: 10, name: "Open", rows: [] });
  assert.equal(raisedHeight(b, 0, 5), 0, "the floor");
  assert.equal(raisedHeight(b, 5 + RAISE.slope + 1, 5), RAISE.height, "beside the drawing");
  assert.equal(raisedHeight(b, 0, 10 + RAISE.slope + 1), RAISE.height, "behind it");
  const mid = raisedHeight(b, 5 + RAISE.slope / 2, 5);
  assert.ok(mid > 0.2 && mid < RAISE.height - 0.2, `a slope up from the floor's edge: ${mid}`);
  assert.equal(raisedHeight(b, 0, -3), 0, "up range is open");
  assert.equal(insideBay([5 + 1, 5], b), false);
});

test("the Technical relief reaches past the drawing's sides and back, where the ground is raised", async () => {
  const { technical } = await import("../js/render/environments/technical.js");
  const b = drawnBay({ width: 10, depth: 10, name: "Plain", rows: [] });
  const relief = technical(b).group.getObjectByName("relief");
  relief.geometry.computeBoundingBox();
  const bb = relief.geometry.boundingBox;
  assert.ok(bb.max.x > 5 + RAISE.slope && bb.max.z > 10 + RAISE.slope, "beyond the grid");
  assert.ok(bb.min.z >= 0, "not in front");
  assert.ok(Math.abs(bb.max.y - RAISE.height) < 0.01);
});
