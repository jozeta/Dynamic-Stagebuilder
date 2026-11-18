// Stage files are untrusted: validation accepts good stages unchanged and rejects bad ones whole.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { validateStage, SCHEMA_VERSION } from "../js/model/schema.js";

function sample() {
  let s = createStage();
  s = addObject(s, "paper-ipsc", [1.25, 5], 15, { mountHeight: 1.2 }).stage;
  s = addObject(s, "wall-mesh", [-2, 8.5], 90, { length: 3, mesh: "blue" }).stage;
  s = addLine(s, "fault-line", [[0, 2], [3, 2], [3, 4]], false).stage;
  s = setStart(s, [0, 1], 0);
  return assignLabels(s);
}
const bad = (json) => {
  const r = validateStage(json);
  assert.equal(r.ok, false);
  assert.ok(r.errors.length > 0 && r.errors.every((e) => typeof e === "string"));
  return r.errors.join("\n");
};

test("schema version is 1", () => assert.equal(SCHEMA_VERSION, 1));

test("a new stage validates unchanged", () => {
  const s = createStage();
  const r = validateStage(s);
  assert.equal(r.ok, true);
  assert.deepEqual(r.stage, s);
});

test("a stage round-trips through JSON unchanged", () => {
  const s = sample();
  const r = validateStage(JSON.parse(JSON.stringify(s)));
  assert.equal(r.ok, true, r.errors?.join("\n"));
  assert.deepEqual(r.stage, s);
});

test("rejects wrong schema, NaN positions, unknown types and duplicate ids", () => {
  const s = sample();
  assert.match(bad({ ...s, schema: 2 }), /schema/);
  const nan = JSON.parse(JSON.stringify({ ...s, objects: [{ ...s.objects[0], position: [NaN, 1] }] }));
  assert.match(bad(nan), /objects\[0\]\.position/);
  assert.match(bad({ ...s, objects: [{ ...s.objects[0], type: "laser" }] }), /unknown prop type "laser"/);
  assert.match(bad({ ...s, objects: [s.objects[0], { ...s.objects[1], id: s.objects[0].id }] }), /duplicate id/);
  assert.match(bad({ ...s, objects: [{ ...s.objects[1], params: { ...s.objects[1].params, length: 99 } }] }), /length/);
  assert.match(bad({ ...s, objects: [{ ...s.objects[1], params: { ...s.objects[1].params, mesh: "pink" } }] }), /mesh/);
  assert.match(bad({ ...s, bay: { width: 0, depth: 30 } }), /bay/);
  assert.match(bad({ ...s, settings: { ...s.settings, environment: "moon" } }), /environment/);
  assert.match(bad(null), /stage/);
  assert.match(bad("x"), /stage/);
});

test("rejects oversized input", () => {
  const s = sample();
  const many = Array.from({ length: 10000 }, (_, i) => ({ ...s.objects[0], id: `id-${i}` }));
  assert.match(bad({ ...s, objects: many }), /objects/);
  assert.match(bad({ ...s, briefing: { ...s.briefing, procedure: "x".repeat(1024 * 1024) } }), /procedure/);
  assert.match(bad({ ...s, lines: [{ ...s.lines[0], points: [[0, 1]] }] }), /points/);
});

test("__proto__ keys never reach Object.prototype and unknown keys are dropped", () => {
  const s = sample();
  const text = JSON.stringify(s).replace('"schema":1', '"__proto__":{"polluted":1},"schema":1,"extra":"x"');
  const r = validateStage(JSON.parse(text));
  assert.equal(r.ok, true, r.errors?.join("\n"));
  assert.equal(({}).polluted, undefined);
  assert.equal(r.stage.polluted, undefined);
  assert.equal(Object.hasOwn(r.stage, "extra"), false);
});
