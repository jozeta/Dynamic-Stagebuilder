// Obstacles: a 200 l barrel, tyres (single or stacked) and a wooden crate.
import * as THREE from "three";
import { BARREL, TYRE, PLANT } from "../../model/props.js";
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

// A potted palm (decorative): a black pot, a short trunk and arching fronds, flat-shaded for the
// illustrated look. Scaled to exactly the catalogue size.
export function buildPlant(obj) {
  const g = group(obj.id);
  const inner = new THREE.Group();
  const pot = mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 18), "pot");
  pot.position.y = 0.18;
  const trunk = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.7, 6), "trunk");
  trunk.position.y = 0.7;
  inner.add(pot, trunk);
  const fronds = 11;
  for (let i = 0; i < fronds; i++) {
    const leaf = new THREE.PlaneGeometry(0.12, 0.62, 1, 6);
    const pos = leaf.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const y = pos.getY(v) + 0.31;                       // 0 … 0.62 along the frond
      pos.setXYZ(v, pos.getX(v) * (1 - y / 0.75), y, -0.5 * y * y);   // taper and droop
    }
    leaf.computeVertexNormals();
    const m = mesh(leaf, "leaf");
    m.position.y = 1.02 + (i % 3) * 0.06;
    m.rotation.set(-0.9 - (i % 4) * 0.15, (i / fronds) * Math.PI * 2, 0, "YXZ");
    inner.add(m);
  }
  g.add(inner);
  // Fit to the catalogue size exactly (bounding box w × h × d, standing on y = 0).
  const box3 = new THREE.Box3().setFromObject(inner);
  const size = box3.getSize(new THREE.Vector3());
  inner.scale.set(PLANT.diameter / size.x, PLANT.height / size.y, PLANT.diameter / size.z);
  inner.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(inner);
  const c = b2.getCenter(new THREE.Vector3());
  inner.position.set(-c.x, -b2.min.y, -c.z);
  return g;
}
