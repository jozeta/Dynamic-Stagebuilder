// The top toolbar, on the right: Undo, Redo, Print, Settings, Help and About. (Deleting a target
// closes its number's gap by itself, so there is no Renumber.) (Measuring and the
// two kinds of snapping are in the right-click menu.)
// (Duplicate and Delete are in the inspector and the right-click menu; the briefing in the right panel.)
import { h, icon } from "./dom.js";
import { canUndo, canRedo } from "../model/history.js";
import { PRESETS, PRESET_LABELS } from "../render/camera.js";
import { createEyeSteps } from "./eye-steps.js";

export function createToolbar(root, { editor, rig, onViewing = () => {}, walking = () => true, onEyeState = () => {}, onAbout, onHelp, onBriefing, onPrint, onSettings }) {
  // Camera presets live in a bar over the 3D view (#camera-slot); the rest in the toolbar.
  const btn = (name, label, onclick, extra = {}) =>
    h("button", { type: "button", class: "lg-btn lg-btn-ghost tool", "aria-label": label, onclick, ...extra }, [icon(name), h("span", { text: label.split(" (")[0] })]);

  const undoB = btn("undo", "Undo", () => editor.dispatch({ type: "undo" }));
  const redoB = btn("redo", "Redo", () => editor.dispatch({ type: "redo" }));
  // The briefing opens from the left panel's stage view, under the stage's statistics.
  const wsbB = h("button", { type: "button", class: "lg-btn brief-btn", onclick: onBriefing }, [icon("doc"), "Written stage briefing…"]);
  const briefSlot = document.getElementById("brief-slot");
  briefSlot?.append(wsbB);
  const printB = btn("print", "Print", onPrint);

  const cams = h("div", { class: "camera-bar lg-glass", role: "group", "aria-label": "Camera" }, [
    ...PRESETS.map((p, i) => h("button", { type: "button", class: "lg-btn lg-btn-ghost tool tool-text", title: `${PRESET_LABELS[p]} (${i + 1})`,
      onclick: () => (p === "shooter" ? eyeSteps.reset() : (eyeSteps.hide(), rig.preset(p, editor.stage()))), text: PRESET_LABELS[p] })),
    h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", title: "Frame all (F)", onclick: () => rig.frameAll(editor.stage()) }, [icon("frame"), "Frame all"]),
  ]);
  document.getElementById("camera-slot").append(cams);
  const eyeSteps = createEyeSteps({ editor, rig, bar: cams, onViewing, walking, onState: onEyeState });
  root.eyeSteps = eyeSteps;

  root.append(
    h("div", { class: "brand" }, [h("span", { class: "brand-name", text: "Dynamic-Stagebuilder" })]),
    h("div", { class: "toolgroup end" }, [undoB, redoB, printB, btn("sliders", "Settings", onSettings, { "aria-pressed": "false" }), btn("help", "Help", onHelp), btn("info", "About", onAbout)]),
  );

  return function update(state) {
    eyeSteps.update();
    undoB.disabled = !canUndo(state.history);
    redoB.disabled = !canRedo(state.history);
  };
}
