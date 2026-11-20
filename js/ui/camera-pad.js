// The view pad in the top-right corner of the 3D view: semi-transparent arrows to look round (pan
// left/right, tilt up/down), move forward/back along the ground, and raise or lower the camera.
// Press and hold to keep moving; a keyboard press (Enter/Space) moves one step. Speeds grow with the
// camera's height, so an overview moves as briskly as the shooter's eye.
import { h } from "./dom.js";

const SVG = "http://www.w3.org/2000/svg";
const ARROWS = { left: "M15 5l-7 7 7 7", right: "M9 5l7 7-7 7", up: "M5 15l7-7 7 7", down: "M5 9l7 7 7-7" };
function arrow(dir) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "pad-arrow");
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("d", ARROWS[dir]);
  svg.append(p);
  return svg;
}

// [move, sign, label, arrow]. Rates per second: degrees for pan and tilt, metres (× height factor) for rise and dolly.
const RATE = { pan: 60, tilt: 40, rise: 1.5, dolly: 3 };
const STEP = { pan: 5, tilt: 4, rise: 0.25, dolly: 0.5 };

export function createCameraPad(slot, { rig }) {
  const scale = (m) => (m === "rise" || m === "dolly" ? Math.max(1, rig.getView().position[1] / 4) : 1);
  let held = null;
  const tick = (now) => {
    if (!held) return;
    const dt = Math.min(0.1, (now - held.last) / 1000);
    held.last = now;
    rig.move(held.move, held.sign * RATE[held.move] * scale(held.move) * dt);
    held.frame = requestAnimationFrame(tick);
  };
  const stop = () => { if (held) { cancelAnimationFrame(held.frame); held.btn.classList.remove("is-held"); held = null; } };

  const btn = (move, sign, label, dir, cls) => {
    const b = h("button", { type: "button", class: `pad-btn ${cls}`, title: label, "aria-label": label }, [arrow(dir)]);
    b.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      stop();
      b.setPointerCapture?.(e.pointerId);
      b.classList.add("is-held");
      rig.move(move, sign * STEP[move] * scale(move) * 0.4);          // a small first step, then a steady glide
      held = { move, sign, btn: b, last: performance.now() };
      held.frame = requestAnimationFrame(tick);
    });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, stop);
    b.addEventListener("click", (e) => { if (e.detail === 0) rig.move(move, sign * STEP[move] * scale(move)); });   // keyboard
    return b;
  };

  const look = h("div", { class: "pad-cross", role: "group", "aria-label": "Look round" }, [
    btn("tilt", 1, "Tilt up", "up", "pad-n"), btn("pan", 1, "Pan left", "left", "pad-w"),
    h("span", { class: "pad-label", text: "Look" }),
    btn("pan", -1, "Pan right", "right", "pad-e"), btn("tilt", -1, "Tilt down", "down", "pad-s"),
  ]);
  const walk = h("div", { class: "pad-column", role: "group", "aria-label": "Move forward or back" }, [
    btn("dolly", 1, "Move forward", "up", ""), h("span", { class: "pad-label", text: "Move" }), btn("dolly", -1, "Move back", "down", ""),
  ]);
  const lift = h("div", { class: "pad-column", role: "group", "aria-label": "Camera height" }, [
    btn("rise", 1, "Move up", "up", ""), h("span", { class: "pad-label", text: "Height" }), btn("rise", -1, "Move down", "down", ""),
  ]);
  const pad = h("div", { class: "camera-pad", role: "group", "aria-label": "View controls" }, [look, walk, lift]);
  window.addEventListener("blur", stop);
  slot.append(pad);
  return { element: pad, stop };
}
