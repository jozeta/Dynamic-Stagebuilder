// Bay shapes: a rectangle, tapered (narrower at the back or the front) or with a back corner cut
// away (notched). width and depth stay the outer rectangle; the shape is the floor inside it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bayOutline, insideBay, cleanBay, outsideDistance, BAY_SHAPES } from "../js/model/bay.js";
import { clampToBay } from "../js/model/snap.js";
import { createEditor } from "../js/editor.js";
import { validateStage } from "../js/model/schema.js";
import { createStage } from "../js/model/stage.js";

test("the outlines: + x is the shooter's left, z down range from the up-range edge", () => {
  assert.deepEqual(BAY_SHAPES, ["rect", "taper", "notch"]);
  assert.deepEqual(bayOutline({ width: 20, depth: 30 }), [[-10, 0], [10, 0], [10, 30], [-10, 30]]);
  assert.deepEqual(bayOutline({ width: 20, depth: 30, shape: "taper", narrowWidth: 12, narrowEnd: "back" }), [[-10, 0], [10, 0], [6, 30], [-6, 30]]);
  assert.deepEqual(bayOutline({ width: 20, depth: 30, shape: "taper", narrowWidth: 12, narrowEnd: "front" }), [[-6, 0], [6, 0], [10, 30], [-10, 30]]);
  assert.deepEqual(bayOutline({ width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 6, notchDepth: 8 }),
    [[-10, 0], [10, 0], [10, 22], [4, 22], [4, 30], [-10, 30]]);
  assert.deepEqual(bayOutline({ width: 20, depth: 30, shape: "notch", notchSide: "right", notchWidth: 6, notchDepth: 8 }),
    [[-10, 0], [10, 0], [10, 30], [-4, 30], [-4, 22], [-10, 22]]);
});

test("inside, clamping and the distance outside follow the shape", () => {
  const bay = { width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 6, notchDepth: 8 };
  assert.equal(insideBay([0, 10], bay), true);
  assert.equal(insideBay([8, 27], bay), false, "in the cut corner");
  assert.deepEqual(clampToBay([8, 27], bay), [4, 27], "to the nearest edge of the floor");
  assert.deepEqual(clampToBay([0, 40], bay), [0, 30]);
  assert.deepEqual(clampToBay([3, 5], { width: 20, depth: 30 }), [3, 5], "rectangles as before");
  assert.equal(outsideDistance([12, 10], bay), 2);
  assert.equal(outsideDistance([0, -5], bay), -10, "up range of the bay is open: no bank in front");
  assert.ok(outsideDistance([8, 27], bay) > 0, "the cut corner is outside");
});

test("bay settings are cleaned: unknown shapes are rectangles, sizes stay inside the rectangle", () => {
  assert.deepEqual(cleanBay({ width: 20, depth: 30, shape: "star" }), { width: 20, depth: 30 });
  assert.deepEqual(cleanBay({ width: 20, depth: 30, shape: "taper", narrowWidth: 50, narrowEnd: "x" }), { width: 20, depth: 30, shape: "taper", narrowWidth: 19, narrowEnd: "back" });
  assert.deepEqual(cleanBay({ width: 20, depth: 30, shape: "notch", notchSide: "right", notchWidth: 0.1, notchDepth: 99 }),
    { width: 20, depth: 30, shape: "notch", notchSide: "right", notchWidth: 1, notchDepth: 29 });
});

test("a stage file keeps its bay shape; the editor changes it in one undo step and keeps props on the floor", () => {
  const s = { ...createStage(), bay: { width: 20, depth: 30, shape: "taper", narrowWidth: 10, narrowEnd: "back" } };
  const r = validateStage(JSON.parse(JSON.stringify(s)));
  assert.equal(r.ok, true, r.errors?.join());
  assert.deepEqual(r.stage.bay, s.bay);
  const ed = createEditor();
  ed.dispatch({ type: "setBay", width: 20, depth: 30 });
  ed.dispatch({ type: "place", propType: "barrel", position: [9, 29] });
  ed.dispatch({ type: "setBay", width: 20, depth: 30, shape: "taper", narrowWidth: 10, narrowEnd: "back" });
  assert.equal(ed.stage().bay.shape, "taper");
  assert.ok(insideBay(ed.stage().objects[0].position, ed.stage().bay), "moved onto the floor");
  ed.dispatch({ type: "setBay", width: 24, depth: 30 });
  assert.equal(ed.stage().bay.shape, "taper", "a size change keeps the shape");
  ed.dispatch({ type: "undo" });
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().bay.shape, undefined);
});

test("the Outdoor berms follow the shape; a rectangular bay's berms are unchanged", async () => {
  const { heightAt } = await import("../js/render/environments/terrain.js");
  const rect = { width: 20, depth: 30 };
  assert.equal(heightAt(0, 15, rect), 0, "the floor is flat");
  assert.ok(heightAt(15, 15, rect) > 1, "a side bank");
  const notch = { width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 8, notchDepth: 10 };
  assert.ok(heightAt(9, 28, notch) > 0.5, "the bank comes into the cut corner");
  assert.equal(heightAt(-5, 28, notch), 0, "the rest of the back is floor");
  const taper = { width: 20, depth: 30, shape: "taper", narrowWidth: 8, narrowEnd: "back" };
  assert.ok(heightAt(9, 28, taper) > 0.5, "the banks close in at the narrow back");
  assert.equal(heightAt(9, 1, taper), 0, "the wide front is floor");
});

test("Technical builds a wall outside each side and back edge of a shaped bay", async () => {
  const { technical } = await import("../js/render/environments/technical.js");
  const walls = (bay) => technical(bay).group.getObjectByName("walls").children.length;
  assert.equal(walls({ width: 20, depth: 30 }), 3);
  assert.equal(walls({ width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 6, notchDepth: 8 }), 5);
  assert.equal(walls({ width: 20, depth: 30, shape: "taper", narrowWidth: 10, narrowEnd: "back" }), 3);
});

test("the printed map draws a shaped bay's outline", async () => {
  const { mapModel } = await import("../js/model/map.js");
  const s = { ...createStage(), bay: { width: 20, depth: 30, shape: "notch", notchSide: "left", notchWidth: 6, notchDepth: 8 } };
  const bay = mapModel(s, { width: 180, height: 240 }).items.find((i) => i.kind === "bay");
  assert.equal(bay.points.length, 6);
  assert.equal(mapModel(createStage(), { width: 180, height: 240 }).items.find((i) => i.kind === "bay").points, undefined, "a rectangle stays a rect");
});
