// A shooting position on the ground: a light grey ring with an arrow for the facing, and a light
// grey mannequin (head, body, arms holding a pistol, legs, feet) in the stance (standing, crouching, kneeling, sitting or prone) at real size. The figure
// casts no shadow and doesn't hide the stage behind it.
import * as THREE from "three";
import { STANCES, MARKER_RADIUS, positionSize } from "../../model/positions.js";
import { getMaterial } from "../materials.js";
import { group } from "./parts.js";

export function buildShootingPosition(obj) {
  const st = STANCES.find((s) => s.id === obj.params.stance) || STANCES[0];
  const g = group(obj.id);
  const ring = new THREE.Mesh(new THREE.RingGeometry(MARKER_RADIUS - 0.07, MARKER_RADIUS, 40), getMaterial("position-ring"));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.0015;
  g.add(ring);
  // The facing: a small chevron on the ring's rim.
  const arrow = new THREE.Shape([new THREE.Vector2(0, -0.47), new THREE.Vector2(0.09, -0.36), new THREE.Vector2(0, -0.39), new THREE.Vector2(-0.09, -0.36)]);
  const a = new THREE.Mesh(new THREE.ShapeGeometry(arrow), getMaterial("position-ring"));
  a.rotation.x = -Math.PI / 2;                     // shape −y → world +z: points the way the shooter faces
  a.position.y = 0.002;
  g.add(a);
  const figure = new THREE.Group();
  const up = new THREE.Vector3(0, 1, 0);
  for (const { a: p0, b: p1, r } of st.segments) {
    const A = new THREE.Vector3(...p0), B = new THREE.Vector3(...p1), dir = B.clone().sub(A);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, dir.length()), 6, 14), getMaterial("position-ghost"));
    m.position.copy(A).addScaledVector(dir, 0.5);
    if (dir.lengthSq() > 1e-9) m.quaternion.setFromUnitVectors(up, dir.normalize());
    figure.add(m);
  }
  for (const [x, y, z, r] of st.spheres) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), getMaterial("position-ghost"));
    m.position.set(x, y, z);
    figure.add(m);
  }
  st.boxes.forEach(([x, y, z, w, bh, d], i) => {
    const pistol = i === st.boxes.length - 1;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, bh, d), getMaterial(pistol ? "position-gun" : "position-ghost"));
    m.position.set(x, y, z);
    figure.add(m);
  });
  figure.traverse((m) => { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 2; });
  g.add(figure);
  g.userData.size = positionSize(st.id);
  return g;
}
