// Steel: poppers (round head on a tapered body, on a base plate) and plates on a post with a foot.
import * as THREE from "three";
import { TARGET_SIZES, PLATE_FOOT } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box as plainBox, worldBox, group } from "./parts.js";
import { steelFaceUV } from "./wear.js";

// Worn stand steel is mapped in metres, so a long post is not one stretched texture.
const box = (w, h, d, m, ...at) => (m === "steel-dark" ? worldBox : plainBox)(w, h, d, m, ...at);

const PLATE = 0.012;   // steel thickness
const BASE = 0.02;     // popper base plate thickness
const POST = 0.05;

function popperShape(w, h) {
  // Head radius w/2 at the top, body tapering from 0.5 w at the bottom to 0.33 w at the neck.
  const r = w / 2;
  const neckY = h - 2 * r + r * 0.25;
  const s = new THREE.Shape();
  s.moveTo(-w * 0.25, 0);
  s.lineTo(w * 0.25, 0);
  s.lineTo(w * 0.165, neckY);
  s.absarc(0, h - r, r, -Math.PI / 2 + 0.6, Math.PI * 1.5 - 0.6, false);
  s.lineTo(-w * 0.165, neckY);
  s.closePath();
  return s;
}

export function buildPopper(obj) {
  const s = obj.type === "mini-popper" ? TARGET_SIZES.miniPopper : TARGET_SIZES.popper;
  const g = group(obj.id);
  const bh = obj.params.baseHeight;
  // Raised: the base plate on a post, the post on a foot plate on the ground.
  if (bh > 0) { g.add(box(Math.max(s.w, PLATE_FOOT), 0.02, Math.max(s.d, PLATE_FOOT), "steel-dark", 0, 0.01, 0)); g.add(box(POST, bh, POST, "steel-dark", 0, bh / 2, 0)); }
  g.add(box(s.w, BASE, s.d, "steel-dark", 0, bh + BASE / 2, 0));
  // Hinge bracket the popper falls back on.
  g.add(box(s.w * 0.55, 0.05, 0.05, "steel-dark", 0, bh + BASE + 0.025, 0.055));
  g.add(box(s.w * 0.3, 0.12, 0.03, "steel-dark", 0, bh + BASE + 0.06, s.d * 0.3));
  // A chunky popper with rounded (bevelled) edges, like painted steel seen on the range.
  const BEVEL = 0.01, THICK = 0.016;
  const geo = new THREE.ExtrudeGeometry(popperShape(s.w - 2 * BEVEL, s.h - BASE - 2 * BEVEL),
    { depth: THICK, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 3, curveSegments: 28 });
  geo.translate(0, BEVEL, -THICK / 2);
  steelFaceUV(geo);                                // the face shows the worn paint once, edges the chipped border
  const body = new THREE.Mesh(geo, getMaterial(`steel-${obj.params.paint || "yellow"}`));
  body.castShadow = true;
  body.receiveShadow = true;
  // The popper hinges at its foot and falls back when hit.
  const hinge = new THREE.Group();
  hinge.position.y = bh + BASE;
  hinge.userData.anim = { kind: "fall", delay: 0, period: 3.2 };
  hinge.add(body);
  g.add(hinge);
  return g;
}

export function buildPlate(obj) {
  const { size, baseHeight: bh } = obj.params;
  const g = group(obj.id);
  g.add(box(PLATE_FOOT, 0.02, PLATE_FOOT, "steel-dark", 0, 0.01, 0));
  // The post runs up behind the plate to its centre, where the plate is bolted on.
  g.add(box(POST, bh + size / 2, POST, "steel-dark", 0, (bh + size / 2) / 2, 0));
  const paint = getMaterial(`steel-${obj.params.paint || "white"}`);
  let plate;
  if (obj.type === "plate-round") {
    plate = new THREE.Mesh(steelFaceUV(new THREE.CylinderGeometry(size / 2, size / 2, PLATE, 32), { axis: "y", round: true, flipV: true }), paint);
    plate.rotation.x = Math.PI / 2;
  } else {
    plate = new THREE.Mesh(steelFaceUV(new THREE.BoxGeometry(size, size, PLATE)), paint);
  }
  plate.position.set(0, bh + size / 2, -POST / 2 - PLATE / 2);
  plate.castShadow = true;
  g.add(plate);
  return g;
}
