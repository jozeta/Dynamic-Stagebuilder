// The printed distance sheet: every prop and the start box joined by the shortest set of lines that
// connects them all (a minimum spanning tree, Prim's algorithm), so each item has a measured line to
// a near neighbour without a web of lines. Only straight lines, as a stage builder measures with a
// tape: from A down range to B's distance, then across to B, each leg with its own length. Centre
// to centre, in metres with one decimal. Pure: no DOM.
import { propName } from "./props.js";

const round1 = (m) => Math.round(m * 10) / 10;

// The legs from a to b: down range (axis "z") first, then across (axis "x"); a leg that rounds to 0.0 m is left out.
function legsOf([ax, az], [bx, bz]) {
  const leg = (axis, from, to) => { const metres = round1(Math.abs(axis === "z" ? to[1] - from[1] : to[0] - from[0])); return { axis, from, to, metres, text: `${metres.toFixed(1)} m` }; };
  return [leg("z", [ax, az], [ax, bz]), leg("x", [ax, bz], [bx, bz])].filter((l) => l.metres > 0);
}

/**
 * The lines: [{ a, b, legs, metres, text }], a and b being { id, name, position }; legs as legsOf;
 * metres the two legs together; text "4.0 m down range, 3.0 m across" (a leg left out if none).
 */
export function distancePairs(stage) {
  const items = stage.objects.map((o) => ({ id: o.id, name: o.label ? `${o.label}` : propName(o), position: o.position }));
  // Unlabelled props that share a name are numbered in stage order (Mesh wall 1, Mesh wall 2…).
  const count = new Map();
  for (const it of items) count.set(it.name, (count.get(it.name) ?? 0) + 1);
  const seen = new Map();
  for (const it of items) if (count.get(it.name) > 1) { const n = (seen.get(it.name) ?? 0) + 1; seen.set(it.name, n); it.name = `${it.name} ${n}`; }
  if (stage.start) items.push({ id: "start", name: "Start", position: stage.start.position });
  if (items.length < 2) return [];
  // Neighbours by the length of the drawn legs (across plus down range).
  const dist = (a, b) => Math.abs(a.position[0] - b.position[0]) + Math.abs(a.position[1] - b.position[1]);
  const inTree = new Set([0]);
  const best = items.map((it, i) => ({ d: i ? dist(items[0], it) : Infinity, from: 0 }));
  const pairs = [];
  while (inTree.size < items.length) {
    let next = -1;
    for (let i = 0; i < items.length; i++) if (!inTree.has(i) && (next < 0 || best[i].d < best[next].d)) next = i;
    inTree.add(next);
    const a = items[best[next].from], b = items[next];
    const legs = legsOf(a.position, b.position);
    const text = legs.map((l) => `${l.text} ${l.axis === "z" ? "down range" : "across"}`).join(", ") || "0.0 m";
    pairs.push({ a, b, legs, metres: round1(best[next].d), text });
    for (let i = 0; i < items.length; i++) {
      if (inTree.has(i)) continue;
      const d = dist(items[next], items[i]);
      if (d < best[i].d) best[i] = { d, from: next };
    }
  }
  return pairs;
}
