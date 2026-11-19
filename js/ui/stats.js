// Live stage statistics and warnings, shown under the inspector.
import { h } from "./dom.js";
import { stageStats } from "../model/stats.js";
import { duplicateLabels } from "../model/numbering.js";
import { SCORING } from "../model/scoring-rules.js";
import { stageChecks, SAFETY } from "../model/safety.js";
import { runEstimate } from "../model/estimate.js";

export function createStats(root, { onShow = () => {} } = {}) {
  let checked = null, checks = [];
  return function update(state) {
    const stage = state.history.present;
    // Safety checks: worked out again when the stage changes, not on every frame of a drag.
    if (stage !== checked && !state.drag) { checks = stageChecks(stage); checked = stage; }
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
    const safety = h("section", { class: "safety", "aria-labelledby": "safety-title" }, [
      h("h3", { class: "lg-label", id: "safety-title", text: `Safety checks${checks.length ? ` (${checks.length})` : ""}` }),
      checks.length
        ? h("ul", { class: "safety-list" }, checks.map((c) => h("li", { class: `lg-alert lg-alert-${c.level === "bad" ? "bad" : "warn"} safety-item` }, [
          h("span", { text: c.text }),
          h("button", { type: "button", class: "lg-btn lg-btn-ghost safety-show", onclick: () => onShow(c.ids), text: "Show" }),
        ])))
        : h("p", { class: "lg-muted hint-text", text: "No problems found. Steel 7 m away, targets within 90° of down range, every target can be seen." }),
      h("p", { class: "lg-muted hint-text", text: `From ${SAFETY.edition}, rules ${SAFETY.muzzleRule} and ${SAFETY.distanceRule}. A designer's aid, not a range approval.` }),
    ]);
    const estNote = est ? h("p", { class: "lg-muted hint-text", text: `Estimate: draw, ${est.rounds} shots, ${est.metres} m of movement${est.reloads ? `, ${est.reloads} reload${est.reloads === 1 ? "" : "s"}` : ""}. A rule of thumb, not a rule.` }) : null;
    root.replaceChildren(...[h("h2", { class: "lg-subtitle panel-title", text: "Stage statistics" }), dl, estNote,
      ...warnings.map((w) => h("p", { class: "lg-alert lg-alert-warn stats-warn", role: "status", text: w })), safety].filter(Boolean));
  };
}
