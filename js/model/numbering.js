// Target labels: T1… for paper targets, P1… for steel, NS1… for no-shoots, in placement order. A
// paper array with two scoring targets takes two numbers and shows them as a range ("T2–3").
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

// How many numbers an object takes, and its label for a first number.
const span = (o, p) => (p === PREFIX.paper ? Math.max(1, arrayCounts(o).paper) : 1);
const labelFor = (p, n, k) => (k > 1 ? `${p}${n}–${n + k - 1}` : `${p}${n}`);

// The last number a label uses ("T2–3" → 3), or null when it isn't an automatic-style label.
function numberOf(label, prefix) {
  const m = typeof label === "string" && label.match(/^([A-Z]+)(\d+)(?:–(\d+))?$/);
  return m && m[1] === prefix ? Number(m[3] ?? m[2]) : null;
}
function numbersOf(label, prefix) {
  const m = typeof label === "string" && label.match(/^([A-Z]+)(\d+)(?:–(\d+))?$/);
  if (!m || m[1] !== prefix) return [];
  const out = [];
  for (let n = Number(m[2]); n <= Number(m[3] ?? m[2]); n++) out.push(n);
  return out;
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
    const k = span(o, p), n = (highest[p] || 0) + 1;
    highest[p] = n + k - 1;
    return { ...o, label: labelFor(p, n, k), labelManual: false };
  });
  return changed ? { ...stage, objects } : stage;
}

export function renumber(stage) {
  const taken = {};
  for (const o of stage.objects) {
    const p = labelPrefix(o);
    if (p && o.labelManual) for (const n of numbersOf(o.label, p)) (taken[p] ||= new Set()).add(n);
  }
  const next = {};
  const objects = stage.objects.map((o) => {
    const p = labelPrefix(o);
    if (!p || o.labelManual) return o;
    const k = span(o, p);
    let n = (next[p] || 0) + 1;
    while ([...Array(k)].some((_, i) => taken[p]?.has(n + i))) n++;
    next[p] = n + k - 1;
    return { ...o, label: labelFor(p, n, k) };
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
