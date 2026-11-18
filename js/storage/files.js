// Stage JSON files. Imported files are untrusted: size-checked, parsed safely, validated by the
// schema, and always given a new id so an import can never overwrite an existing project.
import { validateStage } from "../model/schema.js";

export function exportFileName(stage) {
  const slug = String(stage.name || "").normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
  return `stage-${slug || "stage"}.json`;
}

export const stageToJson = (stage) => JSON.stringify(stage, null, 2);

export function parseStageFile(text, { maxBytes = 5_000_000 } = {}) {
  if (typeof text !== "string") return { ok: false, error: "This is not a stage file." };
  if (text.length > maxBytes) return { ok: false, error: "The file is too large to be a stage file." };
  let json;
  try { json = JSON.parse(text); } catch { return { ok: false, error: "This is not a stage file (it isn't valid JSON)." }; }
  const r = validateStage(json);
  if (!r.ok) return { ok: false, error: `The stage file has problems: ${r.errors.slice(0, 3).join("; ")}${r.errors.length > 3 ? "; …" : ""}` };
  return { ok: true, stage: { ...r.stage, id: crypto.randomUUID() } };
}
