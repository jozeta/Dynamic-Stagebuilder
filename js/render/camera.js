// Camera navigation (orbit, pan, zoom; one finger rotates, two pan and zoom on touch) and presets.
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { obliqueView, stageArea, VIEW } from "./view-math.js";
import { viewFromPosition, anglesFromView, walkBetween, walkDuration } from "../model/positions.js";
import { surfaceHeight, pointAlong, legLength } from "../model/route.js";

export const PRESETS = ["iso", "top", "front", "shooter"];
export const PRESET_LABELS = { iso: "Isometric", top: "Top", front: "Front", shooter: "Shooter's eye" };
const EYE = 1.6;

export function createCameraRig(engine, domElement) {
  const camera = engine.camera;
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;   // never below the ground
  controls.minDistance = 0.05;   // the shooter's eye turns in place round a point 10 cm ahead
  controls.maxDistance = 250;
  controls.addEventListener("change", () => engine.requestRender());

  // Overview presets use a long lens (drone / telephoto feel); the shooter's eye a natural one.
  function lens(fov) {
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  }

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
    lens(name === "shooter" || name === "front" ? VIEW.eyeFov : VIEW.fov);
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
        const v = obliqueView(stageArea(stage), camera.aspect || 1.6);
        look(v.position, v.target);
      }
    }
  }

  function frameAll(stage) {
    const pts = [...stage.objects.map((o) => o.position), ...stage.lines.flatMap((l) => l.points)];
    if (!pts.length) return preset("iso", stage);
    lens(VIEW.fov);
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 4);
    const d = span / (2 * Math.tan((camera.fov * Math.PI) / 360)) + 3;
    const dir = camera.position.clone().sub(controls.target).normalize();
    look([cx + dir.x * d, Math.max(dir.y * d, 2), cz + dir.z * d], [cx, 0, cz]);
  }

  // Shooter's eye from a shooting position: its eye height, facing and look angle.
  function viewFrom(o) {
    lens(VIEW.eyeFov);
    const v = viewFromPosition(o);
    look(v.eye, v.target);
  }
  /** Where the camera looks now, as a shooting position's facing and pitch. */
  function currentAngles() {
    return anglesFromView(camera.position.toArray(), controls.target.toArray());
  }

  // Shooter's eye on the move: a view is { eye: [x, y, z], yaw, pitch } in the shooting-position
  // convention (yaw 0 looks down range). walkTo() walks the camera there (or jumps, when the
  // system asks for reduced motion) and resolves true when it arrives, false if interrupted.
  const rad = (d) => (d * Math.PI) / 180;
  function lookFrom(v) {
    const dir = [-Math.sin(rad(v.yaw)) * Math.cos(rad(v.pitch)), Math.sin(rad(v.pitch)), Math.cos(rad(v.yaw)) * Math.cos(rad(v.pitch))];
    look(v.eye, v.eye.map((p, i) => p + dir[i] * 0.1));
  }
  let walking = null;
  function stopWalk() { if (walking) { cancelAnimationFrame(walking.frame); walking.done(false); walking = null; } }
  // With a route (`path`, [[x, z], …] from here to there, and the stage), the camera walks along it,
  // standing on the ground, ramps and platforms under it.
  function walkTo(to, { path = null, stage = null } = {}) {
    stopWalk();
    lens(VIEW.eyeFov);
    const a = currentAngles();
    const from = { eye: camera.position.toArray(), yaw: a.rotation, pitch: a.pitch };
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ground = (x, z) => (stage ? surfaceHeight(stage, x, z) : 0);
    const eyeFrom = from.eye[1] - ground(from.eye[0], from.eye[2]), eyeTo = to.eye[1] - ground(to.eye[0], to.eye[2]);
    const route = path && path.length >= 2 ? path : null;
    const dist = route ? legLength(route) : Math.hypot(to.eye[0] - from.eye[0], to.eye[2] - from.eye[2]);
    const ms = reduce ? 0 : walkDuration([0, 0, 0], [dist, 0, 0]) * 1000;
    return new Promise((done) => {
      const t0 = performance.now();
      const w = { done, frame: 0 };
      walking = w;
      const step = () => {
        const t = ms ? (performance.now() - t0) / ms : 1;
        const v = walkBetween(from, to, t);
        if (route) {
          const k = v.eased;
          const [x, z] = pointAlong(route, k);
          v.eye = [x, ground(x, z) + eyeFrom + (eyeTo - eyeFrom) * k, z];
        }
        lookFrom(v);
        if (t < 1) w.frame = requestAnimationFrame(step);
        else { if (walking === w) walking = null; done(true); }
      };
      step();
    });
  }
  /** The view from the start position, or from a shooting position. */
  const startView = (stage) => {
    const p = stage.start?.position ?? [0, 0.5];
    return { eye: [p[0], EYE + surfaceHeight(stage, p[0], p[1]), p[1]], yaw: -(stage.start?.facing ?? 0), pitch: 0 };
  };
  // Standing on whatever is under the position (a platform, a ramp).
  const positionView = (o, stage) => {
    const e = viewFromPosition(o).eye;
    return { eye: [e[0], e[1] + (stage ? surfaceHeight(stage, e[0], e[2]) : 0), e[2]], yaw: o.rotation || 0, pitch: o.params?.pitch || 0 };
  };
  controls.addEventListener("start", stopWalk);      // grabbing the view stops a walk

  return { controls, preset, frameAll, viewFrom, currentAngles, walkTo, stopWalk, jumpTo: (v) => { stopWalk(); lens(VIEW.eyeFov); lookFrom(v); }, startView, positionView, dispose: () => controls.dispose() };
}
