// A node's turn about the vertical axis in stage degrees [0, 360). Read through the "YXZ" Euler
// order: the default XYZ order folds yaw beyond ±90° into the other axes (TransformControls writes
// rotations that way), so rotation.y alone would turn 150° into 30°.
import * as THREE from "three";

const euler = new THREE.Euler();

export function yawDegrees(node) {
  euler.setFromQuaternion(node.quaternion, "YXZ");
  const deg = (-euler.y * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}
