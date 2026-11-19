// The props on stage as a list: groups, hidden and locked props, and copy and paste. Stored in
// the stage: each object may have `locked: true`, `hidden: true` and `group: <group id>`;
// stage.groups is [{ id, name, hidden?, locked? }]. A hidden prop isn't drawn (it still counts);
// a locked prop can't be clicked or dragged in the 3D view (pick it in the list to change it).
// Pure: no DOM, no Three.js.
import { newId } from "./stage.js";
import { getProp } from "./props.js";

export const MAX_GROUPS = 200;
const groupsOf = (stage) => stage.groups ?? [];
const groupOf = (stage, o) => (o.group ? groupsOf(stage).find((g) => g.id === o.group) : null);

/** Is the object locked (itself or through its group)? */
export const isLocked = (stage, o) => o.locked === true || groupOf(stage, o)?.locked === true;
/** Is the object hidden (itself or through its group)? */
export const isHidden = (stage, o) => o.hidden === true || groupOf(stage, o)?.hidden === true;

const mapObjects = (stage, ids, fn) => {
  const want = new Set(ids);
  return { ...stage, objects: stage.objects.map((o) => (want.has(o.id) ? fn(o) : o)) };
};
const without = (o, key) => { const c = { ...o }; delete c[key]; return c; };

/** Lock or unlock, hide or show objects: key "locked" or "hidden". */
export function setFlag(stage, ids, key, on) {
  if (!["locked", "hidden", "safetyRings"].includes(key)) throw new Error(`Unknown flag: ${key}`);
  return mapObjects(stage, ids, (o) => (on ? { ...o, [key]: true } : without(o, key)));
}

/** Groups with no members left are dropped. */
export function pruneGroups(stage) {
  if (!stage.groups) return stage;
  const used = new Set(stage.objects.map((o) => o.group).filter(Boolean));
  const groups = stage.groups.filter((g) => used.has(g.id));
  return groups.length === stage.groups.length ? stage : { ...stage, groups };
}

/** Put objects in a new group. Returns { stage, id }. */
export function groupObjects(stage, ids, name) {
  const id = newId();
  const n = groupsOf(stage).length + 1;
  const group = { id, name: String(name || `Group ${n}`).slice(0, 60) };
  const next = mapObjects({ ...stage, groups: [...groupsOf(stage), group] }, ids, (o) => ({ ...o, group: id }));
  return { stage: pruneGroups(next), id };
}

/** Move objects into a group (or out of any, with null). */
export function moveToGroup(stage, ids, groupId) {
  if (groupId && !groupsOf(stage).some((g) => g.id === groupId)) return stage;
  return pruneGroups(mapObjects(stage, ids, (o) => (groupId ? { ...o, group: groupId } : without(o, "group"))));
}

/** Dissolve a group: its members stay, ungrouped. */
export function ungroup(stage, groupId) {
  const members = stage.objects.filter((o) => o.group === groupId).map((o) => o.id);
  return pruneGroups(mapObjects(stage, members, (o) => without(o, "group")));
}

/** Change a group: { name?, hidden?, locked? }. */
export function updateGroup(stage, groupId, patch) {
  return {
    ...stage,
    groups: groupsOf(stage).map((g) => {
      if (g.id !== groupId) return g;
      let n = { ...g };
      if (typeof patch.name === "string" && patch.name.trim()) n.name = patch.name.trim().slice(0, 60);
      for (const k of ["hidden", "locked"]) if (typeof patch[k] === "boolean") n = patch[k] ? { ...n, [k]: true } : without(n, k);
      return n;
    }),
  };
}

/** The list for the panel: groups (with their members) and single props, in stage order. */
export function layerTree(stage) {
  const out = [], seen = new Map();
  for (const o of stage.objects) {
    const g = groupOf(stage, o);
    if (!g) { out.push({ kind: "item", object: o }); continue; }
    if (!seen.has(g.id)) { const node = { kind: "group", group: g, items: [] }; seen.set(g.id, node); out.push(node); }
    seen.get(g.id).items.push(o);
  }
  return out;
}

/** A row's text: its label and name, e.g. "T3 · IPSC target". */
export function itemName(o) {
  const name = getProp(o.type).name;
  return o.label ? `${o.label} · ${name}` : name;
}

/** What copy puts on the clipboard: plain copies of the objects (in stage order). */
export function copyObjects(stage, ids) {
  const want = new Set(ids);
  return stage.objects.filter((o) => want.has(o.id)).map((o) => JSON.parse(JSON.stringify(o)));
}

/**
 * Paste clipboard copies into a stage, moved by `offset`: new ids, fresh target numbers, links
 * between pasted props kept (an activator and what it starts), a group kept if it still exists.
 * Returns { stage, ids }.
 */
export function pasteObjects(stage, copies, offset = [0.5, 0.5], clamp = (p) => p) {
  const ids = new Map(copies.map((o) => [o.id, newId()]));
  const groups = new Set(groupsOf(stage).map((g) => g.id));
  const pasted = copies.map((o) => {
    let n = { ...JSON.parse(JSON.stringify(o)), id: ids.get(o.id), label: null, labelManual: false, position: clamp([o.position[0] + offset[0], o.position[1] + offset[1]]) };
    if (n.activatedBy && ids.has(n.activatedBy)) n.activatedBy = ids.get(n.activatedBy);
    if (n.group && !groups.has(n.group)) n = without(n, "group");
    if (n.via) n.via = n.via.map((p) => clamp([p[0] + offset[0], p[1] + offset[1]]));
    return n;
  });
  return { stage: { ...stage, objects: [...stage.objects, ...pasted] }, ids: pasted.map((o) => o.id) };
}
