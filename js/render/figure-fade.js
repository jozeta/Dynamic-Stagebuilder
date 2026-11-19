// Figures (the shooter at the start and at each shooting position) fade out as the camera comes
// close, and are gone when it is inside one, as in Shooter's eye. Runs before every render.
import { Vector3 } from "three";
import { figureFade, distanceToFigure, FADE_LEVELS } from "../model/positions.js";
import { ghostAt } from "./materials.js";

const at = new Vector3();
export function fadeFigures(root, camera) {
  const eye = camera.position.toArray();
  root.traverse((m) => {
    const f = m.userData.fade;
    if (!f) return;
    m.getWorldPosition(at);
    const level = Math.round(figureFade(distanceToFigure([eye[0], eye[1] - at.y, eye[2]], [at.x, at.z], f.height)) * FADE_LEVELS);
    m.material = ghostAt(level, FADE_LEVELS);
    m.visible = f.depth.visible = level > 0;
  });
}
