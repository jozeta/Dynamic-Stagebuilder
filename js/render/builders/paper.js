// Paper targets: one prop is a target, a no-shoot or a combination of them (model/arrays.js). Each
// card is the IPSC outline in cardboard with its printed scoring zones; cards stand on two wooden
// sticks in a steel stand, centred on it. A card that only overlaps the edge of another (a no-shoot
// over a side, the front one of two overlapping targets) has its own stand in front; one behind has
// its own stand behind; a no-shoot backed by the cards behind it is stapled on. Hard cover is black
// paint on the card (Target Array Handbook 2019, 1.2).
import * as THREE from "three";
import { paperSize, TARGET_STICK, STAND } from "../../model/props.js";
import { arrayCards, arrayExtent, arrayStands, layerZ } from "../../model/arrays.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";
import { STYLES } from "./target-shape.js";

const CARD = 0.006;
const STICK_X = 0.11;                              // the sticks stand ± this far from the stand's centre
// A card's face, just in front of its own sticks; a stapled card just in front of the card it is stapled to.
const cardZ = (layer) => (layer === "front" ? -TARGET_STICK / 2 - 2 * CARD - 0.004 : layerZ(layer) - TARGET_STICK / 2 - CARD);

function shapeOf(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

// Sutherland–Hodgman: the part of a polygon where f(x, y) ≤ 0 (one straight cut).
export function clipPolygon(points, f) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const fa = f(...a), fb = f(...b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

// The covered side of each hard cover, in card metres (origin bottom centre, +x the shooter's left).
function coverCut(cover, w, h) {
  const lower = { "lower-1/4": 0.25, "lower-1/3": 1 / 3, "lower-1/2": 0.5 }[cover];
  if (lower) return (x, y) => y - h * lower;
  if (cover === "left-1/2") return (x) => -x;
  if (cover === "right-1/2") return (x) => x;
  if (cover === "diagonal") return (x, y) => y - h * 0.6 * (0.5 + x / w);
  return null;
}

// A steel stand centred at (x, z): two feet, a cross bar and two stick sockets.
function stand(g, x, z) {
  const { w, d, h } = STAND;
  const base = new THREE.Group();
  base.userData.stand = { x, z };
  base.add(box(0.035, h, d, "stand-foot", x - w / 2 + 0.0175, h / 2, z));
  base.add(box(0.035, h, d, "stand-foot", x + w / 2 - 0.0175, h / 2, z));
  base.add(box(w - 0.07, h * 0.75, 0.035, "stand-foot", x, (h * 0.75) / 2, z));
  for (const sx of [-STICK_X, STICK_X]) base.add(box(0.05, 0.09, 0.05, "stand-foot", x + sx, h + 0.045, z));   // stick sockets
  g.add(base);
}

/** One cardboard card, origin at its bottom centre, the printed face toward −z at z = 0. */
export function paperCard(obj, kind = "target") {
  const mini = obj.type === "paper-mini";
  const style = obj.params.style === "head" ? "head" : "classic";
  const shape = STYLES[style], size = paperSize(obj);
  const outline = shape.outline.map(([x, y]) => [x * (size.w / shape.grid.w), y * (size.h / shape.grid.h)]);
  const geo = new THREE.ExtrudeGeometry(shapeOf(outline), { depth: CARD, bevelEnabled: false });
  const card = new THREE.Mesh(geo, [getMaterial(`${kind === "noshoot" ? "noshoot" : "card"}-${style}-${mini ? "mini" : "ipsc"}`), getMaterial("card-edge")]);
  card.castShadow = true;
  card.receiveShadow = true;
  card.userData.card = kind;
  return card;
}

export function buildPaper(obj) {
  const mini = obj.type === "paper-mini";
  const style = obj.params.style === "head" ? "head" : "classic";
  const shape = STYLES[style];
  const size = paperSize(obj);
  const outline = shape.outline.map(([x, y]) => [x * (size.w / shape.grid.w), y * (size.h / shape.grid.h)]);
  const mount = obj.params.mountHeight;
  const cards = arrayCards(obj);
  const e = arrayExtent(obj, STAND.w, STAND.d);
  const shift = -(e.minX + e.maxX) / 2, shiftZ = -(e.minZ + e.maxZ) / 2;   // centre the array (stands and cards) on the object's position
  const g = group(obj.id);
  const geo = new THREE.ExtrudeGeometry(shapeOf(outline), { depth: CARD, bevelEnabled: false });

  // Stands and sticks: two sticks in each stand's sockets, reaching half way up the highest card they hold.
  for (const s of arrayStands(obj)) {
    const x = s.x + shift, z = s.z + shiftZ;
    stand(g, x, z);
    const held = cards.filter((c) => c.layer === s.layer && c.x === s.x);
    const stickH = mount + Math.max(...held.map((c) => c.y)) + size.h * 0.5;
    for (const sx of [-STICK_X, STICK_X]) {
      const stick = box(TARGET_STICK, stickH, TARGET_STICK, "stick-wood", x + sx, stickH / 2, z);
      stick.userData.stick = { x: x + sx, z };
      g.add(stick);
    }
  }

  for (const c of cards) {
    const face = `${c.kind === "noshoot" ? "noshoot" : "card"}-${style}-${mini ? "mini" : "ipsc"}`;
    const card = new THREE.Mesh(geo, [getMaterial(face), getMaterial("card-edge")]);
    card.position.set(c.x + shift, mount + c.y, cardZ(c.layer) + shiftZ);
    card.castShadow = true;
    card.receiveShadow = true;
    card.userData.card = c.kind;
    g.add(card);
    const cut = coverCut(c.cover, size.w, size.h);
    if (cut) {
      const poly = clipPolygon(outline, cut);
      if (poly.length >= 3) {
        const paint = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(poly)), getMaterial("hard-cover"));
        paint.position.set(c.x + shift, mount + c.y, cardZ(c.layer) + shiftZ - 0.0008);
        paint.userData.part = "cover";
        g.add(paint);
      }
    }
  }
  return g;
}
