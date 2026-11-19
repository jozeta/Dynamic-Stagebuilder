// Suggested shooting positions: a realistic way to shoot a stage, worked out from its layout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { planPositions, canSee, blockers, insidePolygon, crossesBlocker } from "../js/model/planner.js";
import { STAGE_LIBRARY, libraryStage } from "../js/model/stage-library.js";
import { routeLegs } from "../js/model/route.js";
import { getProp } from "../js/model/props.js";

const area = (s, x0, z0, x1, z1) => addLine(s, "shooting-area", [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], true).stage;
const targets = (s) => s.objects.filter((o) => ["paper", "steel"].includes(getProp(o.type).scoring));

test("a wall hides targets behind it; a port lets you see through, kneeling when it's low", () => {
  let s = createStage({ width: 20, depth: 20 });
  s = addObject(s, "wall-wood", [0, 6], 0, { length: 4, height: 2 }).stage;
  s = addObject(s, "wall-port", [6, 6], 0, { length: 2, height: 2, portWidth: 0.5, portHeight: 0.4, portBottom: 0.7 }).stage;
  const b = blockers(s);
  assert.equal(canSee(b, [0, 2], 1.6, [0, 12], 1.0), null, "behind the wooden wall");
  assert.ok(canSee(b, [-4, 2], 1.6, [0, 12], 1.0), "round the wall's end");
  assert.equal(canSee(b, [6, 2], 1.6, [6, 12], 1.0), null, "standing, the low port is below the sight line");
  assert.ok(canSee(b, [6, 2], 0.95, [6, 12], 1.0), "kneeling, you see through the port");
});

test("the plan covers every target from inside the shooting areas, facing them, never in a wall", () => {
  let s = setStart(createStage({ width: 20, depth: 24 }), [0, 2], 0);
  s = area(s, -6, 0.5, 6, 4);
  s = addObject(s, "wall-mesh", [0, 8], 0, { length: 2, height: 2 }).stage;
  s = addObject(s, "wall-mesh", [2, 8], 0, { length: 2, height: 2 }).stage;
  for (const [x, z] of [[-4, 14], [-2, 16], [3, 15], [5, 13]]) s = addObject(s, "paper-ipsc", [x, z]).stage;
  s = assignLabels(s);
  const plan = planPositions(s);
  assert.ok(plan.positions.length >= 1);
  assert.deepEqual(plan.unseen, []);
  for (const p of plan.positions) {
    assert.ok(s.lines.some((l) => insidePolygon(p.position, l.points)), "inside a shooting area");
    assert.ok(p.engages.length > 0, "each position engages something");
    const mid = p.engages.map((id) => s.objects.find((o) => o.id === id).position).reduce((a, q) => [a[0] + q[0] / p.engages.length, a[1] + q[1] / p.engages.length], [0, 0]);
    const look = [-Math.sin((p.rotation * Math.PI) / 180), Math.cos((p.rotation * Math.PI) / 180)];
    const to = [mid[0] - p.position[0], mid[1] - p.position[1]], len = Math.hypot(...to);
    assert.ok((look[0] * to[0] + look[1] * to[1]) / len > 0.95, "facing its targets");
  }
});

for (const spec of STAGE_LIBRARY) {
  test(`library stage "${spec.name}" comes with a realistic plan of shooting positions`, () => {
    const s = libraryStage(spec);
    const ps = s.objects.filter((o) => o.type === "shooting-position");
    assert.ok(ps.length >= 1, "at least one position");
    assert.ok(ps.length <= Math.max(2, targets(s).length), "not more positions than targets");
    const b = blockers(s);
    const plan = planPositions({ ...s, objects: s.objects.filter((o) => o.type !== "shooting-position") });
    assert.deepEqual(plan.unseen, [], "every target can be seen from some position");
    for (const p of ps) {
      assert.ok(s.lines.filter((l) => l.type === "shooting-area").some((l) => insidePolygon(p.position, l.points)), `${p.label} inside a shooting area`);
      assert.ok(!b.some((w) => w.dist(p.position) < 0.3), `${p.label} not in a wall`);
    }
    for (const leg of routeLegs(s)) for (let i = 1; i < leg.points.length; i++) {
      assert.equal(crossesBlocker(b, leg.points[i - 1], leg.points[i]), false, `the walk to ${leg.to} goes round walls`);
    }
  });
}
