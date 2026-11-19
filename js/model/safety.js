// Safety distances and sight lines. Pure: no DOM, no Three.js.
//
// Source: IPSC Combined Competition Rules – 6 Disciplines, January 2024 Edition (Handgun [H]),
// https://www.ipsc.org/wp-content/uploads/2024/02/IPSC-Combined-Competition-Rules-6-Disciplines-Jan-2024-Edition-Final-31-Jan-2024.pdf
// - Rule 2.1.3 [H]: competitors keep a minimum distance of 7 m from metal targets while they are
//   shot; fault lines that limit the approach to metal targets are at least 8 m from them.
// - Rule 10.4.7 [H]: a shot fired at a metal target from less than 7 m is a disqualification.
// - Rule 10.4.2 [H]: a shot striking the ground within 3 m of the competitor is a disqualification,
//   except when shooting at a paper target closer than 3 m.
import { getProp } from "./props.js";
import { blockers, canSee, aimPoints } from "./planner.js";

export const SAFETY = Object.freeze({
  edition: "IPSC Combined Competition Rules, January 2024 Edition (Handgun)",
  steelMin: 7, faultLineMin: 8, distanceRule: "2.1.3",
});

/**
 * Sight lines from one place (eye height in metres): { seen: [{ id, aim: [x, z, y] }], hidden: [ids] }
 * for every paper and steel target. `aim` is the first point of the target the eye can see.
 */
export function sightFrom(stage, point, eye) {
  const bs = blockers(stage);
  const seen = [], hidden = [];
  for (const o of stage.objects) {
    if (!["paper", "steel"].includes(getProp(o.type).scoring)) continue;
    const aim = aimPoints(o).find(([x, z, y]) => canSee(bs, point, eye, [x, z], y));
    if (aim) seen.push({ id: o.id, aim }); else hidden.push(o.id);
  }
  return { seen, hidden };
}

/**
 * The rulebook distances to draw round a target (IPSC CCR January 2024, Handgun): steel gets 7 m
 * (red: no one closer while it is shot, rule 2.1.3; a shot from closer is a disqualification, rule
 * 10.4.7) and 8 m (yellow: the nearest a fault line limiting the approach may be, rule 2.1.3). Paper
 * has no minimum distance; its 3 m ring (yellow) marks rule 10.4.2: a shot striking the ground within
 * 3 m of the shooter is a disqualification, except when shooting at a paper target closer than 3 m.
 */
export function safetyRings(obj) {
  const kind = getProp(obj.type).scoring;
  if (kind === "steel") return [
    { radius: SAFETY.steelMin, level: "bad", rule: SAFETY.distanceRule, label: `${SAFETY.steelMin} m`,
      text: `Minimum distance: nobody within ${SAFETY.steelMin} m while steel is shot (rule ${SAFETY.distanceRule}); a shot from closer is a disqualification (rule 10.4.7).` },
    { radius: SAFETY.faultLineMin, level: "warn", rule: SAFETY.distanceRule, label: `${SAFETY.faultLineMin} m`,
      text: `A fault line limiting the approach to steel must be at least ${SAFETY.faultLineMin} m away (rule ${SAFETY.distanceRule}).` },
  ];
  if (kind === "paper") return [
    { radius: 3, level: "warn", rule: "10.4.2", label: "3 m",
      text: "No minimum distance for paper. Inside 3 m, a shot that strikes the ground near the shooter is not a disqualification (rule 10.4.2)." },
  ];
  return [];
}
