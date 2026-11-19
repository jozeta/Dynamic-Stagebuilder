// Shooter's eye through the stage: ‹ and › walk from the start position to shooting position 1, 2,
// 3… (and back) along the route drawn on the ground (bending at its grab points, standing on ramps
// and platforms), at each one's eye height, facing and look angle; Play run walks the whole course,
// pausing at every position. At a position, looking around saves the view to it (an undo step) when
// you let go. Keys: [ and ]. With no positions yet, the bar says how to add them. Standing on a
// position, a pad of arrows in the lower left steps it forward, back, left or right (relative to
// the way it faces), one undo step each.
import { h, icon } from "./dom.js";
import { shootingPositions } from "../model/positions.js";
import { routeLegs } from "../model/route.js";

const PAUSE_MS = 1400;     // time at each position during Play run

export function createEyeSteps({ editor, rig, bar, onViewing = () => {}, walking = () => true }) {
  let index = -1;                                    // −1 = the start position, else a shooting position
  let running = false;
  const label = h("span", { class: "eye-step-label", "aria-live": "polite", text: "Start" });
  const prev = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Previous shooting position ([)", title: "Previous position ([)", onclick: () => step(-1) }, [icon("chevl")]);
  const next = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon tool-text", "aria-label": "Next shooting position (])", title: "Next position (])", onclick: () => step(1) }, [icon("chevr")]);
  const run = h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text", "aria-pressed": "false", title: "Walk the whole run, start to the last position",
    onclick: () => (running ? stopRun() : playRun()) }, [icon("play"), "Play run"]);
  const hint = h("span", { class: "eye-step-hint", text: "Add shooting positions: Stage markings → Shooting position" });
  const saved = h("span", { class: "eye-step-hint", text: "Look around: the view is saved" });
  const box = h("div", { class: "eye-steps", role: "group", "aria-label": "Shooting positions", hidden: true }, [prev, label, next, run, saved, hint]);
  bar.append(box);
  const arrow = (dir, name, label) => h("button", { type: "button", class: `eye-pad-btn eye-pad-${dir}`, "aria-label": `Move the position ${label}`, title: `Move ${label}`,
    onclick: () => nudge(dir) }, [icon(name)]);
  const pad = h("div", { class: "eye-pad", role: "group", "aria-label": "Move the shooting position", hidden: true },
    [arrow("forward", "chevu", "forward"), arrow("left", "chevl", "left"), arrow("right", "chevr", "right"), arrow("back", "chevd", "back")]);
  bar.parentElement.append(pad);
  function nudge(dir) {
    const o = list()[index];
    if (!o || running) return;
    const a = rig.currentAngles();                 // keep looking where you look now
    editor.dispatch({ type: "stepPosition", id: o.id, dir });
    const moved = list().find((p) => p.id === o.id);
    if (moved) rig.jumpTo({ ...rig.positionView(moved, editor.stage()), yaw: a.rotation, pitch: a.pitch });
  }

  const list = () => shootingPositions(editor.stage());
  const viewOf = (i, ps) => (i < 0 ? rig.startView(editor.stage()) : rig.positionView(ps[i], editor.stage()));
  // The route between two neighbouring stops (−1 = the start), in walking order, or null.
  function pathBetween(from, to, ps) {
    const idOf = (i) => (i < 0 ? "start" : ps[i]?.id);
    const legs = routeLegs(editor.stage());
    const fwd = legs.find((l) => l.from === idOf(from) && l.to === idOf(to));
    if (fwd) return fwd.points;
    const back = legs.find((l) => l.from === idOf(to) && l.to === idOf(from));
    return back ? [...back.points].reverse() : null;
  }
  function describe(ps) {
    const has = ps.length > 0;
    for (const el of [prev, next, run]) el.disabled = !has;
    hint.hidden = has;
    label.hidden = !has;
    saved.hidden = index < 0 || !has;
    pad.hidden = box.hidden || index < 0 || !has || running;
    if (index < 0) label.textContent = "Start";
    else {
      const o = ps[index];
      label.textContent = `Position ${o.label} of ${ps.length} · ${o.params.stance[0].toUpperCase()}${o.params.stance.slice(1)}`;
    }
  }
  // Walk to the current index (or jump there when not already in the shooter's eye).
  let at = -1;                                       // where the camera is now
  async function go({ walk = true } = {}) {
    const ps = list();
    if (index >= ps.length) index = ps.length - 1;
    onViewing(index < 0 ? null : ps[index].id);
    describe(ps);
    const from = at;
    at = index;
    // Play / Pause decides: playing walks the route, paused jumps straight to the position.
    if (!walk || !walking()) { rig.jumpTo(viewOf(index, ps)); return true; }
    return rig.walkTo(viewOf(index, ps), { path: pathBetween(from, index, ps), stage: editor.stage() });
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
    pad.hidden = true;
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
    describe(list());
  }
  function saveView() {
    const o = list()[index];
    if (!o) return;
    const a = rig.currentAngles();
    editor.dispatch({ type: "setView", id: o.id, rotation: a.rotation, pitch: a.pitch });
  }
  // Looking around at a position saves the view to it when you let go (not while walking a run).
  rig.controls.addEventListener("end", () => { if (!box.hidden && index >= 0 && !running) saveView(); });

  return {
    step,
    /** The Shooter's eye button: back to the start and show the bar (with a hint if there are no positions). */
    reset() { stopRun(); rig.stopWalk(); index = -1; at = -1; box.hidden = false; go({ walk: false }); },
    update() { if (!box.hidden) describe(list()); },
    hide() { stopRun(); rig.stopWalk(); box.hidden = true; pad.hidden = true; onViewing(null); },
  };
}
