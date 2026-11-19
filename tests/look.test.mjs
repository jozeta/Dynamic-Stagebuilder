// Environment look settings: defaults, cleaning untrusted values, and the sun from the time of day.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOK_DEFAULTS, TECHNICAL_LOOK, cleanLook, sunFromHour } from "../js/model/look.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";

test("defaults", () => {
  assert.deepEqual({ ...LOOK_DEFAULTS }, { hour: 15.75, sun: 0.85, ambient: 1.05, shadows: true, softness: 4, shadowStrength: 0.55, haze: 0.15, exposure: 1, ground: "gravel", foliage: "nordic",
    clouds: 0.45, cloudSpeed: 0.5, wind: 70, cloudShadow: 0.5, sunAuto: false, sunElevation: 31, sunAzimuth: 35, sunColor: 0.78,
    groundHue: null, groundIntensity: null, groundBrightness: null, walls: true, gridIntensity: null, gridColor: null });
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
  assert.deepEqual({ ...TECHNICAL_LOOK }, { hour: 16, sun: 0.85, ambient: 1.05, shadows: true, softness: 4, shadowStrength: 0.55, haze: 0.15, exposure: 1, ground: "sand", foliage: "mixed",
    clouds: 0.45, cloudSpeed: 0.5, wind: 70, cloudShadow: 0.5, sunAuto: false, sunElevation: 31, sunAzimuth: 35, sunColor: 0.78,
    groundHue: 220, groundIntensity: 0, groundBrightness: 1.1, walls: false, gridIntensity: 0.4, gridColor: null });
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
  assert.deepEqual({ ...BLUEPRINT_LOOK }, { hour: 11, sun: 1, ambient: 1.15, shadows: true, softness: 4, shadowStrength: 0.7, haze: 0, exposure: 1.05, ground: "sand", foliage: "mixed", clouds: 0.35, cloudSpeed: 1, wind: 60, cloudShadow: 0.5, sunAuto: true, sunElevation: 35, sunAzimuth: 20, sunColor: 0.8, groundHue: null, groundIntensity: null, groundBrightness: null, walls: true, gridIntensity: null, gridColor: null });
  const { ENVIRONMENTS } = await import("../js/model/schema.js");
  assert.ok(ENVIRONMENTS.includes("blueprint"));
});

test("Outdoor grounds: sand, light sand, dark sand, red dirt and gravel; unknown names fall back", async () => {
  const { GROUNDS } = await import("../js/model/look.js");
  assert.deepEqual(GROUNDS.map((g) => g.id), ["sand", "light-sand", "dark-sand", "red-dirt", "gravel"]);
  assert.equal(cleanLook({ ground: "gravel" }).ground, "gravel");
  assert.equal(cleanLook({ ground: "lava" }).ground, "gravel", "unknown: the Outdoor default");
  assert.equal(cleanLook({ ground: 3 }).ground, "gravel");
});

