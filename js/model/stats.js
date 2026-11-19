// Stage statistics, recomputed from the stage on every edit.
import { getProp } from "./props.js";
import { SCORING } from "./scoring-rules.js";
import { arrayCounts } from "./arrays.js";

// Steel props with several plates (a plate rack, a Texas star, a dueling tree) count each plate.
const steelCount = (o) => getProp(o.type).plates?.(o.params ?? {}) ?? 1;

export function stageStats(stage, rules = SCORING) {
  let paper = 0, steel = 0, noShoots = 0;
  for (const o of stage.objects) {
    const kind = getProp(o.type).scoring;
    if (kind === "paper") { const c = arrayCounts(o); paper += c.paper; noShoots += c.noshoot; }
    else if (kind === "steel") steel += steelCount(o);
  }
  const minRounds = paper * rules.hitsPerPaper + steel * rules.hitsPerSteel;
  const maxPoints = paper * rules.hitsPerPaper * rules.pointsPerPaperHit + steel * rules.hitsPerSteel * rules.pointsPerSteelHit;
  const limits = rules.courseLimits;
  let suggestedType = null;
  if (minRounds > 0) suggestedType = minRounds <= limits.Short ? "Short" : minRounds <= limits.Medium ? "Medium" : "Long";
  return { paper, steel, noShoots, minRounds, maxPoints, suggestedType, overLimit: minRounds > limits.Long };
}
