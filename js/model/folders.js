// Folders for sorting your stages and matches in the Projects panel. A folder holds items by key
// ("stage:<id>", "match:<id>") and may sit in another folder (parent). Folders are kept next to the
// matches in the browser's storage (kind "folder"); stages and matches themselves don't change, so
// files and share links carry no folders. Pure: no DOM. Stored folders are checked by cleanFolder.
import { newId } from "./id.js";

const NAME_MAX = 120;
const KEY = /^(stage|match):[A-Za-z0-9_-]{1,64}$/;
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const named = (v, fallback) => (typeof v === "string" ? v.trim() : "").slice(0, NAME_MAX) || fallback;

export function createFolder({ name = "", parent = null, now = Date.now() } = {}) {
  return { kind: "folder", id: newId(), name: named(name, "New folder"), parent, items: [], created: now };
}

/** A stored folder as the app uses it, or null when it isn't one. */
export function cleanFolder(v) {
  if (!v || typeof v !== "object" || v.kind !== "folder" || typeof v.id !== "string" || !ID.test(v.id)) return null;
  const items = Array.isArray(v.items) ? [...new Set(v.items.filter((k) => typeof k === "string" && KEY.test(k)))].slice(0, 2000) : [];
  return { kind: "folder", id: v.id, name: named(v.name, "Folder"), parent: typeof v.parent === "string" && ID.test(v.parent) && v.parent !== v.id ? v.parent : null,
    items, created: Number.isFinite(v.created) ? v.created : 0 };
}

/** The folder holding a stage or match (by key), or null at the top. */
export const folderOf = (folders, key) => folders.find((f) => f.items.includes(key))?.id ?? null;

/** The folders from the top down to `id` (empty for the top). */
export function pathTo(folders, id) {
  const out = [];
  const seen = new Set();
  for (let f = folders.find((x) => x.id === id); f && !seen.has(f.id); f = folders.find((x) => x.id === f.parent)) { seen.add(f.id); out.unshift(f); }
  return out;
}

/** May folder `id` move into `into`? Not into itself or a folder inside it. */
export const canMoveFolder = (folders, id, into) => into === null || !pathTo(folders, into).some((f) => f.id === id);

/**
 * Move a stage, match ("stage:…", "match:…") or folder ("folder:<id>") into folder `into` (null: the
 * top). Returns the new list of folders, or the same list when the move isn't allowed.
 */
export function moveInto(folders, key, into) {
  if (into !== null && !folders.some((f) => f.id === into)) return folders;
  if (key.startsWith("folder:")) {
    const id = key.slice(7);
    if (!folders.some((f) => f.id === id) || !canMoveFolder(folders, id, into)) return folders;
    return folders.map((f) => (f.id === id ? { ...f, parent: into } : f));
  }
  return folders.map((f) => {
    const has = f.items.includes(key);
    if (f.id === into) return has ? f : { ...f, items: [...f.items, key] };
    return has ? { ...f, items: f.items.filter((k) => k !== key) } : f;
  });
}

/** Delete a folder: what it holds (items and folders) moves to its parent. */
export function removeFolder(folders, id) {
  const gone = folders.find((f) => f.id === id);
  if (!gone) return folders;
  return folders.filter((f) => f.id !== id).map((f) => {
    let next = f.parent === id ? { ...f, parent: gone.parent } : f;
    if (next.id === gone.parent) next = { ...next, items: [...new Set([...next.items, ...gone.items])] };
    return next;
  });
}

export const renameFolder = (folders, id, name) => folders.map((f) => (f.id === id ? { ...f, name: named(name, f.name) } : f));

/** What folder `id` (null: the top) shows: its folders (ids, by name) and its items among `keys`. */
export function contents(folders, id, keys) {
  const known = new Set(folders.map((f) => f.id));
  const sub = folders.filter((f) => (f.parent && known.has(f.parent) ? f.parent : null) === id).sort((a, b) => a.name.localeCompare(b.name)).map((f) => f.id);
  return { folders: sub, keys: keys.filter((k) => folderOf(folders, k) === id || (id === null && !known.has(folderOf(folders, k)))) };
}
