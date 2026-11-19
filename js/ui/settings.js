// The environment settings dialog: surroundings, time of day, light, shadows, haze and exposure.
// Sliders apply live while dragging; settings are saved with the stage but aren't undo steps.
import { h } from "./dom.js";
import { ENVIRONMENT_NAMES, ENVIRONMENT_LABELS } from "../render/environments/index.js";

const SLIDERS = [
  ["hour", "Time of day", 6, 20, 0.25, (v) => `${String(Math.floor(v)).padStart(2, "0")}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`],
  ["sun", "Sunlight", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["ambient", "Ambient light", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["softness", "Shadow softness", 0, 8, 0.5, (v) => (v ? `${v}` : "Sharp")],
  ["haze", "Haze", 0, 1, 0.05, (v) => (v ? `${Math.round(v * 100)} %` : "Clear")],
  ["exposure", "Exposure", 0.5, 1.6, 0.05, (v) => v.toFixed(2)],
];

export function createSettings({ editor }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "lg-modal-body settings-body" });
  const dialog = h("dialog", { class: "lg-modal", id: "settings", "aria-labelledby": "settings-title" }, [
    h("h2", { class: "lg-modal-title", id: "settings-title", text: "Environment settings" }),
    body,
    h("div", { class: "lg-modal-actions" }, [
      h("button", { type: "button", class: "lg-btn", onclick: () => { d({ type: "setLook", reset: true }); fill(); }, text: "Reset to defaults" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => dialog.close(), text: "Done" }),
    ]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);

  function fill() {
    const st = editor.stage().settings;
    const look = st.look;
    const env = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Surroundings" });
    for (const name of ENVIRONMENT_NAMES) {
      const id = `set-env-${name}`;
      const input = h("input", { type: "radio", name: "set-env", id, value: name, onchange: () => d({ type: "setEnvironment", name }) });
      input.checked = st.environment === name;
      env.append(input, h("label", { for: id, text: ENVIRONMENT_LABELS[name] }));
    }
    const rows = SLIDERS.map(([key, label, min, max, step, show]) => {
      const id = `set-${key}`;
      const out = h("output", { for: id, class: "lg-mono settings-value", text: show(look[key]) });
      const input = h("input", { type: "range", class: "lg-slider", id, min, max, step, value: String(look[key]),
        oninput: (e) => { const v = Number(e.target.value); out.textContent = show(v); d({ type: "setLook", patch: { [key]: v } }); } });
      return h("div", { class: "settings-row" }, [h("label", { for: id, text: label }), input, out]);
    });
    const shadows = h("input", { type: "checkbox", class: "lg-toggle", id: "set-shadows", onchange: (e) => d({ type: "setLook", patch: { shadows: e.target.checked } }) });
    shadows.checked = look.shadows;
    body.replaceChildren(
      h("div", { class: "settings-row" }, [h("span", { class: "settings-label", text: "Surroundings" }), env]),
      ...rows.slice(0, 3),
      h("div", { class: "settings-row" }, [h("label", { for: "set-shadows", text: "Shadows" }), shadows]),
      ...rows.slice(3),
      h("p", { class: "lg-muted", text: "Saved with this stage and used for the printed 3D view. Changing these is not an undo step." }),
    );
  }

  return { open() { fill(); dialog.showModal(); } };
}
