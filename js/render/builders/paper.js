// Paper targets and no-shoots: the IPSC outline in cardboard (darker cut edges, scoring-zone lines)
// on two wooden sticks in a blue steel stand, like a club range's target stands.
import * as THREE from "three";
import { TARGET_SIZES, TARGET_STICK, STAND } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";

// The IPSC target outline (rulebook drawing, Appendix B2) on a grid of 46 × 58 cm, origin
// bottom-centre: an octagonal body 46 wide and 43 tall, and a 15 × 15 cm head on top.
const OUTLINE = [[-15, 0], [15, 0], [23, 8], [23, 34], [15, 43], [7.5, 43], [7.5, 58], [-7.5, 58], [-7.5, 43], [-15, 43], [-23, 34], [-23, 8]];
// Scoring-zone lines: A zone of the body and head, the C zone and the D-zone head line.
const ZONES = [[-7.5, 13, 15, 28], [-4, 48, 8, 6], [-15, 5, 30, 37], [-7.5, 43, 15, 15]];
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

  const stickH = mount + size.h * 0.5;     // sticks reach half way up the card
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
