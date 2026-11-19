// Common choices for the Written Stage Briefing fields (free text always stays possible).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BRIEFING_OPTIONS, choiceFor } from "../js/model/briefing-options.js";

test("the common fields offer choices", () => {
  for (const k of ["scoring", "startSignal", "startPosition", "gunCondition", "stopTime", "procedure"]) {
    assert.ok(BRIEFING_OPTIONS[k]?.length >= 2, k);
    for (const o of BRIEFING_OPTIONS[k]) assert.ok(typeof o === "string" && o.length > 3 && o.length <= 4000, `${k}: ${o}`);
  }
  assert.ok(BRIEFING_OPTIONS.gunCondition.some((o) => /holster/i.test(o)));
  assert.ok(BRIEFING_OPTIONS.scoring.some((o) => /Comstock/.test(o)));
});

test("a saved value picks its choice, or is custom text", () => {
  const first = BRIEFING_OPTIONS.startSignal[0];
  assert.deepEqual(choiceFor("startSignal", first), { choice: first, custom: false });
  assert.deepEqual(choiceFor("startSignal", "  "), { choice: "", custom: false });
  assert.deepEqual(choiceFor("startSignal", "A whistle"), { choice: "custom", custom: true });
  assert.deepEqual(choiceFor("matchName", "Club cup"), { choice: "custom", custom: true });
});
