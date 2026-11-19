// The printed top-down map as plain shapes in millimetres (no DOM). Seen from above with down range
// at the top; the map is the 3D world turned 180° (both axes mirrored), so +x (the shooter's left)
// is on the left, as in the 3D view.
import { dimensionsOf, getProp, paperSize, STICK } from "./props.js";

const ROUND = new Set(["barrel", "tyre", "tyre-stack", "plate-round", "plant-palm", "cone"]);
const CARD_DEPTH = 0.03;   // paper targets are drawn as their thin face, not their stand

function style(type) {
  const p = getProp(type);
  if (p.scoring === "noshoot") return "noshoot";
  if (p.scoring === "paper") return "paper";
  if (p.scoring === "steel") return "steel";
  if (p.category === "wall") return "wall";
  return "obstacle";
}

export function mapModel(stage, { width, height, margin = 4 }) {
  const { width: bw, depth: bd } = stage.bay;
  const scale = Math.min((width - 2 * margin) / bw, (height - 2 * margin) / bd);
  const cx = width / 2, cy = height / 2;
  const pt = ([x, z]) => [cx - x * scale, cy + (bd / 2 - z) * scale];
  const items = [];

  items.push({ kind: "bay", x: cx - (bw / 2) * scale, y: cy - (bd / 2) * scale, w: bw * scale, h: bd * scale });
  for (let x = Math.ceil(-bw / 2); x <= Math.floor(bw / 2); x++) items.push({ kind: "grid", points: [pt([x, 0]), pt([x, bd])] });
  for (let z = 0; z <= Math.floor(bd); z++) items.push({ kind: "grid", points: [pt([-bw / 2, z]), pt([bw / 2, z])] });

  for (const l of stage.lines) {
    items.push({ kind: "poly", points: l.points.map(pt), closed: l.closed, style: l.type === "shooting-area" ? "area" : "fault" });
  }

  for (const o of stage.objects) {
    const [x, y] = pt(o.position);
    const d = dimensionsOf(o);
    const st = style(o.type);
    if (ROUND.has(o.type)) {
      const diameter = o.type === "plate-round" ? o.params.size : d.w;
      items.push({ kind: "circle", x, y, r: Math.max((diameter / 2) * scale, 0.6), style: st });
    } else {
      // Paper targets are thin: draw them at least 0.8 mm deep so they stay visible.
      const paper = st === "paper" || st === "noshoot";
      // Walls are drawn as their frame (not the feet); paper targets as their thin face.
      const width = paper ? paperSize(o).w * scale : d.w * scale;
      const depth = paper ? Math.max(CARD_DEPTH * scale, 0.8) : st === "wall" ? Math.max(STICK * scale, 0.6) : Math.max(d.d * scale, 0.5);
      items.push({ kind: "rect", x, y, w: width, h: depth, rotation: o.rotation, style: st });
    }
    if (o.label && getProp(o.type).scoring) items.push({ kind: "label", x, y: y - 2.2, text: o.label, style: st });
  }

  if (stage.start) {
    const [x, y] = pt(stage.start.position);
    items.push({ kind: "start", x, y, size: scale, rotation: stage.start.facing });
  }

  const metres = bw < 10 && bd < 10 ? 2 : 5;
  items.push({ kind: "scalebar", x: margin, y: height - 1.5, length: metres * scale, metres });
  return { scale, items };
}
