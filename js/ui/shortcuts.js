// Keyboard shortcuts (ignored while typing in a field).
import { isTyping } from "./dom.js";
import { PRESETS } from "../render/camera.js";

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
    if (k === "q") return d({ type: "rotate", by: -step });
    if (k === "e") return d({ type: "rotate", by: step });
    if (k === "f") { e.preventDefault(); rig.frameAll(editor.stage()); return; }
    const n = Number(k);
    if (n >= 1 && n <= PRESETS.length) { e.preventDefault(); rig.preset(PRESETS[n - 1], editor.stage()); }
  });
}
