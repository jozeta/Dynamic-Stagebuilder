// Collapsible side panels: a button in each side panel folds it to a narrow rail (and back), so the
// 3D view gets the room. The choice is remembered per browser (a convenience; it may be unavailable).
import { h, icon } from "./dom.js";
import { clampPanel, DEFAULT_SIZES } from "../model/layout.js";

const KEY = "dsb:panels-collapsed";
function load() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); } }
function save(set) { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* private mode */ } }

/** Adds the fold button to a side panel; `name` is "library" or "inspector". */
export function makeCollapsible(aside, { app, name, label }) {
  const collapsed = load();
  const button = h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon panel-toggle", "aria-controls": aside.id });
  function set(folded) {
    app.classList.toggle(`${name}-collapsed`, folded);
    aside.classList.toggle("panel-collapsed", folded);
    button.setAttribute("aria-expanded", String(!folded));
    button.setAttribute("aria-label", `${folded ? "Show" : "Hide"} the ${label} panel`);
    button.title = `${folded ? "Show" : "Hide"} the ${label} panel`;
    button.replaceChildren(icon(folded === (name === "library") ? "chevr" : "chevl"));
    if (folded) collapsed.add(name); else collapsed.delete(name);
    save(collapsed);
  }
  button.addEventListener("click", () => set(!aside.classList.contains("panel-collapsed")));
  aside.prepend(button);
  set(collapsed.has(name));
  return { set, get collapsed() { return aside.classList.contains("panel-collapsed"); } };
}

// Resizing: a handle on the panel's inner edge (the top edge when the inspector sits under the
// view). Drag it, or use the arrow keys on it; a double-click goes back to the default size. The
// size is a CSS variable on the app (set through the CSSOM, which the CSP allows) and is
// remembered per browser.
const SIZE_KEY = "dsb:panel-sizes";
function loadSizes() { try { return JSON.parse(localStorage.getItem(SIZE_KEY) || "{}") || {}; } catch { return {}; } }
function saveSizes(s) { try { localStorage.setItem(SIZE_KEY, JSON.stringify(s)); } catch { /* private mode */ } }

let sizes = null;                    // shared by both panels, so one never overwrites the other's size
export function makeResizable(aside, { app, name, label }) {
  sizes ??= loadSizes();
  const stacked = () => name === "inspector" && matchMedia("(max-width: 1099px)").matches;   // inspector under the view
  const key = () => (stacked() ? "inspectorHeight" : name);
  const cssVar = (k) => (k === "inspectorHeight" ? "--inspector-h" : `--${k}-w`);
  const handle = h("div", { class: `panel-resize panel-resize-${name}`, role: "separator", tabindex: "0", "aria-label": `Resize the ${label} panel`,
    "aria-orientation": "vertical", title: "Drag to resize · double-click to reset" });
  function apply(k, px, persist = true) {
    const room = k === "inspectorHeight" ? window.innerHeight : window.innerWidth;
    const other = k === "library" ? sizes.inspector : k === "inspector" ? sizes.library : null;
    const v = clampPanel(k, px, room, other);
    app.style.setProperty(cssVar(k), `${v}px`);
    handle.setAttribute("aria-valuenow", String(v));
    handle.setAttribute("aria-orientation", k === "inspectorHeight" ? "horizontal" : "vertical");
    if (persist) { sizes[k] = v; saveSizes(sizes); }
    return v;
  }
  // The size now: the chosen one, else what the panel measures on screen.
  const current = () => {
    const k = key();
    if (sizes[k]) return sizes[k];
    const r = aside.getBoundingClientRect();
    return Math.round(k === "inspectorHeight" ? r.height : r.width) || DEFAULT_SIZES[k];
  };
  function refresh() {
    for (const k of name === "inspector" ? ["inspector", "inspectorHeight"] : ["library"]) {
      if (sizes[k]) apply(k, sizes[k], false); else app.style.removeProperty(cssVar(k));
    }
    handle.setAttribute("aria-orientation", key() === "inspectorHeight" ? "horizontal" : "vertical");
  }
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const k = key(), start = k === "inspectorHeight" ? e.clientY : e.clientX, from = current();
    const sign = name === "library" ? 1 : -1;                  // the inspector grows as you drag left (or up)
    const move = (ev) => apply(k, from + sign * ((k === "inspectorHeight" ? ev.clientY : ev.clientX) - start));
    const up = () => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); handle.classList.remove("is-dragging"); };
    handle.classList.add("is-dragging");
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  });
  handle.addEventListener("keydown", (e) => {
    const k = key(), grow = name === "library" ? "ArrowRight" : k === "inspectorHeight" ? "ArrowUp" : "ArrowLeft";
    const shrink = name === "library" ? "ArrowLeft" : k === "inspectorHeight" ? "ArrowDown" : "ArrowRight";
    if (e.key !== grow && e.key !== shrink) return;
    e.preventDefault();
    apply(k, current() + (e.key === grow ? 16 : -16));
  });
  handle.addEventListener("dblclick", () => { const k = key(); delete sizes[k]; saveSizes(sizes); app.style.removeProperty(cssVar(k)); });
  app.append(handle);            // a grid item over the panel edge, so the panel's scrolling never moves or clips it
  window.addEventListener("resize", refresh);
  refresh();
}
