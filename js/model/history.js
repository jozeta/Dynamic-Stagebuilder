// Undo/redo over immutable stage snapshots. Unchanged objects are shared between snapshots, so
// keeping 200 steps costs little.
export function createHistory(stage, limit = 200) {
  return { past: [], present: stage, future: [], limit };
}

export function commit(h, stage) {
  if (stage === h.present) return h;
  const past = [...h.past, h.present];
  if (past.length > h.limit) past.splice(0, past.length - h.limit);
  return { ...h, past, present: stage, future: [] };
}

/** Replace the present without an undo step (view choices such as the environment). */
export function replacePresent(h, stage) {
  return { ...h, present: stage };
}

export function undo(h) {
  if (!h.past.length) return h;
  return { ...h, past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
}

export function redo(h) {
  if (!h.future.length) return h;
  return { ...h, past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}

export const canUndo = (h) => h.past.length > 0;
export const canRedo = (h) => h.future.length > 0;
