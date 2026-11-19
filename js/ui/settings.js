// The settings panel: surroundings, the default IPSC target style, time of day, light, shadows,
// haze and exposure. It opens in the right-hand panel in place of the inspector (toolbar
// *Settings* toggles it, *Done* or Escape closes it), so the 3D view stays visible and live.
// Sliders apply while dragging; settings are saved with the stage but aren't undo steps.
import { h } from "./dom.js";
import { ENVIRONMENT_NAMES, ENVIRONMENT_LABELS } from "../render/environments/index.js";

const SLIDERS = [
  ["hour", "Time of day", 6, 20, 0.25, (v) => `${String(Math.floor(v)).padStart(2, "0")}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`],
  ["sun", "Sunlight", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["ambient", "Ambient light", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["softness", "Shadow softness", 0, 8, 0.5, (v) => (v ? `${v}` : "Sharp")],
  ["shadowStrength", "Shadow strength", 0, 1, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["haze", "Haze", 0, 1, 0.05, (v) => (v ? `${Math.round(v * 100)} %` : "Clear")],
  ["exposure", "Exposure", 0.5, 1.6, 0.05, (v) => v.toFixed(2)],
];

export function createSettings({ editor, panel, hide = [], onToggle = () => {} }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "settings-body" });
  panel.append(
    h("div", { class: "settings-head" }, [
      h("h2", { class: "lg-subtitle panel-title", id: "settings-title", text: "Settings" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => close(), text: "Done" }),
    ]),
    body,
    h("div", { class: "lg-row settings-actions" }, [
      h("button", { type: "button", class: "lg-btn", onclick: () => { d({ type: "setLook", reset: true }); fill(); }, text: "Reset light to defaults" }),
    ]),
  );
  panel.setAttribute("aria-labelledby", "settings-title");
  panel.hidden = true;
  let isOpen = false;
  function show(open) {
    isOpen = open;
    panel.hidden = !open;
    for (const el of hide) el.hidden = open;
    onToggle(open);
  }
  function close() { show(false); }
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });

  function fill() {
    const st = editor.stage().settings;
    const look = st.look;
    const env = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Surroundings" });
    for (const name of ENVIRONMENT_NAMES) {
      const id = `set-env-${name}`;
      const input = h("input", { type: "radio", name: "set-env", id, value: name, onchange: () => { d({ type: "setEnvironment", name }); fill(); } });
      input.checked = st.environment === name;
      env.append(input, h("label", { for: id, text: ENVIRONMENT_LABELS[name] }));
    }
    const rows = SLIDERS.map(([key, label, min, max, step, show]) => {
      const id = `set-${key}`;
      const off = key === "haze" && st.environment === "technical";   // the indoor-style bay has no haze
      const out = h("output", { for: id, class: "lg-mono settings-value", text: show(look[key]) });
      const input = h("input", { type: "range", class: "lg-slider", id, min, max, step, value: String(look[key]), disabled: off,
        title: off ? "Haze applies to the Outdoor surroundings" : null,
        oninput: (e) => { const v = Number(e.target.value); out.textContent = show(v); d({ type: "setLook", patch: { [key]: v } }); } });
      return h("div", { class: "settings-row" }, [h("label", { for: id, text: label }), input, out]);
    });
    const shadows = h("input", { type: "checkbox", class: "lg-toggle", id: "set-shadows", onchange: (e) => d({ type: "setLook", patch: { shadows: e.target.checked } }) });
    shadows.checked = look.shadows;
    // Default style for new IPSC paper targets (each target can still be switched in its properties).
    const ts = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Default target style" });
    for (const [value, label] of [["classic", "Classic (octagon)"], ["head", "With head"]]) {
      const id = `set-ts-${value}`;
      const input = h("input", { type: "radio", name: "set-ts", id, value, onchange: () => d({ type: "setSetting", key: "targetStyle", value }) });
      input.checked = (st.targetStyle || "classic") === value;
      ts.append(input, h("label", { for: id, text: label }));
    }
    body.replaceChildren(
      h("div", { class: "settings-row" }, [h("span", { class: "settings-label", text: "Surroundings" }), env]),
      h("div", { class: "settings-row" }, [h("span", { class: "settings-label", text: "Default target style" }), ts]),
      ...rows.slice(0, 3),
      h("div", { class: "settings-row" }, [h("label", { for: "set-shadows", text: "Shadows" }), shadows]),
      ...rows.slice(3),
      h("p", { class: "lg-muted", text: "Saved with this stage and used for the printed 3D view. Changing these is not an undo step." }),
    );
  }

  return {
    open() { if (isOpen) return close(); fill(); show(true); panel.querySelector("input, button")?.focus(); },
    close,
    get isOpen() { return isOpen; },
  };
}
