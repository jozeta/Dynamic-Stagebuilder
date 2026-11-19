// Paper targets: one prop is a target, a no-shoot or a combination of them (model/arrays.js). Each
// card is the IPSC outline in cardboard with its printed scoring zones; cards stand on two wooden
// sticks in a blue steel stand, no-shoots in front are stapled on, cards behind have their own
// sticks. Hard cover is black paint on the card (Target Array Handbook 2019, 1.2).
import * as THREE from "three";
import { paperSize, TARGET_STICK, STAND } from "../../model/props.js";
import { arrayCards, arrayExtent, arrayStands } from "../../model/arrays.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";
import { STYLES } from "./target-shape.js";

const CARD = 0.006;
const LAYER_Z = { front: -TARGET_STICK / 2 - 2 * CARD - 0.004, main: -TARGET_STICK / 2 - CARD, back: TARGET_STICK * 1.5 + 0.03 };

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

function stand(g, x) {
  const { w, d, h } = STAND;
  g.add(box(0.035, h, d, "stand-blue", x - w / 2 + 0.0175, h / 2, 0));
  g.add(box(0.035, h, d, "stand-blue", x + w / 2 - 0.0175, h / 2, 0));
  g.add(box(w - 0.07, h * 0.75, 0.035, "stand-blue", x, (h * 0.75) / 2, 0));
  for (const sx of [-0.11, 0.11]) g.add(box(0.05, 0.09, 0.05, "stand-blue", x + sx, h + 0.045, 0));   // stick sockets
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
  const e = arrayExtent(obj, STAND.w);
  const shift = -(e.minX + e.maxX) / 2;          // centre the array on the object's position
  const g = group(obj.id);
  const geo = new THREE.ExtrudeGeometry(shapeOf(outline), { depth: CARD, bevelEnabled: false });

  // Stands and sticks: the sticks reach half way up the highest card they hold.
  for (const sx of arrayStands(obj)) {
    stand(g, sx + shift);
    const held = cards.filter((c) => c.layer !== "front" && c.x === sx);
    const stickH = mount + Math.max(...held.map((c) => c.y)) + size.h * 0.5;
    const back = held.every((c) => c.layer === "back");
    for (const x of [-0.11, 0.11]) {
      g.add(box(TARGET_STICK, stickH, TARGET_STICK, "stick-wood", sx + shift + x, stickH / 2, back ? LAYER_Z.back + CARD + TARGET_STICK / 2 : 0));
    }
  }

  for (const c of cards) {
    const face = `${c.kind === "noshoot" ? "noshoot" : "card"}-${style}-${mini ? "mini" : "ipsc"}`;
    const card = new THREE.Mesh(geo, [getMaterial(face), getMaterial("card-edge")]);
    card.position.set(c.x + shift, mount + c.y, LAYER_Z[c.layer]);
    card.castShadow = true;
    card.receiveShadow = true;
    card.userData.card = c.kind;
    g.add(card);
    const cut = coverCut(c.cover, size.w, size.h);
    if (cut) {
      const poly = clipPolygon(outline, cut);
      if (poly.length >= 3) {
        const paint = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(poly)), getMaterial("hard-cover"));
        paint.position.set(c.x + shift, mount + c.y, LAYER_Z[c.layer] - 0.0008);
        paint.userData.part = "cover";
        g.add(paint);
      }
    }
  }
  return g;
}
