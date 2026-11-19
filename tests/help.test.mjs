// The Help window's content: every topic has a title, an illustration, text and tips.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HELP_TOPICS, SHORTCUTS } from "../js/model/help-content.js";

test("help covers the main tasks, each with an illustration and text", () => {
  const ids = HELP_TOPICS.map((t) => t.id);
  for (const id of ["start", "props", "move", "walls", "markings", "targets", "moving", "view", "settings", "briefing", "projects", "keys"])
    assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of HELP_TOPICS) {
    assert.ok(t.title && t.icon && t.art, t.id);
    assert.ok(t.text.length >= 1 && t.text.every((p) => typeof p === "string" && p.length > 20), t.id);
    assert.ok(Array.isArray(t.tips), t.id);
  }
});

test("the shortcut list matches the keys the app handles", () => {
  const keys = SHORTCUTS.map(([k]) => k).join(" ");
  for (const k of ["Z", "D", "Delete", "Q", "E", "F", "Shift", "Enter", "Escape", "1"]) assert.match(keys, new RegExp(k), k);
});
