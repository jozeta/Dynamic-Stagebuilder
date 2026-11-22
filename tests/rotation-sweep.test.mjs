// While a prop is turned with the rotate ring: a line on the ground for the angle it started at, one
// for the angle now, the area between them filled, and how far it has turned written beside it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { turnBy, groundDir, sweepOf, sweepRadius, turnText } from "../js/model/rotation-sweep.js";

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

test("the turn is the short way round, signed like the inspector's rotate buttons", () => {
  assert.equal(turnBy(0, 30), 30);
  assert.equal(turnBy(30, 0), -30);
  assert.equal(turnBy(350, 10), 20);
  assert.equal(turnBy(10, 350), -20);
  assert.equal(turnBy(0, 180), 180);
  assert.equal(turnText(30), "+30°");
  assert.equal(turnText(-45), "−45°");
  assert.equal(turnText(0), "0°");
  assert.equal(turnText(14.6), "+15°");
});

test("a rotation's direction on the ground: 0° faces up range (−z), 90° the shooter's left (+x)", () => {
  const [x0, z0] = groundDir(0), [x9, z9] = groundDir(90);
  near(x0, 0, "x at 0°"); near(z0, -1, "z at 0°");
  near(x9, 1, "x at 90°"); near(z9, 0, "z at 90°");
});

test("the sweep: the two lines' ends on the circle, the arc between them, the text beside the prop", () => {
  const s = sweepOf({ centre: [2, 5], radius: 1, from: 0, to: 90 });
  near(s.start[0], 2, "start x"); near(s.start[1], 4, "start z");
  near(s.end[0], 3, "end x"); near(s.end[1], 5, "end z");
  assert.ok(s.arc.length >= 3);
  near(s.arc[0][0], s.start[0], "arc starts at the first line"); near(s.arc.at(-1)[1], s.end[1], "arc ends at the second line");
  for (const [x, z] of s.arc) near(Math.hypot(x - 2, z - 5), 1, "arc on the circle");
  assert.equal(s.text, "+90°");
  assert.ok(Math.hypot(s.labelAt[0] - 2, s.labelAt[1] - 5) > 1, "the text sits outside the circle");
  // No turn yet: no arc to fill.
  assert.equal(sweepOf({ centre: [0, 0], radius: 1, from: 40, to: 40 }).arc.length, 0);
});

test("the circle is a little wider than the prop, never tiny", () => {
  near(sweepRadius({ w: 2, d: 0.2 }), 1.4, "a 2 m wall");
  near(sweepRadius({ w: 0.1, d: 0.1 }), 0.6, "a small prop");
});
