// The top toolbar: edit actions, drawing tools, surroundings, camera presets and About.
import { h, icon } from "./dom.js";
import { canUndo, canRedo } from "../model/history.js";
import { ENVIRONMENT_NAMES, ENVIRONMENT_LABELS } from "../render/environments/index.js";
import { PRESETS, PRESET_LABELS } from "../render/camera.js";

export function createToolbar(root, { editor, rig, onAbout, onNew }) {
  // Camera presets live in a bar over the 3D view (#camera-slot); the rest in the toolbar.
  const btn = (name, label, onclick, extra = {}) =>
    h("button", { type: "button", class: "lg-btn lg-btn-ghost tool", "aria-label": label, onclick, ...extra }, [icon(name), h("span", { text: label.split(" (")[0] })]);

  const undoB = btn("undo", "Undo", () => editor.dispatch({ type: "undo" }));
  const redoB = btn("redo", "Redo", () => editor.dispatch({ type: "redo" }));
  const dupB = btn("copy", "Duplicate", () => editor.dispatch({ type: "duplicate" }));
  const delB = btn("trash", "Delete", () => editor.dispatch({ type: "delete" }));
  const lineB = btn("line", "Fault line", () => editor.dispatch({ type: "beginDraw", lineType: "fault-line" }), { "aria-pressed": "false" });
  const areaB = btn("area", "Shooting area", () => editor.dispatch({ type: "beginDraw", lineType: "shooting-area" }), { "aria-pressed": "false" });
  const startB = btn("flag", "Start position", () => editor.dispatch({ type: "beginStart" }), { "aria-pressed": "false" });
  const numB = btn("hash", "Renumber", () => editor.dispatch({ type: "renumber" }));

  const env = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Surroundings" });
  for (const name of ENVIRONMENT_NAMES) {
    const id = `env-${name}`;
    env.append(h("input", { type: "radio", name: "env", id, value: name,
      onchange: () => editor.dispatch({ type: "setEnvironment", name }) }), h("label", { for: id, text: ENVIRONMENT_LABELS[name] }));
  }

  const cams = h("div", { class: "camera-bar lg-glass", role: "group", "aria-label": "Camera" }, [
    ...PRESETS.map((p, i) => h("button", { type: "button", class: "lg-btn lg-btn-ghost tool tool-text", title: `${PRESET_LABELS[p]} (${i + 1})`,
      onclick: () => rig.preset(p, editor.stage()), text: PRESET_LABELS[p] })),
    h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", title: "Frame all (F)", onclick: () => rig.frameAll(editor.stage()) }, [icon("frame"), "Frame all"]),
  ]);
  document.getElementById("camera-slot").append(cams);

  root.append(
    h("div", { class: "brand" }, [h("span", { class: "brand-name", text: "Dynamic-Stagebuilder" })]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Edit" }, [btn("new", "New stage", onNew), undoB, redoB, dupB, delB]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Draw" }, [lineB, areaB, startB, numB]),
    env,
    h("div", { class: "toolgroup end" }, [btn("info", "About", onAbout)]),
  );

  return function update(state) {
    undoB.disabled = !canUndo(state.history);
    redoB.disabled = !canRedo(state.history);
    const anyObj = state.selection.some((id) => state.history.present.objects.some((o) => o.id === id));
    dupB.disabled = !anyObj;
    delB.disabled = state.selection.length === 0;
    lineB.setAttribute("aria-pressed", String(state.mode?.draw === "fault-line"));
    areaB.setAttribute("aria-pressed", String(state.mode?.draw === "shooting-area"));
    startB.setAttribute("aria-pressed", String(state.mode === "start"));
    const current = env.querySelector(`#env-${state.history.present.settings.environment}`);
    if (current) current.checked = true;
  };
}
