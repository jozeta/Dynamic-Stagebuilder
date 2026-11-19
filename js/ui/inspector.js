// The inspector: settings for the selected object(s), or the stage when nothing is selected.
// Fields commit on change (Enter or leaving the field); every change goes through the editor.
import { h, icon } from "./dom.js";
import { getProp } from "../model/props.js";
import { labelPrefix } from "../model/numbering.js";

const PARAM_LABELS = {
  mountHeight: "Mount height (m)", baseHeight: "Base height (m)", size: "Size (m)", length: "Length (m)",
  height: "Height (m)", mesh: "Mesh colour", frame: "Frame", portWidth: "Port width (m)",
  portHeight: "Port height (m)", portBottom: "Port bottom (m)", count: "Count", paint: "Paint", color: "Colour", width: "Width (m)", rows: "Rows",
  doorWidth: "Door width (m)", doorHeight: "Door height (m)",
};
const OPTION_LABELS = { black: "Black", blue: "Blue", wood: "Wood", white: "White", yellow: "Yellow", red: "Red",
  green: "Green", grey: "Grey", rust: "Rusty" };
const GRID_OPTIONS = [[0, "Off"], [0.1, "0.1 m"], [0.25, "0.25 m"], [0.5, "0.5 m"], [1, "1 m"]];
const ANGLE_OPTIONS = [[0, "Off"], [5, "5°"], [15, "15°"], [45, "45°"], [90, "90°"]];
let uid = 0;

function field(label, control) {
  const id = `f${++uid}`;
  control.id = id;
  return h("div", { class: "lg-field" }, [h("label", { for: id, text: label }), control]);
}
const numberInput = (key, value, spec, onchange) =>
  h("input", { class: "lg-input", type: "number", inputmode: "decimal", value: String(value), min: spec.min, max: spec.max, step: spec.step,
    dataset: { field: key }, onchange: (e) => { if (e.target.value !== "") onchange(Number(e.target.value)); } });
const select = (key, value, options, onchange) => {
  const s = h("select", { class: "lg-select", dataset: { field: key }, onchange: (e) => onchange(e.target.value) },
    options.map(([v, label]) => h("option", { value: String(v), text: label })));
  s.value = String(value);
  return s;
};

export function createInspector(root, { editor }) {
  const d = (action) => editor.dispatch(action);
  let lastKey = "";

  function objectPanel(o, angle) {
    const def = getProp(o.type);
    const nodes = [h("h2", { class: "lg-subtitle panel-title", text: def.name })];
    if (labelPrefix(o.type)) {
      nodes.push(field("Label", h("input", { class: "lg-input", value: o.label ?? "", maxlength: "12", dataset: { field: "label" },
        placeholder: "Automatic", onchange: (e) => d({ type: "setLabel", id: o.id, text: e.target.value }) })));
    }
    const step = angle || 15;
    nodes.push(field("Rotation (°)", h("div", { class: "lg-row rot-row" }, [
      h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": `Rotate −${step}°`, onclick: () => d({ type: "rotate", by: -step }) }, [icon("rotl")]),
      numberInput("rotation", o.rotation, { min: 0, max: 359, step: angle || 1 }, (v) => d({ type: "setRotation", id: o.id, value: v })),
      h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": `Rotate +${step}°`, onclick: () => d({ type: "rotate", by: step }) }, [icon("rotr")]),
    ])));
    for (const [k, spec] of Object.entries(def.params)) {
      const set = (v) => d({ type: "setParams", id: o.id, params: { [k]: v } });
      nodes.push(field(PARAM_LABELS[k] || k, spec.options
        ? select(k, o.params[k], spec.options.map((v) => [v, OPTION_LABELS[v] || v]), set)
        : numberInput(k, o.params[k], spec, set)));
    }
    return nodes;
  }

  function stagePanel(stage) {
    return [
      h("h2", { class: "lg-subtitle panel-title", text: "Stage" }),
      h("p", { class: "lg-muted hint-text", text: "Nothing selected. Tap a prop on the stage to edit it." }),
      field("Bay width (m)", numberInput("bayWidth", stage.bay.width, { min: 1, max: 200, step: 0.5 }, (v) => d({ type: "setBay", width: v, depth: stage.bay.depth }))),
      field("Bay depth (m)", numberInput("bayDepth", stage.bay.depth, { min: 1, max: 200, step: 0.5 }, (v) => d({ type: "setBay", width: stage.bay.width, depth: v }))),
      field("Grid snap", select("grid", stage.settings.grid, GRID_OPTIONS, (v) => d({ type: "setSetting", key: "grid", value: Number(v) }))),
      field("Angle snap", select("angle", stage.settings.angleSnap, ANGLE_OPTIONS, (v) => d({ type: "setSetting", key: "angleSnap", value: Number(v) }))),
    ];
  }

  const actions = () => h("div", { class: "lg-row panel-actions" }, [
    h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "duplicate" }) }, [icon("copy"), "Duplicate"]),
    h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: () => d({ type: "delete" }) }, [icon("trash"), "Delete"]),
  ]);

  return function update(state) {
    const stage = state.history.present;
    const sel = state.selection;
    const objs = stage.objects.filter((o) => sel.includes(o.id));
    const lines = stage.lines.filter((l) => sel.includes(l.id));
    const key = JSON.stringify([sel, objs, lines, sel.length ? null : [stage.bay, stage.settings.grid, stage.settings.angleSnap]]);
    if (key === lastKey) return;
    lastKey = key;
    const focused = root.contains(document.activeElement) ? document.activeElement.dataset.field : null;

    let nodes;
    if (!sel.length) nodes = stagePanel(stage);
    else if (objs.length === 1 && sel.length === 1) nodes = [...objectPanel(objs[0], stage.settings.angleSnap), actions()];
    else if (lines.length === 1 && sel.length === 1) {
      const l = lines[0];
      nodes = [h("h2", { class: "lg-subtitle panel-title", text: l.type === "fault-line" ? "Fault line" : "Shooting area" }),
        h("p", { class: "lg-muted", text: `${l.points.length} points. Drag it to move it.` }),
        h("div", { class: "lg-row panel-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: () => d({ type: "delete" }) }, [icon("trash"), "Delete"])])];
    } else {
      const step = stage.settings.angleSnap || 15;
      nodes = [h("h2", { class: "lg-subtitle panel-title", text: `${sel.length} selected` }),
        h("div", { class: "lg-row" }, [
          h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "rotate", by: -step }) }, [icon("rotl"), `−${step}°`]),
          h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "rotate", by: step }) }, [icon("rotr"), `+${step}°`])]),
        actions()];
    }
    root.replaceChildren(...nodes);
    if (focused) root.querySelector(`[data-field="${CSS.escape(focused)}"]`)?.focus();
  };
}
