// A rough run-time estimate: a fast and a steady run, from the walk route, the shots and reloads.
import { test } from "node:test";
import assert from "node:assert/strict";
import { runEstimate, ESTIMATE } from "../js/model/estimate.js";
import { createStage, addObject, setStart } from "../js/model/stage.js";

const stage = (n, positions) => {
  let s = setStart(createStage(), [0, 1], 0);
  for (let i = 0; i < n; i++) s = addObject(s, "paper-ipsc", [i - n / 2, 15]).stage;
  for (const p of positions) s = addObject(s, "shooting-position", p).stage;
  return s;
};

test("no targets: no estimate", () => {
  assert.equal(runEstimate(createStage()), null);
});

test("standing still: draw plus shots; the fast run is quicker than the steady one", () => {
  const e = runEstimate(stage(3, []));
  assert.equal(e.rounds, 6);
  assert.equal(e.metres, 0);
  assert.equal(e.reloads, 0);
  assert.equal(e.fast, +(ESTIMATE.draw[0] + 5 * ESTIMATE.split[0]).toFixed(1));
  assert.ok(e.fast < e.steady);
  assert.equal(e.hitFactor[0], +(30 / e.steady).toFixed(2), "all A hits, steady run");
  assert.equal(e.hitFactor[1], +(30 / e.fast).toFixed(2));
});

test("moving adds time for the route, and big round counts add reloads", () => {
  const still = runEstimate(stage(12, []));
  const moving = runEstimate(stage(12, [[0, 1], [4, 6], [-4, 9]]));
  assert.equal(still.reloads, 1, "24 rounds, 15 in a magazine");
  assert.ok(moving.metres > 10);
  assert.ok(moving.fast > still.fast);
  assert.ok(moving.steady > still.steady);
});
