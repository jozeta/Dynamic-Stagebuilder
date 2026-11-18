// The printed top-down map: down range at the top, the shooter's left (+x) on the left, to scale.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { mapModel } from "../js/model/map.js";

const BOX = { width: 186, height: 120 };
const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("the bay fits the box at a uniform scale", () => {
  const m = mapModel(createStage(), BOX);
  const bay = m.items.find((i) => i.kind === "bay");
  near(m.scale, (120 - 8) / 30);
  assert.ok(bay.w <= 186 && bay.h <= 120);
  near(bay.w, 20 * m.scale);
  near(bay.h, 30 * m.scale);
});

test("+x maps left of centre and down range maps to the top", () => {
  const s = addObject(addObject(createStage(), "barrel", [5, 30]).stage, "barrel", [-5, 0]).stage;
  const m = mapModel(s, BOX);
  const [a, b] = m.items.filter((i) => i.kind === "circle");
  assert.ok(a.x < BOX.width / 2 && b.x > BOX.width / 2);
  assert.ok(a.y < b.y);
  near(a.y, 4);
});

test("fault lines are open polylines, shooting areas closed", () => {
  let s = addLine(createStage(), "fault-line", [[0, 1], [2, 1], [2, 3]], false).stage;
  s = addLine(s, "shooting-area", [[0, 0], [1, 0], [1, 1]], true).stage;
  const polys = mapModel(s, BOX).items.filter((i) => i.kind === "poly");
  assert.equal(polys[0].points.length, 3);
  assert.equal(polys[0].closed, false);
  assert.equal(polys[1].closed, true);
  assert.equal(polys[1].style, "area");
});

test("every scoring target gets its label; walls become rotated rectangles", () => {
  let s = createStage();
  s = addObject(s, "paper-ipsc", [0, 10]).stage;
  s = addObject(s, "popper", [1, 10]).stage;
  s = addObject(s, "wall-mesh", [0, 8], 30, { length: 3 }).stage;
  s = setStart(assignLabels(s), [0, 1], 0);
  const items = mapModel(s, BOX).items;
  assert.deepEqual(items.filter((i) => i.kind === "label").map((i) => i.text).sort(), ["P1", "T1"]);
  const wall = items.find((i) => i.kind === "rect" && i.style === "wall");
  near(wall.w, 3 * mapModel(s, BOX).scale);
  assert.equal(wall.rotation, 30);
  assert.ok(items.some((i) => i.kind === "start"));
});

test("the scale bar is 5 m, or 2 m for a small bay", () => {
  const m = mapModel(createStage(), BOX);
  const bar = m.items.find((i) => i.kind === "scalebar");
  assert.equal(bar.metres, 5);
  near(bar.length, 5 * m.scale);
  assert.equal(mapModel(createStage({ width: 8, depth: 8 }), BOX).items.find((i) => i.kind === "scalebar").metres, 2);
});
