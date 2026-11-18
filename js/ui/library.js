// The prop library: search plus Paper, Steel, Walls and Obstacles. Tap an item to arm it, then tap
// the ground; with a mouse, items can also be dragged onto the 3D view.
import { h } from "./dom.js";
import { PROPS, defaultParams, TARGET_SIZES, BARREL, TYRE } from "../model/props.js";
import { icon } from "./dom.js";

const CATEGORIES = [["paper", "Paper"], ["steel", "Steel"], ["wall", "Walls"], ["obstacle", "Obstacles"]];
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
    default: return `${p.length} × ${p.height} m`;
  }
}

export function createLibrary(root, { editor }) {
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
    const sec = h("section", { class: "lib-section", "aria-label": title }, [h("h3", { class: "lg-label", text: title }), list]);
    sections.push(sec);
    root.append(sec);
  }
  const empty = h("p", { class: "lg-muted lib-empty", text: "No props match your search.", hidden: true });
  root.append(empty);

  function filter() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const it of items) { const ok = !q || it.text.includes(q); it.el.hidden = !ok; if (ok) shown++; }
    for (const s of sections) s.hidden = ![...s.querySelectorAll(".lib-item")].some((b) => !b.hidden);
    empty.hidden = shown > 0;
  }

  return function update(state) {
    for (const it of items) it.el.setAttribute("aria-pressed", String(state.mode?.place === it.el.dataset.type));
  };
}
