// Rule checks for a stage and for a match, each naming its rule. Pure: no DOM.
//
// Source: IPSC Handgun Competition Rules, January 2026 Edition (www.ipsc.org, Rules). Read
// 2026-11-23 from the edition's final text ("Final 29 Dec 2025").
// - 1.2.1.1–1.2.1.3: Short courses need no more than 12 rounds, Medium 24, Long 32.
// - 1.2.1.4 / Appendix A4: the approved balance for an IPSC sanctioned match is 3 Short : 2 Medium :
//   1 Long; Appendix A4 lists the approved splits for 12 to 30 stages.
// - 1.2.1.5: empty-chamber (and empty magazine well) ready conditions should not be required for more
//   than 25 % of the courses of fire in a match.
// - 2.1.3: competitors keep at least 7 m from metal targets while shooting them; fault lines that
//   limit the approach to metal targets are at least 8 m from them (also model/safety.js).
// - 2.2.1.4: fault lines rise at least 2 cm and, unless they make the boundary of a shooting area,
//   are at least 1.5 m long.
// - 2.2.2: obstacles to be climbed are at most 2 m high; over 1 m they need scaling aids.
// - 3.2.1: the written stage briefing gives at least the scoring targets, rounds, the firearm and
//   competitor ready conditions, the start position, the start signal and the procedure.
// - 4.3.3.3: metal plates must not be used on their own: at least one scoring paper target or
//   scoring popper in each course of fire.
// What the app can't see (shoot-throughs, the 9 hits per view of 1.2.1.1–3, the 90° muzzle angle,
// target arrays of 4.1.1.2) is not checked here.
import { getProp, PROPS } from "./props.js";
import { stageStats } from "./stats.js";
import { insidePolygon } from "./planner.js";
import { SCORING } from "./scoring-rules.js";

export const RULES_EDITION = SCORING.edition;
const LIMITS = SCORING.courseLimits;
const COURSE_RULE = { Short: "1.2.1.1", Medium: "1.2.1.2", Long: "1.2.1.3" };
const STEEL_MIN = 7, FAULT_MIN = 8, FAULT_LENGTH = 1.5, CLIMB_MAX = 2, CLIMB_AIDS = 1;
const CLIMBABLE = new Set(["platform", "ramp"]);
const PLATES = new Set(["plate-round", "plate-square", "plate-rack", "texas-star", "dueling-tree"]);