test("the Outdoor sky has clouds by default; their amount, speed and wind are checked", async () => {
  const { cloudDrift, CLOUD_TILE } = await import("../js/model/look.js");
  assert.equal(LOOK_DEFAULTS.clouds, 0.45);
  assert.equal(LOOK_DEFAULTS.cloudSpeed, 0.5);
  assert.equal(LOOK_DEFAULTS.wind, 70);
  const c = cleanLook({ clouds: 3, cloudSpeed: -1, wind: 400 });
  assert.equal(c.clouds, 1); assert.equal(c.cloudSpeed, 0); assert.equal(c.wind, 359);
  assert.equal(cleanLook({ clouds: "lots" }).clouds, 0.45);
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

test("time of day can be turned off: then the sun's height, direction and colour are set by hand", async () => {
  const { sunFromLook, sunColorAt } = await import("../js/model/look.js");
  assert.equal(LOOK_DEFAULTS.sunAuto, false, "Outdoor: the sun is set by hand by default");
  assert.equal(TECHNICAL_LOOK.sunAuto, false, "Technical: the sun set by hand too");
  const byClock = sunFromLook({ ...LOOK_DEFAULTS, sunAuto: true, hour: 12 });
  assert.deepEqual(byClock, sunFromHour(12), "with time of day on, the clock decides");
  const manual = sunFromLook({ ...LOOK_DEFAULTS, sunAuto: false, sunElevation: 30, sunAzimuth: 0, sunColor: 1 });
  assert.ok(Math.abs(manual.elevation - 30) < 1e-9);
  assert.ok(Math.abs(manual.direction[1] - Math.sin(Math.PI / 6)) < 1e-9, "30° up");
  assert.ok(manual.direction[2] < 0 && Math.abs(manual.direction[0]) < 1e-9, "0°: behind the shooter, up range");
  const left = sunFromLook({ ...LOOK_DEFAULTS, sunAuto: false, sunElevation: 30, sunAzimuth: 90, sunColor: 1 });
  assert.ok(left.direction[0] > 0.8, "90°: toward +x, the shooter's left");
  assert.equal(manual.warmth, 0, "bright white: no evening warmth");
  assert.ok(sunFromLook({ ...LOOK_DEFAULTS, sunAuto: false, sunColor: 0 }).warmth > 0.9, "dark orange: full warmth");
  // The colour runs dark orange → yellow → bright white.
  const [r0, g0, b0] = sunColorAt(0), [r1, g1, b1] = sunColorAt(0.5), [r2, g2, b2] = sunColorAt(1);
  assert.ok(r0 > g0 * 1.6 && b0 < 0.2, "dark orange");
  assert.ok(r1 > 0.95 && g1 > 0.75 && b1 < 0.5, "yellow");
  assert.deepEqual([r2, g2, b2], [1, 1, 1], "bright white");
  const c = cleanLook({ sunAuto: "no", sunElevation: 500, sunAzimuth: -5, sunColor: 2 });
  assert.equal(c.sunAuto, false, "not a yes or no: the Outdoor default"); assert.equal(c.sunElevation, 90); assert.equal(c.sunAzimuth, 0); assert.equal(c.sunColor, 1);
});

test("Blueprint and Technical grounds take a colour: hue, intensity and brightness; Technical walls can go", async () => {
  const { groundTone, hsvToRgb, GROUND_TONE_DEFAULTS } = await import("../js/model/look.js");
  // Not set: each surroundings keeps its own ground (Blueprint blue, Technical grey).
  assert.equal(LOOK_DEFAULTS.groundHue, null);
  assert.deepEqual(groundTone({}, "blueprint"), GROUND_TONE_DEFAULTS.blueprint);
  assert.deepEqual(groundTone({}, "technical"), GROUND_TONE_DEFAULTS.technical);
  assert.equal(GROUND_TONE_DEFAULTS.technical.intensity, 0, "Technical: a grey floor");
  assert.deepEqual(groundTone({ groundHue: 120, groundIntensity: 0.5, groundBrightness: 1.2 }, "technical"), { hue: 120, intensity: 0.5, brightness: 1.2 });
  const c = cleanLook({ groundHue: 400, groundIntensity: -1, groundBrightness: 9, walls: "no" });
  assert.equal(c.groundHue, 359); assert.equal(c.groundIntensity, 0); assert.equal(c.groundBrightness, 1.6);
  assert.equal(c.walls, true, "walls shown unless switched off");
  assert.equal(cleanLook({ groundHue: "red" }).groundHue, null, "not a number: back to the surroundings' own");
  assert.equal(cleanLook({ walls: false }).walls, false);
  // HSV → RGB, for the floor colour.
  assert.deepEqual(hsvToRgb(0, 1, 1), [1, 0, 0]);
  assert.deepEqual(hsvToRgb(120, 1, 1), [0, 1, 0]);
  assert.deepEqual(hsvToRgb(210, 0, 1), [1, 1, 1], "no intensity: white (the floor's own grey shows)");
});

test("cloud shadows have their own strength, 0 (none) to 100 %", () => {
  assert.equal(LOOK_DEFAULTS.cloudShadow, 0.5);
  assert.equal(cleanLook({ cloudShadow: 3 }).cloudShadow, 1);
  assert.equal(cleanLook({ cloudShadow: -1 }).cloudShadow, 0);
  assert.equal(cleanLook({ cloudShadow: "dark" }).cloudShadow, 0.5);
});

test("Blueprint and Technical grids have their own intensity and colour", async () => {
  const { gridTone, GRID_DEFAULTS } = await import("../js/model/look.js");
  assert.equal(LOOK_DEFAULTS.gridIntensity, null);
  assert.equal(LOOK_DEFAULTS.gridColor, null);
  assert.deepEqual(gridTone({}, "blueprint"), GRID_DEFAULTS.blueprint, "not set: the surroundings' own grid");
  assert.deepEqual(gridTone({}, "technical"), GRID_DEFAULTS.technical);
  assert.deepEqual(gridTone({ gridIntensity: 0.4, gridColor: "#ff0000" }, "technical"), { intensity: 0.4, color: "#ff0000" });
  const c = cleanLook({ gridIntensity: 5, gridColor: "#ABCDEF" });
  assert.equal(c.gridIntensity, 1); assert.equal(c.gridColor, "#abcdef");
  assert.equal(cleanLook({ gridColor: "blue" }).gridColor, null, "not a colour: the surroundings' own");
});
