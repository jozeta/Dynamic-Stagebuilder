// Camera navigation (orbit, pan, zoom; one finger rotates, two pan and zoom on touch) and presets.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const PRESETS = ["iso", "top", "front", "shooter"];
export const PRESET_LABELS = { iso: "Isometric", top: "Top", front: "Front", shooter: "Shooter's eye" };
const EYE = 1.6;

export function createCameraRig(engine, domElement) {
  const camera = engine.camera;
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;   // never below the ground
  controls.minDistance = 0.5;
  controls.maxDistance = 250;
  controls.addEventListener("change", () => engine.requestRender());

  function look(position, target) {
    camera.position.set(...position);
    controls.target.set(...target);
    camera.updateProjectionMatrix();
    controls.update();
    engine.requestRender();
  }

  function fitDistance(stage) {
    const size = Math.max(stage.bay.width, stage.bay.depth * 0.8);
    return size / (2 * Math.tan((camera.fov * Math.PI) / 360)) + 2;
  }

  function preset(name, stage) {
    const { depth } = stage.bay;
    const mid = [0, 0, depth / 2];
    const d = fitDistance(stage);
    switch (name) {
      case "top": look([0, d * 1.05, depth / 2 - 0.01], mid); break;
      case "front": look([0, 1.7, -4], [0, 1, depth / 2]); break;
      case "shooter": {
        const p = stage.start?.position ?? [0, 0.5];
        const f = ((stage.start?.facing ?? 0) * Math.PI) / 180;
        look([p[0], EYE, p[1]], [p[0] + Math.sin(f) * 0.1, EYE - 0.004, p[1] + Math.cos(f) * 0.1]);
        break;
      }
      default: {
        const v = new THREE.Vector3(-0.55, 0.62, -0.56).normalize().multiplyScalar(d * 0.95);
        look([v.x, v.y, depth / 2 + v.z], mid);
      }
    }
  }

  function frameAll(stage) {
    const pts = [...stage.objects.map((o) => o.position), ...stage.lines.flatMap((l) => l.points)];
    if (!pts.length) return preset("iso", stage);
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 4);
    const d = span / (2 * Math.tan((camera.fov * Math.PI) / 360)) + 3;
    const dir = camera.position.clone().sub(controls.target).normalize();
    look([cx + dir.x * d, Math.max(dir.y * d, 2), cz + dir.z * d], [cx, 0, cz]);
  }

  return { controls, preset, frameAll, dispose: () => controls.dispose() };
}
