// Collapsible side panels: a button in each side panel folds it to a narrow rail (and back), so the
// 3D view gets the room. The choice is remembered per browser (a convenience; it may be unavailable).
import { h, icon } from "./dom.js";

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
