// Paper targets and no-shoots: the IPSC outline in cardboard (darker cut edges, scoring-zone lines)
// on two wooden sticks in a blue steel stand, like a club range's target stands.
import * as THREE from "three";
import { TARGET_SIZES, TARGET_STICK, STAND } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";

// The IPSC target outline on a unit grid of 46 × 58 (cm), origin bottom-centre.
const OUTLINE = [[-15, 0], [15, 0], [23, 13], [23, 38], [15, 46], [7.5, 46], [7.5, 58], [-7.5, 58], [-7.5, 46], [-15, 46], [-23, 38], [-23, 13]];
// A-zone (body and head) and C-zone outline, same grid.
const ZONES = [[-7.5, 25, 15, 15], [-4, 49, 8, 5], [-15, 12, 30, 30]];
const CARD = 0.006;

function outlineShape(sx, sy) {
  const s = new THREE.Shape();
  OUTLINE.forEach(([x, y], i) => (i ? s.lineTo(x * sx, y * sy) : s.moveTo(x * sx, y * sy)));
  s.closePath();
  return s;
}

function zoneLines(sx, sy, z) {
  const pts = [];
  for (const [x, y, w, h] of ZONES) {
    const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [c[i], c[(i + 1) % 4]];
      pts.push(new THREE.Vector3(a[0] * sx, a[1] * sy, z), new THREE.Vector3(b[0] * sx, b[1] * sy, z));
    }
  }
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), getMaterial("zone-line"));
}

function stand(g) {
  const { w, d, h } = STAND;
  g.add(box(0.035, h, d, "stand-blue", -w / 2 + 0.0175, h / 2, 0));
  g.add(box(0.035, h, d, "stand-blue", w / 2 - 0.0175, h / 2, 0));
  g.add(box(w - 0.07, h * 0.75, 0.035, "stand-blue", 0, (h * 0.75) / 2, 0));
  for (const x of [-0.11, 0.11]) g.add(box(0.05, 0.09, 0.05, "stand-blue", x, h + 0.045, 0));   // stick sockets
}

export function buildPaper(obj) {
  const mini = obj.type === "paper-mini" || obj.type === "noshoot-mini";
  const size = mini ? TARGET_SIZES.mini : TARGET_SIZES.ipsc;
  const noShoot = obj.type.startsWith("noshoot");
  const sx = size.w / 46, sy = size.h / 58;
  const g = group(obj.id);
  const mount = obj.params.mountHeight;
  stand(g);

  const stickH = mount + size.h * 0.7;
  for (const x of [-0.11, 0.11]) g.add(box(TARGET_STICK, stickH, TARGET_STICK, "stick-wood", x, stickH / 2, 0));

  const geo = new THREE.ExtrudeGeometry(outlineShape(sx, sy), { depth: CARD, bevelEnabled: false });
  const card = new THREE.Mesh(geo, [getMaterial(noShoot ? "noshoot-white" : "target-tan"), getMaterial("card-edge")]);
  card.position.set(0, mount, -TARGET_STICK / 2 - CARD);
  card.castShadow = true;
  card.receiveShadow = true;
  g.add(card);
  if (!noShoot) {
    const lines = zoneLines(sx, sy, -TARGET_STICK / 2 - CARD - 0.0006);
    lines.position.y = mount;
    g.add(lines);
  }
  return g;
}
