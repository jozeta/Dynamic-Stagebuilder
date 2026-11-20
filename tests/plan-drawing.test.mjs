// Surroundings from a plan: offered for plain floors only, and walls, doors and windows drawn on the
// plan (snapped together, doors and windows set into the walls), with heights and a cut.
import { test } from "node:test";
import assert from "node:assert/strict";
import { offersPlans } from "../js/model/surroundings.js";

test("My surroundings and New from a plan are offered with Technical and your own, not Outdoor, Blueprint or Industrial", () => {
  assert.equal(offersPlans("outdoor"), false);
  assert.equal(offersPlans("blueprint"), false);
  assert.equal(offersPlans("technical"), true);
  assert.equal(offersPlans("industrial"), false);
  assert.equal(offersPlans("custom:abc"), true);
});

const D = async () => import("../js/model/plan-draw.js");
// A plan of 1000 × 800 px at 1 cm a pixel (10 × 8 m); tolerance 0.4 m = 40 px.
const TOL = 40;

test("walls snap to each other's ends and onto walls, and straighten when nearly level", async () => {
  const { emptyDrawing, addWall } = await D();
  let d = emptyDrawing();
  d = addWall(d, [100, 100], [600, 108], TOL);
  assert.deepEqual(d.walls[0], { a: [100, 100], b: [600, 100] }, "nearly level: straightened");
  d = addWall(d, [620, 90], [610, 500], TOL);
  assert.deepEqual(d.walls[1].a, [600, 100], "starts on the first wall's end");
  assert.deepEqual(d.walls[1].b, [600, 500], "nearly upright: straightened");
  d = addWall(d, [350, 130], [350, 400], TOL);
  assert.deepEqual(d.walls[2].a, [350, 100], "a T onto the first wall");
  assert.equal(addWall(d, [10, 10], [20, 12], TOL), d, "too short: nothing added");
});

test("doors and windows are set into the nearest wall, ends near a corner anchor to it", async () => {
  const { emptyDrawing, addWall, addOpening } = await D();
  let d = addWall(emptyDrawing(), [100, 100], [900, 100], TOL);
  d = addOpening(d, "door", [300, 120], [390, 85], TOL);
  assert.deepEqual(d.doors[0], { a: [300, 100], b: [390, 100] }, "on the wall's line");
  d = addOpening(d, "window", [870, 110], [700, 95], TOL);
  assert.deepEqual(d.windows[0], { a: [900, 100], b: [700, 100] }, "the end near the corner goes to it");
});

test("a door drawn in a gap between two walls fills it: the walls meet the door", async () => {
  const { emptyDrawing, addWall, addOpening } = await D();
  let d = addWall(emptyDrawing(), [100, 100], [400, 100], TOL);
  d = addWall(d, [500, 100], [900, 100], TOL);
  d = addOpening(d, "door", [420, 110], [480, 90], TOL);
  assert.deepEqual(d.doors[0], { a: [400, 100], b: [500, 100] }, "spans the gap, anchored to both wall ends");
});

test("the 3D parts: walls round the openings, a lintel over the door, sill and head round the window, glass", async () => {
  const { emptyDrawing, addWall, addOpening, layout } = await D();
  let d = addWall(emptyDrawing(), [0, 0], [1000, 0], TOL);
  d = addOpening(d, "door", [200, 0], [300, 0], TOL);
  d = addOpening(d, "window", [600, 0], [800, 0], TOL);
  const parts = layout(d, 0.01);
  const kinds = (k) => parts.filter((p) => p.kind === k);
  assert.equal(kinds("wall").length, 3, "three solid stretches");
  assert.equal(kinds("lintel").length, 1);
  assert.deepEqual([kinds("sill").length, kinds("head").length, kinds("glass").length], [1, 1, 1]);
  const lintel = kinds("lintel")[0];
  assert.deepEqual([lintel.y0, lintel.y1], [d.heights.door, d.heights.wall]);
  assert.deepEqual(kinds("wall")[0].a, [0, 0]);
  assert.deepEqual(kinds("wall")[0].b, [2, 0], "in metres");
});

