// Rule checks (model/rule-checks.js) in the panels: a stage's under its statistics, a match's on the
// match page. Problems first, each with its rule and a Show button for the props or stages it is
// about; the checks that pass fold away under "What is checked".
import { h } from "./dom.js";
import { stageChecks, RULES_EDITION } from "../model/rule-checks.js";

const LEVEL_TEXT = { bad: "Fails", warn: "Check", ok: "Passes" };
const NOT_CHECKED = "Not checked: shoot-throughs, 9 scoring hits per view, the 90° muzzle angle and target arrays. Check those by eye.";

/** The list for some checks; onShow(ids) for a problem's Show button (omitted: no button). */
export function checkList(checks, { title, onShow = null, showLabel = "Show", note = NOT_CHECKED } = {}) {
  const problems = checks.filter((c) => c.level !== "ok");
  const passed = checks.filter((c) => c.level === "ok");
  const item = (c) => h("li", { class: `rule-check rule-${c.level}` }, [
    h("span", { class: `lg-badge lg-badge-${c.level} rule-badge`, text: LEVEL_TEXT[c.level] }),
    h("span", { class: "rule-text" }, [h("span", { text: c.text }), " ", h("span", { class: "lg-muted rule-num", text: `Rule ${c.rule}` })]),
    onShow && c.ids.length && c.level !== "ok" ? h("button", { type: "button", class: "lg-btn lg-btn-ghost rule-show", text: showLabel, onclick: () => onShow(c.ids) }) : null,
  ]);
  return h("div", { class: "rule-checks" }, [
    h("h2", { class: "lg-subtitle panel-title", text: title }),
    problems.length
      ? h("ul", { class: "rule-list", "aria-label": `${title}: problems` }, problems.map(item))
      : h("p", { class: "lg-alert lg-alert-ok", role: "status", text: `All ${checks.length} checks pass.` }),
    passed.length ? h("details", { class: "rule-passed" }, [
      h("summary", { text: problems.length ? `Passes (${passed.length})` : "What is checked" }),
      h("ul", { class: "rule-list" }, passed.map(item)),
    ]) : null,
    h("p", { class: "lg-muted hint-text", text: `${RULES_EDITION}. ${note}` }),
  ]);
}

/** The open stage's checks, kept up to date (an updater for main.js). */
export function createRuleChecks(root, { onShow }) {
  let last = "";
  return function update(state) {
    const checks = stageChecks(state.history.present);
    const key = JSON.stringify(checks);
    if (key === last) return;                 // unchanged: keep the panel (and an open fold) as it is
    last = key;
    const open = root.querySelector("details")?.open;
    root.replaceChildren(checkList(checks, { title: "Rule checks", onShow }));
    if (open) root.querySelector("details")?.setAttribute("open", "");
  };
}
