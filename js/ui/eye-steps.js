// Shooter's eye through the stage: ‹ and › step from the start position to shooting position 1, 2,
// 3… (and back), seen from each one's eye height, facing and look angle. "Save view" stores where
// you're looking now as that position's facing and look angle. Keys: [ and ].
import { h, icon } from "./dom.js";
import { shootingPositions } from "../model/positions.js";

export function createEyeSteps({ editor, rig, bar, onViewing = () => {} }) {
  let index = -1;                                    // −1 = the start position, else a shooting position
  const label = h("span", { class: "eye-step-label", "aria-live": "polite", text: "Start" });
  const prev = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Previous shooting position ([)", title: "Previous position ([)", onclick: () => step(-1) }, [icon("chevl")]);
  const next = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Next shooting position (])", title: "Next position (])", onclick: () => step(1) }, [icon("chevr")]);
  const save = h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", title: "Store where you're looking as this position's facing and look angle",
    onclick: () => saveView() }, [icon("check"), "Save view"]);
  const box = h("div", { class: "eye-steps", role: "group", "aria-label": "Shooting positions", hidden: true }, [prev, label, next, save]);
  bar.append(box);

  const list = () => shootingPositions(editor.stage());
  function show() {
    const ps = list();
    if (index >= ps.length) index = ps.length - 1;
    if (index < 0) { onViewing(null); rig.preset("shooter", editor.stage()); label.textContent = "Start"; }
    else {
      const o = ps[index];
      onViewing(o.id);
      rig.viewFrom(o);
      const stance = o.params.stance[0].toUpperCase() + o.params.stance.slice(1);
      label.textContent = `Position ${o.label} of ${ps.length} · ${stance}`;
    }
    save.hidden = index < 0;
  }
  function step(d) {
    const n = list().length;
    if (!n) return;
    index = ((index + 1 + d + n + 1) % (n + 1)) - 1;     // cycle start → 1 … n → start
    show();
  }
  function saveView() {
    const o = list()[index];
    if (!o) return;
    const a = rig.currentAngles();
    editor.dispatch({ type: "setView", id: o.id, rotation: a.rotation, pitch: a.pitch });
  }
  return {
    step,
    /** The Shooter's eye button: back to the start, and show the stepper if there are positions. */
    reset() { index = -1; box.hidden = !list().length; show(); },
    update() { if (!list().length) box.hidden = true; },
    hide() { box.hidden = true; onViewing(null); },
  };
}
