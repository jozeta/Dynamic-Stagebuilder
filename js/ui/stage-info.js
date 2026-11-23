// A stage's ⓘ in the Projects panel: a small round button that shows a box of details (targets,
// rounds, points, type, bay, props, and the matches it is in). Shown on hover, on focus and on a tap
// (iPads have no hover); hidden when the pointer leaves, on Escape, or on a tap elsewhere. One box is
// shared by all the buttons. Text only (names come from storage).
import { h } from "./dom.js";

const box = h("div", { class: "stage-info-box", role: "tooltip", id: "stage-info-box", hidden: true });
let owner = null;
function hide() { box.hidden = true; owner?.setAttribute("aria-expanded", "false"); owner = null; }
function show(btn, details) {
  if (!box.isConnected) document.body.append(box);
  owner?.setAttribute("aria-expanded", "false");
  owner = btn;
  btn.setAttribute("aria-expanded", "true");
  // A saved stage: { rows, matches }; a library stage: { meta, rows?, text } (category line, its
  // shots and course length, and the description).
  box.replaceChildren(...(details.rows && details.matches ? [
    h("dl", { class: "stage-info-rows" }, details.rows.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })])),
    h("p", { class: "stage-info-head", text: details.matches.length ? "In matches" : "Not in a match" }),
    details.matches.length ? h("ul", { class: "stage-info-matches" }, details.matches.map((m) => h("li", { text: m }))) : null,
  ] : [
    h("p", { class: "stage-info-meta", text: details.meta }),
    details.rows ? h("dl", { class: "stage-info-rows" }, details.rows.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })])) : null,
    h("p", { class: "stage-info-text", text: details.text }),
  ]).filter(Boolean));
  box.hidden = false;
  // Beside the button, inside the window.
  const r = btn.getBoundingClientRect(), b = box.getBoundingClientRect();
  const left = Math.min(innerWidth - b.width - 8, r.right + 8), top = Math.max(8, Math.min(innerHeight - b.height - 8, r.top - 8));
  box.style.setProperty("left", `${Math.max(8, left)}px`);
  box.style.setProperty("top", `${top}px`);
}
addEventListener("keydown", (e) => { if (e.key === "Escape" && owner) hide(); });
addEventListener("pointerdown", (e) => { if (owner && !owner.contains(e.target) && !box.contains(e.target)) hide(); }, true);

/** The ⓘ button for a stage; `details` is model/match.js stageDetails(…), or { meta, text } for a library stage (a function is called when shown). */
export function stageInfoButton(name, detailsOrFn) {
  const details = { get rows() { return resolved().rows; }, get matches() { return resolved().matches; }, get meta() { return resolved().meta; }, get text() { return resolved().text; } };
  let cached = null;
  const resolved = () => (cached ??= typeof detailsOrFn === "function" ? detailsOrFn() : detailsOrFn);
  const btn = h("button", { type: "button", class: "stage-info", "aria-label": `About ${name}`, "aria-describedby": "stage-info-box", "aria-expanded": "false", text: "i" });
  btn.addEventListener("mouseenter", () => show(btn, details));
  btn.addEventListener("mouseleave", () => { if (owner === btn) hide(); });
  btn.addEventListener("focus", () => show(btn, details));
  btn.addEventListener("blur", () => { if (owner === btn) hide(); });
  btn.addEventListener("click", (e) => { e.stopPropagation(); if (owner === btn && !box.hidden) hide(); else show(btn, details); });
  return btn;
}
