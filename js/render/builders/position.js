// A shooting position on the ground: a light grey ring with a chevron for the facing, and a light
// grey, see-through man in the stance (standing, crouching, kneeling, sitting or prone) at real
// size, holding a pistol in both hands (all from figureParts in model/positions.js). The figure is
// one merged mesh drawn after a depth-only pass, so only its outer surface shows, as one even
// translucent grey. It casts no shadow.
import * as THREE from "three";
import { STANCES, MARKER_RADIUS, positionSize, partsSize } from "../../model/positions.js";
import { getMaterial } from "../materials.js";
import { group } from "./parts.js";

const up = new THREE.Vector3(0, 1, 0);

function limbGeometry({ a, b, prof }) {
  const A = new THREE.Vector3(...a), dir = new THREE.Vector3(...b).sub(A), len = Math.max(0.001, dir.length());
  const g = new THREE.LatheGeometry(prof.map(([t, r]) => new THREE.Vector2(r, t * len)), 16);
  const m = new THREE.Matrix4().compose(A, new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()), new THREE.Vector3(1, 1, 1));
  return g.applyMatrix4(m);
}
function loftGeometry({ sections }) {
  const N = 24, pos = [], idx = [];
  for (const { c, rx, rz, X, V } of sections) {
    for (let k = 0; k < N; k++) {
      const t = (k / N) * Math.PI * 2, cx = Math.cos(t) * rx, sz = Math.sin(t) * rz;
      pos.push(...c.map((v, i) => v + X[i] * cx + V[i] * sz));
    }
  }
  const S = sections.length;
  for (let s = 0; s < S - 1; s++) for (let k = 0; k < N; k++) {
    const a = s * N + k, b = s * N + ((k + 1) % N), c = a + N, d = b + N;
    idx.push(a, c, b, b, c, d);
  }
  for (const [s, flip] of [[0, true], [S - 1, false]]) {       // close both ends
    const centre = pos.length / 3;
    pos.push(...sections[s].c);
    for (let k = 0; k < N; k++) {
      const a = s * N + k, b = s * N + ((k + 1) % N);
      idx.push(...(flip ? [centre, b, a] : [centre, a, b]));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function partGeometry(part) {
  switch (part.kind) {
    case "limb": return limbGeometry(part);
    case "loft": return loftGeometry(part);
    case "ellipsoid": return new THREE.SphereGeometry(1, 20, 14).scale(...part.r).translate(...part.c);
    case "box": return new THREE.BoxGeometry(...part.s).rotateX(part.tilt).translate(...part.c);
    default: return null;
  }
}
// One geometry from many (non-indexed), keeping each part's smooth normals.
function merge(geoms) {
  const flat = geoms.map((g) => (g.index ? g.toNonIndexed() : g));
  const join = (name) => {
    const arrays = flat.map((g) => g.getAttribute(name).array);
    const out = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
    let o = 0;
    for (const a of arrays) { out.set(a, o); o += a.length; }
    return new THREE.BufferAttribute(out, 3);
  };
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", join("position"));
  g.setAttribute("normal", join("normal"));
  return g;
}

/** A see-through grey figure from its parts (model/positions.js figureParts): two meshes, one geometry. */
export function figureMeshes(parts) {
  const body = merge(parts.map(partGeometry).filter(Boolean));
  const depth = new THREE.Mesh(body, getMaterial("position-ghost-depth"));
  const skin = new THREE.Mesh(body, getMaterial("position-ghost"));
  depth.renderOrder = 1;
  skin.renderOrder = 2;
  for (const m of [depth, skin]) { m.castShadow = false; m.receiveShadow = false; }
  skin.userData.fade = { depth, height: partsSize(parts).h };      // render/figure-fade.js
  return [depth, skin];
}

export function buildShootingPosition(obj) {
  const st = STANCES.find((s) => s.id === obj.params.stance) || STANCES[0];
  const g = group(obj.id);
  const ring = new THREE.Mesh(new THREE.RingGeometry(MARKER_RADIUS - 0.07, MARKER_RADIUS, 40), getMaterial("position-ring"));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.0015;
  ring.userData.runPart = "mark";               // Settings → View can hide the marks
  g.add(ring);
  // The facing: a small chevron on the ring's rim.
  const arrow = new THREE.Shape([new THREE.Vector2(0, -0.47), new THREE.Vector2(0.09, -0.36), new THREE.Vector2(0, -0.39), new THREE.Vector2(-0.09, -0.36)]);
  const a = new THREE.Mesh(new THREE.ShapeGeometry(arrow), getMaterial("position-ring"));
  a.rotation.x = -Math.PI / 2;                     // shape −y → world +z: points the way the shooter faces
  a.position.y = 0.002;
  a.userData.runPart = "mark";
  g.add(a);
  const man = new THREE.Group();
  man.userData.runPart = "figure";              // …and the figures
  man.add(...figureMeshes(st.parts));
  g.add(man);
  g.userData.size = positionSize(st.id);
  return g;
}
