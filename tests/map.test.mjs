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

test("the printed map can crop to what is on the stage, at a larger scale", async () => {
  const { addObject } = await import("../js/model/stage.js");
  let s = createStage({ width: 30, depth: 40 });
  s = addObject(s, "paper-ipsc", [2, 10]).stage;
  s = addObject(s, "barrel", [-3, 14]).stage;
  const bay = mapModel(s, BOX), crop = mapModel(s, { ...BOX, region: "content" });
  assert.ok(crop.scale > bay.scale * 2, `${crop.scale} vs ${bay.scale}`);
  for (const it of crop.items.filter((i) => i.kind === "rect" || i.kind === "circle")) {
    assert.ok(it.x > 0 && it.x < BOX.width && it.y > 0 && it.y < BOX.height, "objects stay inside the box");
  }
});

test("labels of targets standing close together don't overlap", async () => {
  const { addObject } = await import("../js/model/stage.js");
  const { assignLabels } = await import("../js/model/numbering.js");
  let s = createStage({ width: 20, depth: 30 });
  for (const x of [0, 0.4, 0.8, 1.2]) s = addObject(s, "popper", [x, 10]).stage;
  s = addObject(s, "paper-ipsc", [0.2, 10.3]).stage;
  const labels = mapModel(assignLabels(s), { ...BOX, region: "content" }).items.filter((i) => i.kind === "label");
  assert.equal(labels.length, 5);
  assert.ok(labels.every((l) => l.w > 0 && l.h > 0), "labels carry their size");
  const box = (l) => ({ x0: l.x - l.w / 2, x1: l.x + l.w / 2, y0: l.y - l.h, y1: l.y });
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
    const a = box(labels[i]), b = box(labels[j]);
    const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    assert.ok(!overlap, `${labels[i].text} and ${labels[j].text} overlap`);
  }
});
