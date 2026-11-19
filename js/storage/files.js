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

// Match files: the match's name and all its stages, in order, in one file.
const MATCH_KIND = "dynamic-stagebuilder-match";
const MAX_MATCH_STAGES = 100;
const slug = (name) => String(name || "").normalize("NFKD").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
export const matchFileName = (match) => `match-${slug(match.name) || "match"}.json`;
export const matchToJson = (match, stages) => JSON.stringify({ kind: MATCH_KIND, version: 1, name: match.name, stages }, null, 2);

/**
 * A stage file or a match file (untrusted): { ok, kind: "stage", stage } or
 * { ok, kind: "match", name, stages }, every stage validated and given a new id; or { ok: false, error }.
 */
export function parseFile(text, { maxBytes = 20_000_000 } = {}) {
  if (typeof text !== "string") return { ok: false, error: "This is not a stage or match file." };
  if (text.length > maxBytes) return { ok: false, error: "The file is too large." };
  let json;
  try { json = JSON.parse(text); } catch { return { ok: false, error: "This is not a stage file (it isn't valid JSON)." }; }
  if (json?.kind !== MATCH_KIND) {
    if (text.length > 5_000_000) return { ok: false, error: "The file is too large to be a stage file." };
    const r = parseStageFile(text);
    return r.ok ? { ok: true, kind: "stage", stage: r.stage } : r;
  }
  if (!Array.isArray(json.stages) || !json.stages.length) return { ok: false, error: "The match file has no stages." };
  if (json.stages.length > MAX_MATCH_STAGES) return { ok: false, error: `A match can hold at most ${MAX_MATCH_STAGES} stages.` };
  const stages = [];
  for (const [i, raw] of json.stages.entries()) {
    const r = validateStage(raw);
    if (!r.ok) return { ok: false, error: `Stage ${i + 1} in the match file has problems: ${r.errors.slice(0, 2).join("; ")}` };
    stages.push({ ...r.stage, id: crypto.randomUUID() });
  }
  const name = (typeof json.name === "string" ? json.name.trim() : "").slice(0, 120) || "Imported match";
  return { ok: true, kind: "match", name, stages };
}
