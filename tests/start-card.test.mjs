// The start-position card (rule 3.2.2: the RO may show the start position "by use of a picture"):
// a camera in front of the start box looking back at the posed shooter, and the briefing's start
// wording to go with it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, setStart, setBriefing } from "../js/model/stage.js";
import { startCamera, startCard } from "../js/model/start-card.js";

const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

test("facing down range, the camera stands down range of the start, a little to one side, looking back", () => {
  const c = startCamera({ position: [0, 2], facing: 0 });
  assert.ok(c.position[2] > 4.5, "down range of the start box");
  assert.ok(Math.abs(c.position[0]) > 0.5, "turned to one side, so the pose shows in depth");
  assert.ok(c.position[1] > 1 && c.position[1] < 2.2, "about eye height");
  assert.ok(close(c.target, [0, 1, 2]), "looking at the shooter's middle");
  assert.ok(Math.abs(Math.hypot(c.position[0], c.position[2] - 2) - 3.4) < 1e-9, "3.4 m away on the ground");
});

test("the camera turns with the start's facing", () => {
  const c = startCamera({ position: [0, 2], facing: 180 });       // facing up range
  assert.ok(c.position[2] < 0, "now up range of the start box, in front of the shooter");
});

test("the card: stage title, the start position, gun condition and start signal, '–' when empty", () => {
  let s = setStart(createStage({ name: "Coffee Break" }), [0, 2], 0);
  s = setBriefing(s, { stageNumber: 4, startPosition: "Seated on the chair, hands flat on the thighs", gunCondition: "Loaded, on the table" });
  const card = startCard(s);
  assert.equal(card.title, "Stage 4 – Coffee Break: start position");
  assert.deepEqual(card.rows, [["Start position", "Seated on the chair, hands flat on the thighs"], ["Gun condition", "Loaded, on the table"], ["Start signal", "Audible"]]);
  assert.equal(startCard(setBriefing(s, { gunCondition: " " })).rows[1][1], "–");
  assert.equal(startCard(createStage()).hasStart, false);
});
