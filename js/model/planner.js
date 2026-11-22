// Suggested shooting positions: a realistic way to shoot a stage, worked out from its layout.
//
// Sight lines are checked in plan view with heights: walls, vision barriers and buildings block
// (mesh walls too: in IPSC they are vision barriers); you see through ports, open doorways and
// over anything lower than the sight line, and under a raised barricade. Positions stand inside
// the shooting areas, never in a wall. The plan picks as few positions as it can, each seeing new
// targets, preferring short moves from the last one; a position kneels only when a low port is the
// only way to see its targets. Each position faces the targets it engages, and the walk to it goes
// round walls (a grab point past the wall's end). Pure: no DOM, no Three.js.
import { getProp, paperSize, CAR_MODELS, CONTAINERS, MOVING, STICK } from "./props.js";
import { portRect, doorRect } from "./wall-port.js";

// Stances the plan may use, with eye height and a cost (standing is preferred; lower stances are
// chosen only when a low port or gap is the way to see the targets).
const EYE = { standing: 1.6, crouching: 1.15, kneeling: 0.95, prone: 0.3 };
const STANCE_COST = { standing: 0, crouching: 4, kneeling: 6, prone: 12 };
const CLEAR = 0.35;             // a position keeps this far from any wall

const rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

/** Point in polygon ([x, z] points), even-odd rule. */
export function insidePolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > p[1]) !== (zj > p[1]) && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// A blocking segment: ends a and b, its height, and openings along it (u from the centre, metres):
// { u0, u1, y0, y1, walk } (walk: you can walk through it, e.g. a doorway).
function segment(centre, deg, length, height, openings = []) {
  const d = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const a = [centre[0] - (d[0] * length) / 2, centre[1] - (d[1] * length) / 2], b = [centre[0] + (d[0] * length) / 2, centre[1] + (d[1] * length) / 2];
  return {
    a, b, dir: d, length, height, openings,
    dist(p) {
      const v = sub(b, a), w = sub(p, a), k = Math.max(0, Math.min(1, (w[0] * v[0] + w[1] * v[1]) / (length * length || 1)));
      return Math.hypot(p[0] - (a[0] + v[0] * k), p[1] - (a[1] + v[1] * k));
    },
  };
}
function rect(o, length, width, height) {
  const d = [Math.cos(rad(o.rotation)), Math.sin(rad(o.rotation))], n = [-d[1], d[0]];
  const c = o.position;
  // A solid footprint: nobody stands inside a car or a container.
  const inside = (p) => { const v = sub(p, c); return Math.abs(v[0] * d[0] + v[1] * d[1]) < length / 2 && Math.abs(v[0] * n[0] + v[1] * n[1]) < width / 2; };
  return [[length, width, n, 0], [length, -width, n, 0], [width, length, d, 90], [width, -length, d, 90]].map(([len, off, axis, turn]) =>
    Object.assign(segment([c[0] + (axis[0] * off) / 2, c[1] + (axis[1] * off) / 2], o.rotation + turn, len, height), { inside }));
}

/** Everything on the stage that blocks sight or walking. */
export function blockers(stage) {
  const out = [];
  for (const o of stage.objects) {
    const p = o.params || {};
    switch (o.type) {
      case "wall-mesh": case "wall-wood": {
        // A plain wall, a port to shoot through, or a doorway to walk through (model/wall-port.js).
        const r = p.variant === "port" ? portRect(p) : p.variant === "doorway" ? doorRect(p) : null;
        out.push(segment(o.position, o.rotation, p.length, p.height, r ? [{ u0: r.x0, u1: r.x1, y0: r.y0, y1: r.y1, walk: p.variant === "doorway" }] : [])); break;
      }
      case "wall-solid": case "hardcover-panel": case "building-wall":
        out.push(segment(o.position, o.rotation, p.length, p.height)); break;
      case "wall-port-shutter": {
        const r = portRect(p);
        out.push(segment(o.position, o.rotation, p.length, p.height, [{ u0: r.x0, u1: r.x1, y0: r.y0, y1: r.y1, walk: false }])); break;
      }
      case "door": {
        const L = p.doorWidth + 2 * STICK + 0.02;              // the shooter opens the door
        out.push(segment(o.position, o.rotation, L, p.height, [{ u0: -p.doorWidth / 2, u1: p.doorWidth / 2, y0: 0, y1: p.height - STICK, walk: true }])); break;
      }
      case "raised-barricade":
        out.push(segment(o.position, o.rotation, p.length, p.gap + p.panelHeight, [{ u0: -p.length / 2, u1: p.length / 2, y0: 0, y1: p.gap, walk: false }])); break;
      case "container": { const c = CONTAINERS[p.size] || CONTAINERS["20ft"]; out.push(...rect(o, c.length, c.width, c.height)); break; }
      case "car": { const m = CAR_MODELS[p.model] || CAR_MODELS.sedan; out.push(...rect(o, m.length, m.width, m.height * 0.75)); break; }
    }
  }
  return out;
}

