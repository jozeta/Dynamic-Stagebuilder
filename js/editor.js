// The editor: turns user actions into stage edits. Every edit is snapped to the grid and angle
// settings, kept inside the bay, numbered, and committed to the undo history as one step. No DOM,
// no Three.js, so it runs under node --test.
import { createStage, addObject, updateObject, removeObjects, duplicateObjects, addLine, setStart,
  setSetting, setBay, setBriefing, pruneSelection } from "./model/stage.js";
import { createHistory, commit, replacePresent, undo, redo } from "./model/history.js";
import { assignLabels, renumber, setLabel } from "./model/numbering.js";
import { fitStand, arrayCounts, arrayExtent } from "./model/arrays.js";
import { takeBuildingPieces, putBackPieces } from "./model/surroundings.js";
import { snapPoint, snapAngle, clampToBay } from "./model/snap.js";
import { getProp } from "./model/props.js";
import { snapToObjects, SNAP_RADIUS } from "./model/objsnap.js";
import { cleanLook, lookDefaults, lookAfterSwitch } from "./model/look.js";
import { stepFrom } from "./model/positions.js";
import { snapMeasure } from "./model/measure.js";
import { mirrorStage, alignObjects, distributeObjects } from "./model/arrange.js";
import { canBeActivated, isActivator } from "./model/activation.js";
import { isLocked, isHidden, setFlag, pruneGroups, groupObjects, ungroup, moveToGroup, updateGroup, copyObjects, pasteObjects } from "./model/layers.js";

const STAGE_TYPES = ["", "Short", "Medium", "Long"];
const BRIEFING_TEXT = ["matchName", "designer", "startSignal", "startPosition", "gunCondition", "procedure", "stopTime", "notes", "scoring"];
const LINE_MIN = { "fault-line": 2, "shooting-area": 3 };
const clampNum = (v, min, max) => Math.min(max, Math.max(min, v));

// A copy of the stage with one shooting position's grab points changed by fn(via) (at most 50).
function withVia(stage, id, fn) {
  return { ...stage, objects: stage.objects.map((o) => (o.id === id && o.type === "shooting-position"
    ? { ...o, via: fn(o.via || []).slice(0, 50).map((p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]) } : o)) };
}

