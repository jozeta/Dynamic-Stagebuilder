// Every target is built the way it stands on a range: no part floats. Each mesh must touch (within
// 3 mm) a chain of other meshes that reaches the ground, and paper cards sit centred on their stands.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3 } from "three";
import { defaultParams, STAND } from "../js/model/props.js";
import { PRESENTATIONS, arrayCards } from "../js/model/arrays.js";
import { buildProp } from "../js/render/builders/index.js";

const obj = (type, params = {}) => ({ id: `t-${type}`, type, position: [0, 10], rotation: 0, params: { ...defaultParams(type), ...params } });
const GAP = 0.003;

/** The meshes that no chain of touching meshes connects to the ground. */
function floating(g) {
  g.updateMatrixWorld(true);
  const parts = [];
  g.traverse((c) => { if (c.isMesh) parts.push({ c, b: new Box3().setFromObject(c).expandByScalar(GAP) }); });
  const grounded = new Set(parts.filter((p) => p.b.min.y <= GAP * 2));
  let grew = true;
  while (grew) {
    grew = false;
    for (const p of parts) if (!grounded.has(p) && [...grounded].some((q) => q.b.intersectsBox(p.b))) { grounded.add(p); grew = true; }
  }
  return parts.filter((p) => !grounded.has(p)).map((p) => p.c.userData.card || p.c.userData.part || p.c.material?.name || p.c.name || "mesh");
}

const CASES = [
  ...PRESENTATIONS.flatMap((p) => ["paper-ipsc", "paper-mini"].flatMap((type) => ["classic", "head"].map((style) => [type, { presentation: p.id, style }]))),
  ["popper", {}], ["popper", { baseHeight: 0.5 }], ["mini-popper", { baseHeight: 0.3 }], ["plate-round", {}], ["plate-square", {}],
  ["swinger", {}], ["drop-turner", {}], ["clamshell", {}], ["mover", { targets: 3 }], ["texas-star", {}], ["plate-rack", {}],
  ["dueling-tree", {}], ["bobber", {}], ["twister", {}],
];
for (const [type, params] of CASES) {
  test(`${type} ${JSON.stringify(params)}: nothing floats`, () => {
    assert.deepEqual(floating(buildProp(obj(type, params))), []);
  });
}

test("paper cards on their own sticks are centred on their stand", () => {
  for (const p of PRESENTATIONS) {
    const o = obj("paper-ipsc", { presentation: p.id });
    const g = buildProp(o);
    const stands = [], sticks = [];
    g.traverse((c) => { if (c.userData.stand) stands.push(c.userData.stand); if (c.userData.stick) sticks.push(c.userData.stick); });
    const own = arrayCards(o).filter((c) => c.layer !== "front");
    assert.equal(stands.length, new Set(own.map((c) => `${c.x}|${c.layer}`)).size, `${p.id}: a stand for each card on its own sticks`);
    for (const s of sticks) assert.ok(stands.some((t) => Math.abs(t.x - s.x) <= 0.15 && Math.abs(t.z - s.z) < 1e-6), `${p.id}: every stick stands in a stand`);
    for (const t of stands) {
      const xs = sticks.filter((s) => Math.abs(s.z - t.z) < 1e-6 && Math.abs(s.x - t.x) <= 0.15).map((s) => s.x);
      assert.equal(xs.length, 2, `${p.id}: two sticks per stand`);
      assert.ok(Math.abs((xs[0] + xs[1]) / 2 - t.x) < 1e-6, `${p.id}: the sticks are centred on the stand`);
    }
  }
});

test("stands never overlap each other", () => {
  for (const p of PRESENTATIONS) {
    const g = buildProp(obj("paper-ipsc", { presentation: p.id }));
    const s = [];
    g.traverse((c) => { if (c.userData.stand) s.push(c.userData.stand); });
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      const apart = Math.abs(s[i].x - s[j].x) >= STAND.w || Math.abs(s[i].z - s[j].z) >= STAND.d;
      assert.ok(apart, `${p.id}: stands ${i} and ${j} overlap`);
    }
  }
});

test("a card stapled in front has at least half of it backed by the cards behind it", async () => {
  const { paperSize } = await import("../js/model/arrays.js");
  for (const p of PRESENTATIONS) {
    const o = obj("paper-ipsc", { presentation: p.id }), { w, h } = paperSize(o), cards = arrayCards(o);
    for (const f of cards.filter((c) => c.layer === "front")) {
      let covered = 0;                                   // rectangles; the cards behind don't overlap each other here
      for (const b of cards.filter((c) => c.layer !== "front")) {
        const ox = Math.max(0, Math.min(f.x + w / 2, b.x + w / 2) - Math.max(f.x - w / 2, b.x - w / 2));
        const oy = Math.max(0, Math.min(f.y + h, b.y + h) - Math.max(f.y, b.y));
        covered += ox * oy;
      }
      assert.ok(covered >= 0.5 * w * h - 1e-9, `${p.id}: a stapled card is only ${Math.round((100 * covered) / (w * h))} % backed`);
    }
  }
});

test("every target stands on a foot at least 25 cm across, both ways", () => {
  for (const [type, params] of CASES) {
    const g = buildProp(obj(type, params));
    g.updateMatrixWorld(true);
    const foot = new Box3();
    g.traverse((c) => { if (c.isMesh) { const b = new Box3().setFromObject(c); if (b.min.y <= 0.005) foot.union(b); } });
    assert.ok(foot.max.x - foot.min.x >= 0.25 && foot.max.z - foot.min.z >= 0.25, `${type} ${JSON.stringify(params)}: the foot is ${(foot.max.x - foot.min.x).toFixed(2)} × ${(foot.max.z - foot.min.z).toFixed(2)} m`);
  }
});

test("cards and plates are held by their post or sticks over part of their height, not balanced on a tip", () => {
  for (const [type, params] of [["twister", {}], ["bobber", {}], ["plate-round", {}], ["plate-square", {}], ["mover", {}], ["swinger", {}]]) {
    const g = buildProp(obj(type, params));
    g.updateMatrixWorld(true);
    const faces = [], holders = [];
    g.traverse((c) => {
      if (!c.isMesh) return;
      const b = new Box3().setFromObject(c);
      if (c.userData.card || c.userData.part === "plate") faces.push(b);
      else if (/stick-wood|steel-dark/.test(c.material?.name || "")) holders.push(b);
    });
    for (const f of faces) {
      const h = f.max.y - f.min.y;
      const held = holders.some((s) => s.min.x < f.max.x && s.max.x > f.min.x && Math.min(s.max.y, f.max.y) - Math.max(s.min.y, f.min.y) >= 0.25 * h);
      assert.ok(held, `${type}: a card or plate is not held over a quarter of its height`);
    }
  }
});
