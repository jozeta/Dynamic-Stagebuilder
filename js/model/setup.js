// The setup sheet: where to put each prop when building the stage, measured with a tape from the
// bay. "Left" is the shooter's left looking down range (+x). Each prop's centre is given from the
// left side line and from the up-range edge, and its distance to both up-range corners, so it can
// be found from two tapes. Pure: no DOM.
import { propName } from "./props.js";

const r2 = (v) => Math.round(v * 100) / 100 + 0;
const deg = (v) => ((Math.round(v) % 360) + 360) % 360;
const PLAN_ONLY = new Set(["shooting-position"]);           // planning marks, nothing to build

const place = (bay, [x, z]) => {
  const fromLeft = bay.width / 2 - x;
  return { fromLeft: r2(fromLeft), downRange: r2(z), toLeftCorner: r2(Math.hypot(fromLeft, z)), toRightCorner: r2(Math.hypot(x + bay.width / 2, z)) };
};

/** One row per prop to build (and the start box), nearest the up-range edge first. */
export function setupRows(stage) {
  const rows = stage.objects.filter((o) => !PLAN_ONLY.has(o.type)).map((o) => ({
    id: o.id, label: o.label || "", name: propName(o), rotation: deg(o.rotation), ...place(stage.bay, o.position),
  }));
  if (stage.start) rows.push({ id: "start", label: "", name: "Start box", rotation: deg(stage.start.facing), ...place(stage.bay, stage.start.position) });
  return rows.sort((a, b) => a.downRange - b.downRange || a.fromLeft - b.fromLeft);
}

/** Fault lines and shooting areas: their corner points as [from the left side line, down range]. */
export function setupLines(stage) {
  return stage.lines.map((l) => ({ id: l.id, name: l.type === "fault-line" ? "Fault line" : "Shooting area",
    points: l.points.map((p) => { const q = place(stage.bay, p); return [q.fromLeft, q.downRange]; }) }));
}
