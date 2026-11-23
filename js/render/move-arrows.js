// The move arrows on a selected prop, at its centre on the ground (inside the rotate ring): a small
// cube to drag the prop anywhere, a red arrow across (x), a blue arrow down range (z), and, for props
// with a height (steel base height, a paper target's stand), a green arrow up (y). Drawn over
// everything and kept the same size on screen; picking.js turns a grab into an editor drag.
import * as THREE from "three";

const COLORS = { free: 0xf2f4f7, x: 0xe0453a, y: 0x4fd18b, z: 0x3d7fe0 };
const HOVER = 0xffd60a;
const LENGTH = 0.32;          // in the rotate ring's units (its grab zone starts at 0.4)

const material = (color) => new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, transparent: true, opacity: 0.95, toneMapped: false });
// An invisible, fatter copy of a handle, so it is easy to grab (raycast only).
const grab = () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false });

function arrow(axis) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, LENGTH - 0.07, 8), material(COLORS[axis]));
  shaft.position.y = 0.035 + (LENGTH - 0.07) / 2;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 12), material(COLORS[axis]));
  head.position.y = LENGTH - 0.035;
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, LENGTH, 6), grab());
  hit.position.y = LENGTH / 2;
  for (const m of [shaft, head, hit]) { m.userData.handle = axis; m.renderOrder = 30; g.add(m); }
  // Built along +y; turned to point along the stage's axis.
  if (axis === "x") g.rotation.z = -Math.PI / 2;
  if (axis === "z") g.rotation.x = Math.PI / 2;
  g.userData.parts = [shaft, head];
  return g;
}

export function createMoveArrows() {
  const group = new THREE.Group();
  group.name = "move-arrows";
  group.visible = false;
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), material(COLORS.free));
  cube.userData.handle = "free";
  cube.renderOrder = 31;
  const arrows = { x: arrow("x"), y: arrow("y"), z: arrow("z") };
  group.add(cube, arrows.x, arrows.y, arrows.z);
  const tint = (handle, color) => {
    if (handle === "free") cube.material.color.setHex(color);
    else for (const m of arrows[handle].userData.parts) m.material.color.setHex(color);
  };
  let hovered = null;
  return {
    group,
    /** At [x, z] on the ground, `scale` the rotate ring's (so both keep their size on screen); `lift`: show the up arrow. */
    show({ position: [x, z], scale, lift = false }) {
      group.position.set(x, 0.02, z);
      group.scale.setScalar(scale);
      arrows.y.visible = lift;
      group.visible = true;
    },
    hide() { group.visible = false; },
    get visible() { return group.visible; },
    /** The handle under the ray ("free", "x", "y", "z") or null. */
    pick(raycaster) {
      if (!group.visible) return null;
      for (const hit of raycaster.intersectObject(group, true)) {
        let shown = true;
        for (let n = hit.object; n; n = n.parent) if (!n.visible) shown = false;
        if (shown && hit.object.userData.handle) return hit.object.userData.handle;
      }
      return null;
    },
    /** Highlight the handle the pointer is over (null: none). */
    hover(handle) {
      if (handle === hovered) return false;
      if (hovered) tint(hovered, COLORS[hovered]);
      hovered = handle;
      if (handle) tint(handle, HOVER);
      return true;
    },
  };
}
