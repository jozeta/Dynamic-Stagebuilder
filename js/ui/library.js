// The prop library: search plus Paper, Steel, Walls and Obstacles. Tap an item to arm it, then tap
// the ground; with a mouse, items can also be dragged onto the 3D view.
import { h } from "./dom.js";
import { PROPS, defaultParams, TARGET_SIZES, BARREL, TYRE, CAR, PALLET } from "../model/props.js";
import { icon } from "./dom.js";

const CATEGORIES = [["paper", "Paper"], ["steel", "Steel"], ["wall", "Walls"], ["structure", "Structures"], ["obstacle", "Obstacles and range furniture"]];
const cm = (m) => `${Math.round(m * 100)}`;

// The size people know each prop by: the target face, the plate, the wall panel.
function sizeText(type) {
  const p = defaultParams(type);
  const face = (s) => `${cm(s.w)} × ${cm(s.h)} cm`;
  switch (type) {
    case "paper-ipsc": case "noshoot": return face(TARGET_SIZES.ipsc);
    case "paper-mini": case "noshoot-mini": return face(TARGET_SIZES.mini);
    case "popper": return `${cm(TARGET_SIZES.popper.h)} cm tall`;
    case "mini-popper": return `${cm(TARGET_SIZES.miniPopper.h)} cm tall`;
    case "plate-round": return `Ø ${cm(p.size)} cm`;
    case "plate-square": return `${cm(p.size)} × ${cm(p.size)} cm`;
    case "barrel": return `Ø ${cm(BARREL.diameter)} × ${cm(BARREL.height)} cm`;
    case "tyre": return `Ø ${cm(TYRE.diameter)} cm`;
    case "tyre-stack": return `${p.count} tyres`;
    case "crate": return `${cm(p.size)} cm cube`;
    case "plant-palm": return "Decoration";
    case "ramp": case "platform": return `${p.length} × ${p.width} m, ${cm(p.height)} cm high`;
    case "car": return `${CAR.length} × ${CAR.width} m`;
    case "table": return `${p.length} m`;
    case "chair": return "Range chair";
    case "pallet": return `${PALLET.length} × ${PALLET.width} m`;
    case "sandbags": return `${p.length} m, ${p.rows} rows`;
    case "cone": return "70 cm";
    case "wall-door": return `${p.length} × ${p.height} m, door ${cm(p.doorWidth)} cm`;
    default: return `${p.length} × ${p.height} m`;
  }
}

// Which groups are folded is remembered per browser (a convenience; it may be unavailable).
const FOLD_KEY = "dsb:library-closed";
function loadClosed() { try { return new Set(JSON.parse(localStorage.getItem(FOLD_KEY) || "[]")); } catch { return new Set(); } }
function saveClosed(set) { try { localStorage.setItem(FOLD_KEY, JSON.stringify([...set])); } catch { /* private mode */ } }

export function createLibrary(root, { editor }) {
  const closed = loadClosed();
  const search = h("input", { type: "search", placeholder: "Search props", "aria-label": "Search props", oninput: () => filter() });
  const sections = [];
  const items = [];
  root.append(h("h2", { class: "lg-subtitle panel-title", text: "Props" }), h("div", { class: "lg-search" }, [icon("search"), search]));
  for (const [cat, title] of CATEGORIES) {
    const list = h("div", { class: "lib-list", role: "list" });
    for (const def of Object.values(PROPS).filter((p) => p.category === cat)) {
      const item = h("button", {
        type: "button", class: "lib-item", draggable: "true", role: "listitem", "aria-pressed": "false",
        dataset: { type: def.type },
        onclick: () => {
          const armed = editor.state.mode?.place === def.type;
          editor.dispatch({ type: "setMode", mode: armed ? "select" : { place: def.type } });
        },
        ondragstart: (e) => { e.dataTransfer.setData("application/x-stage-prop", def.type); e.dataTransfer.effectAllowed = "copy"; },
      }, [h("span", { class: "lib-name", text: def.name }), h("span", { class: "lib-size lg-muted", text: sizeText(def.type) })]);
      items.push({ el: item, text: `${def.name} ${title}`.toLowerCase() });
      list.append(item);
    }
    // A native <details>: the heading toggles the group with mouse, touch and keyboard.
    const sec = h("details", { class: "lib-section", open: !closed.has(cat), dataset: { cat } }, [
      h("summary", { class: "lib-summary" }, [h("span", { class: "lg-label", text: title }), h("span", { class: "lib-count lg-muted", text: String(list.children.length) })]),
      list,
    ]);
    sec.addEventListener("toggle", () => {
      if (filtering) return;
      if (sec.open) closed.delete(cat); else closed.add(cat);
      saveClosed(closed);
    });
    sections.push(sec);
    root.append(sec);
  }
  const empty = h("p", { class: "lg-muted lib-empty", text: "No props match your search.", hidden: true });
  root.append(empty);

  let filtering = false;
  function filter() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const it of items) { const ok = !q || it.text.includes(q); it.el.hidden = !ok; if (ok) shown++; }
    filtering = true;
    for (const s of sections) {
      s.hidden = ![...s.querySelectorAll(".lib-item")].some((b) => !b.hidden);
      s.open = q ? !s.hidden : !closed.has(s.dataset.cat);     // a search opens groups with matches
    }
    setTimeout(() => { filtering = false; });
    empty.hidden = shown > 0;
  }

  return function update(state) {
    for (const it of items) it.el.setAttribute("aria-pressed", String(state.mode?.place === it.el.dataset.type));
  };
}