// Geometry on the ground ([x, z], metres).
const segDist = ([px, pz], [ax, az], [bx, bz]) => {
  const dx = bx - ax, dz = bz - az, len = dx * dx + dz * dz;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
const edges = (l) => {
  const out = [];
  for (let i = 1; i < l.points.length; i++) out.push([l.points[i - 1], l.points[i]]);
  if (l.closed && l.points.length > 2) out.push([l.points.at(-1), l.points[0]]);
  return out;
};
const lineDist = (p, l) => Math.min(...edges(l).map(([a, b]) => segDist(p, a, b)));
const lineLength = (l) => edges(l).reduce((n, [a, b]) => n + Math.hypot(b[0] - a[0], b[1] - a[1]), 0);
const m1 = (v) => `${(Math.floor(v * 10) / 10).toFixed(1)} m`;
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const check = (id, level, rule, text, ids = []) => ({ id, level, rule, text, ids });

/** The course type a stage counts as: the briefing's own choice, else the one its rounds suggest. */
export const courseType = (stage, stats = stageStats(stage)) => stage.briefing?.stageType || stats.suggestedType;

/** The checks for one stage: [{ id, level ("ok" | "warn" | "bad"), rule, text, ids }]. */
export function stageChecks(stage) {
  const s = stageStats(stage);
  const out = [];
  const known = stage.objects.filter((o) => Object.hasOwn(PROPS, o.type));

  // Rounds (1.2.1.1–1.2.1.3).
  const chosen = stage.briefing?.stageType;
  if (s.minRounds > LIMITS.Long) out.push(check("rounds", "bad", COURSE_RULE.Long, `${s.minRounds} rounds: more than the ${LIMITS.Long} a Long course may need.`));
  else if (chosen && LIMITS[chosen] && s.minRounds > LIMITS[chosen]) out.push(check("rounds", "bad", COURSE_RULE[chosen], `${s.minRounds} rounds: more than the ${LIMITS[chosen]} a ${chosen} course may need. Change the stage type or take targets out.`));
  else out.push(check("rounds", "ok", COURSE_RULE[courseType(stage, s)] ?? COURSE_RULE.Long, s.minRounds ? `${s.minRounds} rounds: within the ${courseType(stage, s)} course limit (${LIMITS[courseType(stage, s)]}).` : "No targets yet, so no rounds to count."));

  // Plates only (4.3.3.3).
  const plates = known.filter((o) => PLATES.has(o.type));
  const scoringOther = known.some((o) => getProp(o.type).scoring === "paper" || o.type === "popper");
  out.push(plates.length && !scoringOther
    ? check("plates-only", "bad", "4.3.3.3", "Only metal plates: add at least one scoring paper target or popper.", plates.map((o) => o.id))
    : check("plates-only", "ok", "4.3.3.3", "Not plates only: there is a scoring paper target or popper (or no plates)."));

  // Steel distance from where the shooter stands (2.1.3): shooting areas, shooting positions, the start box.
  const areas = stage.lines.filter((l) => l.type === "shooting-area" && l.closed && l.points.length > 2);
  const spots = [...known.filter((o) => o.type === "shooting-position").map((o) => o.position), ...(stage.start ? [stage.start.position] : [])];
  const nearest = (p) => Math.min(Infinity, ...areas.map((a) => (insidePolygon(p, a.points) ? 0 : lineDist(p, a))), ...spots.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])));
  const steel = known.filter((o) => getProp(o.type).scoring === "steel");
  const close = steel.filter((o) => nearest(o.position) < STEEL_MIN - 1e-6);
  out.push(close.length
    ? check("steel-distance", "bad", "2.1.3", `${plural(close.length, "steel target")} closer than ${STEEL_MIN} m to where the shooter stands (nearest ${m1(Math.min(...close.map((o) => nearest(o.position))))}). A shot from closer is a disqualification (rule 10.4.7).`, close.map((o) => o.id))
    : check("steel-distance", "ok", "2.1.3", steel.length ? `All steel is at least ${STEEL_MIN} m from the shooting areas, positions and the start.` : "No steel on the stage."));

  // Fault lines near steel (2.1.3) and their length (2.2.1.4).
  const faults = stage.lines.filter((l) => l.type === "fault-line" && l.points.length > 1);
  const nearSteel = faults.filter((l) => steel.some((o) => lineDist(o.position, l) < FAULT_MIN - 1e-6));
  out.push(nearSteel.length
    ? check("fault-line-steel", "warn", "2.1.3", `${plural(nearSteel.length, "fault line")} closer than ${FAULT_MIN} m to steel. A fault line that limits the approach to steel must be at least ${FAULT_MIN} m from it.`, nearSteel.map((l) => l.id))
    : check("fault-line-steel", "ok", "2.1.3", `No fault line within ${FAULT_MIN} m of steel.`));
  const short = faults.filter((l) => !l.closed && lineLength(l) < FAULT_LENGTH - 1e-6);
  out.push(short.length
    ? check("fault-line-length", "warn", "2.2.1.4", `${plural(short.length, "fault line")} shorter than ${FAULT_LENGTH} m. A fault line must be at least ${FAULT_LENGTH} m long unless it bounds a shooting area.`, short.map((l) => l.id))
    : check("fault-line-length", "ok", "2.2.1.4", `Fault lines are at least ${FAULT_LENGTH} m long.`));

  // Obstacles to climb (2.2.2).
  const climb = known.filter((o) => CLIMBABLE.has(o.type));
  const tooHigh = climb.filter((o) => (o.params?.height ?? 0) > CLIMB_MAX + 1e-6);
  const needAids = climb.filter((o) => (o.params?.height ?? 0) > CLIMB_AIDS + 1e-6);
  out.push(tooHigh.length ? check("obstacle-height", "bad", "2.2.2", `${plural(tooHigh.length, "obstacle")} higher than ${CLIMB_MAX} m.`, tooHigh.map((o) => o.id))
    : needAids.length ? check("obstacle-height", "warn", "2.2.2", `${plural(needAids.length, "platform or ramp", "platforms or ramps")} over ${CLIMB_AIDS} m high: supply scaling aids (steps or a ladder).`, needAids.map((o) => o.id))
      : check("obstacle-height", "ok", "2.2.2", `Platforms and ramps are ${CLIMB_AIDS} m high or lower.`));

  // The briefing's minimum contents (3.2.1); targets and rounds are counted from the stage.
  const b = stage.briefing ?? {};
  const missing = [["startPosition", "start position"], ["gunCondition", "gun condition"], ["startSignal", "start signal"], ["procedure", "procedure"]]
    .filter(([k]) => !String(b[k] ?? "").trim()).map(([, name]) => name);
  out.push(missing.length
    ? check("briefing", "warn", "3.2.1", `The briefing has no ${missing.length > 1 ? `${missing.slice(0, -1).join(", ")} or ${missing.at(-1)}` : missing[0]} yet.`)
    : check("briefing", "ok", "3.2.1", "The briefing gives the start position, gun condition, start signal and procedure."));
  return out;
}

