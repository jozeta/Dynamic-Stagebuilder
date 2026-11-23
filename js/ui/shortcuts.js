// Keyboard shortcuts (ignored while typing in a field).
import { isTyping } from "./dom.js";
import { PRESETS } from "../render/camera.js";

// Are all the selected props locked (or hidden)? Then L (or H) undoes it, else it sets it.
const allFlag = (editor, key) => {
  const sel = editor.stage().objects.filter((o) => editor.state.selection.includes(o.id));
  return sel.length > 0 && sel.every((o) => o[key] === true);
};

export function attachShortcuts({ editor, rig, onEscape }) {
  document.addEventListener("keydown", (e) => {
    if (isTyping(e.target) || e.defaultPrevented || document.querySelector("dialog[open]")) return;
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    const d = (a) => { e.preventDefault(); editor.dispatch(a); };
    const step = editor.stage().settings.angleSnap || 15;
    if (mod && k === "z") return d({ type: e.shiftKey ? "redo" : "undo" });
    if (mod && k === "y") return d({ type: "redo" });
    if (mod && k === "d") return d({ type: "duplicate" });
    if (mod && k === "c") return d({ type: "copy" });
    if (mod && k === "x") return d({ type: "cut" });
    if (mod && k === "v") return d({ type: "paste" });
    if (mod && k === "a") return d({ type: "selectAll" });
    if (mod && k === "g") return d({ type: e.shiftKey ? "ungroup" : "group" });
    if (mod || e.altKey) return;
    if (k === "delete" || k === "backspace") return d({ type: "delete" });
    if (k === "escape") {
      e.preventDefault();
      if (editor.state.mode !== "select") editor.dispatch({ type: "cancel" });
      else if (editor.state.selection.length) editor.dispatch({ type: "select", ids: [] });
      onEscape?.();
      return;
    }
    if (k === "enter" && editor.state.mode?.draw) return d({ type: "finishDraw" });
    if (k === "enter" && editor.state.mode?.place) return d({ type: "cancel" });       // stop placing shooting positions
    if (k === "l" && editor.state.selection.length) return d({ type: "setLocked", locked: !allFlag(editor, "locked") });
    if (k === "h" && editor.state.selection.length) return d({ type: "setHidden", hidden: !allFlag(editor, "hidden") });
    if (k === "q") return d({ type: "rotate", by: -step });
    if (k === "e") return d({ type: "rotate", by: step });
    if (k === "f") { e.preventDefault(); rig.frameAll(editor.stage()); return; }
    if (k === "m") return d({ type: editor.state.mode?.measure ? "cancel" : "beginMeasure" });
    if (k === "[" || k === "]") { e.preventDefault(); document.getElementById("toolbar")?.eyeSteps?.step(k === "]" ? 1 : -1); return; }
    const n = Number(k);
    if (n >= 1 && n <= PRESETS.length) {
      e.preventDefault();
      const steps = document.getElementById("toolbar")?.eyeSteps;
      if (PRESETS[n - 1] === "shooter" && steps) steps.reset(); else { steps?.hide(); rig.preset(PRESETS[n - 1], editor.stage()); }
    }
  });
}
