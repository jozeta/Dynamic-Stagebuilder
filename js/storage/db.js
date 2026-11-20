// IndexedDB storage for projects (database "dynamic-stagebuilder", store "projects", key "id"), your
// own surroundings templates (store "surroundings": { id, name, plan, pieces, image Blob }) and
// matches (store "matches": { kind: "match", id, name, stageIds, created, modified }).
// Asks the browser to keep the data (Safari may clear unvisited sites' storage after 7 days unless
// the app is installed).
const DB = "dynamic-stagebuilder";
const STORE = "projects";
const SURROUNDINGS = "surroundings";
const MATCHES = "matches";

const done = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export async function openStore({ beforeClose = async () => {}, reload = () => globalThis.location?.reload?.() } = {}) {
  if (!("indexedDB" in globalThis)) throw new Error("This browser has no IndexedDB.");
  const open = indexedDB.open(DB, 3);
  open.onupgradeneeded = () => {
    const names = open.result.objectStoreNames;
    if (!names.contains(STORE)) open.result.createObjectStore(STORE, { keyPath: "id" });
    if (!names.contains(SURROUNDINGS)) open.result.createObjectStore(SURROUNDINGS, { keyPath: "id" });
    if (!names.contains(MATCHES)) open.result.createObjectStore(MATCHES, { keyPath: "id" });
  };
  // An older copy of the app open in another tab or window keeps the old version: say so instead of
  // waiting for ever (main.js then works unsaved and tells the user).
  open.onblocked = () => { const e = new Error("Close the other Dynamic-Stagebuilder tabs or windows, then reload."); e.name = "BlockedError"; open.onsuccess = () => open.result.close(); rejectBlocked(e); };
  let rejectBlocked = () => {};
  const db = await new Promise((resolve, reject) => { rejectBlocked = reject; done(open).then(resolve, reject); });
  // A newer copy opened elsewhere asks to upgrade: let it (this tab reloads to use it).
  // The pending save is written first, so nothing is lost.
  db.onversionchange = async () => { try { await beforeClose(); } catch { /* save what we can */ } db.close(); reload(); };
  try { await navigator.storage?.persist?.(); } catch { /* optional */ }
  const tx = (mode, store = STORE) => db.transaction(store, mode).objectStore(store);
  return {
    surroundings: {
      list: () => done(tx("readonly", SURROUNDINGS).getAll()),
      put: (record) => done(tx("readwrite", SURROUNDINGS).put(record)),
      remove: (id) => done(tx("readwrite", SURROUNDINGS).delete(id)),
    },
    matches: {
      list: () => done(tx("readonly", MATCHES).getAll()),
      put: (record) => done(tx("readwrite", MATCHES).put(record)),
      remove: (id) => done(tx("readwrite", MATCHES).delete(id)),
    },
    list: () => done(tx("readonly").getAll()),
    get: (id) => done(tx("readonly").get(id)),
    put: (record) => done(tx("readwrite").put(record)),
    remove: (id) => done(tx("readwrite").delete(id)),
  };
}

/** A store that keeps projects in memory only, for browsers where IndexedDB is unavailable. */
export function memoryStore() {
  const m = new Map(), sur = new Map(), mat = new Map();
  return {
    memory: true,
    surroundings: {
      list: async () => [...sur.values()],
      put: async (r) => { sur.set(r.id, r); },
      remove: async (id) => { sur.delete(id); },
    },
    matches: {
      list: async () => [...mat.values()],
      put: async (r) => { mat.set(r.id, structuredClone(r)); },
      remove: async (id) => { mat.delete(id); },
    },
    list: async () => [...m.values()],
    get: async (id) => m.get(id),
    put: async (r) => { m.set(r.id, structuredClone(r)); },
    remove: async (id) => { m.delete(id); },
  };
}
