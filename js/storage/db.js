// IndexedDB storage for projects (database "dynamic-stagebuilder", store "projects", key "id") and
// your own surroundings templates (store "surroundings": { id, name, plan, pieces, image Blob }).
// Asks the browser to keep the data (Safari may clear unvisited sites' storage after 7 days unless
// the app is installed).
const DB = "dynamic-stagebuilder";
const STORE = "projects";
const SURROUNDINGS = "surroundings";

const done = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export async function openStore() {
  if (!("indexedDB" in globalThis)) throw new Error("This browser has no IndexedDB.");
  const open = indexedDB.open(DB, 2);
  open.onupgradeneeded = () => {
    const names = open.result.objectStoreNames;
    if (!names.contains(STORE)) open.result.createObjectStore(STORE, { keyPath: "id" });
    if (!names.contains(SURROUNDINGS)) open.result.createObjectStore(SURROUNDINGS, { keyPath: "id" });
  };
  const db = await done(open);
  try { await navigator.storage?.persist?.(); } catch { /* optional */ }
  const tx = (mode, store = STORE) => db.transaction(store, mode).objectStore(store);
  return {
    surroundings: {
      list: () => done(tx("readonly", SURROUNDINGS).getAll()),
      put: (record) => done(tx("readwrite", SURROUNDINGS).put(record)),
      remove: (id) => done(tx("readwrite", SURROUNDINGS).delete(id)),
    },
    list: () => done(tx("readonly").getAll()),
    get: (id) => done(tx("readonly").get(id)),
    put: (record) => done(tx("readwrite").put(record)),
    remove: (id) => done(tx("readwrite").delete(id)),
  };
}

/** A store that keeps projects in memory only, for browsers where IndexedDB is unavailable. */
export function memoryStore() {
  const m = new Map(), sur = new Map();
  return {
    memory: true,
    surroundings: {
      list: async () => [...sur.values()],
      put: async (r) => { sur.set(r.id, r); },
      remove: async (id) => { sur.delete(id); },
    },
    list: async () => [...m.values()],
    get: async (id) => m.get(id),
    put: async (r) => { m.set(r.id, structuredClone(r)); },
    remove: async (id) => { m.delete(id); },
  };
}
