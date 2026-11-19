// The shooter's route on the ground: a dashed blue ribbon from the start through each shooting
// position, with arrows showing the way, lying on the ground, ramps and platforms; round handles at
// the grab points; and an invisible wider strip under the line so it's easy to click.
import * as THREE from "three";
import { routeLegs, densify, surfaceHeight, trimPolyline, WALKABLE } from "../../model/route.js";
import { getMaterial } from "../materials.js";

const LIFT = 0.018;                // just above what it lies on
const DASH = 0.35, GAP = 0.2;
const END = 0.45;                  // the line stops this far from each end (the ring's edge)

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
    // What's drawn stops at the ring of each position (and the start box), so ends stay tidy.
    const shown = trimPolyline(leg.points, END, END);
    const draw = shown.length ? densify(shown, 0.12).map(([x, z]) => [x, lift(x, z), z]) : [];
    // Dashes: alternate pieces along the length.
    const along = [0];
    for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
    if (draw.length > 1) {
      const da = [0];
      for (let i = 1; i < draw.length; i++) da.push(da[i - 1] + Math.hypot(draw[i][0] - draw[i - 1][0], draw[i][2] - draw[i - 1][2]));
      const dash = (i) => ((da[i - 1] + da[i]) / 2) % (DASH + GAP) < DASH;
      const line = new THREE.Mesh(ribbon(draw, 0.08, dash), getMaterial("route-line"));
      line.renderOrder = 3;
      group.add(line);
      // A few small arrows pointing the way: every 2.5 m, none close to the ends.
      const len = da.at(-1), n = Math.max(1, Math.floor(len / 2.5));
      for (let k = 0; k < n; k++) {
        const s = (len * (k + 0.5)) / n;
        const i = Math.max(1, da.findIndex((v) => v >= s));
        const a = draw[i - 1], b = draw[i];
        const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
        const shape = new THREE.Shape([new THREE.Vector2(0, 0.13), new THREE.Vector2(0.09, -0.05), new THREE.Vector2(0, 0), new THREE.Vector2(-0.09, -0.05)]);
        const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), getMaterial("route-line"));
        m.rotation.order = "YXZ";
        m.rotation.set(-Math.PI / 2, yaw + Math.PI, 0);   // the shape's tip lies along −z; turn it to face the way
        m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.003, (a[2] + b[2]) / 2);
        m.renderOrder = 3;
        group.add(m);
      }
    }
    // A wide invisible strip to click on (adds a grab point there).
    // (Not the last 0.6 m at each end, so a click on a shooting position still selects it.)
    const pick = new THREE.Mesh(ribbon(pts, 0.6, (i) => along[i - 1] > 0.6 && along[i] < along.at(-1) - 0.6), getMaterial("route-pick"));
    pick.userData.routeLeg = { to: leg.to, points: leg.points };
    group.add(pick);
    // Grab points: flat discs on the line, in the line's own colour, with a clear centre.
    leg.points.slice(1, -1).forEach(([x, z], index) => {
      const h = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.15, 28), getMaterial("route-line"));
      h.rotation.x = -Math.PI / 2;
      h.position.set(x, lift(x, z) + 0.004, z);
      h.userData.via = { id: leg.to, index };
      h.renderOrder = 4;
      group.add(h);
      const hit = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), getMaterial("route-pick"));   // easy to grab
      hit.rotation.x = -Math.PI / 2;
      hit.position.copy(h.position);
      hit.userData.via = { id: leg.to, index };
      group.add(hit);
    });
  }
  return group;
}
