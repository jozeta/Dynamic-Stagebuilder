// The shooter's route on the ground: a dashed blue ribbon from the start through each shooting
// position, with arrows showing the way, lying on the ground, ramps and platforms; round handles at
// the grab points; and an invisible wider strip under the line so it's easy to click.
import * as THREE from "three";
import { routeLegs, densify, surfaceHeight, WALKABLE } from "../../model/route.js";
import { getMaterial } from "../materials.js";

const LIFT = 0.018;                // just above what it lies on
const DASH = 0.35, GAP = 0.2;

function ribbon(points, width, keep = () => true) {
  const pos = [], idx = [];
  for (let i = 1; i < points.length; i++) {
    if (!keep(i)) continue;
    const a = points[i - 1], b = points[i];
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, nx = (-dz / L) * (width / 2), nz = (dx / L) * (width / 2);
    const n = pos.length / 3;
    pos.push(a[0] + nx, a[1], a[2] + nz, a[0] - nx, a[1], a[2] - nz, b[0] + nx, b[1], b[2] + nz, b[0] - nx, b[1], b[2] - nz);
    idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A key for the route: what it depends on (positions, grab points, start, walkable props). */
export function routeKey(stage) {
  return JSON.stringify([routeLegs(stage), stage.objects.filter((o) => WALKABLE.includes(o.type)).map((o) => [o.type, o.position, o.rotation, o.params])]);
}

export function buildRoute(stage) {
  const group = new THREE.Group();
  group.userData.route = true;
  const lift = (x, z) => surfaceHeight(stage, x, z) + LIFT;
  for (const leg of routeLegs(stage)) {
    const pts = densify(leg.points, 0.12).map(([x, z]) => [x, lift(x, z), z]);
    // Dashes: alternate pieces along the length.
    const along = [0];
    for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
    const dash = (i) => ((along[i - 1] + along[i]) / 2) % (DASH + GAP) < DASH;
    const line = new THREE.Mesh(ribbon(pts, 0.08, dash), getMaterial("route-line"));
    line.renderOrder = 3;
    group.add(line);
    // Arrows every 1.5 m, pointing the way.
    for (let s = 0.9; s < along.at(-1) - 0.5; s += 1.5) {
      const i = along.findIndex((v) => v >= s);
      const a = pts[Math.max(0, i - 1)], b = pts[i];
      const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
      const shape = new THREE.Shape([new THREE.Vector2(0, 0.2), new THREE.Vector2(0.13, -0.05), new THREE.Vector2(-0.13, -0.05)]);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), getMaterial("route-line"));
      m.rotation.order = "YXZ";
      m.rotation.set(-Math.PI / 2, yaw + Math.PI, 0);     // the shape's tip lies along −z; turn it to face the way
      m.position.set(b[0], b[1] + 0.002, b[2]);
      m.renderOrder = 3;
      group.add(m);
    }
    // A wide invisible strip to click on (adds a grab point there).
    // (Not the last 0.6 m at each end, so a click on a shooting position still selects it.)
    const pick = new THREE.Mesh(ribbon(pts, 0.6, (i) => along[i - 1] > 0.6 && along[i] < along.at(-1) - 0.6), getMaterial("route-pick"));
    pick.userData.routeLeg = { to: leg.to, points: leg.points };
    group.add(pick);
    // Grab points: a handle at each.
    leg.points.slice(1, -1).forEach(([x, z], index) => {
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 24), getMaterial("route-handle"));
      h.position.set(x, lift(x, z) + 0.025, z);
      h.userData.via = { id: leg.to, index };
      h.renderOrder = 4;
      group.add(h);
    });
  }
  return group;
}