// Appendix A4: the approved [short, medium, long] splits for 12 to 30 stages.
const A4 = [[12, 6, 4, 2], [13, 7, 4, 2], [13, 6, 5, 2], [14, 7, 5, 2], [14, 8, 4, 2], [14, 6, 6, 2], [15, 8, 5, 2], [15, 7, 6, 2],
  [16, 8, 6, 2], [16, 9, 5, 2], [17, 9, 6, 2], [18, 9, 6, 3], [19, 10, 6, 3], [19, 9, 7, 3], [20, 10, 7, 3], [20, 11, 6, 3], [20, 9, 8, 3],
  [21, 11, 7, 3], [21, 10, 8, 3], [22, 11, 8, 3], [22, 12, 7, 3], [23, 12, 8, 3], [24, 12, 8, 4], [25, 13, 8, 4], [25, 12, 9, 4],
  [26, 13, 9, 4], [26, 14, 8, 4], [26, 12, 10, 4], [27, 14, 9, 4], [27, 13, 10, 4], [28, 14, 10, 4], [28, 15, 9, 4], [29, 15, 10, 4], [30, 15, 10, 5]];
const split = ([s, m, l]) => `${s} short, ${m} medium, ${l} long`;
const EMPTY = /\bunloaded\b|empty chamber|chamber empty|empty magazine well/i;

/** The checks for a match's stages (in order): [{ id, level, rule, text, ids }]; ids are stage ids. */
export function matchChecks(stages) {
  const out = [];
  const n = stages.length;
  const types = stages.map((s) => courseType(s));
  const count = ["Short", "Medium", "Long"].map((t) => types.filter((x) => x === t).length);
  const approved = A4.filter((r) => r[0] === n).map((r) => r.slice(1));
  if (!approved.length) out.push(check("ratio", "ok", "1.2.1.4", `${split(count)}. The approved balance for a sanctioned match is 3:2:1 short, medium and long (Appendix A4 lists splits for 12 to 30 stages).`));
  else if (approved.some((a) => a.every((v, i) => v === count[i]))) out.push(check("ratio", "ok", "1.2.1.4", `${split(count)}: an approved split for ${n} stages (Appendix A4).`));
  else out.push(check("ratio", "warn", "1.2.1.4", `${split(count)}. For ${n} stages a sanctioned match needs ${approved.map(split).join(", or ")} (Appendix A4).`));

  // "stage 2" / "stages 2 and 5" / "stages 1, 3 and 4", by their place in the match.
  const which = (list) => { const ns = list.map((s) => stages.indexOf(s) + 1); return ns.length === 1 ? `stage ${ns[0]}` : `stages ${ns.slice(0, -1).join(", ")} and ${ns.at(-1)}`; };
  const empty = stages.filter((s) => EMPTY.test(String(s.briefing?.gunCondition ?? "")));
  out.push(n && empty.length / n > 0.25
    ? check("empty-chamber", "warn", "1.2.1.5", `Empty-chamber starts on ${empty.length} of ${n} stages (${which(empty)}): more than 25 %.`, empty.map((s) => s.id))
    : check("empty-chamber", "ok", "1.2.1.5", `Empty-chamber starts on ${empty.length} of ${n} stages (at most 25 %).`));

  const over = stages.filter((s) => stageChecks(s).some((c) => c.level === "bad"));
  out.push(over.length
    ? check("stages", "bad", "1.2.1", `A failed rule check on ${which(over)}: open ${over.length === 1 ? "it" : "them"} to see which.`, over.map((s) => s.id))
    : check("stages", "ok", "1.2.1", "Every stage passes its own rule checks."));
  return out;
}
