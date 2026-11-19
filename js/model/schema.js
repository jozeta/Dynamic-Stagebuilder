// Validation for stage JSON from untrusted places (imported files, browser storage). It builds a
// fresh stage from known keys only, so unknown and "__proto__" keys never get through, and it
// rejects the whole stage on any error: nothing is ever applied halfway.
import { PROPS, TARGET_STYLES } from "./props.js";
import { cleanLook } from "./look.js";

export const SCHEMA_VERSION = 1;
export const ENVIRONMENTS = ["technical", "outdoor", "blueprint"];
const LIMITS = { objects: 2000, lines: 500, points: 500, id: 64, label: 12, name: 120, text: 4000, bay: [1, 200] };
const BRIEFING_TEXT = ["matchName", "designer", "stageType", "startSignal", "startPosition", "gunCondition",
  "procedure", "stopTime", "notes", "scoring"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

// Stages saved before no-shoots became a target presentation had separate no-shoot props.
const OLD_NOSHOOTS = { noshoot: "paper-ipsc", "noshoot-mini": "paper-mini" };
function migrateObject(o) {
  if (!Object.hasOwn(OLD_NOSHOOTS, o.type)) return o;
  return { ...o, type: OLD_NOSHOOTS[o.type], params: { ...(isObj(o.params) ? o.params : {}), presentation: "noshoot" } };
}

export function validateStage(json) {
  const errors = [];
  const err = (path, msg) => { if (errors.length < 50) errors.push(`${path}: ${msg}`); };
  if (!isObj(json)) return { ok: false, errors: ["stage: not a stage object"] };

  const str = (v, path, max, { allowEmpty = true } = {}) => {
    if (typeof v !== "string") { err(path, "must be text"); return ""; }
    if (v.length > max) err(path, `longer than ${max} characters`);
    if (!allowEmpty && !v.length) err(path, "must not be empty");
    return v;
  };
  const num = (v, path, min, max) => {
    if (!isNum(v)) { err(path, "must be a number"); return 0; }
    if (v < min || v > max) err(path, `must be between ${min} and ${max}`);
    return v;
  };

  if (json.schema !== SCHEMA_VERSION) err("schema", `unsupported version ${JSON.stringify(json.schema)}`);
  const bay = isObj(json.bay) ? json.bay : (err("bay", "missing"), {});
  const width = num(bay.width, "bay.width", ...LIMITS.bay);
  const depth = num(bay.depth, "bay.depth", ...LIMITS.bay);
  const inBay = (p, path) => {
    if (!Array.isArray(p) || p.length !== 2 || !isNum(p[0]) || !isNum(p[1])) { err(path, "must be two numbers [x, z]"); return [0, 0]; }
    if (Math.abs(p[0]) > width / 2 + 5 || p[1] < -5 || p[1] > depth + 5) err(path, "is outside the bay");
    return [p[0], p[1]];
  };

  const ids = new Set();
  const id = (v, path) => {
    const s = str(v, path, LIMITS.id, { allowEmpty: false });
    if (ids.has(s)) err(path, `duplicate id "${s}"`);
    ids.add(s);
    return s;
  };

  const settings = isObj(json.settings) ? json.settings : (err("settings", "missing"), {});
  // Built-in surroundings, or your own ("custom:<id>", Settings → Surroundings → New from a plan).
  if (!ENVIRONMENTS.includes(settings.environment) && !/^custom:[A-Za-z0-9-]{1,64}$/.test(String(settings.environment))) err("settings.environment", `unknown environment ${JSON.stringify(settings.environment)}`);
  const targetStyle = settings.targetStyle ?? "classic";
  if (!TARGET_STYLES.includes(targetStyle)) err("settings.targetStyle", `must be one of ${TARGET_STYLES.join(", ")}`);

  const objectsIn = Array.isArray(json.objects) ? json.objects : (err("objects", "must be a list"), []);
  if (objectsIn.length > LIMITS.objects) err("objects", `more than ${LIMITS.objects} objects`);
  const objects = objectsIn.length > LIMITS.objects ? [] : objectsIn.map((o, i) => {
    const path = `objects[${i}]`;
    if (!isObj(o)) { err(path, "not an object"); return null; }
    o = migrateObject(o);
    const def = typeof o.type === "string" && Object.hasOwn(PROPS, o.type) ? PROPS[o.type] : null;
    if (!def) err(`${path}.type`, `unknown prop type ${JSON.stringify(o.type)}`);
    const params = {};
    const pin = isObj(o.params) ? o.params : {};
    for (const [k, spec] of Object.entries(def?.params || {})) {
      // Steel saved before the paint setting existed was white; keep it white.
      const v = Object.hasOwn(pin, k) ? pin[k] : k === "paint" ? "white" : spec.default;
      if (spec.bool) {
        if (typeof v !== "boolean") err(`${path}.params.${k}`, "must be true or false");
      } else if (spec.options) {
        if (!spec.options.includes(v)) err(`${path}.params.${k}`, `must be one of ${spec.options.join(", ")}`);
      } else num(v, `${path}.params.${k}`, spec.min, spec.max);
      params[k] = v;
    }
    const label = o.label === null || o.label === undefined ? null : str(o.label, `${path}.label`, LIMITS.label);
    return {
      id: id(o.id, `${path}.id`), type: o.type, label, labelManual: o.labelManual === true,
      position: inBay(o.position, `${path}.position`), rotation: num(o.rotation, `${path}.rotation`, -1e6, 1e6), params,
    };
  });

  const linesIn = Array.isArray(json.lines) ? json.lines : (err("lines", "must be a list"), []);
  if (linesIn.length > LIMITS.lines) err("lines", `more than ${LIMITS.lines} lines`);
  const lines = linesIn.length > LIMITS.lines ? [] : linesIn.map((l, i) => {
    const path = `lines[${i}]`;
    if (!isObj(l)) { err(path, "not an object"); return null; }
    if (l.type !== "fault-line" && l.type !== "shooting-area") err(`${path}.type`, `unknown line type ${JSON.stringify(l.type)}`);
    const pts = Array.isArray(l.points) ? l.points : [];
    if (pts.length < 2 || pts.length > LIMITS.points) err(`${path}.points`, `must have 2 to ${LIMITS.points} points`);
    return { id: id(l.id, `${path}.id`), type: l.type, points: pts.slice(0, LIMITS.points).map((p, j) => inBay(p, `${path}.points[${j}]`)), closed: l.closed === true };
  });

  let start = null;
  if (json.start !== null && json.start !== undefined) {
    if (!isObj(json.start)) err("start", "must be an object or null");
    else start = { position: inBay(json.start.position, "start.position"), facing: num(json.start.facing, "start.facing", -1e6, 1e6) };
  }

  const b = isObj(json.briefing) ? json.briefing : (err("briefing", "missing"), {});
  const briefing = {};
  for (const k of BRIEFING_TEXT) briefing[k] = str(b[k] ?? "", `briefing.${k}`, LIMITS.text);
  briefing.stageNumber = num(b.stageNumber ?? 1, "briefing.stageNumber", 0, 999);

  let camera = null;
  if (json.camera !== null && json.camera !== undefined) {
    const c = json.camera;
    const v3 = (v, path) => Array.isArray(v) && v.length === 3 && v.every(isNum) ? [v[0], v[1], v[2]] : (err(path, "must be three numbers"), [0, 0, 0]);
    camera = isObj(c) ? { position: v3(c.position, "camera.position"), target: v3(c.target, "camera.target") } : (err("camera", "must be an object or null"), null);
  }

  const stage = {
    schema: SCHEMA_VERSION,
    id: str(json.id, "id", LIMITS.id, { allowEmpty: false }),
    name: str(json.name, "name", LIMITS.name),
    bay: { width, depth },
    settings: { grid: num(settings.grid, "settings.grid", 0, 5), angleSnap: num(settings.angleSnap, "settings.angleSnap", 0, 90),
      environment: settings.environment, objectSnap: settings.objectSnap !== false, look: cleanLook(settings.look), targetStyle },
    objects, lines, start, briefing, camera,
  };
  return errors.length ? { ok: false, errors } : { ok: true, stage };
}