// Where segment p→q crosses a blocker: { t along p→q, u along the wall from its centre } or null.
function crossing(w, p, q) {
  const r = sub(q, p), s = sub(w.b, w.a), den = cross(r, s);
  if (Math.abs(den) < 1e-9) return null;
  const t = cross(sub(w.a, p), s) / den, k = cross(sub(w.a, p), r) / den;
  if (t <= 1e-6 || t >= 1 - 1e-6 || k < 0 || k > 1) return null;
  return { t, u: (k - 0.5) * w.length };
}

/** Can an eye at `from` (height eyeH) see a target point at `to` (height th)? true or null. */
export function canSee(bs, from, eyeH, to, th) {
  for (const w of bs) {
    const c = crossing(w, from, to);
    if (!c) continue;
    const y = eyeH + (th - eyeH) * c.t;
    if (y > w.height + 0.05) continue;                                  // over it
    const open = w.openings.some((g) => c.u > g.u0 + 0.05 && c.u < g.u1 - 0.05 && y > g.y0 + 0.03 && y < g.y1 - 0.03);
    if (!open) return null;
  }
  return true;
}

/** Does walking straight from p to q go through a blocker (other than a doorway)? */
export function crossesBlocker(bs, p, q) {
  return bs.some((w) => { const c = crossing(w, p, q); return c && !w.openings.some((g) => g.walk && c.u > g.u0 + 0.15 && c.u < g.u1 - 0.15); });
}

// Points worth shooting on a target: the centre, the upper part and both sides (as seen face on).
// A target counts as seen if any of them is.
export function aimPoints(o) {
  const h = aimHeight(o), d = [Math.cos(rad(o.rotation || 0)), Math.sin(rad(o.rotation || 0))];
  const half = o.type.startsWith("paper") ? paperSize(o).w * 0.35 : 0.1;
  const top = o.type.startsWith("paper") ? (o.params.mountHeight ?? 0) + paperSize(o).h * 0.85 : h + 0.1;
  const at = (k, y) => [o.position[0] + d[0] * k, o.position[1] + d[1] * k, y];
  return [at(0, h), at(0, top), at(-half, h), at(half, h)];
}

// The height to aim at on each target.
function aimHeight(o) {
  const p = o.params || {};
  switch (o.type) {
    case "paper-ipsc": case "paper-mini": return p.mountHeight + paperSize(o).h * 0.5;
    case "popper": return (p.baseHeight || 0) + (p.kind === "mini" ? 0.45 : 0.65);
    case "plate-round": case "plate-square": return p.baseHeight + p.size / 2;
    case "texas-star": return MOVING.star.hub;
    case "plate-rack": return MOVING.rack.centre;
    case "dueling-tree": return 1.3;
    case "bobber": return 1.25;
    default: return 1.2;
  }
}

/** Facing (object rotation, degrees) from p toward q: 0 looks down range. */
const faceToward = (p, q) => ((Math.atan2(-(q[0] - p[0]), q[1] - p[1]) * 180) / Math.PI + 360) % 360;

