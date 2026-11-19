// The default high-oblique "drone" camera and the golden-hour sun (Step 1 of the look brief).
import { test } from "node:test";
import assert from "node:assert/strict";
import { obliqueView, VIEW } from "../js/render/view-math.js";
import { LOOK_DEFAULTS, sunFromHour } from "../js/model/look.js";

const deg = (r) => (r * 180) / Math.PI;

test("the overview looks down 40–50° with a 20–30° yaw through a long lens", () => {
  assert.ok(VIEW.fov >= 30 && VIEW.fov <= 35);
  const { position, target } = obliqueView({ width: 20, depth: 30 }, 16 / 10);
  const d = position.map((v, i) => v - target[i]);
  const horiz = Math.hypot(d[0], d[2]);
  const pitch = deg(Math.atan2(d[1], horiz));
  assert.ok(pitch >= 40 && pitch <= 50, `pitch ${pitch}`);
  const yaw = Math.abs(deg(Math.atan2(d[0], -d[2])));          // 0° = straight from behind the shooters
  assert.ok(yaw >= 20 && yaw <= 30, `yaw ${yaw}`);
  assert.deepEqual(target, [0, 0, 15]);
});

test("the whole bay fits in the frame, a bigger bay moves the camera back", () => {
  const near = obliqueView({ width: 20, depth: 30 }, 1.6);
  const far = obliqueView({ width: 40, depth: 60 }, 1.6);
  const dist = (v) => Math.hypot(...v.position.map((p, i) => p - v.target[i]));
  assert.ok(dist(far) > dist(near) * 1.8);
  // A narrow (portrait) viewport needs more distance than a wide one.
  assert.ok(dist(obliqueView({ width: 20, depth: 30 }, 0.8)) > dist(near));
});

test("by default the sun is low (20–28°), warm, and shadows fall diagonally", () => {
  const s = sunFromHour(LOOK_DEFAULTS.hour);
  assert.ok(s.elevation >= 20 && s.elevation <= 28, `elevation ${s.elevation}`);
  assert.ok(s.warmth > 0.5);
  const [x, , z] = s.direction;
  const angle = deg(Math.atan2(Math.abs(z), Math.abs(x)));
  assert.ok(angle >= 25 && angle <= 65, `shadow heading ${angle}° from the x axis`);
});
