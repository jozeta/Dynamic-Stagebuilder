// Target labels: T1… for paper targets, P1… for steel, NS1… for no-shoots, in placement order.
// New targets get the next free number (gaps are kept until Renumber); hand-set labels are kept.
import { getProp } from "./props.js";
import { arrayCounts } from "./arrays.js";

const PREFIX = { paper: "T", steel: "P", noshoot: "NS" };
const MAX_LABEL = 12;

/** The label prefix for an object (or a prop type): a paper array that is only no-shoots is NS. */
export function labelPrefix(objOrType) {
  const o = typeof objOrType === "string" ? { type: objOrType, params: {} } : objOrType;
  const kind = getProp(o.type).scoring;
  if (kind === "paper" && arrayCounts(o).paper === 0) return PREFIX.noshoot;
  return PREFIX[kind] ?? null;
}

function numberOf(label, prefix) {
  const m = typeof label === "string" && label.match(/^([A-Z]+)(\d+)$/);
  return m && m[1] === prefix ? Number(m[2]) : null;
}

export function assignLabels(stage) {
  const highest = {};
  for (const o of stage.objects) {
    const p = labelPrefix(o);
    const n = p && numberOf(o.label, p);
    if (n) highest[p] = Math.max(highest[p] || 0, n);
  }
  let changed = false;
  const objects = stage.objects.map((o) => {
    const p = labelPrefix(o);
    if (!p || o.label !== null) return o;
    changed = true;
    highest[p] = (highest[p] || 0) + 1;
    return { ...o, label: `${p}${highest[p]}`, labelManual: false };
  });
  return changed ? { ...stage, objects } : stage;
}

export function renumber(stage) {
  const taken = {};
  for (const o of stage.objects) {
    const p = labelPrefix(o);
    const n = p && o.labelManual && numberOf(o.label, p);
    if (n) (taken[p] ||= new Set()).add(n);
  }
  const next = {};
  const objects = stage.objects.map((o) => {
    const p = labelPrefix(o);
    if (!p || o.labelManual) return o;
    let n = (next[p] || 0) + 1;
    while (taken[p]?.has(n)) n++;
    next[p] = n;
    return { ...o, label: `${p}${n}` };
  });
  return { ...stage, objects };
}

export function setLabel(stage, id, text) {
  const label = String(text ?? "").trim().slice(0, MAX_LABEL);
  const objects = stage.objects.map((o) => o.id !== id ? o
    : label ? { ...o, label, labelManual: true } : { ...o, label: null, labelManual: false });
  return assignLabels({ ...stage, objects });
}

export function duplicateLabels(stage) {
  const seen = new Set();
  const dups = new Set();
  for (const o of stage.objects) {
    if (o.label === null) continue;
    if (seen.has(o.label)) dups.add(o.label);
    seen.add(o.label);
  }
  return [...dups];
}
