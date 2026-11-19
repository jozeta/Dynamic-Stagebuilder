// Draw a bay shape: a white sheet with a 1 m grid (bold every 5 m), seen from above with down range
// at the top. The black pencil raises ground, the white pencil makes it floor again. Width and depth
// are whole metres; the drawing keeps what fits when they change. Name it and save it to My shapes.
// Names are shown with textContent; the drawing is a canvas.
import { h, icon } from "./dom.js";
import { drawnBay, floodFill } from "../model/bay.js";

const MAX = 200;
export const NEW_SIZE = Object.freeze({ width: 35, depth: 35 });           // a new drawing: 35 × 35 m
const blank = (w, d) => Array.from({ length: d }, () => "0".repeat(w));
// Resize the grid: keep the cells that still fit (anchored at the front, centred across).
function resized(rows, w0, w, d) {
  const off = Math.floor((w - w0) / 2);
  return Array.from({ length: d }, (_, r) => Array.from({ length: w }, (_, c) => (rows[r]?.[c - off] === "1" ? "1" : "0")).join(""));
}

export function createBayDrawer({ onSave, onDelete = null }) {
  let w = NEW_SIZE.width, d = NEW_SIZE.depth, rows = blank(w, d), tool = "1", mode = "pencil", brush = 1, editing = null;
  const name = h("input", { class: "lg-input", maxlength: "60", placeholder: "For example: Bay 3 with the pit", "aria-label": "Shape name" });
  const num = (label, onchange) => {
    const input = h("input", { class: "lg-input", type: "number", inputmode: "numeric", min: "2", max: String(MAX), step: "1", onchange });
    return [input, h("label", { class: "lg-field" }, [h("span", { text: label }), input])];
  };
  const [wIn, wField] = num("Width (m, across)", () => resize());
  const [dIn, dField] = num("Depth (m, down range)", () => resize());
  const canvas = h("canvas", { class: "bay-draw-canvas", role: "img", "aria-label": "The bay seen from above, down range at the top. Black is raised ground, white is floor." });
  const sheetBox = h("div", { class: "bay-draw-box" }, [canvas]);
  const msg = h("p", { class: "lg-muted hint-text", role: "status", "aria-live": "polite" });
  const toolBtn = (v, label, swatch) => h("button", { type: "button", class: "lg-btn bay-tool", "aria-pressed": "false", dataset: { tool: v }, onclick: () => setTool(v) },
    [h("span", { class: `bay-swatch bay-swatch-${swatch}`, "aria-hidden": "true" }), label]);
  const tools = [toolBtn("1", "Black: raised ground", "black"), toolBtn("0", "White: floor", "white")];
  // Pencil (paints squares under it) or paint bucket (fills the connected area of one colour).
  const modeBtn = (v, label, ic) => h("button", { type: "button", class: "lg-btn bay-tool", "aria-pressed": "false", dataset: { mode: v }, onclick: () => setMode(v) }, [icon(ic), label]);
  const modes = [modeBtn("pencil", "Pencil", "line"), modeBtn("bucket", "Paint bucket", "bucket")];
  const brushSel = h("select", { class: "lg-select", "aria-label": "Pencil size", onchange: (e) => { brush = Number(e.target.value); } },
    [[1, "1 m"], [2, "2 m"], [3, "3 m"], [5, "5 m"]].map(([v, t]) => h("option", { value: String(v), text: `Pencil ${t}` })));
  const del = h("button", { type: "button", class: "lg-btn lg-btn-danger is-gone", onclick: async () => { if (editing && onDelete) { await onDelete(editing); dialog.close(); } }, text: "Delete from My shapes" });
  const dialog = h("dialog", { class: "lg-modal bay-draw", "aria-labelledby": "bay-draw-title" }, [
    h("section", { class: "lg-modal-body bay-draw-body" }, [
      h("div", { class: "lg-stack bay-draw-side" }, [
        h("h2", { class: "lg-subtitle", id: "bay-draw-title", text: "Draw a bay shape" }),
        h("p", { class: "lg-muted hint-text", text: "Each square is 1 × 1 m. Black is raised ground (a bank with a slope down to the floor), white is floor; everything outside the sheet's sides and back is raised too. Seen from above: down range at the top, the shooter's left on the left." }),
        h("label", { class: "lg-field" }, [h("span", { text: "Name" }), name]),
        h("div", { class: "pos-fields" }, [wField, dField]),
        h("span", { class: "lg-label", text: "Colour" }),
        h("div", { class: "lg-stack bay-draw-tools" }, tools),
        h("span", { class: "lg-label", text: "Tool" }),
        h("div", { class: "lg-stack bay-draw-tools" }, [...modes, brushSel,
          h("button", { type: "button", class: "lg-btn", onclick: () => { rows = blank(w, d); draw(); }, text: "Clear the drawing" })]),
        msg,
      ]),
      h("div", { class: "bay-draw-sheet" }, [
        h("span", { class: "bay-draw-edge", text: "Down range ↑" }), sheetBox, h("span", { class: "bay-draw-edge", text: "Up range: the shooters come in here" }),
      ]),
    ]),
    h("div", { class: "lg-modal-actions" }, [del,
      h("button", { type: "button", class: "lg-btn", onclick: () => dialog.close(), text: "Cancel" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => save() }, [icon("check"), "Save shape"])]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  globalThis.addEventListener?.("resize", () => { if (dialog.open) draw(); });
  document.body.append(dialog);

  function setTool(v) { tool = v; for (const b of tools) b.setAttribute("aria-pressed", String(b.dataset.tool === v)); }
  function setMode(v) {
    mode = v;
    for (const b of modes) b.setAttribute("aria-pressed", String(b.dataset.mode === v));
    brushSel.disabled = v === "bucket";
    canvas.classList.toggle("is-bucket", v === "bucket");
  }
  function resize() {
    const nw = Math.min(MAX, Math.max(2, Math.round(Number(wIn.value) || w))), nd = Math.min(MAX, Math.max(2, Math.round(Number(dIn.value) || d)));
    wIn.value = String(nw); dIn.value = String(nd);
    rows = resized(rows, w, nw, nd); w = nw; d = nd;
    draw();
  }
  let cell = 10;
  // Squares as big as the sheet's space allows (at least 2 px; it scrolls past 200 m).
  function draw() {
    const room = Math.max(120, sheetBox.clientWidth - 4), tall = Math.max(120, sheetBox.clientHeight - 4);
    cell = Math.max(2, Math.min(32, Math.floor(Math.min(room / w, tall / d))));
    const dpr = globalThis.devicePixelRatio || 1;
    canvas.width = w * cell * dpr; canvas.height = d * cell * dpr;
    canvas.style.setProperty("width", `${w * cell}px`); canvas.style.setProperty("height", `${d * cell}px`);
    const g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w * cell, d * cell);
    g.fillStyle = "#111111";
    // Row 0 (up range) at the bottom.
    rows.forEach((row, r) => { for (let c = 0; c < w; c++) if (row[c] === "1") g.fillRect(c * cell, (d - 1 - r) * cell, cell, cell); });
    for (let i = 0; i <= Math.max(w, d); i++) {
      g.strokeStyle = i % 5 === 0 ? "rgba(90,147,196,0.75)" : "rgba(90,147,196,0.3)";
      g.lineWidth = i % 5 === 0 ? 1.2 : 0.6;
      if (i <= w) { g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, d * cell); g.stroke(); }
      if (i <= d) { g.beginPath(); g.moveTo(0, i * cell); g.lineTo(w * cell, i * cell); g.stroke(); }
    }
  }
  // Paint round a canvas point with the pencil (brush × brush cells).
  function paint(px, py) {
    const c0 = Math.floor(px / cell), r0 = d - 1 - Math.floor(py / cell), k = Math.floor((brush - 1) / 2);
    let changed = false;
    for (let r = r0 - k; r < r0 - k + brush; r++) {
      if (r < 0 || r >= d) continue;
      const cells = rows[r].split("");
      for (let c = c0 - k; c < c0 - k + brush; c++) if (c >= 0 && c < w && cells[c] !== tool) { cells[c] = tool; changed = true; }
      rows[r] = cells.join("");
    }
    return changed;
  }
  let last = null;
  const at = (e) => { const b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (mode === "bucket") {
      const [px, py] = at(e), next = floodFill(rows, Math.floor(px / cell), d - 1 - Math.floor(py / cell), tool);
      if (next !== rows) { rows = next; draw(); }
      return;
    }
    canvas.setPointerCapture(e.pointerId); last = at(e); if (paint(...last)) draw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!last) return;
    const p = at(e), steps = Math.ceil(Math.hypot(p[0] - last[0], p[1] - last[1]) / Math.max(1, cell / 2));
    let changed = false;
    for (let i = 1; i <= steps; i++) changed = paint(last[0] + ((p[0] - last[0]) * i) / steps, last[1] + ((p[1] - last[1]) * i) / steps) || changed;
    last = p;
    if (changed) draw();
  });
  for (const ev of ["pointerup", "pointercancel"]) canvas.addEventListener(ev, () => { last = null; });

  async function save() {
    const n = name.value.trim();
    if (!n) { msg.textContent = "Give the shape a name, so you can find it in the list."; name.focus(); return; }
    if (!rows.some((r) => r.includes("0"))) { msg.textContent = "Leave some floor (white) to stand on."; return; }
    await onSave(drawnBay({ width: w, depth: d, name: n, rows }), editing);
    dialog.close();
  }

  return {
    /** Open it: a new drawing the size of `size`, or `shape` (a drawn bay, with `id` when it is one of My shapes) to edit. */
    open({ size = NEW_SIZE, shape = null, id = null } = {}) {
      editing = id;
      w = Math.min(MAX, Math.max(2, Math.round(shape?.width ?? size.width)));
      d = Math.min(MAX, Math.max(2, Math.round(shape?.depth ?? size.depth)));
      rows = shape ? resized(shape.rows, shape.width, w, d) : blank(w, d);
      name.value = shape?.name ?? "";
      wIn.value = String(w); dIn.value = String(d);
      msg.textContent = "";
      del.classList.toggle("is-gone", !(id && onDelete));
      setTool("1");
      setMode("pencil");
      dialog.showModal();
      draw();
      name.focus();
    },
  };
}
