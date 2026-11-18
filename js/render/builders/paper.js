// Paper targets and no-shoots: the IPSC outline (scaled for the mini target) on two wooden sticks.
import * as THREE from "three";
import { TARGET_SIZES, STICK } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, extrude, group } from "./parts.js";

// The IPSC target outline on a unit grid of 46 × 58 (cm), origin bottom-centre.
const OUTLINE = [[-15, 0], [15, 0], [23, 13], [23, 38], [15, 46], [7.5, 46], [7.5, 58], [-7.5, 58], [-7.5, 46], [-15, 46], [-23, 38], [-23, 13]];
// A-zone (body and head) as rectangles, same grid.
const A_ZONES = [[-7.5, 25, 15, 15], [-4, 49, 8, 5]];
const CARD = 0.008;

function outlineShape(sx, sy) {
  const s = new THREE.Shape();
  OUTLINE.forEach(([x, y], i) => (i ? s.lineTo(x * sx, y * sy) : s.moveTo(x * sx, y * sy)));
  s.closePath();
  return s;
}

function zoneLines(sx, sy, z) {
  const pts = [];
  for (const [x, y, w, h] of A_ZONES) {
    const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [c[i], c[(i + 1) % 4]];
      pts.push(new THREE.Vector3(a[0] * sx, a[1] * sy, z), new THREE.Vector3(b[0] * sx, b[1] * sy, z));
    }
  }
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), getMaterial("zone-line"));
}

export function buildPaper(obj) {
  const mini = obj.type === "paper-mini" || obj.type === "noshoot-mini";
  const size = mini ? TARGET_SIZES.mini : TARGET_SIZES.ipsc;
  const noShoot = obj.type.startsWith("noshoot");
  const sx = size.w / 46, sy = size.h / 58;
  const g = group(obj.id);
  const mount = obj.params.mountHeight;

  // Two sticks reaching two thirds up the target, centred on z = 0 (depth = STICK).
  const stickH = mount + size.h * 0.66;
  for (const x of [-size.w * 0.25, size.w * 0.25]) g.add(box(0.025, stickH, STICK, "stick-wood", x, stickH / 2, 0));

  const card = extrude(outlineShape(sx, sy), CARD, noShoot ? "noshoot-white" : "target-tan", -STICK / 2);
  card.position.y = mount;
  g.add(card);
  if (!noShoot) {
    const lines = zoneLines(sx, sy, -STICK / 2 - CARD - 0.0005);
    lines.position.y = mount;
    g.add(lines);
  }
  return g;
}
