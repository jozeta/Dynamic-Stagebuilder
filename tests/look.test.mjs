// Environment look settings: defaults, cleaning untrusted values, and the sun from the time of day.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOK_DEFAULTS, cleanLook, sunFromHour } from "../js/model/look.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";

test("defaults", () => {
  assert.deepEqual({ ...LOOK_DEFAULTS }, { hour: 15.75, sun: 0.5, ambient: 1, shadows: true, softness: 4, shadowStrength: 0.5, haze: 0.35, exposure: 1, ground: "sand", clouds: 0.35, cloudSpeed: 1, wind: 60 });
  assert.ok(Object.isFrozen(LOOK_DEFAULTS));
});

test("cleanLook clamps numbers, keeps booleans, fills gaps", () => {
  const l = cleanLook({ hour: 30, sun: -1, shadows: false, haze: "x", bogus: 1 });
  assert.equal(l.hour, 20);
  assert.equal(l.sun, 0);
  assert.equal(l.shadows, false);
  assert.equal(l.haze, LOOK_DEFAULTS.haze);
  assert.equal(Object.hasOwn(l, "bogus"), false);
  assert.deepEqual(cleanLook(undefined), { ...LOOK_DEFAULTS });
});

test("the sun is high at noon, low and warm in the evening, in the east in the morning", () => {
  const noon = sunFromHour(13), eve = sunFromHour(19), morning = sunFromHour(7);
  assert.ok(noon.elevation > 45 && eve.elevation < 15 && eve.elevation > 0, `${noon.elevation} ${eve.elevation}`);
  assert.ok(eve.warmth > noon.warmth);
  assert.ok(eve.strength < noon.strength);
  assert.ok(morning.direction[0] > 0 && eve.direction[0] < 0, "east is +x, west −x");
  const len = Math.hypot(...noon.direction);
  assert.ok(Math.abs(len - 1) < 1e-9);
});

test("setLook changes the stage but is not an undo step", () => {
  const ed = createEditor();
  ed.dispatch({ type: "place", propType: "barrel", position: [0, 5] });
  const steps = ed.state.history.past.length;
  ed.dispatch({ type: "setLook", patch: { hour: 8, haze: 2 } });
  assert.equal(ed.stage().settings.look.hour, 8);
  assert.equal(ed.stage().settings.look.haze, 1);
  assert.equal(ed.state.history.past.length, steps);
  ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().settings.look.hour, 8, "undo keeps the look");
  ed.dispatch({ type: "setLook", reset: true });
  assert.deepEqual(ed.stage().settings.look, { ...LOOK_DEFAULTS });
});

test("old files read with the default look; a saved look round-trips", () => {
  const s = createStage();
  const { look, ...rest } = s.settings;
  assert.ok(look);
  assert.deepEqual(validateStage({ ...s, settings: rest }).stage.settings.look, { ...LOOK_DEFAULTS });
  const custom = { ...s, settings: { ...s.settings, look: { ...LOOK_DEFAULTS, hour: 9 } } };
  assert.equal(validateStage(JSON.parse(JSON.stringify(custom))).stage.settings.look.hour, 9);
});

test("Technical surroundings have their own light defaults; reset and switching use them", async () => {
  const { lookDefaults, TECHNICAL_LOOK } = await import("../js/model/look.js");
  assert.deepEqual({ ...TECHNICAL_LOOK }, { hour: 16, sun: 1.15, ambient: 1.1, shadows: true, softness: 3, shadowStrength: 0.55, haze: 0.2, exposure: 1, ground: "sand", clouds: 0.35, cloudSpeed: 1, wind: 60 });
  assert.deepEqual(lookDefaults("technical"), TECHNICAL_LOOK);
  assert.deepEqual(lookDefaults("outdoor"), LOOK_DEFAULTS);
  const ed = createEditor();
  ed.dispatch({ type: "setEnvironment", name: "technical" });
  assert.deepEqual(ed.stage().settings.look, { ...TECHNICAL_LOOK }, "an untouched look follows the surroundings");
  ed.dispatch({ type: "setLook", patch: { hour: 9 } });
  ed.dispatch({ type: "setEnvironment", name: "outdoor" });
  assert.equal(ed.stage().settings.look.hour, 9, "a look you changed is kept");
  ed.dispatch({ type: "setEnvironment", name: "technical" });
  ed.dispatch({ type: "setLook", reset: true });
  assert.deepEqual(ed.stage().settings.look, { ...TECHNICAL_LOOK });
});

test("Blueprint has its own light defaults: 11:00, ambient 115 %, softness 4, shadows 70 %, no haze, exposure 1.05", async () => {
  const { lookDefaults, BLUEPRINT_LOOK } = await import("../js/model/look.js");
  assert.deepEqual(lookDefaults("blueprint"), BLUEPRINT_LOOK);
  assert.deepEqual({ ...BLUEPRINT_LOOK }, { hour: 11, sun: 1, ambient: 1.15, shadows: true, softness: 4, shadowStrength: 0.7, haze: 0, exposure: 1.05, ground: "sand", clouds: 0.35, cloudSpeed: 1, wind: 60 });
  const { ENVIRONMENTS } = await import("../js/model/schema.js");
  assert.ok(ENVIRONMENTS.includes("blueprint"));
});

test("Outdoor grounds: sand, light sand, dark sand, red dirt and gravel; unknown names fall back", async () => {
  const { GROUNDS } = await import("../js/model/look.js");
  assert.deepEqual(GROUNDS.map((g) => g.id), ["sand", "light-sand", "dark-sand", "red-dirt", "gravel"]);
  assert.equal(cleanLook({ ground: "gravel" }).ground, "gravel");
  assert.equal(cleanLook({ ground: "lava" }).ground, "sand");
  assert.equal(cleanLook({ ground: 3 }).ground, "sand");
});

test("the Outdoor sky has clouds by default; their amount, speed and wind are checked", async () => {
  const { cloudDrift, CLOUD_TILE } = await import("../js/model/look.js");
  assert.equal(LOOK_DEFAULTS.clouds, 0.35);
  assert.equal(LOOK_DEFAULTS.cloudSpeed, 1);
  assert.equal(LOOK_DEFAULTS.wind, 60);
  const c = cleanLook({ clouds: 3, cloudSpeed: -1, wind: 400 });
  assert.equal(c.clouds, 1); assert.equal(c.cloudSpeed, 0); assert.equal(c.wind, 359);
  assert.equal(cleanLook({ clouds: "lots" }).clouds, 0.35);
  // Drift: the cloud pattern moves with the wind, by speed × time, in tiles of the texture.
  assert.deepEqual(cloudDrift({ cloudSpeed: 1, wind: 0 }, 0), [0, 0]);
  const [u, v] = cloudDrift({ cloudSpeed: 1, wind: 0 }, 10);
  assert.ok(Math.abs(u) < 1e-9 && v > 0, "wind 0°: drifting down range (+z)");
  const [u2] = cloudDrift({ cloudSpeed: 1, wind: 90 }, 10);
  assert.ok(u2 > 0, "wind 90°: drifting toward +x");
  const fast = cloudDrift({ cloudSpeed: 2, wind: 0 }, 10)[1];
  assert.ok(Math.abs(fast - 2 * v) < 1e-9, "twice the speed, twice as far");
  assert.equal(cloudDrift({ cloudSpeed: 0, wind: 0 }, 99)[1], 0, "speed 0: still");
  assert.ok(v * CLOUD_TILE > 50 && v * CLOUD_TILE < 150, "about 8 m/s at speed 100 %");
});
