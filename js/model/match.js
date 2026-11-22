// Matches: a named set of one or more stages in order (Stage 1, 2, 3…). The stages stay ordinary
// projects; a match lists their ids, and each stage in it carries the match's name and its number in
// its briefing. Stored apart from the stages (storage "matches"). Pure: no DOM.
import { stageStats } from "./stats.js";

export const MAX_STAGES = 100;
const NAME_MAX = 120;
import { newId } from "./id.js";

/** A new, empty match. */
export function createMatch({ name = "New match", now = Date.now() } = {}) {
  return { kind: "match", id: newId(), name: String(name).trim().slice(0, NAME_MAX) || "New match", stageIds: [], created: now, modified: now };
}
const touch = (m, now, patch) => ({ ...m, ...patch, modified: now });

/** Add stages (by id) at the end, each once. */
export function addStages(m, ids, now = Date.now()) {
  const out = [...m.stageIds];
  for (const id of ids) if (!out.includes(id) && out.length < MAX_STAGES) out.push(id);
  return touch(m, now, { stageIds: out });
}
/** Take a stage out of the match (the stage itself stays). */
export const removeStage = (m, id, now = Date.now()) => touch(m, now, { stageIds: m.stageIds.filter((x) => x !== id) });
/** Move a stage up (−1) or down (+1) in the order. */
export function moveStage(m, id, by, now = Date.now()) {
  const i = m.stageIds.indexOf(id), j = i + by;
  if (i < 0 || j < 0 || j >= m.stageIds.length) return m;
  const ids = [...m.stageIds];
  [ids[i], ids[j]] = [ids[j], ids[i]];
  return touch(m, now, { stageIds: ids });
}
export function renameMatch(m, name, now = Date.now()) {
  const n = String(name ?? "").trim().slice(0, NAME_MAX);
  return n ? touch(m, now, { name: n }) : m;
}

/** What a stage's briefing should say in this match: { matchName, stageNumber }, or null. */
export function briefingFor(m, stageId) {
  const i = m.stageIds.indexOf(stageId);
  return i < 0 ? null : { matchName: m.name, stageNumber: i + 1 };
}

/** The match in figures: stages found, minimum rounds and maximum points, and ids not found. */
export function matchSummary(m, stages) {
  const byId = new Map(stages.map((s) => [s.id, s]));
  let minRounds = 0, maxPoints = 0, n = 0;
  const missing = [];
  for (const id of m.stageIds) {
    const s = byId.get(id);
    if (!s) { missing.push(id); continue; }
    const st = stageStats(s);
    minRounds += st.minRounds; maxPoints += st.maxPoints; n++;
  }
  return { stages: n, minRounds, maxPoints, missing };
}

/** A stored match, checked (unknown fields dropped), or null if it isn't one. */
export function cleanMatch(v) {
  if (!v || typeof v !== "object" || v.kind !== "match" || typeof v.id !== "string" || !v.id || v.id.length > 64) return null;
  const ids = Array.isArray(v.stageIds) ? [...new Set(v.stageIds.filter((x) => typeof x === "string" && x && x.length <= 64))].slice(0, MAX_STAGES) : [];
  const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
  return { kind: "match", id: v.id, name: (typeof v.name === "string" ? v.name.trim() : "").slice(0, NAME_MAX) || "Match", stageIds: ids, created: num(v.created), modified: num(v.modified) };
}

/** Stage ids in matches other than this one: Map(stageId → that match's name). */
export function inOtherMatches(matches, matchId) {
  const out = new Map();
  for (const m of matches) if (m.id !== matchId) for (const id of m.stageIds) if (!out.has(id)) out.set(id, m.name);
  return out;
}

/** A deleted stage leaves every match it was in: the changed matches (renumbered by their order). */
export function dropStageEverywhere(matches, stageId, now = Date.now()) {
  return matches.filter((m) => m.stageIds.includes(stageId)).map((m) => removeStage(m, stageId, now));
}

/** Adding `ids` to match `matchId` moves them out of any other match: those matches, changed. */
export function takeFromOthers(matches, matchId, ids, now = Date.now()) {
  return matches.filter((m) => m.id !== matchId && m.stageIds.some((id) => ids.includes(id)))
    .map((m) => touch(m, now, { stageIds: m.stageIds.filter((id) => !ids.includes(id)) }));
}

// The New match / Edit match window's list of stages, before it is saved: [{ key, name }], where key
// is "own:<project id>", "demo" or "lib:<library id>". Each stage once; order is the stage order.
export const draftAdd = (list, item) => (list.some((x) => x.key === item.key) || list.length >= MAX_STAGES ? list : [...list, item]);
export function draftMove(list, i, by) {
  const j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}
export const draftRemove = (list, i) => list.filter((_, k) => k !== i);
/** Move the stage at `from` to position `to` (dragged in the window), the others closing up. */
export function draftMoveTo(list, from, to) {
  if (from < 0 || from >= list.length) return list;
  const t = Math.max(0, Math.min(list.length - 1, to));
  if (t === from) return list;
  const out = [...list];
  const [item] = out.splice(from, 1);
  out.splice(t, 0, item);
  return out;
}

/** What a stage's ⓘ in the Projects panel shows: { rows: [label, value][], matches: ["Name (stage n)"] }. */
export function stageDetails(stage, matches) {
  const st = stageStats(stage);
  const rows = [["Paper targets", String(st.paper)], ["Steel targets", String(st.steel)], ["No-shoots", String(st.noShoots)],
    ["Minimum rounds", String(st.minRounds)], ["Maximum points", String(st.maxPoints)], ["Stage type", st.suggestedType || "–"],
    ["Bay", `${stage.bay.width} × ${stage.bay.depth} m`], ["Props", String(stage.objects.length)]];
  const inMatches = matches.filter((m) => m.stageIds.includes(stage.id)).map((m) => `${m.name} (stage ${m.stageIds.indexOf(stage.id) + 1})`);
  return { rows, matches: inMatches };
}
