// Small helpers shared by the prop builders. All sizes in metres; y = 0 is the ground.
import * as THREE from "three";
import { getMaterial } from "../materials.js";

/** A box mesh with its min corner logic expressed as centre (x, y, z) and size (w, h, d). */
export function box(w, h, d, material, x = 0, y = h / 2, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), getMaterial(material));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Extrude a 2D shape (in the x/y plane) by depth, front face towards −z, back at zBack. */
export function extrude(shape, depth, material, zBack = 0) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
  const m = new THREE.Mesh(g, getMaterial(material));
  m.position.z = zBack - depth;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function group(id) {
  const g = new THREE.Group();
  g.userData.id = id;
  return g;
}
