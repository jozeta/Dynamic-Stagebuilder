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
  assert.deepEqual(BAY_SHAPES, ["rect", "taper", "notch", "l", "l-reverse", "t", "u", "u-reverse", "dogleg", "dogleg-reverse"]);
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

const area = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

test("the new shapes: L, reverse L, T, U, reverse U and the doglegs", () => {
  const b = (shape, extra = {}) => cleanBay({ width: 20, depth: 30, shape, ...extra });
  assert.deepEqual(bayOutline(b("l", { legWidth: 8, footDepth: 12 })), [[-10, 0], [10, 0], [10, 30], [2, 30], [2, 12], [-10, 12]], "back part on the shooter's left");
  assert.deepEqual(bayOutline(b("l-reverse", { legWidth: 8, footDepth: 12 })), [[10, 12], [-2, 12], [-2, 30], [-10, 30], [-10, 0], [10, 0]], "on the right");
  assert.deepEqual(bayOutline(b("t", { stemWidth: 6, stemDepth: 10 })), [[-3, 0], [3, 0], [3, 10], [10, 10], [10, 30], [-10, 30], [-10, 10], [-3, 10]]);
  assert.deepEqual(bayOutline(b("u", { armWidth: 5, baseDepth: 15 })), [[-10, 0], [10, 0], [10, 30], [5, 30], [5, 15], [-5, 15], [-5, 30], [-10, 30]]);
  assert.deepEqual(bayOutline(b("u-reverse", { armWidth: 5, armDepth: 10 })), [[-10, 0], [-5, 0], [-5, 10], [5, 10], [5, 0], [10, 0], [10, 30], [-10, 30]]);
  assert.deepEqual(bayOutline(b("dogleg", { partWidth: 12, splitDepth: 15 })), [[-10, 0], [2, 0], [2, 15], [10, 15], [10, 30], [-2, 30], [-2, 15], [-10, 15]]);
  for (const shape of BAY_SHAPES) {
    const o = bayOutline(b(shape));
    assert.ok(area(o) > 0, `${shape} winds anticlockwise`);
    assert.ok(area(o) <= 600 + 1e-9, `${shape} stays inside the rectangle`);
    assert.ok(o.some(([, z]) => z === 0), `${shape} has a front edge`);
  }
});

test("shape sizes are kept inside the bay, and a dogleg's parts always meet", () => {
  assert.equal(cleanBay({ width: 20, depth: 30, shape: "u", armWidth: 15 }).armWidth, 9.5, "two arms fit across");
  assert.equal(cleanBay({ width: 20, depth: 30, shape: "dogleg", partWidth: 4 }).partWidth, 10.5, "wider than half, so they overlap");
  assert.equal(cleanBay({ width: 20, depth: 30, shape: "t", stemDepth: 99 }).stemDepth, 29);
  assert.deepEqual(Object.keys(cleanBay({ width: 20, depth: 30, shape: "t", narrowWidth: 3 })).sort(), ["depth", "shape", "stemDepth", "stemWidth", "width"], "only its own fields");
});

test("inside the U's cut, and in front of the reverse U's cut, is not floor; banks fill the cut", async () => {
  const { heightAt } = await import("../js/render/environments/terrain.js");
  const u = cleanBay({ width: 20, depth: 30, shape: "u", armWidth: 5, baseDepth: 15 });
  assert.equal(insideBay([0, 25], u), false);
  assert.equal(insideBay([7, 25], u), true, "in an arm");
  assert.ok(heightAt(0, 27, u) > 0.5, "a bank in the cut");
  assert.equal(heightAt(7, 25, u), 0);
  const ru = cleanBay({ width: 20, depth: 30, shape: "u-reverse", armWidth: 5, armDepth: 10 });
  assert.equal(insideBay([0, 5], ru), false);
  assert.equal(insideBay([0, 20], ru), true);
  assert.equal(heightAt(7, -3, ru), 0, "open in front of an arm");
  assert.equal(heightAt(0, 20, ru), 0);
});

test("Technical walls every edge but the open front ones", async () => {
  const { technical } = await import("../js/render/environments/technical.js");
  const walls = (bay) => technical(cleanBay(bay)).group.getObjectByName("walls").children.length;
  assert.equal(walls({ width: 20, depth: 30, shape: "u-reverse" }), 6, "two front edges stay open");
  assert.equal(walls({ width: 20, depth: 30, shape: "t" }), 7);
  assert.equal(walls({ width: 20, depth: 30, shape: "dogleg" }), 7);
});
