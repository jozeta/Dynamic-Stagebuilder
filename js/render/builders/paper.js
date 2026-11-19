// Paper targets and no-shoots: the IPSC outline in cardboard (darker cut edges, scoring-zone lines)
// on two wooden sticks in a blue steel stand, like a club range's target stands.
import * as THREE from "three";
import { paperSize, TARGET_STICK, STAND } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";

import { STYLES } from "./target-shape.js";

const CARD = 0.006;

function outlineShape(outline, sx, sy) {
  const s = new THREE.Shape();
  outline.forEach(([x, y], i) => (i ? s.lineTo(x * sx, y * sy) : s.moveTo(x * sx, y * sy)));
  s.closePath();
  return s;
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
  const style = obj.params.style === "head" ? "head" : "classic";
  const shape = STYLES[style];
  const size = paperSize(obj);
  const noShoot = obj.type.startsWith("noshoot");
  const sx = size.w / shape.grid.w, sy = size.h / shape.grid.h;
  const g = group(obj.id);
  const mount = obj.params.mountHeight;
  stand(g);

  const stickH = mount + size.h * 0.5;     // sticks reach half way up the card
  for (const x of [-0.11, 0.11]) g.add(box(TARGET_STICK, stickH, TARGET_STICK, "stick-wood", x, stickH / 2, 0));

  const geo = new THREE.ExtrudeGeometry(outlineShape(shape.outline, sx, sy), { depth: CARD, bevelEnabled: false });
  // The face carries a printed texture with the scoring zones (see materials.js "card-…").
  const face = `${noShoot ? "noshoot" : "card"}-${style}-${mini ? "mini" : "ipsc"}`;
  const card = new THREE.Mesh(geo, [getMaterial(face), getMaterial("card-edge")]);
  card.position.set(0, mount, -TARGET_STICK / 2 - CARD);
  card.castShadow = true;
  card.receiveShadow = true;
  g.add(card);
  return g;
}
