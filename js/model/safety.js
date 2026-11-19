// Safety checks for a stage design, each citing its rule. Pure: no DOM, no Three.js.
//
// Source: IPSC Combined Competition Rules – 6 Disciplines, January 2024 Edition (Handgun [H]),
// https://www.ipsc.org/wp-content/uploads/2024/02/IPSC-Combined-Competition-Rules-6-Disciplines-Jan-2024-Edition-Final-31-Jan-2024.pdf
// - Rule 2.1.2: unless otherwise specified, the default maximum muzzle angle is 90 degrees in all
//   directions, measured from the competitor facing directly centre down range.
// - Rule 2.1.3 [H]: competitors keep a minimum distance of 7 m from metal targets while they are
//   shot; fault lines that limit the approach to metal targets are at least 8 m from them.
// Where a shooter may stand: inside the shooting areas (sampled every 0.5 m, plus the corners),
// at the shooting positions and at the start. The checks are a designer's aid, not a range
// approval: they don't know about berms, ricochets or stage-specific muzzle angles (2.1.2.1).
import { getProp } from "./props.js";
import { blockers, canSee, insidePolygon, aimPoints } from "./planner.js";

export const SAFETY = Object.freeze({
  edition: "IPSC Combined Competition Rules, January 2024 Edition (Handgun)",
  muzzleAngle: 90, muzzleRule: "2.1.2",
  steelMin: 7, faultLineMin: 8, distanceRule: "2.1.3",
});
const EYES = [1.6, 1.15, 0.95], STEP = 0.5, PAST = 0.05;     // standing, crouching, kneeling

// Distance from p to the segment a–b.
function segDist(p, a, b) {
  const v = [b[0] - a[0], b[1] - a[1]], L = v[0] * v[0] + v[1] * v[1];
  const k = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L)) : 0;
  return Math.hypot(p[0] - a[0] - v[0] * k, p[1] - a[1] - v[1] * k);
}
const polyDist = (p, poly) => (insidePolygon(p, poly) ? 0 : Math.min(...poly.map((a, i) => segDist(p, a, poly[(i + 1) % poly.length]))));
const lineDist = (p, pts, closed) => Math.min(...pts.slice(0, closed ? pts.length : -1).map((a, i) => segDist(p, a, pts[(i + 1) % pts.length])));

/** Where a shooter may stand: sampled points, plus the areas themselves (for exact distances). */
export function shooterPlaces(stage, step = STEP) {
  const areas = stage.lines.filter((l) => l.type === "shooting-area" && l.points.length >= 3).map((l) => l.points);
  const points = [];
  for (const a of areas) {
    const xs = a.map((p) => p[0]), zs = a.map((p) => p[1]);
    points.push(...a.map((p) => [...p]));
    for (let x = Math.ceil(Math.min(...xs) / step) * step; x <= Math.max(...xs) + 1e-9; x += step)
      for (let z = Math.ceil(Math.min(...zs) / step) * step; z <= Math.max(...zs) + 1e-9; z += step)
        if (insidePolygon([x, z], a)) points.push([x, z]);
  }
  for (const o of stage.objects) if (o.type === "shooting-position") points.push([...o.position]);
  if (stage.start) points.push([...stage.start.position]);
  return { areas, points };
}

const label = (o) => o.label || getProp(o.type).name;
const m1 = (v) => `${v.toFixed(1)} m`;

/** The checks that fail: [{ rule, level: "bad" | "warn", text, ids }]. */
export function stageChecks(stage) {
  const { areas, points } = shooterPlaces(stage);
  if (!points.length) return [];
  const out = [];
  const targets = stage.objects.filter((o) => ["paper", "steel"].includes(getProp(o.type).scoring));
  const steel = targets.filter((o) => getProp(o.type).scoring === "steel");

  // 2.1.3: 7 m from steel, to the nearest place a shooter may stand.
  for (const o of steel) {
    const d = Math.min(...areas.map((a) => polyDist(o.position, a)), ...points.map((p) => Math.hypot(p[0] - o.position[0], p[1] - o.position[1])));
    if (d < SAFETY.steelMin - 1e-6) out.push({ rule: SAFETY.distanceRule, level: "bad", ids: [o.id],
      text: `${label(o)} is ${m1(d)} from where a shooter may stand; steel needs at least ${SAFETY.steelMin} m (rule ${SAFETY.distanceRule}).` });
  }
  // 2.1.3: a fault line limiting the approach to steel sits at least 8 m from it.
  for (const l of stage.lines.filter((x) => x.type === "fault-line" && x.points.length >= 2)) {
    for (const o of steel) {
      const d = lineDist(o.position, l.points, l.closed);
      if (d < SAFETY.faultLineMin - 1e-6) out.push({ rule: `${SAFETY.distanceRule} fault line`, level: "warn", ids: [o.id, l.id],
        text: `A fault line is ${m1(d)} from ${label(o)}; if it limits the approach to the steel it must be at least ${SAFETY.faultLineMin} m away (rule ${SAFETY.distanceRule}).` });
    }
  }
  // 2.1.2 and visibility: from which places can each target be seen, and is it within 90° of down range there?
  const bs = blockers(stage);
  for (const o of targets) {
    const aims = aimPoints(o);
    const from = points.filter((p) => EYES.some((eye) => aims.some(([x, z, y]) => canSee(bs, p, eye, [x, z], y))));
    if (!from.length) {
      out.push({ rule: "visibility", level: "warn", ids: [o.id], text: `${label(o)} can't be seen from anywhere a shooter may stand.` });
      continue;
    }
    const past = from.filter((p) => o.position[1] - p[1] < -PAST);       // the target is up range of the shooter
    if (!past.length) continue;
    const ok = past.length < from.length;
    out.push({ rule: SAFETY.muzzleRule, level: ok ? "warn" : "bad", ids: [o.id],
      text: ok
        ? `${label(o)} can be seen from places down range of it: shot from there, the muzzle points past ${SAFETY.muzzleAngle}° (rule ${SAFETY.muzzleRule}). Consider a fault line or a vision barrier.`
        : `${label(o)} can only be shot with the muzzle past ${SAFETY.muzzleAngle}° from down range (rule ${SAFETY.muzzleRule}).` });
  }
  return out;
}
