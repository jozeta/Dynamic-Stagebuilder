// Back up everything: every project, match, folder and surroundings template (with its plan image)
// in one file, and restoring one. A backup file is untrusted input: it is size-capped, every record
// goes through the same checks as on its own (schema for stages, cleanMatch, cleanFolder,
// cleanTemplate, image type and encoding), and everything comes in as NEW records with new ids, so a
// restore never overwrites what is there. The links between records follow the new ids: a match's
// stages, a folder's items and parent, a stage's own surroundings ("custom:<id>"). No DOM.
import { validateStage } from "../model/schema.js";
import { onFloor } from "../model/bay.js";
import { newId } from "../model/id.js";
import { cleanMatch } from "../model/match.js";
import { cleanFolder } from "../model/folders.js";
import { cleanTemplate, customId, customEnv } from "../model/surroundings.js";
import { cleanClub } from "../model/club.js";

export const BACKUP_KIND = "dynamic-stagebuilder-backup";
const MAX_BYTES = 200_000_000;
const MAX_RECORDS = 5000;
const MAX_IMAGE = 30_000_000;                     // characters of one plan image's data URL
const IMAGE = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]*={0,2})$/;

export const backupFileName = (now = Date.now()) => `dynamic-stagebuilder-backup-${new Date(now).toISOString().slice(0, 10)}.json`;

/** The backup file's text. surroundings: templates with `image` as a data URL (or null). */
export function backupToJson({ projects = [], matches = [], folders = [], surroundings = [], club = null }, { now = Date.now() } = {}) {
  return JSON.stringify({ kind: BACKUP_KIND, version: 1, created: now,
    projects: projects.map((r) => ({ id: r.id, name: r.name, modified: r.modified, exportedAt: r.exportedAt ?? null, stage: r.stage })),
    matches, folders, surroundings, ...(club ? { club } : {}) });
}

/** A data URL's bytes and type, or null unless it is a base64 PNG, JPEG or WebP. */
export function dataUrlToBytes(url) {
  if (typeof url !== "string" || url.length > MAX_IMAGE) return null;
  const m = IMAGE.exec(url);
  if (!m) return null;
  let bin;
  try { bin = atob(m[2]); } catch { return null; }
  return { type: m[1], bytes: Uint8Array.from(bin, (c) => c.charCodeAt(0)) };
}

/** Bytes as a base64 data URL of `type`. */
export function bytesToDataUrl(bytes, type) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${type};base64,${btoa(s)}`;
}

const list = (v) => (Array.isArray(v) ? v.slice(0, MAX_RECORDS) : []);
const num = (v, fallback) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/**
 * A backup file (untrusted) as new records: { ok, projects, matches, folders, surroundings, club,
 * counts, skipped } (surroundings carry imageBytes and imageType, or null), or { ok: false, error }.
 */
export function parseBackup(text, { maxBytes = MAX_BYTES, now = Date.now() } = {}) {
  if (typeof text !== "string" || text.length > maxBytes) return { ok: false, error: "The file is too large to be a backup." };
  let json;
  try { json = JSON.parse(text); } catch { return { ok: false, error: "This is not a backup file (it isn't valid JSON)." }; }
  if (json?.kind !== BACKUP_KIND) return { ok: false, error: "This is not a backup file. Stage and match files are opened with Import." };
  let skipped = 0;

  // Surroundings first: stages point at them.
  const envIds = new Map();
  const surroundings = [];
  for (const raw of list(json.surroundings)) {
    const t = cleanTemplate(raw);
    if (!t) { skipped++; continue; }
    const id = newId();
    envIds.set(t.id, id);
    const img = raw.image == null ? null : dataUrlToBytes(raw.image);
    surroundings.push({ ...t, id, imageBytes: img?.bytes ?? null, imageType: img?.type ?? null });
  }

  const stageIds = new Map();
  const projects = [];
  for (const raw of list(json.projects)) {
    const r = validateStage(raw?.stage);
    if (!r.ok) { skipped++; continue; }
    const id = newId();
    stageIds.set(typeof raw.id === "string" ? raw.id : r.stage.id, id);
    let stage = onFloor({ ...r.stage, id });
    const env = customId(stage.settings.environment);
    if (env) stage = { ...stage, settings: { ...stage.settings, environment: envIds.has(env) ? customEnv(envIds.get(env)) : "outdoor" } };
    projects.push({ id, name: stage.name, modified: num(raw.modified, now), exportedAt: num(raw.exportedAt, null), stage });
  }

  const matchIds = new Map();
  const matches = [];
  for (const raw of list(json.matches)) {
    const m = cleanMatch(raw);
    if (!m) { skipped++; continue; }
    const id = newId();
    matchIds.set(m.id, id);
    matches.push({ ...m, id, stageIds: m.stageIds.filter((s) => stageIds.has(s)).map((s) => stageIds.get(s)) });
  }

  const cleanFolders = list(json.folders).map(cleanFolder);
  skipped += cleanFolders.filter((f) => !f).length;
  const folderIds = new Map(cleanFolders.filter(Boolean).map((f) => [f.id, newId()]));
  const key = (k) => {
    const [kind, old] = [k.slice(0, k.indexOf(":")), k.slice(k.indexOf(":") + 1)];
    const map = kind === "stage" ? stageIds : matchIds;
    return map.has(old) ? `${kind}:${map.get(old)}` : null;
  };
  const folders = cleanFolders.filter(Boolean).map((f) => ({ ...f, id: folderIds.get(f.id), parent: folderIds.get(f.parent) ?? null, items: f.items.map(key).filter(Boolean) }));

  if (!projects.length && !matches.length && !folders.length && !surroundings.length) {
    return { ok: false, error: skipped ? "Nothing in the backup could be read." : "The backup is empty." };
  }
  const club = json.club && typeof json.club === "object" ? cleanClub(json.club) : null;
  return { ok: true, projects, matches, folders, surroundings, skipped, club,
    counts: { projects: projects.length, matches: matches.length, folders: folders.length, surroundings: surroundings.length } };
}