// A way round: the shortest walk from p to q that doesn't go through a wall, turning only at
// points just off the walls' corners (a visibility graph, searched with Dijkstra). The turns are
// the route's grab points.
function detour(bs, p, q, bay) {
  if (!crossesBlocker(bs, p, q)) return [];
  const inBay = (v) => !bay || (Math.abs(v[0]) <= bay.width / 2 && v[1] >= 0 && v[1] <= bay.depth);
  const corners = [];
  for (const w of bs) {
    const n = [-w.dir[1], w.dir[0]];
    for (const [e, k] of [[w.a, -1], [w.b, 1]]) for (const side of [1, -1]) {
      const c = [e[0] + w.dir[0] * k * 0.45 + n[0] * side * 0.45, e[1] + w.dir[1] * k * 0.45 + n[1] * side * 0.45];
      if (inBay(c) && !bs.some((b) => b.dist(c) < 0.3)) corners.push(c);
    }
  }
  const nodes = [p, q, ...corners];
  const dist = nodes.map(() => Infinity), from = nodes.map(() => -1), done = nodes.map(() => false);
  dist[0] = 0;
  for (;;) {
    let i = -1;
    for (let k = 0; k < nodes.length; k++) if (!done[k] && dist[k] < Infinity && (i < 0 || dist[k] < dist[i])) i = k;
    if (i < 0 || i === 1) break;
    done[i] = true;
    for (let k = 0; k < nodes.length; k++) {
      if (done[k] || k === i) continue;
      const d = dist[i] + Math.hypot(nodes[k][0] - nodes[i][0], nodes[k][1] - nodes[i][1]);
      if (d < dist[k] && !crossesBlocker(bs, nodes[i], nodes[k])) { dist[k] = d; from[k] = i; }
    }
  }
  if (dist[1] === Infinity) return [];
  const path = [];
  for (let k = from[1]; k > 0; k = from[k]) path.unshift(nodes[k].map((v) => Math.round(v * 100) / 100));
  return path;
}

/**
 * A plan: { positions: [{ position, rotation, stance, engages: [target ids], via }], unseen: [ids] }.
 */
export function planPositions(stage) {
  const bs = blockers(stage);
  const areas = stage.lines.filter((l) => l.type === "shooting-area" && l.points.length >= 3);
  const tgs = stage.objects.filter((o) => ["paper", "steel"].includes(getProp(o.type).scoring)).map((o) => ({ id: o.id, at: o.position, aims: aimPoints(o) }));
  const sees = (p, eye, t) => t.aims.some(([x, z, y]) => canSee(bs, p, eye, [x, z], y));
  // Candidate spots: a 0.5 m grid inside each shooting area (and its centre), clear of walls.
  const spots = [];
  for (const a of areas) {
    const xs = a.points.map((p) => p[0]), zs = a.points.map((p) => p[1]);
    const c = [xs.reduce((s, v) => s + v, 0) / xs.length, zs.reduce((s, v) => s + v, 0) / zs.length];
    const pts = [c];
    for (let x = Math.ceil(Math.min(...xs) * 4) / 4; x <= Math.max(...xs); x += 0.25) for (let z = Math.ceil(Math.min(...zs) * 4) / 4; z <= Math.max(...zs); z += 0.25) pts.push([x, z]);
    for (const p of pts) if (insidePolygon(p, a.points) && !bs.some((w) => w.dist(p) < CLEAR || w.inside?.(p))) spots.push(p);
  }
  if (stage.start && areas.some((a) => insidePolygon(stage.start.position, a.points))) spots.unshift([...stage.start.position]);
  const options = spots.flatMap((p) => Object.entries(EYE).map(([stance, eye]) => ({ p, stance, sees: new Set(tgs.filter((t) => sees(p, eye, t)).map((t) => t.id)) })));
  let remaining = new Set(tgs.map((t) => t.id));
  let prev = stage.start?.position ?? spots[0] ?? [0, 0];
  const positions = [];
  while (remaining.size) {
    let best = null, bestScore = -Infinity;
    for (const o of options) {
      const n = [...o.sees].filter((id) => remaining.has(id)).length;
      if (!n) continue;
      const score = n * 10 - Math.hypot(o.p[0] - prev[0], o.p[1] - prev[1]) * 1.2 - STANCE_COST[o.stance];
      if (score > bestScore) { bestScore = score; best = o; }
    }
    if (!best) break;
    const engages = [...best.sees].filter((id) => remaining.has(id));
    const at = engages.map((id) => tgs.find((t) => t.id === id).at);
    const mid = [at.reduce((s, v) => s + v[0], 0) / at.length, at.reduce((s, v) => s + v[1], 0) / at.length];
    positions.push({ position: [best.p[0], best.p[1]], rotation: Math.round(faceToward(best.p, mid)), stance: best.stance, engages, via: detour(bs, prev, best.p, stage.bay) });
    remaining = new Set([...remaining].filter((id) => !best.sees.has(id)));
    prev = best.p;
  }
  return { positions, unseen: [...remaining] };
}
