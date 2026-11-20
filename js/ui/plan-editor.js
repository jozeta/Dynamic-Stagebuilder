// The plan window: a large dialog with the plan scaled to fit (never scrolled). Step 1 scales it
// (click both ends of a known length, type the length); step 2 draws walls, doors and windows on it
// (model/plan-draw.js snaps them together), with their heights and a cut at a height. Opened new
// (from an image file) or to edit a saved plan. The image is a canvas; names are text only.
import { h, icon } from "./dom.js";
import { scaleFromReference } from "../model/surroundings.js";
import { emptyDrawing, addWall, addOpening, eraseAt, snapPoint, cleanDrawing, HEIGHT_LIMITS } from "../model/plan-draw.js";

const SNAP_M = 0.4, SNAP_PX = 10;               // snap within 40 cm, and never less than 10 screen pixels
const COLORS = { wall: "#111418", door: "#b5651d", window: "#1f7ae0", preview: "#e0402f", snap: "#e0402f" };

export function createPlanEditor({ onFile }) {
  let image = null, step = 1, points = [], mpp = null, drawing = emptyDrawing(), history = [], tool = "wall", chain = null, start = null, cursor = null, resolve = null, editing = false;
  let fit = 1;                                     // screen pixels per image pixel

  const canvas = h("canvas", { class: "plan-canvas", role: "img", "aria-label": "The plan" });
  const box = h("div", { class: "plan-box" }, [canvas]);
  const file = h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", class: "lg-input" });
  const nameIn = h("input", { class: "lg-input", id: "plan-name", maxlength: "60", value: "My range" });
  const lenIn = h("input", { class: "lg-input", id: "plan-length", type: "number", inputmode: "decimal", min: "0.1", max: "1000", step: "0.01", placeholder: "e.g. 5.2" });
  const message = h("div", { role: "status", "aria-live": "polite" });
  const say = (text, tone = "info") => message.replaceChildren(text ? h("p", { class: `lg-alert lg-alert-${tone}`, text }) : "");
  const hint = h("p", { class: "lg-muted hint-text" });

  // Step 1: the image and its scale.
  const fileField = h("div", { class: "lg-field" }, [h("label", { text: "Plan image (PNG, JPEG or WebP)" }), file]);
  const step1 = h("div", { class: "lg-stack plan-side" }, [
    h("p", { class: "lg-muted hint-text", text: "Use a blueprint, a site plan or a drawing of your range. Click both ends of something whose real length you know, such as a wall, and type that length." }),
    fileField,
    h("div", { class: "lg-field" }, [h("label", { for: "plan-length", text: "Real length between the points (m)" }), lenIn]),
    h("div", { class: "lg-field" }, [h("label", { for: "plan-name", text: "Name" }), nameIn]),
    h("button", { type: "button", class: "lg-btn", onclick: () => { points = []; draw(); }, text: "Pick the points again" }),
  ]);

  // Step 2: the tools, heights and cut.
  const toolBtn = (id, label, ic) => h("button", { type: "button", class: "lg-btn plan-tool", "aria-pressed": "false", dataset: { tool: id }, onclick: () => setTool(id) }, [icon(ic), label]);
  const tools = [toolBtn("wall", "Wall", "line"), toolBtn("door", "Door", "frame"), toolBtn("window", "Window", "grid"), toolBtn("erase", "Erase", "trash")];
  const num = (key, label, [lo, hi], get, set) => {
    const id = `plan-h-${key}`;
    const input = h("input", { class: "lg-input", id, type: "number", inputmode: "decimal", min: String(lo), max: String(hi), step: "0.05", value: String(get()),
      onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { set(Math.min(hi, Math.max(lo, v))); e.target.value = String(get()); } } });
    return h("div", { class: "lg-field" }, [h("label", { for: id, text: label }), input]);
  };
  const H = () => drawing.heights;
  const heights = h("div", { class: "lg-stack" });
  function fillHeights() {
    const c = drawing.cut;
    const check = (key, label) => {
      const id = `plan-cut-${key}`;
      const cb = h("input", { type: "checkbox", id, onchange: (e) => { drawing = { ...drawing, cut: { ...drawing.cut, [key]: e.target.checked } }; fillHeights(); } });
      cb.checked = c[key] === true;
      return h("label", { class: "plan-check", for: id }, [cb, h("span", { text: label })]);
    };
    const setH = (k) => (v) => { drawing = { ...drawing, heights: { ...drawing.heights, [k]: v } }; };
    heights.replaceChildren(
      h("span", { class: "lg-label", text: "Heights" }),
      h("div", { class: "plan-grid" }, [
        num("wall", "Walls (m)", HEIGHT_LIMITS.wall, () => H().wall, setH("wall")),
        num("door", "Doors (m)", HEIGHT_LIMITS.door, () => H().door, setH("door")),
        num("sill", "Window sill (m)", HEIGHT_LIMITS.sill, () => H().sill, setH("sill")),
        num("head", "Window top (m)", HEIGHT_LIMITS.head, () => H().head, setH("head")),
        num("thickness", "Wall thickness (m)", HEIGHT_LIMITS.thickness, () => H().thickness, setH("thickness")),
      ]),
      h("span", { class: "lg-label", text: "Cut" }),
      h("p", { class: "lg-muted hint-text", text: "Cut at a height to see over: the kinds ticked end there, as in a plan's section." }),
      check("on", "Cut at"),
      num("cut", "Cut height (m)", HEIGHT_LIMITS.cut, () => drawing.cut.height, (v) => { drawing = { ...drawing, cut: { ...drawing.cut, height: v } }; }),
      h("div", { class: "plan-checks" }, [check("walls", "Walls"), check("doors", "Doors"), check("windows", "Windows")]),
    );
  }
  const step2 = h("div", { class: "lg-stack plan-side" }, [
    h("p", { class: "lg-muted hint-text", text: "Wall: click point to point, double-click (or Finish wall) to stop. Door and window: click both ends on a wall, or across a gap between two walls. Ends close to each other snap together." }),
    h("div", { class: "plan-tools" }, tools),
    h("div", { class: "lg-row plan-row" }, [
      h("button", { type: "button", class: "lg-btn", onclick: () => endChain(), text: "Finish wall" }),
      h("button", { type: "button", class: "lg-btn", onclick: () => undo() }, [icon("undo"), "Undo"]),
      h("button", { type: "button", class: "lg-btn", onclick: () => { push(); drawing = { ...emptyDrawing(), heights: drawing.heights, cut: drawing.cut }; draw(); }, text: "Clear" }),
    ]),
    heights,
  ]);

  const backB = h("button", { type: "button", class: "lg-btn", onclick: () => go(1) }, [icon("chevl"), "Back to the scale"]);
  const nextB = h("button", { type: "button", class: "lg-btn lg-btn-primary", disabled: true, onclick: () => go(2) }, ["Next: draw walls", icon("chevr")]);
  const saveB = h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => finish() }, [icon("check"), "Save"]);
  const title = h("h2", { class: "lg-modal-title", id: "plan-title" });
  const dialog = h("dialog", { class: "lg-modal plan-modal", "aria-labelledby": "plan-title" }, [
    title,
    h("div", { class: "lg-modal-body plan-body" }, [h("div", { class: "plan-sidebar" }, [step1, step2, hint, message]), box]),
    h("div", { class: "lg-modal-actions" }, [backB, h("button", { type: "button", class: "lg-btn", onclick: () => dialog.close(), text: "Cancel" }), nextB, saveB]),
  ]);
  document.body.append(dialog);
  dialog.addEventListener("close", () => { resolve?.(null); resolve = null; });
  globalThis.addEventListener?.("resize", () => { if (dialog.open) draw(); });

  function go(n) {
    step = n;
    chain = start = null;
    step1.hidden = n !== 1; step2.hidden = n !== 2;
    backB.hidden = n !== 2; nextB.hidden = n !== 1; saveB.hidden = n !== 2;
    title.textContent = n === 1 ? (editing ? "The plan's scale" : "New surroundings from a plan") : "Draw walls, doors and windows";
    if (n === 2) { const m = validate(); if (m) mpp = m; setTool(tool); fillHeights(); }     // the measured scale snaps the drawing
    draw();
  }
  function setTool(id) { tool = id; chain = start = null; for (const b of tools) b.setAttribute("aria-pressed", String(b.dataset.tool === id)); draw(); }
  const push = () => { history.push(drawing); if (history.length > 200) history.shift(); };
  function undo() { if (chain) { endChain(); return; } if (history.length) { drawing = history.pop(); draw(); } }
  function endChain() { chain = null; start = null; draw(); }
  const tolPx = () => Math.max((mpp ? SNAP_M / mpp : 20), SNAP_PX / fit);

  // Draw the plan scaled to fit the box, and on it the drawing (or the scale points).
  function draw() {
    if (!image) { canvas.hidden = true; hint.textContent = "Choose an image of the plan first."; validate(); return; }
    canvas.hidden = false;
    const bw = Math.max(100, box.clientWidth - 2), bh = Math.max(100, box.clientHeight - 2);
    fit = Math.min(bw / image.width, bh / image.height);
    const dpr = globalThis.devicePixelRatio || 1;
    canvas.width = Math.round(image.width * fit * dpr); canvas.height = Math.round(image.height * fit * dpr);
    canvas.style.setProperty("width", `${Math.round(image.width * fit)}px`); canvas.style.setProperty("height", `${Math.round(image.height * fit)}px`);
    const g = canvas.getContext("2d");
    g.setTransform(fit * dpr, 0, 0, fit * dpr, 0, 0);
    g.drawImage(image, 0, 0);
    const lw = 2 / fit;
    const seg = (s, color, width, dash = []) => { g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash.map((x) => x / fit)); g.beginPath(); g.moveTo(...s.a); g.lineTo(...s.b); g.stroke(); g.setLineDash([]); };
    const dot = (p, color, r = 4) => { g.fillStyle = color; g.beginPath(); g.arc(p[0], p[1], r / fit, 0, 7); g.fill(); };
    if (step === 1) {
      if (points.length === 2) seg({ a: points[0], b: points[1] }, COLORS.preview, lw);
      for (const p of points) dot(p, COLORS.preview, 5);
      hint.textContent = points.length < 2 ? `Click ${points.length ? "the other end" : "one end"} of something you know the length of.` : "Now type its real length in metres.";
      validate();
      return;
    }
    const wallW = Math.max(3 / fit, drawing.heights.thickness / mpp);
    for (const w of drawing.walls) seg(w, COLORS.wall, wallW);
    for (const w of drawing.walls) { dot(w.a, COLORS.wall, 3); dot(w.b, COLORS.wall, 3); }
    for (const o of drawing.doors) { seg(o, "#ffffff", wallW * 1.1); seg(o, COLORS.door, 4 / fit, [6, 4]); dot(o.a, COLORS.door); dot(o.b, COLORS.door); }
    for (const o of drawing.windows) { seg(o, "#ffffff", wallW * 1.1); seg(o, COLORS.window, 3 / fit); dot(o.a, COLORS.window); dot(o.b, COLORS.window); }
    const from = chain ?? start;
    if (from && cursor) seg({ a: from, b: snapPoint(drawing, cursor, tolPx()) }, COLORS.preview, 2 / fit, [5, 4]);
    if (cursor && tool !== "erase") { const s = snapPoint(drawing, cursor, tolPx()); if (s[0] !== cursor[0] || s[1] !== cursor[1]) { g.strokeStyle = COLORS.snap; g.lineWidth = 2 / fit; g.beginPath(); g.arc(s[0], s[1], 7 / fit, 0, 7); g.stroke(); } }
    hint.textContent = { wall: chain ? "Click the next corner; double-click or Finish wall to stop." : "Click where the wall starts.", door: start ? "Click the door's other side." : "Click one side of the door, on a wall or across a gap.",
      window: start ? "Click the window's other end." : "Click one end of the window, on a wall.", erase: "Click a wall, door or window to remove it." }[tool];
  }

  function validate() {
    try {
      const m = scaleFromReference(points[0] ?? [0, 0], points[1] ?? [0, 0], Number(lenIn.value));
      nextB.disabled = !image;
      if (step === 1 && image) say(`Scale: 1 pixel = ${(m * 100).toFixed(2)} cm. The plan is ${(image.width * m).toFixed(1)} × ${(image.height * m).toFixed(1)} m.`);
      return m;
    } catch (e) {
      nextB.disabled = !(editing && mpp && points.length === 0);       // editing: the saved scale still stands
      if (step === 1) { if (points.length === 2 && lenIn.value) say(e.message, "bad"); else say(editing && mpp ? `Scale: 1 pixel = ${(mpp * 100).toFixed(2)} cm (pick two points to measure it again).` : ""); }
      return null;
    }
  }

  const at = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / fit, (e.clientY - r.top) / fit]; };
  canvas.addEventListener("pointermove", (e) => { if (step === 2) { cursor = at(e); draw(); } });
  canvas.addEventListener("pointerleave", () => { cursor = null; if (step === 2) draw(); });
  canvas.addEventListener("click", (e) => {
    if (!image) return;
    const p = at(e);
    if (step === 1) { points = points.length >= 2 ? [p] : [...points, p]; draw(); return; }
    const tol = tolPx();
    if (tool === "erase") { const next = eraseAt(drawing, p, tol); if (next !== drawing) { push(); drawing = next; } draw(); return; }
    if (tool === "wall") {
      if (!chain) { chain = snapPoint(drawing, p, tol); draw(); return; }
      const next = addWall(drawing, chain, p, tol);
      if (next !== drawing) { push(); drawing = next; chain = drawing.walls.at(-1).b; }
      draw();
      return;
    }
    if (!start) { start = p; draw(); return; }
    const next = addOpening(drawing, tool, start, p, tol);
    if (next !== drawing) { push(); drawing = next; }
    start = null;
    draw();
  });
  canvas.addEventListener("dblclick", () => { if (tool === "wall") endChain(); });
  dialog.addEventListener("keydown", (e) => {
    if (step !== 2) return;
    if (e.key === "Enter") { e.preventDefault(); endChain(); }
    if (e.key === "Escape" && (chain || start)) { e.preventDefault(); e.stopPropagation(); endChain(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
  });

  lenIn.addEventListener("input", validate);
  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      image = await onFile(f);
      points = [];
      if (!nameIn.value.trim() || nameIn.value === "My range") nameIn.value = f.name.replace(/\.[a-z]+$/i, "").slice(0, 60) || "My range";
      say("");
      draw();
    } catch (err) { image = null; draw(); say(err.message, "bad"); }
  });

  function finish() {
    const m = validate() ?? mpp;
    if (!m || !image) { go(1); say("Measure the plan's scale first.", "bad"); return; }
    const r = resolve;
    resolve = null;
    dialog.close();
    r?.({ image, metresPerPixel: m, name: nameIn.value.trim() || "My range", drawing: cleanDrawing(drawing) });
  }

  return {
    /**
     * Open it: new (pick an image) or to edit { image, metresPerPixel, name, drawing }. Resolves with
     * { image, metresPerPixel, name, drawing } when saved, or null.
     */
    open(existing = null) {
      editing = Boolean(existing);
      image = existing?.image ?? null; mpp = existing?.metresPerPixel ?? null; drawing = existing?.drawing ? cleanDrawing(existing.drawing) : emptyDrawing();
      history = []; points = []; cursor = null; chain = start = null; tool = "wall";
      file.value = ""; lenIn.value = ""; nameIn.value = existing?.name ?? "My range";
      fileField.hidden = editing;
      say("");
      dialog.showModal();
      go(editing ? 2 : 1);
      return new Promise((res) => { resolve = res; });
    },
  };
}
