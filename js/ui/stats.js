// Live stage statistics and warnings, shown under the inspector.
import { h } from "./dom.js";
import { stageStats } from "../model/stats.js";
import { duplicateLabels } from "../model/numbering.js";
import { SCORING } from "../model/scoring-rules.js";
import { runEstimate } from "../model/estimate.js";

export function createStats(root) {
  return function update(state) {
    const stage = state.history.present;
    const s = stageStats(stage);
    const dups = duplicateLabels(stage);
    const typeText = s.suggestedType ? `${s.suggestedType}${SCORING.typeByRoundsOnly ? "" : " (suggested from round count)"}` : "–";
    const rows = [["Paper targets", s.paper], ["Steel targets", s.steel], ["No-shoots", s.noShoots],
      ["Minimum rounds", s.minRounds], ["Maximum points", s.maxPoints], ["Stage type", typeText]];
    // A rough time for a fast and a steady run, and the hit factors they give with all A hits.
    const est = runEstimate(stage);
    if (est) rows.push(["Run time (estimate)", `${est.fast}–${est.steady} s`], ["Hit factor, all A", `${est.hitFactor[0]}–${est.hitFactor[1]}`]);
    const dl = h("dl", { class: "lg-kv" });
    for (const [k, v] of rows) dl.append(h("dt", { text: k }), h("dd", { class: "lg-num", text: String(v) }));
    const warnings = [];
    if (s.overLimit) warnings.push(`More than ${SCORING.courseLimits.Long} rounds: over the Long course limit.`);
    if (dups.length) warnings.push(`Duplicate target labels: ${dups.join(", ")}. Use Renumber or change a label.`);
    const estNote = est ? h("p", { class: "lg-muted hint-text", text: `Estimate: draw, ${est.rounds} shots, ${est.metres} m of movement${est.reloads ? `, ${est.reloads} reload${est.reloads === 1 ? "" : "s"}` : ""}. A rule of thumb, not a rule.` }) : null;
    root.replaceChildren(...[h("h2", { class: "lg-subtitle panel-title", text: "Stage statistics" }), dl, estNote,
      ...warnings.map((w) => h("p", { class: "lg-alert lg-alert-warn stats-warn", role: "status", text: w }))].filter(Boolean));
  };
}
