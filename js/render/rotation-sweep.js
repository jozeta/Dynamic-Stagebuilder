// Guides on the ground while a prop is edited in the 3D view, drawn over everything (no depth test):
// - turning with the rotate ring (model/rotation-sweep.js): a faint circle round the prop, a line to
//   the angle it started at, a line to the angle now, and the area between them in see-through grey;
// - dragging (model/move-guide.js): a mark where it started and a line to where it is now.
// The turn ("+30°") and the distance ("2.3 m") are sharp screen labels placed by the caller.
import * as THREE from "three";
import { sweepOf } from "../model/rotation-sweep.js";

const Y = 0.025;          // just above the ground

const flat = (opts) => ({ transparent: true, depthTest: false, depthWrite: false, ...opts });
const toV = ([x, z]) => new THREE.Vector3(x, 0, z);
const replace = (obj, geo) => { obj.geometry.dispose(); obj.geometry = geo; };

export function createRotationSweep() {
  const group = new THREE.Group();
  group.name = "rotation-sweep";
  group.visible = false;
  const circle = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(flat({ color: 0xffffff, opacity: 0.45 })));
  const startLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(flat({ color: 0xffffff, opacity: 0.9 })));
  const endLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(flat({ color: 0xffd60a, opacity: 1 })));
  const fill = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(flat({ color: 0x8a8d91, opacity: 0.4, side: THREE.DoubleSide })));
  for (const [o, order] of [[fill, 20], [circle, 21], [startLine, 22], [endLine, 22]]) { o.renderOrder = order; group.add(o); }

  return {
    group,
    /** Show the turn from `from` to `to` degrees round `centre` ([x, z]) on the ground at height `y`; returns the sweep (its text and labelAt). */
    show({ centre, y = 0, radius, from, to, gap }) {
      const s = sweepOf({ centre, radius, from, to, gap });
      replace(circle, new THREE.BufferGeometry().setFromPoints(Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2; return new THREE.Vector3(centre[0] + Math.cos(a) * radius, 0, centre[1] + Math.sin(a) * radius);
      })));
      replace(startLine, new THREE.BufferGeometry().setFromPoints([toV(centre), toV(s.start)]));
      replace(endLine, new THREE.BufferGeometry().setFromPoints([toV(centre), toV(s.end)]));
      const fan = new THREE.BufferGeometry();
      if (s.arc.length > 1) {
        const pts = [];
        for (let i = 0; i < s.arc.length - 1; i++) pts.push(centre[0], 0, centre[1], s.arc[i][0], 0, s.arc[i][1], s.arc[i + 1][0], 0, s.arc[i + 1][1]);
        fan.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      }
      replace(fill, fan);
      group.position.y = y + Y;
      group.visible = true;
      return s;
    },
    hide() { group.visible = false; },
  };
}

/** The move guide: a ring and cross with a grey disc where the prop started, and a line to where it is now. */
export function createMoveGuide() {
  const group = new THREE.Group();
  group.name = "move-guide";
  group.visible = false;
  const mark = new THREE.Group();
  const ringPts = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return new THREE.Vector3(Math.cos(a), 0, Math.sin(a)); });
  const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial(flat({ color: 0xffffff, opacity: 0.9 })));
  const cross = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(0.6, 0, 0), new THREE.Vector3(0, 0, -0.6), new THREE.Vector3(0, 0, 0.6)]),
    new THREE.LineBasicMaterial(flat({ color: 0xffffff, opacity: 0.9 })));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial(flat({ color: 0x8a8d91, opacity: 0.35, side: THREE.DoubleSide })));
  disc.rotation.x = -Math.PI / 2;
  mark.add(disc, ring, cross);
  const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(flat({ color: 0xffd60a, opacity: 1 })));
  for (const o of [disc, ring, cross, line]) o.renderOrder = 22;
  group.add(mark, line);
  return {
    group,
    /** Show the start `from` and the line to `to` ([x, z]) at height `y`; `size` is the start mark's radius (m). */
    show({ from, to, y = 0, size = 0.3 }) {
      mark.position.set(from[0], 0, from[1]);
      mark.scale.setScalar(size);
      replace(line, new THREE.BufferGeometry().setFromPoints([toV(from), toV(to)]));
      group.position.y = y + Y;
      group.visible = true;
    },
    hide() { group.visible = false; },
  };
}
