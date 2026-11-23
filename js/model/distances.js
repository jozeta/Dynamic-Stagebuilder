// The printed distance sheet: every prop and the start box joined by the shortest set of lines that
// connects them all (a minimum spanning tree, Prim's algorithm), so each item has a measured line to
// a near neighbour without a web of lines. Lengths centre to centre, in metres with one decimal.
// Pure: no DOM.
import { propName } from "./props.js";

const round1 = (m) => Math.round(m * 10) / 10;

/** The lines: [{ a, b, metres, text }], a and b being { id, name, position }. */
export function distancePairs(stage) {
  const items = stage.objects.map((o) => ({ id: o.id, name: o.label ? `${o.label}` : propName(o), position: o.position }));
  // Unlabelled props that share a name are numbered in stage order (Mesh wall 1, Mesh wall 2…).
  const count = new Map();
  for (const it of items) count.set(it.name, (count.get(it.name) ?? 0) + 1);
  const seen = new Map();
  for (const it of items) if (count.get(it.name) > 1) { const n = (seen.get(it.name) ?? 0) + 1; seen.set(it.name, n); it.name = `${it.name} ${n}`; }
  if (stage.start) items.push({ id: "start", name: "Start", position: stage.start.position });
  if (items.length < 2) return [];
  const dist = (a, b) => Math.hypot(a.position[0] - b.position[0], a.position[1] - b.position[1]);
  const inTree = new Set([0]);
  const best = items.map((it, i) => ({ d: i ? dist(items[0], it) : Infinity, from: 0 }));
  const pairs = [];
  while (inTree.size < items.length) {
    let next = -1;
    for (let i = 0; i < items.length; i++) if (!inTree.has(i) && (next < 0 || best[i].d < best[next].d)) next = i;
    inTree.add(next);
    const metres = round1(best[next].d);
    pairs.push({ a: items[best[next].from], b: items[next], metres, text: `${metres.toFixed(1)} m` });
    for (let i = 0; i < items.length; i++) {
      if (inTree.has(i)) continue;
      const d = dist(items[next], items[i]);
      if (d < best[i].d) best[i] = { d, from: next };
    }
  }
  return pairs;
}
