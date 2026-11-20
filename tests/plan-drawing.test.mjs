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
  d = addWall(d, [575, 115], [575, 300], TOL);
  assert.deepEqual(d.walls[3].a, [575, 100], "near an end but not at it: onto the line, not pulled to the end");
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
  assert.equal(kinds("frame").length, 3, "a door frame: two jambs and a head");
  assert.equal(kinds("leaf").length, 0, "no door leaf unless chosen");
  assert.ok(kinds("wframe").length >= 5, "a window frame: two stiles, two rails, a mullion");
  assert.equal(kinds("ledge").length, 1, "a window ledge");
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

test("a door can have its leaf, closed or standing open", async () => {
  const { emptyDrawing, addWall, addOpening, layout } = await D();
  let d = addWall(emptyDrawing(), [0, 0], [1000, 0], TOL);
  d = addOpening(d, "door", [200, 0], [300, 0], TOL);
  const closed = layout({ ...d, style: { ...d.style, leaf: "closed" } }, 0.01).filter((p) => p.kind === "leaf");
  assert.equal(closed.length, 1);
  assert.equal(closed[0].open, 0);
  const open = layout({ ...d, style: { ...d.style, leaf: "open" } }, 0.01).find((p) => p.kind === "leaf");
  assert.equal(open.open, 90);
});

test("wall ends and opening ends can be picked and nudged; joined ends move together", async () => {
  const { emptyDrawing, addWall, addOpening, nearestAnchor, moveAnchor } = await D();
  let d = addWall(emptyDrawing(), [100, 100], [600, 100], TOL);
  d = addWall(d, [600, 100], [600, 500], TOL);
  d = addOpening(d, "window", [300, 100], [400, 100], TOL);
  assert.deepEqual(nearestAnchor(d, [605, 104], TOL), [600, 100]);
  assert.equal(nearestAnchor(d, [450, 300], TOL), null);
  const m = moveAnchor(d, [600, 100], [3, -2]);
  assert.deepEqual([m.walls[0].b, m.walls[1].a], [[603, 98], [603, 98]], "both walls' shared corner");
  assert.deepEqual(moveAnchor(d, [300, 100], [-1, 0]).windows[0].a, [299, 100]);
});

test("the wall surface and door leaf are kept with the drawing", async () => {
  const { cleanDrawing, WALL_SURFACES } = await D();
  assert.deepEqual(WALL_SURFACES, ["concrete", "block", "brick", "plaster", "wood", "metal"]);
  assert.deepEqual(cleanDrawing({ style: { wall: "brick", leaf: "open" } }).style, { wall: "brick", leaf: "open" });
  assert.deepEqual(cleanDrawing({ style: { wall: "glass", leaf: 3 } }).style, { wall: "concrete", leaf: "none" });
});

test("Force 90°: walls, and doors or windows in a gap, run level or upright", async () => {
  const { emptyDrawing, addWall, addOpening } = await D();
  let d = addWall(emptyDrawing(), [100, 100], [500, 300], TOL, { ortho: true });
  assert.deepEqual(d.walls[0], { a: [100, 100], b: [500, 100] }, "more across than down: level");
  d = addWall(d, [500, 100], [560, 600], TOL, { ortho: true });
  assert.deepEqual(d.walls[1].b, [500, 600], "more down than across: upright");
  const gap = addOpening(emptyDrawing(), "door", [100, 100], [190, 130], TOL, { ortho: true });
  assert.deepEqual(gap.doors[0], { a: [100, 100], b: [190, 100] });
});