export function createEditor({ stage = createStage(), onChange = () => {} } = {}) {
  const state = { history: createHistory(assignLabels(stage)), selection: [], mode: "select", drag: null, clipboard: [], measures: [] };
  const present = () => state.history.present;
  const fit = (p, s = present()) => clampToBay(snapPoint(p, s.settings.grid), s.bay);
  let lastGrid = stage.settings.grid || 0.25;

  // Where one object lands: on a nearby wall end (object snap), else on the grid; a fine (Shift)
  // move skips both. Always inside the bay.
  function landing(s, obj, raw, fine = false) {
    if (fine) return clampToBay(raw, s.bay);
    if (s.settings.objectSnap !== false) {
      const r = snapToObjects(s, obj, raw, SNAP_RADIUS);
      if (r.snapped) return clampToBay(r.position, s.bay);
    }
    return fit(raw, s);
  }

  function edit(next) {
    state.history = commit(state.history, assignLabels(pruneGroups(next)));
    state.selection = pruneSelection(state.selection, present());
  }

  const objIds = (ids) => ids.filter((id) => present().objects.some((o) => o.id === id));
  // Lines aren't lockable, so they always pass.
  const unlocked = (ids) => ids.filter((id) => { const o = present().objects.find((x) => x.id === id); return !o || !isLocked(present(), o); });

  function cleanParams(type, params) {
    const out = {};
    for (const [k, v] of Object.entries(params)) {
      const spec = getProp(type).params[k];
      if (!spec) continue;
      if (spec.bool) { if (typeof v === "boolean") out[k] = v; }
      else if (spec.options) { if (spec.options.includes(v)) out[k] = v; }
      else if (Number.isFinite(Number(v))) out[k] = clampNum(Number(v), spec.min, spec.max);
    }
    return out;
  }

  // Limit a group move so every selected item stays inside the bay (the group stops as a whole).
  function limitDelta(base, ids, [dx, dz]) {
    const pts = [];
    for (const id of ids) {
      const o = base.objects.find((x) => x.id === id);
      if (o) pts.push(o.position);
      const l = base.lines.find((x) => x.id === id);
      if (l) pts.push(...l.points);
    }
    const half = base.bay.width / 2;
    for (const [x, z] of pts) {
      dx = Math.min(Math.max(dx, -half - x), half - x);
      dz = Math.min(Math.max(dz, -z), base.bay.depth - z);
    }
    return [dx, dz];
  }

  function moved(base, ids, rawDelta, fine = false) {
    const delta = limitDelta(base, ids, rawDelta);
    const place = (p) => (fine ? clampToBay(p, base.bay) : fit(p, base));
    let s = base;
    if (ids.length === 1) {
      const o = base.objects.find((x) => x.id === ids[0]);
      if (o) return updateObject(s, o.id, { position: landing(base, o, [o.position[0] + delta[0], o.position[1] + delta[1]], fine) });
    }
    for (const id of ids) {
      const o = base.objects.find((x) => x.id === id);
      if (o) { s = updateObject(s, id, { position: place([o.position[0] + delta[0], o.position[1] + delta[1]]) }); continue; }
      const l = base.lines.find((x) => x.id === id);
      if (l) s = { ...s, lines: s.lines.map((x) => x.id !== id ? x : { ...x, points: l.points.map((p) => place([p[0] + delta[0], p[1] + delta[1]])) }) };
    }
    return s;
  }

  // Undo/redo change the stage, not the surroundings the user is looking at.
  function keepEnvironment(step) {
    const { environment: env, look } = present().settings;
    state.history = step(state.history);
    if (present().settings.environment !== env) state.history = replacePresent(state.history, setSetting(present(), "environment", env));
    if (present().settings.look !== look) state.history = replacePresent(state.history, setSetting(present(), "look", look));
    state.selection = pruneSelection(state.selection, present());
  }

  const handlers = {
    setMode({ mode }) { state.mode = mode; },
    cancel() { if (state.mode?.measure) state.measures = []; state.mode = "select"; },
    // The measuring tool (a view aid: state.measures, never the stage).
    beginMeasure() { state.mode = { measure: true, from: null }; state.selection = []; },
    addMeasurePoint({ point, fine = false }) {
      if (!state.mode?.measure) return;
      const p = snapMeasure(present(), point, { fine }).point;
      if (!state.mode.from) state.mode = { ...state.mode, from: p };
      else { state.measures = [...state.measures, { a: state.mode.from, b: p }]; state.mode = { ...state.mode, from: null }; }
    },
    clearMeasures() { state.measures = []; if (state.mode?.measure) state.mode = { ...state.mode, from: null }; },
    select({ ids, add }) {
      if (!add) state.selection = [...ids];
      else for (const id of ids) state.selection = state.selection.includes(id) ? state.selection.filter((x) => x !== id) : [...state.selection, id];
    },
    place({ propType, position, rotation = 0 }) {
      // Paper targets take the stage's default style (Settings → Default target style).
      const extra = getProp(propType).params.style ? { style: present().settings.targetStyle || "classic" } : {};
      const r = addObject(present(), propType, position, snapAngle(rotation, present().settings.angleSnap), extra);
      const obj = r.stage.objects.find((o) => o.id === r.id);
      edit(updateObject(r.stage, r.id, { position: landing(r.stage, obj, position) }));
      state.selection = [r.id];
      state.mode = "select";
    },
    // Shooter's eye move arrows: one step relative to the position's facing, unsnapped, in the bay.
    stepPosition({ id, dir, step }) {
      const o = present().objects.find((x) => x.id === id && x.type === "shooting-position");
      const to = o && stepFrom(o.position, o.rotation, dir, Number.isFinite(step) ? step : undefined);
      if (to) edit(updateObject(present(), id, { position: clampToBay(to, present().bay) }));
    },
    move({ id, position }) {
      const o = present().objects.find((x) => x.id === id);
      if (o) edit(updateObject(present(), id, { position: landing(present(), o, position) }));
    },
    dragStart({ ids }) { state.drag = { base: state.history, ids: unlocked(ids) }; },      // locked props stay put
    dragMove({ delta, fine = false }) {
      if (!state.drag) return;
      state.history = replacePresent(state.drag.base, moved(state.drag.base.present, state.drag.ids, delta, fine));
    },
    dragEnd() {
      if (!state.drag) return;
      const { base } = state.drag;
      state.drag = null;
      if (state.history.present !== base.present) state.history = commit(base, state.history.present);
      else state.history = base;
    },
    rotate({ by, ids = state.selection }) {
      let s = present();
      for (const id of unlocked(ids)) {
        const o = s.objects.find((x) => x.id === id);
        if (o) s = updateObject(s, id, { rotation: snapAngle(o.rotation + by, s.settings.angleSnap) });
      }
      edit(s);
    },
    // A position typed in: used exactly (no grid or object snap), kept inside the bay.
    setPosition({ id, x, z }) {
      const o = present().objects.find((v) => v.id === id);
      if (!o || isLocked(present(), o)) return;
      const num = (v, old) => (v === "" || v === null || v === undefined || !Number.isFinite(Number(v)) ? old : Math.round(Number(v) * 1000) / 1000);
      edit(updateObject(present(), id, { position: clampToBay([num(x, o.position[0]), num(z, o.position[1])], present().bay) }));
    },
    // Mirror left to right: the selection about its centre, or (nothing selected) the whole stage.
    mirror({ ids = state.selection } = {}) {
      const locked = new Set(present().objects.filter((o) => isLocked(present(), o)).map((o) => o.id));
      const next = mirrorStage(present(), ids, locked);
      if (next !== present()) edit({ ...next, objects: next.objects.map((o) => ({ ...o, position: clampToBay(o.position, next.bay) })) });
    },
    align({ ids = state.selection, edge }) { const next = alignObjects(present(), unlocked(objIds(ids)), edge); if (next !== present()) edit(next); },
    distribute({ ids = state.selection, axis }) { const next = distributeObjects(present(), unlocked(objIds(ids)), axis); if (next !== present()) edit(next); },
    setRotation({ id, value }) { edit(updateObject(present(), id, { rotation: snapAngle(Number(value) || 0, present().settings.angleSnap) })); },
    setParams({ id, params }) {
      const o = present().objects.find((x) => x.id === id);
      if (!o) return;
      const clean = cleanParams(o.type, params);
      if (!Object.keys(clean).length) return;          // nothing valid: no edit, no empty undo step
      let next = { ...o.params, ...clean };
      const paper = o.type === "paper-ipsc" || o.type === "paper-mini";
      // A new presentation or style that would put the top over the IPSC limit lowers the stand
      // (a stand height set by hand is kept; the inspector then warns).
      if (paper && !Object.hasOwn(params, "mountHeight") && (Object.hasOwn(params, "presentation") || Object.hasOwn(params, "style"))) {
        // A new presentation keeps the top of the targets where it was: the sticks get shorter or
        // longer instead (never below 10 cm). Then the IPSC height limit still applies.
        if (Object.hasOwn(params, "presentation")) {
          const keep = o.params.mountHeight + arrayExtent(o).top - arrayExtent({ type: o.type, params: next }).top;
          next = { ...next, mountHeight: Math.round(Math.min(2, Math.max(0.1, keep)) * 1e6) / 1e6 };
        }
        next = { ...next, mountHeight: fitStand({ type: o.type, params: next }) };
      }
      // An automatic label follows a change in how many targets the array is.
      const relabel = paper && !o.labelManual && arrayCounts({ type: o.type, params: next }).paper !== arrayCounts(o).paper;
      edit(updateObject(present(), id, { params: next, ...(relabel ? { label: null } : {}) }));
    },
    // Your own surroundings: building pieces leave the stage for the template, or come back to edit.
    takeBuilding() { edit(takeBuildingPieces(present()).stage); state.selection = []; },
    putBackBuilding({ pieces }) { edit(putBackPieces(present(), pieces)); },
    // The shooter's route: grab points on the stretch leading to a shooting position.
    addVia({ id, index, point }) { edit(withVia(present(), id, (v) => [...v.slice(0, index), clampToBay(point, present().bay), ...v.slice(index)])); },
    removeVia({ id, index }) { edit(withVia(present(), id, (v) => v.filter((_, i) => i !== index))); },
    viaDragStart({ id, index }) { state.drag = { base: state.history, via: { id, index } }; },
    viaDragMove({ point }) {
      if (!state.drag?.via) return;
      const { id, index } = state.drag.via, base = state.drag.base.present;
      state.history = replacePresent(state.drag.base, withVia(base, id, (v) => v.map((p, i) => (i === index ? clampToBay(point, base.bay) : p))));
    },
    viaDragEnd() {
      if (!state.drag?.via) return;
      const { base } = state.drag;
      state.drag = null;
      state.history = state.history.present !== base.present ? commit(base, state.history.present) : base;
    },
    // Shooter's eye → Save view: the facing and look angle of a shooting position, one undo step.
    setView({ id, rotation, pitch }) {
      const o = present().objects.find((x) => x.id === id);
      if (!o || o.type !== "shooting-position") return;
      const r = ((Math.round(rotation) % 360) + 360) % 360;
      edit(updateObject(present(), id, { rotation: r, params: cleanParams(o.type, { pitch: Math.round(pitch) }) }));
    },
    delete({ ids = state.selection }) {
      const go = unlocked(ids);                    // a locked prop is kept: unlock it first
      if (!go.length) return;
      edit(removeObjects(present(), go));
      state.selection = state.selection.filter((id) => !go.includes(id));
    },
    // The props-on-stage list and the right-click menu.
    setLocked({ ids = state.selection, locked }) { if (objIds(ids).length) edit(setFlag(present(), objIds(ids), "locked", locked)); },
    // Show the rulebook's safety distances round these targets (saved with the stage).
    setSafetyRings({ ids = state.selection, on }) {
      const targets = objIds(ids).filter((id) => ["paper", "steel"].includes(getProp(present().objects.find((o) => o.id === id).type).scoring));
      if (targets.length) edit(setFlag(present(), targets, "safetyRings", on));
    },
    setHidden({ ids = state.selection, hidden }) { if (objIds(ids).length) edit(setFlag(present(), objIds(ids), "hidden", hidden)); },
    group({ ids = state.selection, name }) {
      const go = objIds(ids);
      if (!go.length) return;
      const r = groupObjects(present(), go, name);
      edit(r.stage);
      state.selection = go;
    },
    // Ungroup a group (id), or every group the given props are in.
    ungroup({ id, ids = state.selection }) {
      const gids = id ? [id] : [...new Set(present().objects.filter((o) => ids.includes(o.id) && o.group).map((o) => o.group))];
      if (!gids.length) return;
      edit(gids.reduce((s, g) => ungroup(s, g), present()));
    },
    moveToGroup({ ids = state.selection, group }) { if (objIds(ids).length) edit(moveToGroup(present(), objIds(ids), group)); },
    updateGroup({ id, patch }) { edit(updateGroup(present(), id, patch)); },
    copy({ ids = state.selection }) { const c = copyObjects(present(), objIds(ids)); if (c.length) state.clipboard = c; },
    cut({ ids = state.selection }) {
      const go = unlocked(objIds(ids));
      if (!go.length) return;
      state.clipboard = copyObjects(present(), go);
      edit(removeObjects(present(), go));
      state.selection = [];
    },
    paste({ offset = [0.5, 0.5] } = {}) {
      if (!state.clipboard.length) return;
      const r = pasteObjects(present(), state.clipboard, offset, (p) => clampToBay(p, present().bay));
      edit(r.stage);
      state.selection = r.ids;
      // The next paste lands a step further on.
      state.clipboard = state.clipboard.map((o) => ({ ...o, position: [o.position[0] + offset[0], o.position[1] + offset[1]] }));
    },
    selectAll({ propType = null } = {}) {
      const s = present();
      state.selection = s.objects.filter((o) => (!propType || o.type === propType) && !isHidden(s, o) && !isLocked(s, o)).map((o) => o.id);
    },
    duplicate({ ids = state.selection }) {
      const r = duplicateObjects(present(), ids);
      if (!r.ids.length) return;
      const copies = new Set(r.ids);
      edit({ ...r.stage, objects: r.stage.objects.map((o) => (copies.has(o.id) ? { ...o, position: fit(o.position) } : o)) });
      state.selection = r.ids;
    },
    undo() { keepEnvironment(undo); },
    redo() { keepEnvironment(redo); },
    renumber() { edit(renumber(present())); },
    setLabel({ id, text }) { edit(setLabel(present(), id, text)); },
    // The look (light, time of day, haze) is a view choice like the surroundings: no undo step.
    setLook({ patch = {}, reset = false }) {
      const look = reset ? { ...lookDefaults(present().settings.environment) } : cleanLook({ ...present().settings.look, ...patch });
      state.history = replacePresent(state.history, setSetting(present(), "look", look));
    },
    setEnvironment({ name }) {
      const { environment: from, look } = present().settings;
      const next = setSetting(present(), "environment", name);
      state.history = replacePresent(state.history, setSetting(next, "look", lookAfterSwitch(look, from, name)));
    },
    setSetting({ key, value }) {
      if (key === "targetStyle" && value !== "classic" && value !== "head") return;
      if (key === "grid" && value) lastGrid = value;
      edit(setSetting(present(), key, value));
    },
    toggleGrid() {
      const g = present().settings.grid;
      if (g) lastGrid = g;
      edit(setSetting(present(), "grid", g ? 0 : lastGrid));
    },
    setBriefing({ patch }) {
      const clean = {};
      for (const [k, v] of Object.entries(patch)) {
        if (k === "stageNumber") clean[k] = clampNum(Math.round(Number(v) || 0), 0, 999);
        else if (k === "stageType") { if (STAGE_TYPES.includes(v)) clean[k] = v; }
        else if (BRIEFING_TEXT.includes(k)) clean[k] = String(v ?? "").slice(0, 4000);
      }
      edit(setBriefing(present(), clean));
    },
    rename({ name }) { edit({ ...present(), name: String(name ?? "").trim().slice(0, 120) || "Untitled stage" }); },
    // The bay's size and (optional) shape; a size change alone keeps the shape. Props, lines and
    // the start move onto the floor if they would be off it.
    setBay({ width, depth, ...rest }) {
      const shape = Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "type"));      // the action's own type isn't a bay field
      const keep = Object.keys(shape).length ? shape : present().bay;
      let s = setBay(present(), clampNum(Number(width) || 1, 1, 200), clampNum(Number(depth) || 1, 1, 200), { ...keep, ...shape });
      const bay = s.bay;
      s = { ...s,
        objects: s.objects.map((o) => ({ ...o, position: clampToBay(o.position, bay) })),
        lines: s.lines.map((l) => ({ ...l, points: l.points.map((p) => clampToBay(p, bay)) })),
        start: s.start && { ...s.start, position: clampToBay(s.start.position, bay) } };
      edit(s);
    },
    load({ stage }) {
      state.history = createHistory(assignLabels(stage));
      state.selection = [];
      state.mode = "select";
      state.drag = null;
    },
    beginDraw({ lineType }) { state.mode = { draw: lineType, points: [] }; },
    addPoint({ point }) {
      if (!state.mode?.draw) return;
      const p = fit(point);
      const last = state.mode.points[state.mode.points.length - 1];
      if (last && last[0] === p[0] && last[1] === p[1]) return;
      state.mode = { ...state.mode, points: [...state.mode.points, p] };
    },
    finishDraw() {
      const m = state.mode;
      state.mode = "select";
      if (!m?.draw || m.points.length < LINE_MIN[m.draw]) return;
      const r = addLine(present(), m.draw, m.points, m.draw === "shooting-area");
      edit(r.stage);
      state.selection = [r.id];
    },
    beginStart() { state.mode = "start"; },
    // Looking around in Shooter's eye at the start saves the view (one undo step).
    setStartView({ rotation, pitch }) {
      const st = present().start;
      if (!st || !Number.isFinite(rotation) || !Number.isFinite(pitch)) return;
      const view = { yaw: Math.round(rotation * 10) / 10, pitch: Math.round(Math.max(-89, Math.min(89, pitch)) * 10) / 10 };
      if (st.view && st.view.yaw === view.yaw && st.view.pitch === view.pitch) return;
      edit({ ...present(), start: { ...st, view } });
    },
    // A moving target started by an activator on the stage (by: its id, or null to unlink).
    setActivator({ id, by }) {
      const o = present().objects.find((x) => x.id === id);
      if (!o || !canBeActivated(o.type)) return;
      if (by === null) {
        if (o.activatedBy === undefined) return;
        const rest = { ...o };
        delete rest.activatedBy;
        edit({ ...present(), objects: present().objects.map((x) => (x.id === id ? rest : x)) });
        return;
      }
      const a = present().objects.find((x) => x.id === by);
      if (!a || a.id === id || !isActivator(a.type) || o.activatedBy === by) return;
      edit({ ...present(), objects: present().objects.map((x) => (x.id === id ? { ...x, activatedBy: by } : x)) });
    },
    setStart({ position, facing = 0 }) {
      edit(setStart(present(), fit(position), snapAngle(facing, present().settings.angleSnap)));
      state.mode = "select";
    },
  };

  function dispatch(action) {
    const h = handlers[action.type];
    if (!h) throw new Error(`Unknown editor action: ${action.type}`);
    h(action);
    onChange(state, action);
  }

  return { state, dispatch, stage: present };
}