test("cutting at a height trims the chosen kinds only", async () => {
  const { emptyDrawing, addWall, addOpening, layout } = await D();
  let d = addWall(emptyDrawing(), [0, 0], [1000, 0], TOL);
  d = addOpening(d, "window", [600, 0], [800, 0], TOL);
  d = { ...d, cut: { on: true, height: 1.2, walls: true, doors: false, windows: false } };
  const parts = layout(d, 0.01);
  assert.ok(parts.filter((p) => p.kind === "wall").every((p) => p.y1 === 1.2), "walls cut");
  assert.ok(parts.some((p) => p.kind === "head"), "windows not cut: the head is there");
  const all = layout({ ...d, cut: { on: true, height: 1.2, walls: true, doors: true, windows: true } }, 0.01);
  assert.ok(!all.some((p) => p.kind === "head"), "the head is above the cut");
  assert.ok(all.filter((p) => p.kind === "glass").every((p) => p.y1 === 1.2));
});

test("erase, and a stored drawing is checked", async () => {
  const { emptyDrawing, addWall, addOpening, eraseAt, cleanDrawing } = await D();
  let d = addWall(emptyDrawing(), [0, 0], [1000, 0], TOL);
  d = addOpening(d, "door", [200, 0], [300, 0], TOL);
  assert.equal(eraseAt(d, [250, 5], TOL).doors.length, 0, "the door goes first (it lies on top)");
  assert.equal(eraseAt(eraseAt(d, [250, 5], TOL), [600, 5], TOL).walls.length, 0);
  const c = cleanDrawing({ walls: [{ a: [0, 0], b: [10, "x"] }, { a: [0, 0], b: [100, 0] }], doors: "no", heights: { wall: 99 }, cut: { on: "yes", height: 1 } });
  assert.equal(c.walls.length, 1);
  assert.deepEqual(c.doors, []);
  assert.equal(c.heights.wall, 6, "at most 6 m");
  assert.equal(c.cut.on, false);
});

test("plan pixels to the ground, the same way the plan image is laid", async () => {
  const { planToWorld } = await import("../js/model/surroundings.js");
  const plan = { width: 1000, height: 800, metresPerPixel: 0.01, x: 2, z: 15, rotation: 0 };
  assert.deepEqual(planToWorld(plan, [500, 400]), [2, 15], "the centre of the image at the plan's position");
  assert.deepEqual(planToWorld(plan, [500, 0]), [2, 19], "the top of the image toward down range");
  assert.deepEqual(planToWorld(plan, [1000, 400]), [-3, 15], "its right side to the shooter's right (− x)");
});

test("a template keeps its drawing, and your own surroundings build its walls, doors and windows", async () => {
  const { cleanTemplate } = await import("../js/model/surroundings.js");
  const { emptyDrawing, addWall, addOpening } = await D();
  let d = addWall(emptyDrawing(), [0, 400], [1000, 400], TOL);
  d = addOpening(d, "window", [600, 400], [800, 400], TOL);
  const t = cleanTemplate({ id: "t1", name: "Range", plan: { width: 1000, height: 800, metresPerPixel: 0.01, x: 0, z: 15, rotation: 0, opacity: 1 }, pieces: [], drawing: d });
  assert.equal(t.drawing.walls.length, 1);
  assert.equal(t.drawing.windows.length, 1);
  const { setTemplate, custom } = await import("../js/render/environments/custom.js");
  setTemplate(t, null);
  const env = custom({ width: 20, depth: 30 }, { templateId: "t1" });
  const built = env.group.getObjectByName("plan-built");
  assert.ok(built, "the drawn building");
  const kinds = new Set(built.children.map((c) => c.userData.kind));
  for (const k of ["wall", "sill", "head", "glass"]) assert.ok(kinds.has(k), k);
  const wall = built.children.find((c) => c.userData.kind === "wall");
  wall.geometry.computeBoundingBox();
  assert.ok(Math.abs(wall.geometry.boundingBox.max.y - wall.geometry.boundingBox.min.y - 2.4) < 1e-6, "the wall height");
});
