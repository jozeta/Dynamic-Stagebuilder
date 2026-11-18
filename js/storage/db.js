// IndexedDB storage for projects (database "dynamic-stagebuilder", store "projects", key "id").
// Asks the browser to keep the data (Safari may clear unvisited sites' storage after 7 days unless
// the app is installed).
const DB = "dynamic-stagebuilder";
const STORE = "projects";

const done = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export async function openStore() {
  if (!("indexedDB" in globalThis)) throw new Error("This browser has no IndexedDB.");
  const open = indexedDB.open(DB, 1);
  open.onupgradeneeded = () => open.result.createObjectStore(STORE, { keyPath: "id" });
  const db = await done(open);
  try { await navigator.storage?.persist?.(); } catch { /* optional */ }
  const tx = (mode) => db.transaction(STORE, mode).objectStore(STORE);
  return {
    list: () => done(tx("readonly").getAll()),
    get: (id) => done(tx("readonly").get(id)),
    put: (record) => done(tx("readwrite").put(record)),
    remove: (id) => done(tx("readwrite").delete(id)),
  };
}

/** A store that keeps projects in memory only, for browsers where IndexedDB is unavailable. */
export function memoryStore() {
  const m = new Map();
  return {
    memory: true,
    list: async () => [...m.values()],
    get: async (id) => m.get(id),
    put: async (r) => { m.set(r.id, structuredClone(r)); },
    remove: async (id) => { m.delete(id); },
  };
}
