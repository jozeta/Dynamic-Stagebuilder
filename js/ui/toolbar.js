// The top toolbar: edit actions, drawing tools, surroundings, camera presets and About.
import { h, icon } from "./dom.js";
import { canUndo, canRedo } from "../model/history.js";
import { PRESETS, PRESET_LABELS } from "../render/camera.js";

export function createToolbar(root, { editor, rig, status, onAbout, onBriefing, onPrint, onProjects, onSettings }) {
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
  const gridB = btn("grid", "Grid", () => editor.dispatch({ type: "toggleGrid" }), { "aria-pressed": "true", title: "Snap to the grid" });
  const magB = btn("magnet", "Objects", () => editor.dispatch({ type: "setSetting", key: "objectSnap", value: editor.stage().settings.objectSnap === false }),
    { "aria-pressed": "true", title: "Snap wall ends to other walls" });
  const wsbB = btn("doc", "Briefing", onBriefing);
  const printB = btn("print", "Print", onPrint);

  const cams = h("div", { class: "camera-bar lg-glass", role: "group", "aria-label": "Camera" }, [
    ...PRESETS.map((p, i) => h("button", { type: "button", class: "lg-btn lg-btn-ghost tool tool-text", title: `${PRESET_LABELS[p]} (${i + 1})`,
      onclick: () => rig.preset(p, editor.stage()), text: PRESET_LABELS[p] })),
    h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", title: "Frame all (F)", onclick: () => rig.frameAll(editor.stage()) }, [icon("frame"), "Frame all"]),
  ]);
  document.getElementById("camera-slot").append(cams);

  root.append(
    h("div", { class: "brand" }, [h("span", { class: "brand-name", text: "Dynamic-Stagebuilder" })]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Edit" }, [btn("folder", "Projects", onProjects), undoB, redoB, dupB, delB]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Draw" }, [lineB, areaB, startB, numB]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Snapping" }, [gridB, magB]),
    h("div", { class: "toolgroup", role: "group", "aria-label": "Brief" }, [wsbB, printB]),
    h("div", { class: "toolgroup end" }, [status, btn("sliders", "Settings", onSettings), btn("info", "About", onAbout)]),
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
    const st = state.history.present.settings;
    gridB.setAttribute("aria-pressed", String(st.grid > 0));
    magB.setAttribute("aria-pressed", String(st.objectSnap !== false));
  };
}
