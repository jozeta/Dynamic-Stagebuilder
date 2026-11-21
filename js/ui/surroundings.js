// Your own surroundings: import a plan (blueprint or site drawing), measure it with one known
// length, and keep it with its building pieces as a template in this browser. The file is
// untrusted: only PNG, JPEG or WebP up to 20 MB, decoded by the browser into a bitmap and redrawn
// on a canvas (at most 4096 px a side), and only that redrawn image is stored.
import { cleanTemplate } from "../model/surroundings.js";
import { createPlanEditor } from "./plan-editor.js";
import { setTemplate, removeTemplate, getTemplate } from "../render/environments/index.js";
import { newId } from "../model/id.js";

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
function bitmapToCanvas(bmp) {
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  c.getContext("2d").drawImage(bmp, 0, 0);
  bmp.close?.();
  return c;
}
const canvasToBlob = (c) => new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.9));

// A template without its stored image, for the settings panel.
const plain = (r) => ({ id: r.id, name: r.name, plan: r.plan, pieces: r.pieces, drawing: r.drawing ?? null });

export function createSurroundings({ store, onChange = () => {} }) {
  const records = new Map();            // id → cleaned template

  async function load() {
    for (const r of await store.list()) {
      const t = cleanTemplate(r);
      if (!t) continue;
      let image = null;
      // Redrawn on a canvas: WebGL can't flip an ImageBitmap the way three.js flips a canvas, so
      // a bitmap would lie on the ground upside down (its text mirrored).
      if (r.image instanceof Blob) { try { image = bitmapToCanvas(await createImageBitmap(r.image)); } catch { image = null; } }
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

  // The plan window (ui/plan-editor.js): scale a new plan and draw on it, or edit a saved one.
  const editor = createPlanEditor({ onFile: fileToCanvas });

  return {
    load,
    list: () => [...records.values()].map(plain).sort((a, b) => a.name.localeCompare(b.name)),
    get: (id) => (records.has(id) ? plain(records.get(id)) : null),
    /** Opens the plan window for a new plan; resolves with the new template's id, or null when cancelled. */
    async newFromPlan() {
      const r = await editor.open();
      if (!r) return null;
      const t = await save({ id: newId(), name: r.name, plan: { width: r.image.width, height: r.image.height, metresPerPixel: r.metresPerPixel, x: 0, z: 15, rotation: 0, opacity: 1 },
        pieces: [], drawing: r.drawing, imageBlob: await canvasToBlob(r.image) });
      setTemplate(t, r.image);
      onChange(t.id);
      return t.id;
    },
    /** Opens the plan window on a saved plan: its walls, doors and windows, heights, cut and scale. */
    async editPlan(id) {
      const t = records.get(id), image = getTemplate(id)?.image;
      if (!t?.plan || !image) return false;
      const r = await editor.open({ image, metresPerPixel: t.plan.metresPerPixel, name: t.name, drawing: t.drawing });
      if (!r) return false;
      await save({ ...t, name: r.name, plan: { ...t.plan, metresPerPixel: r.metresPerPixel }, drawing: r.drawing });
      return true;
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
