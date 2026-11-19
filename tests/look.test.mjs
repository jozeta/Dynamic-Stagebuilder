// Environment look settings: defaults, cleaning untrusted values, and the sun from the time of day.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOK_DEFAULTS, cleanLook, sunFromHour } from "../js/model/look.js";
import { createEditor } from "../js/editor.js";
import { createStage } from "../js/model/stage.js";
import { validateStage } from "../js/model/schema.js";

test("defaults", () => {
  assert.deepEqual({ ...LOOK_DEFAULTS }, { hour: 18.25, sun: 1, ambient: 1, shadows: true, softness: 1, haze: 0.2, exposure: 1 });
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
