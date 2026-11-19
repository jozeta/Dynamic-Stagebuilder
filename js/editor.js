// The editor: turns user actions into stage edits. Every edit is snapped to the grid and angle
// settings, kept inside the bay, numbered, and committed to the undo history as one step. No DOM,
// no Three.js, so it runs under node --test.
import { createStage, addObject, updateObject, removeObjects, duplicateObjects, addLine, setStart,
  setSetting, setBay, setBriefing, pruneSelection } from "./model/stage.js";
import { createHistory, commit, replacePresent, undo, redo } from "./model/history.js";
import { assignLabels, renumber, setLabel } from "./model/numbering.js";
import { snapPoint, snapAngle, clampToBay } from "./model/snap.js";
import { getProp } from "./model/props.js";
import { snapToObjects } from "./model/objsnap.js";

const STAGE_TYPES = ["", "Short", "Medium", "Long"];
const BRIEFING_TEXT = ["matchName", "designer", "startSignal", "startPosition", "gunCondition", "procedure", "stopTime", "notes", "scoring"];
const LINE_MIN = { "fault-line": 2, "shooting-area": 3 };
const clampNum = (v, min, max) => Math.min(max, Math.max(min, v));

export function createEditor({ stage = createStage(), onChange = () => {} } = {}) {
  const state = { history: createHistory(assignLabels(stage)), selection: [], mode: "select", drag: null };
  const present = () => state.history.present;
  const fit = (p, s = present()) => clampToBay(snapPoint(p, s.settings.grid), s.bay);
  let lastGrid = stage.settings.grid || 0.25;

  // Where one object lands: on a nearby wall end (object snap), else on the grid; a fine (Shift)
  // move skips both. Always inside the bay.
  function landing(s, obj, raw, fine = false) {
    if (fine) return clampToBay(raw, s.bay);
    if (s.settings.objectSnap !== false) {
      const r = snapToObjects(s, obj, raw);
      if (r.snapped) return clampToBay(r.position, s.bay);
    }
    return fit(raw, s);
  }

  function edit(next) {
    state.history = commit(state.history, assignLabels(next));
    state.selection = pruneSelection(state.selection, present());
  }

  function cleanParams(type, params) {
    const out = {};
    for (const [k, v] of Object.entries(params)) {
      const spec = getProp(type).params[k];
      if (!spec) continue;
      if (spec.options) { if (spec.options.includes(v)) out[k] = v; }
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
    const env = present().settings.environment;
    state.history = step(state.history);
    if (present().settings.environment !== env) state.history = replacePresent(state.history, setSetting(present(), "environment", env));
    state.selection = pruneSelection(state.selection, present());
  }

  const handlers = {
    setMode({ mode }) { state.mode = mode; },
    cancel() { state.mode = "select"; },
    select({ ids, add }) {
      if (!add) state.selection = [...ids];
      else for (const id of ids) state.selection = state.selection.includes(id) ? state.selection.filter((x) => x !== id) : [...state.selection, id];
    },
    place({ propType, position, rotation = 0 }) {
      const r = addObject(present(), propType, position, snapAngle(rotation, present().settings.angleSnap));
      const obj = r.stage.objects.find((o) => o.id === r.id);
      edit(updateObject(r.stage, r.id, { position: landing(r.stage, obj, position) }));
      state.selection = [r.id];
      state.mode = "select";
    },
    move({ id, position }) {
      const o = present().objects.find((x) => x.id === id);
      if (o) edit(updateObject(present(), id, { position: landing(present(), o, position) }));
    },
    dragStart({ ids }) { state.drag = { base: state.history, ids: [...ids] }; },
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
      for (const id of ids) {
        const o = s.objects.find((x) => x.id === id);
        if (o) s = updateObject(s, id, { rotation: snapAngle(o.rotation + by, s.settings.angleSnap) });
      }
      edit(s);
    },
    setRotation({ id, value }) { edit(updateObject(present(), id, { rotation: snapAngle(Number(value) || 0, present().settings.angleSnap) })); },
    setParams({ id, params }) {
      const o = present().objects.find((x) => x.id === id);
      if (o) edit(updateObject(present(), id, { params: cleanParams(o.type, params) }));
    },
    delete({ ids = state.selection }) { edit(removeObjects(present(), ids)); state.selection = []; },
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
    setEnvironment({ name }) { state.history = replacePresent(state.history, setSetting(present(), "environment", name)); },
    setSetting({ key, value }) {
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
    setBay({ width, depth }) {
      const bay = { width: clampNum(Number(width) || 1, 1, 200), depth: clampNum(Number(depth) || 1, 1, 200) };
      let s = setBay(present(), bay.width, bay.depth);
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
