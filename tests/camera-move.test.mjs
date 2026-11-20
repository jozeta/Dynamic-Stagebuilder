// The view pad: pan, tilt, up/down and forward/back on a { position, target } view (plain arrays).
import { test } from "node:test";
import assert from "node:assert/strict";
import { moveView } from "../js/model/camera-move.js";

const v = { position: [0, 2, 0], target: [0, 2, 10] };          // looking down range (+ z), level
const close = (a, b, msg) => a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) < 1e-6, `${msg}: ${a} vs ${b}`));
const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test("pan turns the look left or right about the camera, which stays put", () => {
  const l = moveView(v, "pan", 90);                             // + = to the left; looking down range, left is + x
  close(l.position, v.position, "camera stays");
  close(l.target, [10, 2, 0], "now looking to the left");
  close(moveView(v, "pan", -90).target, [-10, 2, 0], "right");
});

test("tilt looks up or down, and stops short of straight up or down", () => {
  const up = moveView(v, "tilt", 30);
  close(up.position, v.position, "camera stays");
  assert.ok(up.target[1] > 2 && Math.abs(len(up.position, up.target) - 10) < 1e-6);
  const far = moveView(v, "tilt", -200);
  const pitch = Math.asin((far.target[1] - 2) / 10) * 180 / Math.PI;
  assert.ok(pitch >= -85.01 && pitch < -84, `clamped at −85°, was ${pitch}`);
});

test("up and down lift the camera and its look together, never below the ground", () => {
  const u = moveView(v, "rise", 1.5);
  close(u.position, [0, 3.5, 0], "up"); close(u.target, [0, 3.5, 10], "look goes with it");
  assert.ok(moveView(v, "rise", -10).position[1] >= 0.1, "kept above the ground");
});

test("forward and back move along the ground the way the camera looks, at the same height", () => {
  const tilted = { position: [0, 10, 0], target: [0, 0, 10] };  // looking down at 45°
  const f = moveView(tilted, "dolly", 2);
  close(f.position, [0, 10, 2], "2 m forward, height kept"); close(f.target, [0, 0, 12], "look goes with it");
  close(moveView(tilted, "dolly", -2).position, [0, 10, -2], "back");
  const down = { position: [0, 10, 0], target: [0, 0, 0.001] }; // straight down: still moves somewhere sane
  assert.ok(moveView(down, "dolly", 1).position.every(Number.isFinite));
});

test("unknown moves and bad numbers leave the view as it was", () => {
  close(moveView(v, "spin", 5).position, v.position, "unknown");
  close(moveView(v, "pan", NaN).target, v.target, "NaN");
});

test("tilt can be held below level (the orbit view never looks up)", () => {
  const t = moveView(v, "tilt", 40, { maxPitch: -1.5 });
  const pitch = Math.asin((t.target[1] - 2) / 10) * 180 / Math.PI;
  assert.ok(Math.abs(pitch + 1.5) < 1e-6, `held at −1.5°, was ${pitch}`);
});
