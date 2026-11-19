// Terrain maths (Step 2): berms, ground tones and baked material maps. Pure, so it runs in Node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fbm, heightAt, groundTone, heightToNormal, cavityAO, BERM } from "../js/render/environments/terrain.js";

const bay = { width: 20, depth: 30 };

test("noise is seeded, smooth and within ±1", () => {
  const a = fbm(5), b = fbm(5), c = fbm(6);
  assert.equal(a(3.3, 7.1), b(3.3, 7.1));
  assert.notEqual(a(3.3, 7.1), c(3.3, 7.1));
  for (let i = 0; i < 200; i++) { const v = a(i * 0.37, i * 0.91); assert.ok(v >= -1 && v <= 1); }
  assert.ok(Math.abs(a(1, 1) - a(1.001, 1)) < 0.01, "smooth");
});

test("the bay floor is flat and the berms rise 2–3 m with an irregular profile", () => {
  for (const [x, z] of [[0, 0], [9.9, 15], [-9.9, 29.9], [0, 31]]) assert.equal(heightAt(x, z, bay), 0, `${x},${z}`);
  const tops = [];
  for (let z = 2; z < 30; z += 2) tops.push(heightAt(bay.width / 2 + BERM.setback + BERM.run + 3, z, bay));
  for (const h of tops) assert.ok(h >= 2 && h <= 3.2, `berm top ${h}`);
  assert.ok(Math.max(...tops) - Math.min(...tops) > 0.15, "irregular, not a ruler-straight wall");
  assert.ok(heightAt(0, bay.depth + BERM.setback + BERM.run + 3, bay) >= 2, "berm behind the targets");
  assert.ok(heightAt(0, -12, bay) < 0.6, "open up range where the shooters stand");
});

test("ground tones blend dry dust, compacted earth and damp patches, with a worn lane", () => {
  const seen = new Set();
  for (let x = -9; x <= 9; x += 1.5) for (let z = 1; z <= 29; z += 1.5) {
    const t = groundTone(x, z, bay);
    assert.ok(Math.abs(t.dry + t.compact + t.damp - 1) < 1e-9);
    seen.add(t.dry > 0.5 ? "dry" : t.compact > 0.5 ? "compact" : "mixed");
    if (t.damp > 0.25) seen.add("damp");
  }
  assert.ok(seen.has("dry") && seen.has("compact") && seen.has("damp"), [...seen].join(","));
  assert.ok(groundTone(0, 6, bay).wear > groundTone(8, 6, bay).wear, "the middle lane is worn");
});

test("a flat height field bakes to a straight-up normal and no occlusion", () => {
  const size = 8, flat = new Float32Array(size * size).fill(0.5);
  const n = heightToNormal(flat, size, 4);
  for (let i = 0; i < size * size; i++) assert.deepEqual([...n.slice(i * 4, i * 4 + 4)], [128, 128, 255, 255]);
  const ao = cavityAO(flat, size);
  assert.ok([...ao].every((v, i) => (i % 4 === 3 ? v === 255 : v === 255)));
});

test("a bump tilts the normals away from its centre and darkens its foot", () => {
  const size = 16, h = new Float32Array(size * size);
  h[8 * size + 8] = 1;
  const n = heightToNormal(h, size, 4);
  const at = (x, y) => n[(y * size + x) * 4];
  assert.ok(at(7, 8) < 128 && at(9, 8) > 128, "x normals point away from the bump");
  const ao = cavityAO(h, size);
  assert.ok(ao[(8 * size + 7) * 4] < 255, "the foot of the bump is a little occluded");
});

test("the floor runs into the banks without a crease or a colour line", async () => {
  const { bankBlend } = await import("../js/render/environments/terrain.js");
  const bay = { width: 20, depth: 30 };
  // Height: rising from the foot with no kink (the slope starts at zero and grows smoothly).
  const x0 = bay.width / 2 + BERM.setback, z = 15;
  let foot = null;
  for (let x = x0 - 1.5; x < x0 + 2; x += 0.01) if (heightAt(x, z, bay) > 0 && foot === null) foot = x;
  const slope = (x) => (heightAt(x + 0.01, z, bay) - heightAt(x, z, bay)) / 0.01;
  assert.ok(slope(foot + 0.02) < 0.05, `gentle at the foot: ${slope(foot + 0.02).toFixed(3)}`);
  let worst = 0;
  for (let x = foot; x < foot + 3; x += 0.05) worst = Math.max(worst, Math.abs(slope(x + 0.05) - slope(x)));
  assert.ok(worst < 0.12, `no crease: largest change in slope over 5 cm ${worst.toFixed(3)}`);
  // Colour: the earth tone starts before the foot and builds up over a couple of metres.
  assert.equal(bankBlend(0, 15, bay), 0, "the middle of the bay is floor");
  const before = bankBlend(foot - 1, z, bay), at = bankBlend(foot, z, bay), up = bankBlend(foot + 2.5, z, bay);
  assert.ok(before > 0 && before < at && at < up, `${before.toFixed(2)} < ${at.toFixed(2)} < ${up.toFixed(2)}`);
  assert.ok(up > 0.9);
});
