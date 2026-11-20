// The prop library: search plus Paper, Steel, Walls and Obstacles. Tap an item to arm it, then tap
// the ground; with a mouse, items can also be dragged onto the 3D view.
import { h } from "./dom.js";
import { PROPS, defaultParams, TARGET_SIZES, BARREL, TYRE, PALLET, paperSize } from "../model/props.js";
import { icon } from "./dom.js";

import { LIBRARY_GROUPS, isShown } from "../model/visibility.js";
const CATEGORIES = LIBRARY_GROUPS.filter((g) => g.id !== "markings").map((g) => [g.id, g.name]);
const cm = (m) => `${Math.round(m * 100)}`;

// The size people know each prop by: the target face, the plate, the wall panel.
function sizeText(type) {
  const p = defaultParams(type);
  const face = (s) => `${cm(s.w)} × ${cm(s.h)} cm`;
  switch (type) {
    case "paper-ipsc": case "paper-mini": return `${face(paperSize({ type, params: p }))}, no-shoots, arrays, hard cover`;
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
    case "car": return "Saloon, hatchback, pickup or van";
    case "table": return `${p.length} m`;
    case "chair": return "Range chair";
    case "bed": return p.size === "single" ? "Single, 90 × 200 cm" : "Double, 160 × 200 cm";
    case "sofa": return { "1": "Armchair", "2": "2 seats", "3": "3 seats", "l-left": "L-shaped, chaise on the left", "l-right": "L-shaped, chaise on the right", u: "U-shaped", corner: "Corner sofa" }[p.shape];
    case "office-desk": return "Desk with a swivel chair";
    case "dining-set": return `Table with ${p.seats} chairs`;
    case "coffee-table": return p.shape === "round" ? "Round, Ø 80 cm" : "120 × 60 cm";
    case "pallet": return `${PALLET.length} × ${PALLET.width} m`;
    case "sandbags": return `${p.length} m, ${p.rows} rows`;
    case "cone": return "70 cm";
    case "swinger": case "drop-turner": case "clamshell": return "Paper, activated";
    case "mover": return `Paper on a ${p.length} m track`;
    case "texas-star": return `${p.plates} plates, not IPSC`;
    case "plate-rack": return `${p.plates} plates, not IPSC`;
    case "dueling-tree": return "6 paddles, not IPSC";
    case "step-pad": return p.pads > 1 ? "Three pads, activates a target" : "Pad, activates a target";
    case "pull-lever": return "Opens a shutter or releases a target";
    case "wall-port-shutter": return `${p.length} × ${p.height} m, port with a shutter`;
    case "hardcover-panel": return `${p.length} × ${p.height} m, black`;
    case "raised-barricade": return `${p.length} m, gap ${cm(p.gap)} cm`;
    case "bobber": return "Paper, rises and drops";
    case "twister": return "Paper, spins on its post";
    case "wobble-platform": return "1.6 × 1.2 m, moves under you";
    case "balance-rope": return "Rope on a 2.4 m frame";
    case "step-box": return "60 × 30 × 20 cm";
    case "door": return `${cm(p.doorWidth)} × ${cm(p.height)} cm, opens`;
    case "building-wall": return `${p.length} × ${p.height} m, concrete, brick, wood or metal`;
    case "pillar": return `${cm(p.size)} cm square, ${p.height} m`;
    case "column": return `Ø ${cm(p.diameter)} cm, ${p.height} m`;
    case "berm": return `${p.length} m long, ${p.height} m high`;
    case "container": return "20 ft or 40 ft";
    case "fence": return `${p.length} × ${p.height} m`;
    case "barrier": return `${p.length} m jersey barrier`;
    case "wall-door": return `${p.length} × ${p.height} m, door ${cm(p.doorWidth)} cm`;
    default: return `${p.length} × ${p.height} m`;
  }
}

// Which groups are folded is remembered per browser (a convenience; it may be unavailable).
const FOLD_KEY = "dsb:library-closed";
function loadClosed() { try { return new Set(JSON.parse(localStorage.getItem(FOLD_KEY) || "[]")); } catch { return new Set(); } }
function saveClosed(set) { try { localStorage.setItem(FOLD_KEY, JSON.stringify([...set])); } catch { /* private mode */ } }

