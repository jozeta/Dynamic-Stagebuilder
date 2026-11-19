// Arranging props: mirror left to right, align, and spread evenly. Pure: no DOM, no Three.js.
// Positions are [x, z]: x across the bay (centred, + is the shooter's left), z down range.
const r3 = (v) => Math.round(v * 1000) / 1000 + 0;          // + 0 turns −0 into 0
const norm = (deg) => ((Math.round(deg) % 360) + 360) % 360;
const SWAP = { left: "right", right: "left" };
// Left/right parameter values that a mirror swaps: door hinges, no-shoots over one side, side hard cover.
const MIRRORED = { "ns-left": "ns-right", "ns-right": "ns-left", "left-1/2": "right-1/2", "right-1/2": "left-1/2" };
const PARAM_SWAPS = { hinge: SWAP, presentation: MIRRORED, hardCover: MIRRORED };
function mirroredParams(params) {
  if (!params) return params;
  let out = params;
  for (const [k, map] of Object.entries(PARAM_SWAPS)) if (map[params[k]]) out = { ...out, [k]: map[params[k]] };
  return out;
}

/**
 * Mirror left to right. With ids null or empty: the whole stage about the bay centre (x = 0), with
 * its lines and start. With ids: those props and lines about their own centre. Rotations flip, and
 * a door's hinge side swaps. `skip` holds ids that stay put (locked props).
 */
export function mirrorStage(stage, ids, skip = new Set()) {
  const all = !ids || !ids.length;
  const pick = all ? null : new Set(ids);
  const takes = (id) => (all || pick.has(id)) && !skip.has(id);
  let c = 0;
  if (!all) {
    const xs = [...stage.objects.filter((o) => takes(o.id)).map((o) => o.position[0]),
      ...stage.lines.filter((l) => takes(l.id)).flatMap((l) => l.points.map((p) => p[0]))];
    if (!xs.length) return stage;
    c = (Math.min(...xs) + Math.max(...xs)) / 2;
  }
  const fx = (x) => r3(2 * c - x);
  const objects = stage.objects.map((o) => {
    if (!takes(o.id)) return o;
    const params = mirroredParams(o.params);
    return { ...o, position: [fx(o.position[0]), o.position[1]], rotation: norm(-o.rotation), params,
      ...(o.via ? { via: o.via.map(([x, z]) => [fx(x), z]) } : {}) };
  });
  const lines = stage.lines.map((l) => (takes(l.id) ? { ...l, points: l.points.map(([x, z]) => [fx(x), z]) } : l));
  // The start box mirrors with the whole stage; its saved Shooter's eye view no longer fits.
  const start = all && stage.start ? { position: [fx(stage.start.position[0]), stage.start.position[1]], facing: norm(-stage.start.facing) } : stage.start;
  return { ...stage, objects, lines, start };
}

const EDGES = {
  // + x is the shooter's left: "left" lines up on the largest x, "right" on the smallest.
  left: [0, (v) => Math.max(...v)], "centre-x": [0, (v) => (Math.min(...v) + Math.max(...v)) / 2], right: [0, (v) => Math.min(...v)],
  front: [1, (v) => Math.min(...v)], "middle-z": [1, (v) => (Math.min(...v) + Math.max(...v)) / 2], back: [1, (v) => Math.max(...v)],
};
export const ALIGN_EDGES = Object.keys(EDGES);

/** Line the props up on one coordinate: left/centre-x/right (x) or front/middle-z/back (z). */
export function alignObjects(stage, ids, edge) {
  const spec = EDGES[edge];
  const set = new Set(ids);
  const objs = stage.objects.filter((o) => set.has(o.id));
  if (!spec || objs.length < 2) return stage;
  const [axis, of] = spec;
  const v = r3(of(objs.map((o) => o.position[axis])));
  return { ...stage, objects: stage.objects.map((o) => {
    if (!set.has(o.id)) return o;
    const p = [...o.position];
    p[axis] = v;
    return { ...o, position: p };
  }) };
}

/** Spread three or more props evenly along x or z: the outer two stay, the rest get equal gaps. */
export function distributeObjects(stage, ids, axis) {
  const a = axis === "z" ? 1 : 0;
  const set = new Set(ids);
  const objs = stage.objects.filter((o) => set.has(o.id)).sort((p, q) => p.position[a] - q.position[a]);
  if (objs.length < 3) return stage;
  const lo = objs[0].position[a], step = (objs[objs.length - 1].position[a] - lo) / (objs.length - 1);
  const to = new Map(objs.map((o, i) => [o.id, r3(lo + step * i)]));
  return { ...stage, objects: stage.objects.map((o) => {
    if (!to.has(o.id)) return o;
    const p = [...o.position];
    p[a] = to.get(o.id);
    return { ...o, position: p };
  }) };
}
