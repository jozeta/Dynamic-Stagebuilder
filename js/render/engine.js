// The Three.js renderer, scene and render loop. Renders on demand: call requestRender() after a change.
// Scene layout: environment (ground, sky, surroundings), stage (props, built from stage data) and
// helper (selection, gizmos) groups. Environments never touch the stage group.
import * as THREE from "three";
import { createEnvironment } from "./environments/index.js";

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 1000);
  camera.position.set(-14, 16, -10);
  camera.lookAt(0, 0, 15);

  const groups = { environment: new THREE.Group(), stage: new THREE.Group(), helper: new THREE.Group() };
  groups.environment.name = "environment";
  groups.stage.name = "stage";
  groups.helper.name = "helper";
  scene.add(groups.environment, groups.stage, groups.helper);

  const renderHooks = [];
  let pending = false;
  function frame() {
    pending = false;
    for (const fn of renderHooks) fn();
    renderer.render(scene, camera);
  }
  function requestRender() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(frame);
  }
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  // Swap the surroundings: ground, lights, background and fog. The stage group is never touched.
  let env = null;
  function setEnvironment(name, bay) {
    if (env) {
      groups.environment.remove(env.group);
      for (const l of env.lights) { groups.environment.remove(l); if (l.target) groups.environment.remove(l.target); }
      env.dispose();
    }
    env = createEnvironment(name, bay);
    groups.environment.add(env.group);
    for (const l of env.lights) { groups.environment.add(l); if (l.target) groups.environment.add(l.target); }
    scene.background = env.background;
    scene.fog = env.fog;
    requestRender();
  }

  return {
    scene, camera, renderer, groups, requestRender, resize, setEnvironment,
    onRender(fn) { renderHooks.push(fn); },
    dispose() { observer.disconnect(); renderer.dispose(); },
  };
}