export function createLibrary(root, { editor, hidden: initialHidden = { categories: [], props: [] } }) {
  let hidden = initialHidden;
  const closed = loadClosed();
  const search = h("input", { type: "search", placeholder: "Search props", "aria-label": "Search props", oninput: () => filter() });
  const sections = [];
  const items = [];
  root.append(h("h2", { class: "lg-subtitle panel-title", text: "Props" }), h("div", { class: "lg-search" }, [icon("search"), search]));

  // Stage markings first: fault lines, shooting areas and the start position are drawn on the ground.
  const markings = [
    ["line", "Fault line", "Tap points; Finish or Enter to end", { type: "beginDraw", lineType: "fault-line" }, (s) => s.mode?.draw === "fault-line"],
    ["area", "Shooting area", "Tap the corners; Finish to close", { type: "beginDraw", lineType: "shooting-area" }, (s) => s.mode?.draw === "shooting-area"],
    ["flag", "Start position", "Tap where the shooter starts", { type: "beginStart" }, (s) => s.mode === "start"],
    ["flag", "Start marks (X)", "Tap to place X marks for toes, heels or palms", { type: "setMode", mode: { place: "start-marks" } }, (s) => s.mode?.place === "start-marks", "start-marks"],
    ["eye", "Shooting position", "Tap each place the shooter shoots from: 1, 2, 3…", { type: "setMode", mode: { place: "shooting-position" } }, (s) => s.mode?.place === "shooting-position", "shooting-position"],
  ].map(([ic, name, hint, action, active, id = action.lineType || "start"]) => {
    const el = h("button", { type: "button", class: "lib-item lib-marking", role: "listitem", "aria-pressed": "false", dataset: { marking: name, type: id },
      onclick: () => editor.dispatch(active(editor.state) ? { type: "setMode", mode: "select" } : action) },
    [h("span", { class: "lib-name" }, [icon(ic), name]), h("span", { class: "lib-size lg-muted", text: hint })]);
    items.push({ el, text: `${name} stage markings`.toLowerCase(), marking: true, group: "markings", id });
    return { el, active };
  });
  {
    const list = h("div", { class: "lib-list", role: "list" }, markings.map((m) => m.el));
    const sec = h("details", { class: "lib-section", open: !closed.has("markings"), dataset: { cat: "markings" } }, [
      h("summary", { class: "lib-summary" }, [h("span", { class: "lg-label", text: "Stage markings" }), h("span", { class: "lib-count lg-muted", text: String(markings.length) })]),
      list,
    ]);
    sec.addEventListener("toggle", () => {
      if (search.value.trim()) return;
      if (sec.open) closed.delete("markings"); else closed.add("markings");
      saveClosed(closed);
    });
    sections.push(sec);
    root.append(sec);
  }
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
      items.push({ el: item, text: `${def.name} ${title}`.toLowerCase(), group: cat, id: def.type });
      list.append(item);
    }
    // A native <details>: the heading toggles the group with mouse, touch and keyboard.
    const sec = h("details", { class: "lib-section", open: !closed.has(cat), dataset: { cat } }, [
      h("summary", { class: "lib-summary" }, [h("span", { class: "lg-label", text: title }), h("span", { class: "lib-count lg-muted", text: String(list.children.length) })]),
      list,
    ]);
    sec.addEventListener("toggle", () => {
      if (search.value.trim()) return;      // folds caused by a search are not the user's choice
      if (sec.open) closed.delete(cat); else closed.add(cat);
      saveClosed(closed);
    });
    sections.push(sec);
    root.append(sec);
  }
  const empty = h("p", { class: "lg-muted lib-empty", text: "No props match your search.", hidden: true });
  root.append(empty);

  function filter() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const it of items) { const ok = isShown(hidden, it.group, it.id) && (!q || it.text.includes(q)); it.el.hidden = !ok; if (ok) shown++; }
    for (const s of sections) {
      s.hidden = ![...s.querySelectorAll(".lib-item")].some((b) => !b.hidden);
      s.open = q ? !s.hidden : !closed.has(s.dataset.cat);     // a search opens groups with matches
    }
    for (const s of sections) { const c = s.querySelector(".lib-count"); if (c) c.textContent = String([...s.querySelectorAll(".lib-item")].filter((b) => !b.hidden).length); }
    empty.textContent = q ? "No props match your search." : "Every prop is hidden. Show them again in Settings → Props.";
    empty.hidden = shown > 0;
  }

  filter();
  function update(state) {
    for (const it of items) if (!it.marking) it.el.setAttribute("aria-pressed", String(state.mode?.place === it.el.dataset.type));
    for (const m of markings) m.el.setAttribute("aria-pressed", String(m.active(state)));
  }
  // Settings → Props: show or hide groups and single items.
  update.setHidden = (h2) => { hidden = h2; filter(); };
  return update;
}
