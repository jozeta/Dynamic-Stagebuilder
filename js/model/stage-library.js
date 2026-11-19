// The stage library: ready-made stages and drills to open as a new project and edit. Stages are
// original layouts and wording written for this app, modelled on the kinds of stages shot at IPSC
// and USPSA matches (see docs/stage-library-sources.md); classic public drills keep their names.
// Pure data plus libraryStage(), which builds a full, fresh stage from an entry.
import { createStage, addObject, addLine, setStart } from "./stage.js";
import { assignLabels } from "./numbering.js";
import { stageStats } from "./stats.js";
import { targetsText } from "./briefing.js";
import { LIBRARY_STAGES } from "./stage-library-data.js";

export const LIBRARY_CATEGORIES = Object.freeze([
  { id: "drill", name: "Drills and standards" },
  { id: "short", name: "Short courses" },
  { id: "medium", name: "Medium courses" },
  { id: "long", name: "Long courses" },
  { id: "club", name: "USPSA and club (moving and reactive)" },
  { id: "nationals", name: "Match stages (after the 2012 US IPSC Nationals)" },
]);

export const STAGE_LIBRARY = LIBRARY_STAGES;

/** A new stage (new id, fresh copies of everything) built from a library entry. */
export function libraryStage(spec) {
  let s = createStage({ name: spec.name, width: spec.bay?.width ?? 20, depth: spec.bay?.depth ?? 30 });
  s = { ...s, briefing: { ...s.briefing, ...(spec.briefing || {}), stageType: "" } };
  for (const o of spec.objects) s = addObject(s, o.type, o.position, o.rotation ?? 0, o.params ?? {}).stage;
  for (const l of spec.lines || []) s = addLine(s, l.type, l.points, l.closed ?? l.type === "shooting-area").stage;
  if (spec.start) s = setStart(s, spec.start.position, spec.start.facing ?? 0);
  return assignLabels(s);
}

/** What a library card shows: rounds and targets, counted from the built stage. */
export function librarySummary(spec) {
  const st = stageStats(libraryStage(spec));
  return { rounds: `${spec.rounds ?? st.minRounds} rounds`, targets: targetsText(st), stats: st };
}
