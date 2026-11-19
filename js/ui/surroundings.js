// Your own surroundings: import a plan (blueprint or site drawing), measure it with one known
// length, and keep it with its building pieces as a template in this browser. The file is
// untrusted: only PNG, JPEG or WebP up to 20 MB, decoded by the browser into a bitmap and redrawn
// on a canvas (at most 4096 px a side), and only that redrawn image is stored.
import { h } from "./dom.js";
import { scaleFromReference, cleanTemplate } from "../model/surroundings.js";
import { setTemplate, removeTemplate, getTemplate } from "../render/environments/index.js";

const TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 20_000_000, MAX_SIDE = 4096;

async function fileToCanvas(file) {
  if (!TYPES.includes(file.type)) throw new Error("Choose a PNG, JPEG or WebP image of the plan.");
  if (file.size > MAX_BYTES) throw new Error("The image is larger than 20 MB. Save a smaller copy and try again.");
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { throw new Error("That file couldn't be read as an image."); }
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return c;
}
const canvasToBlob = (c) => new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.9));

// A template without its stored image, for the settings panel.
const plain = (r) => ({ id: r.id, name: r.name, plan: r.plan, pieces: r.pieces });

export function createSurroundings({ store, onChange = () => {} }) {
  const records = new Map();            // id → cleaned template

  async function load() {
    for (const r of await store.list()) {
      const t = cleanTemplate(r);
      if (!t) continue;
      let image = null;
      if (r.image instanceof Blob) { try { image = await createImageBitmap(r.image); } catch { image = null; } }
      records.set(t.id, { ...t, imageBlob: r.image instanceof Blob ? r.image : null });
      setTemplate(t, image);
    }
  }
  const save = async (t) => {
    const clean = cleanTemplate(t);
    records.set(clean.id, { ...clean, imageBlob: t.imageBlob ?? records.get(clean.id)?.imageBlob ?? null });
    await store.put({ ...clean, image: records.get(clean.id).imageBlob });
    setTemplate(clean);
    onChange(clean.id);
    return clean;
  };

  // The import dialog: pick the image, click both ends of a known length, type that length.
  const file = h("input", { type: "file", accept: TYPES.join(","), class: "lg-input" });
  const canvas = h("canvas", { class: "plan-canvas", "aria-label": "The plan: click both ends of something you know the length of" });
  const nameIn = h("input", { class: "lg-input", id: "plan-name", maxlength: "60", value: "My range" });
  const lenIn = h("input", { class: "lg-input", id: "plan-length", type: "number", inputmode: "decimal", min: "0.1", max: "1000", step: "0.01", placeholder: "e.g. 5.2" });
  const message = h("div", { role: "status", "aria-live": "polite" });
  const hint = h("p", { class: "lg-muted hint-text", text: "Choose an image of the plan first." });
  const createB = h("button", { type: "button", class: "lg-btn lg-btn-primary", disabled: true, text: "Create surroundings" });
  const clearB = h("button", { type: "button", class: "lg-btn", text: "Pick the points again" });
  const dialog = h("dialog", { class: "lg-modal lg-modal-lg plan-modal", "aria-labelledby": "plan-title" }, [
    h("h2", { class: "lg-modal-title", id: "plan-title", text: "New surroundings from a plan" }),
    h("div", { class: "lg-modal-body lg-stack" }, [
      h("p", { class: "lg-muted", text: "Use a blueprint, a site plan or a drawing of your range. Then click both ends of something on it whose real length you know, such as a wall, and type that length. The plan is scaled to match." }),
      h("div", { class: "lg-field" }, [h("label", { text: "Plan image (PNG, JPEG or WebP)" }), file]),
      canvas, hint,
      h("div", { class: "plan-fields" }, [
        h("div", { class: "lg-field" }, [h("label", { for: "plan-length", text: "Real length between the points (m)" }), lenIn]),
        h("div", { class: "lg-field" }, [h("label", { for: "plan-name", text: "Name" }), nameIn]),
      ]),
      message,
    ]),
    h("div", { class: "lg-modal-actions" }, [clearB, h("button", { type: "button", class: "lg-btn", onclick: () => dialog.close(), text: "Cancel" }), createB]),
  ]);
  document.body.append(dialog);

  let image = null, points = [], resolveOpen = null;
  const say = (text, tone = "bad") => message.replaceChildren(text ? h("p", { class: `lg-alert lg-alert-${tone}`, text }) : "");
  function draw() {
    if (!image) { canvas.hidden = true; return; }
    canvas.hidden = false;
    const g = canvas.getContext("2d");
    g.drawImage(image, 0, 0);
    const lw = Math.max(2, image.width / 400);
    g.lineWidth = lw; g.strokeStyle = "#ff3b30"; g.fillStyle = "#ff3b30";
    if (points.length === 2) { g.beginPath(); g.moveTo(...points[0]); g.lineTo(...points[1]); g.stroke(); }
    for (const [x, y] of points) { g.beginPath(); g.arc(x, y, lw * 3, 0, 7); g.fill(); }
    hint.textContent = points.length < 2 ? `Click ${points.length ? "the other end" : "one end"} of something you know the length of.` : "Now type its real length in metres.";
    validate();
  }
  function validate() {
    try {
      const mpp = scaleFromReference(points[0] ?? [0, 0], points[1] ?? [0, 0], Number(lenIn.value));
      createB.disabled = false;
      say(`Scale: 1 pixel = ${(mpp * 100).toFixed(2)} cm. The plan is ${(image.width * mpp).toFixed(1)} × ${(image.height * mpp).toFixed(1)} m.`, "info");
      return mpp;
    } catch (e) {
      createB.disabled = true;
      if (points.length === 2 && lenIn.value) say(e.message); else say("");
      return null;
    }
  }
  canvas.addEventListener("click", (e) => {
    if (!image) return;
    const r = canvas.getBoundingClientRect();
    const p = [((e.clientX - r.left) / r.width) * image.width, ((e.clientY - r.top) / r.height) * image.height];
    points = points.length >= 2 ? [p] : [...points, p];
    draw();
  });
  clearB.addEventListener("click", () => { points = []; draw(); });
  lenIn.addEventListener("input", validate);
  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      image = await fileToCanvas(f);
      canvas.width = image.width; canvas.height = image.height;
      points = [];
      if (!nameIn.value.trim() || nameIn.value === "My range") nameIn.value = f.name.replace(/\.[a-z]+$/i, "").slice(0, 60) || "My range";
      say("");
      draw();
    } catch (e) { image = null; draw(); say(e.message); }
  });
  createB.addEventListener("click", async () => {
    const mpp = validate();
    if (!mpp || !image) return;
    const id = crypto.randomUUID();
    const t = await save({ id, name: nameIn.value, plan: { width: image.width, height: image.height, metresPerPixel: mpp, x: 0, z: 15, rotation: 0, opacity: 1 }, pieces: [],
      imageBlob: await canvasToBlob(image) });
    setTemplate(t, image);
    onChange(t.id);
    dialog.close();
    resolveOpen?.(t.id);
  });
  dialog.addEventListener("close", () => { resolveOpen?.(null); resolveOpen = null; });

  return {
    load,
    list: () => [...records.values()].map(plain).sort((a, b) => a.name.localeCompare(b.name)),
    get: (id) => (records.has(id) ? plain(records.get(id)) : null),
    /** Opens the import dialog; resolves with the new template's id, or null when cancelled. */
    newFromPlan() {
      image = null; points = []; file.value = ""; lenIn.value = ""; nameIn.value = "My range"; say(""); draw();
      hint.textContent = "Choose an image of the plan first.";
      dialog.showModal();
      return new Promise((res) => { resolveOpen = res; });
    },
    async update(id, patch) {
      const t = records.get(id);
      if (!t) return null;
      return save({ ...t, ...patch, plan: patch.plan ? { ...t.plan, ...patch.plan } : t.plan });
    },
    async remove(id) {
      records.delete(id);
      await store.remove(id);
      removeTemplate(id);
      onChange(id);
    },
    hasImage: (id) => Boolean(getTemplate(id)?.image),
  };
}
