// The stage library: ready-made stages and drills to open as a new project and edit. Stages are
// original layouts and wording written for this app, modelled on the kinds of stages shot at IPSC
// and USPSA matches (see docs/stage-library-sources.md); classic public drills keep their names.
// Pure data plus libraryStage(), which builds a full, fresh stage from an entry.
import { createStage, addObject, addLine, setStart } from "./stage.js";
import { assignLabels } from "./numbering.js";
import { stageStats } from "./stats.js";
import { targetsText } from "./briefing.js";
import { planPositions } from "./planner.js";
import { LIBRARY_STAGES } from "./stage-library-data.js";
import { MORE_STAGES } from "./stage-library-more.js";
import { SCORING } from "./scoring-rules.js";

export const LIBRARY_CATEGORIES = Object.freeze([
  { id: "drill", name: "Drills and standards" },
  { id: "practice", name: "Practice drills (transitions, reloads, movement)" },
  { id: "short", name: "Short courses" },
  { id: "medium", name: "Medium courses" },
  { id: "long", name: "Long courses" },
  { id: "club", name: "USPSA and club (moving and reactive)" },
  { id: "nationals", name: "Match stages (after the 2012 US IPSC Nationals)" },
]);

export const STAGE_LIBRARY = Object.freeze([...LIBRARY_STAGES, ...MORE_STAGES]);

/** The library sorted into folders: one per category, in the categories' order. */
export const libraryFolders = (stages = STAGE_LIBRARY) =>
  LIBRARY_CATEGORIES.map((c) => ({ ...c, stages: stages.filter((s) => s.category === c.id) }));

/** A new stage (new id, fresh copies of everything) built from a library entry. */
export function libraryStage(spec) {
  let s = createStage({ name: spec.name, width: spec.bay?.width ?? 20, depth: spec.bay?.depth ?? 30 });
  s = { ...s, briefing: { ...s.briefing, ...(spec.briefing || {}), stageType: "" } };
  for (const o of spec.objects) s = addObject(s, o.type, o.position, o.rotation ?? 0, o.params ?? {}).stage;
  for (const l of spec.lines || []) s = addLine(s, l.type, l.points, l.closed ?? l.type === "shooting-area").stage;
  if (spec.start) s = setStart(s, spec.start.position, spec.start.facing ?? 0);
  // Suggested shooting positions (and the route between them), worked out from the layout.
  for (const p of planPositions(s).positions) {
    const r = addObject(s, "shooting-position", p.position, p.rotation, { stance: p.stance });
    s = { ...r.stage, objects: r.stage.objects.map((o) => (o.id === r.id && p.via.length ? { ...o, via: p.via } : o)) };
  }
  return assignLabels(s);
}

/** What a library card shows: rounds and targets, counted from the built stage. */
export function librarySummary(spec) {
  const st = stageStats(libraryStage(spec));
  return { rounds: `${spec.rounds ?? st.minRounds} rounds`, targets: targetsText(st), stats: st };
}

const infoCache = new Map();
/**
 * What a library card's ⓘ says about shots and course length. A drill (fixed procedure) fires a set
 * number of shots, so its fewest and most are the same; a Comstock stage has a minimum and no
 * maximum (make-up shots are allowed). The course length follows the rulebook's round limits.
 */
export function libraryInfo(spec) {
  if (infoCache.has(spec.id)) return infoCache.get(spec.id);
  const min = spec.rounds ?? stageStats(libraryStage(spec)).minRounds;
  const fixed = spec.fixed === true || spec.category === "drill";
  const L = SCORING.courseLimits;
  const course = min <= L.Short ? "Short" : min <= L.Medium ? "Medium" : "Long";
  const courseText = fixed ? `${course} course length (${{ Short: `up to ${L.Short}`, Medium: `${L.Short + 1} to ${L.Medium}`, Long: `${L.Medium + 1} to ${L.Long}` }[course]} rounds)`
    : `${course} course (${{ Short: `up to ${L.Short}`, Medium: `${L.Short + 1} to ${L.Medium}`, Long: `${L.Medium + 1} to ${L.Long}` }[course]} rounds)`;
  const info = { minShots: min, maxShots: fixed ? min : null, course, courseText,
    shotsText: fixed ? `Shots: ${min} (fixed by the procedure)` : `Shots: ${min} minimum, no maximum (Comstock: make-up shots allowed)` };
  infoCache.set(spec.id, info);
  return info;
}
