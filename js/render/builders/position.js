// A shooting position on the ground: a blue ring with an arrow for the facing, and a see-through
// figure in the stance (standing, crouching, kneeling, sitting or prone) at real size. The figure
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
  const arrow = new THREE.Shape();
  arrow.moveTo(0, 0.3); arrow.lineTo(0.13, 0.02); arrow.lineTo(0.05, 0.06); arrow.lineTo(0.05, -0.22); arrow.lineTo(-0.05, -0.22); arrow.lineTo(-0.05, 0.06); arrow.lineTo(-0.13, 0.02); arrow.closePath();
  const a = new THREE.Mesh(new THREE.ShapeGeometry(arrow), getMaterial("position-ring"));
  a.rotation.x = -Math.PI / 2;                     // shape +y → world −z, so turn it round to point down range
  a.rotation.z = Math.PI;
  a.position.y = 0.002;
  g.add(a);
  const figure = new THREE.Group();
  for (const [x, y, z, r, len, lying] of st.capsules) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), getMaterial("position-ghost"));
    if (lying) m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    figure.add(m);
  }
  for (const [x, y, z, r] of st.spheres) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), getMaterial("position-ghost"));
    m.position.set(x, y, z);
    figure.add(m);
  }
  figure.traverse((m) => { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 2; });
  g.add(figure);
  g.userData.size = positionSize(st.id);
  return g;
}
