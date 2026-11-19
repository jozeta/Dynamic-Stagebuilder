// The stage as plain JSON data (schema 1). Every function returns a new stage and never mutates its
// input, so the undo history can keep snapshots. Coordinates in metres: x across the bay (centred),
// z down range (0 at the uprange edge). Rotation in degrees about the vertical axis.
import { defaultParams, getProp } from "./props.js";
import { LOOK_DEFAULTS } from "./look.js";

const newId = () => crypto.randomUUID();
const SETTINGS = ["grid", "angleSnap", "environment", "objectSnap", "look", "targetStyle"];

export function createStage({ name = "Stage 1", width = 20, depth = 30 } = {}) {
  return {
    schema: 1,
    id: newId(),
    name,
    bay: { width, depth },
    settings: { grid: 0.25, angleSnap: 15, environment: "outdoor", objectSnap: true, look: { ...LOOK_DEFAULTS }, targetStyle: "classic" },
    objects: [],
    lines: [],
    start: null,
    briefing: {
      matchName: "", stageNumber: 1, designer: "", stageType: "", startSignal: "Audible",
      startPosition: "", gunCondition: "", procedure: "", stopTime: "Last shot", notes: "",
      scoring: "Comstock",
    },
    camera: null,
  };
}

export function addObject(stage, type, position, rotation = 0, params = {}) {
  getProp(type);
  const id = newId();
  const obj = { id, type, label: null, labelManual: false, position: [position[0], position[1]], rotation,
    params: { ...defaultParams(type), ...params } };
  return { stage: { ...stage, objects: [...stage.objects, obj] }, id };
}

export function updateObject(stage, id, patch) {
  return {
    ...stage,
    objects: stage.objects.map((o) => o.id !== id ? o : {
      ...o,
      ...(patch.position ? { position: [patch.position[0], patch.position[1]] } : {}),
      ...(patch.rotation !== undefined ? { rotation: patch.rotation } : {}),
      ...(patch.params ? { params: { ...o.params, ...patch.params } } : {}),
    }),
  };
}

export function removeObjects(stage, ids) {
  const gone = new Set(ids);
  return { ...stage, objects: stage.objects.filter((o) => !gone.has(o.id)), lines: stage.lines.filter((l) => !gone.has(l.id)) };
}

export function duplicateObjects(stage, ids, offset = [0.5, 0.5]) {
  const wanted = new Set(ids);
  const copies = stage.objects.filter((o) => wanted.has(o.id)).map((o) => ({
    ...o, id: newId(), label: null, labelManual: false,
    position: [o.position[0] + offset[0], o.position[1] + offset[1]], params: { ...o.params },
  }));
  return { stage: { ...stage, objects: [...stage.objects, ...copies] }, ids: copies.map((c) => c.id) };
}

export function addLine(stage, type, points, closed) {
  if (type !== "fault-line" && type !== "shooting-area") throw new Error(`Unknown line type: ${type}`);
  const id = newId();
  const line = { id, type, points: points.map((p) => [p[0], p[1]]), closed: Boolean(closed) };
  return { stage: { ...stage, lines: [...stage.lines, line] }, id };
}

export function updateLine(stage, id, points) {
  return { ...stage, lines: stage.lines.map((l) => l.id !== id ? l : { ...l, points: points.map((p) => [p[0], p[1]]) }) };
}

export function setStart(stage, position, facing) {
  return { ...stage, start: { position: [position[0], position[1]], facing } };
}

export function setSetting(stage, key, value) {
  if (!SETTINGS.includes(key)) throw new Error(`Unknown setting: ${key}`);
  return { ...stage, settings: { ...stage.settings, [key]: value } };
}

export function setBay(stage, width, depth) {
  return { ...stage, bay: { width, depth } };
}

export function setBriefing(stage, patch) {
  return { ...stage, briefing: { ...stage.briefing, ...patch } };
}

export function pruneSelection(selection, stage) {
  const ids = new Set([...stage.objects.map((o) => o.id), ...stage.lines.map((l) => l.id)]);
  return selection.filter((id) => ids.has(id));
}
