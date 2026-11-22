// The sandbag wall: pillow-shaped bags in a running bond, half bags closing the offset rows, so every
// bag lies on the row below over its whole length (none hangs in the air at the ends).
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3 } from "three";
import { defaultParams } from "../js/model/props.js";
import { buildProp } from "../js/render/builders/index.js";

const build = (params) => { const g = buildProp({ id: "s", type: "sandbags", params: { ...defaultParams("sandbags"), ...params } }); g.updateMatrixWorld(true); return g; };
const bags = (g) => { const out = []; g.traverse((c) => { if (c.isMesh && c.userData.bag) out.push(new Box3().setFromObject(c)); }); return out; };

for (const [length, rows] of [[1.8, 3], [1.2, 4], [3, 2], [0.6, 3]]) test(`${length} m × ${rows} rows: every bag lies fully on the bags below`, () => {
  const all = bags(build({ length, rows })), byRow = new Map();
  for (const b of all) { const r = Math.round(b.min.y * 100); if (!byRow.has(r)) byRow.set(r, []); byRow.get(r).push(b); }
  const levels = [...byRow.keys()].sort((a, b) => a - b);
  assert.equal(levels.length, rows, "one level per row");
  for (let i = 1; i < levels.length; i++) {
    const below = byRow.get(levels[i - 1]);
    for (const b of byRow.get(levels[i])) {
      // Walk along the bag's foot (inset 2 cm at each end, as a bag's rounded end): always a bag under it.
      for (let x = b.min.x + 0.02; x <= b.max.x - 0.02; x += 0.01) assert.ok(below.some((u) => x >= u.min.x - 1e-6 && x <= u.max.x + 1e-6), `row ${i + 1}: nothing under x = ${x.toFixed(2)}`);
      assert.ok(below.some((u) => u.max.y >= b.min.y - 0.005), `row ${i + 1} rests on the row below`);
    }
  }
  const ends = all.map((b) => [b.min.x, b.max.x]).flat();
  assert.ok(Math.abs(Math.min(...ends) + length / 2) < 0.03 && Math.abs(Math.max(...ends) - length / 2) < 0.03, "every row reaches both ends");
});
