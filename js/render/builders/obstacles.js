// Obstacles: a 200 l barrel, tyres (single or stacked) and a wooden crate.
import * as THREE from "three";
import { BARREL, TYRE } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";

function mesh(geo, material) {
  const m = new THREE.Mesh(geo, getMaterial(material));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function buildBarrel(obj) {
  const g = group(obj.id);
  const r = BARREL.diameter / 2;
  const body = mesh(new THREE.CylinderGeometry(r - 0.006, r - 0.006, BARREL.height, 32), "barrel");
  body.position.y = BARREL.height / 2;
  g.add(body);
  for (const y of [BARREL.height / 3, (BARREL.height * 2) / 3]) {
    const rib = mesh(new THREE.TorusGeometry(r - 0.006, 0.006, 6, 40), "barrel");
    rib.rotation.x = Math.PI / 2;
    rib.position.y = y;
    g.add(rib);
  }
  return g;
}

function tyre(y) {
  const tube = TYRE.height / 2;
  const t = mesh(new THREE.TorusGeometry(TYRE.diameter / 2 - tube, tube, 16, 36), "rubber");
  t.rotation.x = Math.PI / 2;
  t.position.y = y + tube;
  return t;
}

export function buildTyre(obj) {
  const g = group(obj.id);
  const count = obj.type === "tyre-stack" ? obj.params.count : 1;
  for (let i = 0; i < count; i++) g.add(tyre(i * TYRE.height));
  return g;
}

export function buildCrate(obj) {
  const g = group(obj.id);
  const s = obj.params.size;
  g.add(box(s, s, s, "wood", 0, s / 2, 0));
  return g;
}
