// The default high-oblique "drone" camera and the golden-hour sun (Step 1 of the look brief).
import { test } from "node:test";
import assert from "node:assert/strict";
import { obliqueView, VIEW, bayArea, stageArea } from "../js/render/view-math.js";
import { LOOK_DEFAULTS, sunFromHour } from "../js/model/look.js";

const deg = (r) => (r * 180) / Math.PI;

test("the overview looks down 40–50° with a 20–30° yaw through a long lens", () => {
  assert.ok(VIEW.fov >= 30 && VIEW.fov <= 35);
  const { position, target } = obliqueView(bayArea({ width: 20, depth: 30 }), 16 / 10);
  const d = position.map((v, i) => v - target[i]);
  const horiz = Math.hypot(d[0], d[2]);
  const pitch = deg(Math.atan2(d[1], horiz));
  assert.ok(pitch >= 40 && pitch <= 50, `pitch ${pitch}`);
  const yaw = Math.abs(deg(Math.atan2(d[0], -d[2])));          // 0° = straight from behind the shooters
  assert.ok(yaw >= 20 && yaw <= 30, `yaw ${yaw}`);
  assert.deepEqual(target, [0, 0, 15]);
});

test("the whole bay fits in the frame, a bigger bay moves the camera back", () => {
  const near = obliqueView(bayArea({ width: 20, depth: 30 }), 1.6);
  const far = obliqueView(bayArea({ width: 40, depth: 60 }), 1.6);
  const dist = (v) => Math.hypot(...v.position.map((p, i) => p - v.target[i]));
  assert.ok(dist(far) > dist(near) * 1.5);   // the 6 m berm margin is fixed, so not quite double
  // A narrow (portrait) viewport needs more distance than a wide one.
  assert.ok(dist(obliqueView(bayArea({ width: 20, depth: 30 }), 0.8)) > dist(near));
});

test("by default (15:45) the afternoon sun is about 50° high and shadows fall diagonally", () => {
  const s = sunFromHour(LOOK_DEFAULTS.hour);
  assert.ok(s.elevation >= 45 && s.elevation <= 55, `elevation ${s.elevation}`);
  const [x, , z] = s.direction;
  const angle = deg(Math.atan2(Math.abs(z), Math.abs(x)));
  assert.ok(angle >= 25 && angle <= 65, `shadow heading ${angle}° from the x axis`);
});

test("the overview frames what is on the stage, or the bay when it is empty", () => {
  const bay = { width: 20, depth: 30 };
  const empty = { bay, objects: [], lines: [], start: null };
  assert.deepEqual(stageArea(empty), bayArea(bay));
  const s = { bay, objects: [{ position: [-4, 6] }, { position: [3, 18] }], lines: [{ points: [[0, 2], [5, 3]] }], start: { position: [0, 1] } };
  const a = stageArea(s);
  assert.ok(a.minX <= -4 && a.maxX >= 5 && a.minZ <= 1 && a.maxZ >= 18);
  assert.ok(a.maxX - a.minX < 20, "tighter than the bay");
  const dist = (v) => Math.hypot(...v.position.map((p, i) => p - v.target[i]));
  assert.ok(dist(obliqueView(a, 1)) < dist(obliqueView(bayArea(bay), 1)));
});
