// Safety distances (IPSC CCR January 2024) and sight lines from a shooting position.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SAFETY } from "../js/model/safety.js";
import { insidePolygon } from "../js/model/planner.js";
import { createStage, addObject } from "../js/model/stage.js";

test("sight lines from a position: which targets it sees, and where it sees each one", async () => {
  const { sightFrom } = await import("../js/model/safety.js");
  let s = createStage();
  s = addObject(s, "wall-solid", [0, 6], 0, { length: 2, height: 2.5 }).stage;
  const hidden = addObject(s, "paper-ipsc", [0, 8]); s = hidden.stage;
  const seen = addObject(s, "paper-ipsc", [6, 8]); s = seen.stage;
  const r = sightFrom(s, [0, 1], 1.6);
  assert.deepEqual(r.seen.map((x) => x.id), [seen.id]);
  assert.deepEqual(r.hidden, [hidden.id]);
  assert.equal(r.seen[0].aim.length, 3, "a point [x, z, y] on the target to draw the line to");
});

test("safety rings round a target: steel 7 m (red) and 8 m (yellow), paper 3 m (yellow); none for props", async () => {
  const { safetyRings } = await import("../js/model/safety.js");
  const steel = safetyRings({ type: "popper" });
  assert.deepEqual(steel.map((r) => [r.radius, r.level, r.rule]), [[7, "bad", "2.1.3"], [8, "warn", "2.1.3"]]);
  assert.ok(steel.every((r) => r.label && r.text.length > 20));
  assert.deepEqual(safetyRings({ type: "paper-ipsc" }).map((r) => [r.radius, r.level, r.rule]), [[3, "warn", "10.4.2"]]);
  assert.deepEqual(safetyRings({ type: "barrel" }), []);
});

test("the safety-ring switch is a saved flag on the target, undoable, and kept by the stage file", async () => {
  const { createEditor } = await import("../js/editor.js");
  const { validateStage } = await import("../js/model/schema.js");
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "popper", position: [0, 12] });
  const id = ed.stage().objects[0].id;
  ed.dispatch({ type: "setSafetyRings", ids: [id], on: true });
  assert.equal(ed.stage().objects[0].safetyRings, true);
  const r = validateStage(JSON.parse(JSON.stringify(ed.stage())));
  assert.equal(r.ok, true, r.errors?.join());
  assert.equal(r.stage.objects[0].safetyRings, true);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects[0].safetyRings, undefined);
});

test("the rules are cited with their edition", () => {
  assert.match(SAFETY.edition, /January 2024/);
  assert.equal(SAFETY.steelMin, 7);
  assert.equal(SAFETY.faultLineMin, 8);
});

test("no library stage puts steel closer than 7 m to where a shooter may stand (rule 2.1.3)", async () => {
  const { STAGE_LIBRARY, libraryStage } = await import("../js/model/stage-library.js");
  const seg = (p, a, b) => { const v = [b[0] - a[0], b[1] - a[1]], L = v[0] ** 2 + v[1] ** 2; const k = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L)) : 0; return Math.hypot(p[0] - a[0] - v[0] * k, p[1] - a[1] - v[1] * k); };
  for (const spec of STAGE_LIBRARY) {
    const s = libraryStage(spec);
    const areas = s.lines.filter((l) => l.type === "shooting-area").map((l) => l.points);
    const spots = [...s.objects.filter((o) => o.type === "shooting-position").map((o) => o.position), ...(s.start ? [s.start.position] : [])];
    for (const o of s.objects.filter((x) => ["popper", "mini-popper", "plate-round", "plate-square", "texas-star", "plate-rack", "dueling-tree"].includes(x.type))) {
      const d = Math.min(...areas.map((a) => (insidePolygon(o.position, a) ? 0 : Math.min(...a.map((p, i) => seg(o.position, p, a[(i + 1) % a.length]))))),
        ...spots.map((p) => Math.hypot(p[0] - o.position[0], p[1] - o.position[1])));
      assert.ok(d >= 7 - 1e-6, `${spec.id} ${o.label}: ${d.toFixed(2)} m`);
    }
  }
});
