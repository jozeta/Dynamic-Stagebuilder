// The Written Stage Briefing as rows for the editor and the printed brief. Counted values (targets,
// rounds, points, suggested type) always come from the stage, so they can't drift from it.
import { stageStats } from "./stats.js";

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const dash = (v) => (String(v ?? "").trim() ? String(v).trim() : "–");

export function targetsText(stats) {
  const parts = [];
  if (stats.paper) parts.push(`${stats.paper} paper`);
  if (stats.steel) parts.push(`${stats.steel} steel`);
  if (stats.noShoots) parts.push(plural(stats.noShoots, "no-shoot"));
  return parts.length ? parts.join(", ") : "None";
}

export function stageTypeText(stage, stats = stageStats(stage)) {
  if (stage.briefing.stageType) return stage.briefing.stageType;
  return stats.suggestedType ? `${stats.suggestedType} (suggested)` : "–";
}

export function briefingRows(stage) {
  const b = stage.briefing;
  const s = stageStats(stage);
  const free = (label, value) => ({ label, value: dash(value), counted: false });
  const counted = (label, value) => ({ label, value: String(value), counted: true });
  return [
    free("Match", b.matchName),
    free("Stage", `${b.stageNumber} – ${stage.name}`),
    free("Designer", b.designer),
    { label: "Stage type", value: stageTypeText(stage, s), counted: !b.stageType },
    free("Scoring", b.scoring),
    counted("Targets", targetsText(s)),
    counted("Minimum rounds", s.minRounds),
    counted("Maximum points", s.maxPoints),
    free("Start signal", b.startSignal),
    free("Start position", b.startPosition),
    free("Gun condition", b.gunCondition),
    free("Stop time", b.stopTime),
  ];
}

export function briefingText(stage) {
  return { procedure: stage.briefing.procedure, notes: stage.briefing.notes };
}
