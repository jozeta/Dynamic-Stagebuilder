// The Written Stage Briefing dialog. Free-text fields commit on change; common fields offer a list
// of usual wordings plus "Custom text…" (model/briefing-options.js). Counted values are shown
// read-only because they come from the stage.
import { h } from "./dom.js";
import { stageStats } from "../model/stats.js";
import { targetsText } from "../model/briefing.js";
import { BRIEFING_OPTIONS, choiceFor } from "../model/briefing-options.js";

const TEXT_FIELDS = [
  ["matchName", "Match name"], ["designer", "Designer"], ["scoring", "Scoring"],
  ["startSignal", "Start signal"], ["startPosition", "Start position"], ["gunCondition", "Gun condition"],
  ["stopTime", "Stop time"],
];

export function createBriefing({ editor }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "lg-modal-body briefing-body" });
  const dialog = h("dialog", { class: "lg-modal lg-modal-lg", id: "briefing", "aria-labelledby": "briefing-title" }, [
    h("h2", { class: "lg-modal-title", id: "briefing-title", text: "Written Stage Briefing" }),
    body,
    h("div", { class: "lg-modal-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => dialog.close(), text: "Done" })]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  let n = 0;

  const field = (label, control, wide = false) => {
    control.id = `wsb-${++n}`;
    return h("div", { class: `lg-field${wide ? " wsb-wide" : ""}` }, [h("label", { for: control.id, text: label }), control]);
  };

  function fill() {
    const stage = editor.stage();
    const b = stage.briefing;
    const s = stageStats(stage);
    const set = (key, value) => d({ type: "setBriefing", patch: { [key]: value } });
    const text = (key, label) => {
      const input = h("input", { class: "lg-input", value: b[key], maxlength: "4000", onchange: (e) => set(key, e.target.value) });
      if (!BRIEFING_OPTIONS[key]) return field(label, input);
      // A list of common wordings; "Custom text…" shows the text box for your own.
      const { choice, custom } = choiceFor(key, b[key]);
      input.hidden = !custom;
      input.setAttribute("aria-label", `${label}, custom text`);
      const list = h("select", { class: "lg-select", onchange: (e) => {
        const v = e.target.value;
        input.hidden = v !== "custom";
        if (v === "custom") { input.value = ""; input.focus(); } else set(key, v);
      } }, [
        h("option", { value: "", text: "Not set" }),
        ...BRIEFING_OPTIONS[key].map((o) => h("option", { value: o, text: o })),
        h("option", { value: "custom", text: "Custom text…" }),
      ]);
      list.value = choice;
      const f = field(label, list);
      f.append(input);
      f.classList.add("wsb-choice");
      return f;
    };
    const area = (key, label) => {
      const ta = h("textarea", { class: "lg-input", maxlength: "4000", rows: "5", onchange: (e) => set(key, e.target.value) }, [b[key]]);
      const f = field(label, ta, true);
      if (BRIEFING_OPTIONS[key]) {
        // Add a common sentence to the text (it stays editable).
        const add = h("select", { class: "lg-select wsb-insert", "aria-label": `Add a common ${label.toLowerCase()} sentence`, onchange: (e) => {
          const v = e.target.value;
          e.target.value = "";
          if (!v) return;
          ta.value = ta.value.trim() ? `${ta.value.trim()}\n${v}` : v;
          set(key, ta.value);
        } }, [h("option", { value: "", text: "Add a common sentence…" }), ...BRIEFING_OPTIONS[key].map((o) => h("option", { value: o, text: o }))]);
        f.insertBefore(add, ta);
      }
      return f;
    };
    const type = h("select", { class: "lg-select", onchange: (e) => d({ type: "setBriefing", patch: { stageType: e.target.value } }) }, [
      h("option", { value: "", text: s.suggestedType ? `Suggested: ${s.suggestedType}` : "Suggested (no targets yet)" }),
      ...["Short", "Medium", "Long"].map((t) => h("option", { value: t, text: t }))]);
    type.value = b.stageType;
    const counted = h("dl", { class: "lg-kv wsb-wide" }, [
      h("dt", { text: "Targets" }), h("dd", { text: targetsText(s) }),
      h("dt", { text: "Minimum rounds" }), h("dd", { class: "lg-num", text: String(s.minRounds) }),
      h("dt", { text: "Maximum points" }), h("dd", { class: "lg-num", text: String(s.maxPoints) }),
    ]);
    body.replaceChildren(
      h("p", { class: "lg-muted wsb-wide", text: "Targets, rounds and points are counted from the stage." }),
      counted,
      field("Stage name", h("input", { class: "lg-input", value: stage.name, maxlength: "120", onchange: (e) => d({ type: "rename", name: e.target.value }) })),
      field("Stage number", h("input", { class: "lg-input", type: "number", min: "0", max: "999", step: "1", value: String(b.stageNumber),
        onchange: (e) => d({ type: "setBriefing", patch: { stageNumber: e.target.value } }) })),
      field("Stage type", type),
      ...TEXT_FIELDS.map(([k, label]) => text(k, label)),
      area("procedure", "Procedure"),
      area("notes", "Notes"),
    );
  }

  return { open() { fill(); dialog.showModal(); } };
}
