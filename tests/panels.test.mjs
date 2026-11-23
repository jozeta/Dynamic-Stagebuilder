// The side panels: the left column's tabs in order (Projects, Props, On stage), Settings as a tab of
// the right-hand panel (not a modal), and the camera pad's labels.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const pad = readFileSync(new URL("../js/ui/camera-pad.js", import.meta.url), "utf8");
const panels = [...html.matchAll(/data-lg-dock-panel="([^"]+)" data-lg-dock-side="([^"]+)" data-lg-dock-group="([^"]+)"/g)].map((m) => ({ id: m[1], side: m[2], group: m[3] }));

test("the left panel's tabs are Projects, Props, then On stage", () => {
  assert.deepEqual(panels.filter((p) => p.group === "left").map((p) => p.id), ["projects", "props", "stage"]);
});

test("Settings is a tab of the right-hand panel, after the Inspector, not a modal", () => {
  assert.deepEqual(panels.filter((p) => p.group === "right").map((p) => p.id), ["inspector", "settings"]);
  assert.doesNotMatch(html, /<dialog[^>]*settings/);
});

test("the camera pad says Fwd/Back and Up/Down", () => {
  assert.match(pad, /text: "Fwd\/Back"/);
  assert.match(pad, /text: "Up\/Down"/);
  assert.doesNotMatch(pad, /text: "Move"|text: "Height"/);
});
