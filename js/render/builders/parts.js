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

export function mesh(geo, material) {
  const m = new THREE.Mesh(geo, Array.isArray(material) ? material.map(getMaterial) : getMaterial(material));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A solid of revolution around y from [radius, y] points (a barrel, a tyre). */
export function lathe(points, material, segments = 40) {
  return mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments), material);
}

/**
 * Scale a built model so its bounding box is exactly w × h × d, centred on x/z and standing on
 * y = 0. Used for organic or detailed models (car, plant, chair) whose size comes from the catalogue.
 */
export function fitTo(inner, w, h, d) {
  inner.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(inner).getSize(new THREE.Vector3());
  inner.scale.set(w / size.x, h / size.y, d / size.z);
  inner.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(inner);
  const c = b.getCenter(new THREE.Vector3());
  inner.position.set(-c.x, -b.min.y, -c.z);
  return inner;
}
