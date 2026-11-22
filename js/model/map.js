// The printed top-down map as plain shapes in millimetres (no DOM). Seen from above with down range
// at the top; the map is the 3D world turned 180° (both axes mirrored), so +x (the shooter's left)
// is on the left, as in the 3D view.
import { dimensionsOf, getProp, STICK } from "./props.js";
import { arrayCounts } from "./arrays.js";
import { bayOutline, isRect, isDrawn } from "./bay.js";

const ROUND = new Set(["shooting-position", "barrel", "tyre", "plate-round", "plant-palm", "cone"]);
const CARD_DEPTH = 0.03;   // paper targets are drawn as their thin face, not their stand

function style(o) {
  const p = getProp(o.type);
  if (p.scoring === "position") return "position";
  if (o.type === "hardcover-panel") return "hardcover";
  if (p.scoring === "paper") return arrayCounts(o).paper ? "paper" : "noshoot";
  if (p.scoring === "steel") return "steel";
  if (p.category === "wall") return "wall";
  return "obstacle";
}

// The ground area the map shows: the whole bay, or ("content") what is on the stage with a margin,
// kept inside the bay. In world metres: x from minX to maxX, z from minZ to maxZ.
function regionOf(stage, region) {
  const { width: bw, depth: bd } = stage.bay;
  const bay = { minX: -bw / 2, maxX: bw / 2, minZ: 0, maxZ: bd };
  if (region !== "content") return bay;
  const pts = [];
  for (const o of stage.objects) {
    const d = dimensionsOf(o), r = Math.hypot(d.w, d.d) / 2;
    pts.push([o.position[0] - r, o.position[1] - r], [o.position[0] + r, o.position[1] + r]);
  }
  for (const l of stage.lines) pts.push(...l.points);
  if (stage.start) pts.push([stage.start.position[0] - 1, stage.start.position[1] - 1], [stage.start.position[0] + 1, stage.start.position[1] + 1]);
  if (!pts.length) return bay;
  const PAD = 1.5;
  return {
    minX: Math.max(bay.minX, Math.min(...pts.map((p) => p[0])) - PAD), maxX: Math.min(bay.maxX, Math.max(...pts.map((p) => p[0])) + PAD),
    minZ: Math.max(bay.minZ, Math.min(...pts.map((p) => p[1])) - PAD), maxZ: Math.min(bay.maxZ, Math.max(...pts.map((p) => p[1])) + PAD),
  };
}

const LABEL_FONT = 2.6;   // mm
const labelSize = (text) => ({ w: text.length * LABEL_FONT * 0.62 + 0.8, h: LABEL_FONT * 1.05 });

// Labels that would cover each other move to the next free place: above, below, then to the sides.
function placeLabels(labels) {
  const placed = [];
  const hits = (a, b) => a.x - a.w / 2 < b.x + b.w / 2 && b.x - b.w / 2 < a.x + a.w / 2 && a.y - a.h < b.y && b.y - b.h < a.y;
  for (const l of labels) {
    const tries = [[0, 0], [0, l.h + 2.6], [l.w * 0.9, l.h * 0.6], [-l.w * 0.9, l.h * 0.6], [0, -l.h - 0.2], [l.w * 1.8, 0], [-l.w * 1.8, 0], [0, 2 * l.h + 2.6], [0, -2 * l.h - 0.2]];
    let best = null;
    for (const [dx, dy] of tries) {
      const c = { ...l, x: l.x + dx, y: l.y + dy };
      if (!placed.some((p) => hits(c, p))) { best = c; break; }
    }
    placed.push(best || l);
  }
  return placed;
}

/** The ground area a map shows (see regionOf), for sizing its box. */
export const mapRegion = (stage, region = "bay") => regionOf(stage, region);

export function mapModel(stage, { width, height, margin = 4, region = "bay" }) {
  const { width: bw, depth: bd } = stage.bay;
  const r = regionOf(stage, region);
  const rw = r.maxX - r.minX, rd = r.maxZ - r.minZ;
  const scale = Math.min((width - 2 * margin) / rw, (height - 2 * margin) / rd);
  const cx = width / 2, cy = height / 2;
  const mx = (r.minX + r.maxX) / 2, mz = (r.minZ + r.maxZ) / 2;
  const pt = ([x, z]) => [cx - (x - mx) * scale, cy + (mz - z) * scale];
  const items = [];

  const [bx0, by0] = pt([bw / 2, bd]);
  items.push({ kind: "bay", x: bx0, y: by0, w: bw * scale, h: bd * scale, ...(isRect(stage.bay) ? {} : { points: bayOutline(stage.bay).map(pt) }) });
  // A drawn bay's raised ground: a shaded strip for each run of raised cells in a row.
  if (isDrawn(stage.bay)) stage.bay.rows.forEach((row, r) => {
    for (const m of row.matchAll(/1+/g)) {
      const [x0, y0] = pt([bw / 2 - m.index, r + 1]);
      items.push({ kind: "raised", x: x0, y: y0, w: m[0].length * scale, h: scale });
    }
  });
  items.push({ kind: "frame", x: cx - (rw / 2) * scale, y: cy - (rd / 2) * scale, w: rw * scale, h: rd * scale });
  for (let x = Math.ceil(r.minX); x <= Math.floor(r.maxX); x++) items.push({ kind: "grid", points: [pt([x, r.minZ]), pt([x, r.maxZ])] });
  for (let z = Math.ceil(r.minZ); z <= Math.floor(r.maxZ); z++) items.push({ kind: "grid", points: [pt([r.minX, z]), pt([r.maxX, z])] });

  for (const l of stage.lines) {
    items.push({ kind: "poly", points: l.points.map(pt), closed: l.closed, style: l.type === "shooting-area" ? "area" : "fault" });
  }

  const labels = [];
  for (const o of stage.objects) {
    const [x, y] = pt(o.position);
    const d = dimensionsOf(o);
    const st = style(o);
    if (ROUND.has(o.type)) {
      const diameter = o.type === "plate-round" ? o.params.size : d.w;
      items.push({ kind: "circle", x, y, r: Math.max((diameter / 2) * scale, 0.6), style: st });
    } else {
      // Paper targets are thin: draw them at least 0.8 mm deep so they stay visible.
      const paper = st === "paper" || st === "noshoot";
      // Walls are drawn as their frame (not the feet); paper targets as their thin face.
      const width = d.w * scale;
      const depth = paper ? Math.max(CARD_DEPTH * scale, 0.8) : st === "wall" || st === "hardcover" ? Math.max(STICK * scale, 0.6) : Math.max(d.d * scale, 0.5);
      items.push({ kind: "rect", x, y, w: width, h: depth, rotation: o.rotation, style: st });
    }
    if (o.label && getProp(o.type).scoring) labels.push({ kind: "label", x, y: y - 1.6, text: o.label, style: st, ...labelSize(o.label) });
  }

  items.push(...placeLabels(labels));

  if (stage.start) {
    const [x, y] = pt(stage.start.position);
    items.push({ kind: "start", x, y, size: scale, rotation: stage.start.facing });
  }

  const metres = rw < 10 && rd < 10 ? 2 : 5;
  items.push({ kind: "scalebar", x: margin, y: height - 1.5, length: metres * scale, metres });
  return { scale, items, region: r };
}
