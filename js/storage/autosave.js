// Autosave: writes the current stage a moment after the last change, never re-saves a stage that
// is already stored, and can be cancelled (before deleting a project, so a pending save can't bring
// it back).
import { projectRecord } from "./projects.js";

export function createAutosave({ store, getStage, delay = 600, now = () => Date.now(), onStatus = () => {} }) {
  let saved = null;
  let timer = 0;
  let exportedAt = null;

  async function flush() {
    clearTimeout(timer);
    timer = 0;
    const stage = getStage();
    if (stage === saved) return;
    try {
      await store.put(projectRecord(stage, { now: now(), exportedAt }));
      saved = stage;
      onStatus("saved");
    } catch (err) {
      onStatus("error", err);
    }
  }

  return {
    flush,
    schedule() {
      if (getStage() === saved) return;
      onStatus("saving");
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    cancel() { clearTimeout(timer); timer = 0; },
    /** The stage on screen is already stored as it is (just opened, or just exported). */
    markSaved(stage, exported = exportedAt) { saved = stage; exportedAt = exported; },
    get exportedAt() { return exportedAt; },
  };
}
