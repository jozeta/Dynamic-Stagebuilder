// Shooter's eye through the stage: ‹ and › walk from the start position to shooting position 1, 2,
// 3… (and back), at each one's eye height, facing and look angle; Play run walks the whole course,
// pausing at every position. "Save view" stores where you're looking as that position's facing and
// look angle. Keys: [ and ]. With no positions yet, the bar says how to add them.
import { h, icon } from "./dom.js";
import { shootingPositions } from "../model/positions.js";

const PAUSE_MS = 1400;     // time at each position during Play run

export function createEyeSteps({ editor, rig, bar, onViewing = () => {} }) {
  let index = -1;                                    // −1 = the start position, else a shooting position
  let running = false;
  const label = h("span", { class: "eye-step-label", "aria-live": "polite", text: "Start" });
  const prev = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Previous shooting position ([)", title: "Previous position ([)", onclick: () => step(-1) }, [icon("chevl")]);
  const next = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Next shooting position (])", title: "Next position (])", onclick: () => step(1) }, [icon("chevr")]);
  const run = h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", "aria-pressed": "false", title: "Walk the whole run, start to the last position",
    onclick: () => (running ? stopRun() : playRun()) }, [icon("play"), "Play run"]);
  const save = h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", title: "Store where you're looking as this position's facing and look angle",
    onclick: () => saveView() }, [icon("check"), "Save view"]);
  const hint = h("span", { class: "eye-step-hint", text: "Add shooting positions: Stage markings → Shooting position" });
  const box = h("div", { class: "eye-steps", role: "group", "aria-label": "Shooting positions", hidden: true }, [prev, label, next, run, save, hint]);
  bar.append(box);

  const list = () => shootingPositions(editor.stage());
  const viewOf = (i, ps) => (i < 0 ? rig.startView(editor.stage()) : rig.positionView(ps[i]));
  function describe(ps) {
    const has = ps.length > 0;
    for (const el of [prev, next, run]) el.disabled = !has;
    hint.hidden = has;
    label.hidden = !has;
    save.hidden = index < 0 || !has;
    if (index < 0) label.textContent = "Start";
    else {
      const o = ps[index];
      label.textContent = `Position ${o.label} of ${ps.length} · ${o.params.stance[0].toUpperCase()}${o.params.stance.slice(1)}`;
    }
  }
  // Walk to the current index (or jump there when not already in the shooter's eye).
  async function go({ walk = true } = {}) {
    const ps = list();
    if (index >= ps.length) index = ps.length - 1;
    onViewing(index < 0 ? null : ps[index].id);
    describe(ps);
    if (!walk) { if (index < 0) rig.preset("shooter", editor.stage()); else rig.viewFrom(ps[index]); return true; }
    return rig.walkTo(viewOf(index, ps));
  }
  function step(d) {
    stopRun();
    const n = list().length;
    if (!n) return;
    index = ((index + 1 + d + n + 1) % (n + 1)) - 1;     // cycle start → 1 … n → start
    go();
  }
  async function playRun() {
    if (!list().length) return;
    running = true;
    run.setAttribute("aria-pressed", "true");
    run.replaceChildren(icon("pause"), "Stop run");
    index = -1;
    await go({ walk: true });
    while (running && index < list().length - 1) {
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      if (!running) break;
      index++;
      if (!(await go())) break;                       // interrupted (the view was grabbed)
    }
    stopRun();
  }
  function stopRun() {
    if (!running) return;
    running = false;
    run.setAttribute("aria-pressed", "false");
    run.replaceChildren(icon("play"), "Play run");
  }
  function saveView() {
    const o = list()[index];
    if (!o) return;
    const a = rig.currentAngles();
    editor.dispatch({ type: "setView", id: o.id, rotation: a.rotation, pitch: a.pitch });
  }
  return {
    step,
    /** The Shooter's eye button: back to the start and show the bar (with a hint if there are no positions). */
    reset() { stopRun(); rig.stopWalk(); index = -1; box.hidden = false; go({ walk: false }); },
    update() { if (!box.hidden) describe(list()); },
    hide() { stopRun(); rig.stopWalk(); box.hidden = true; onViewing(null); },
  };
}
