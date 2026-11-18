// Project records as saved in the browser: one per stage, with when it last changed and was exported.
export function projectRecord(stage, { now, exportedAt = null }) {
  return { id: stage.id, name: stage.name, modified: now, exportedAt, stage };
}

export const sortProjects = (records) => [...records].sort((a, b) => b.modified - a.modified);

export function nextProjectAfterDelete(records, deletedId) {
  return sortProjects(records.filter((r) => r.id !== deletedId))[0]?.id ?? null;
}

function ago(ms) {
  const unit = (n, word) => `${n} ${word}${n === 1 ? "" : "s"} ago`;
  const min = Math.max(1, Math.round(ms / 60e3));
  if (min < 60) return unit(min, "minute");
  const hours = Math.round(min / 60);
  if (hours < 24) return unit(hours, "hour");
  return unit(Math.round(hours / 24), "day");
}

/** A hint when the project has changes that no exported file holds; null when the export is current. */
export function exportAge(record, now) {
  if (!record.exportedAt) return "Not exported yet";
  if (record.exportedAt >= record.modified) return null;
  return `Changed since the last export ${ago(now - record.exportedAt)}`;
}
