// The Three.js renderer, scene and render loop. Renders on demand: call requestRender() after a change.
// Scene layout: environment (ground, sky, surroundings), stage (props, built from stage data) and
// helper (selection, gizmos) groups. Environments never touch the stage group.
import * as THREE from "three";
import { createEnvironment, applyLook } from "./environments/index.js";

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;   // warm, filmic highlights like a photo
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 1000);
  const pmrem = new THREE.PMREMGenerator(renderer);
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
  function setLook(look, bay) {
    if (!env) return;
    applyLook(env, look, bay);
    scene.fog = env.fog;
    renderer.toneMappingExposure = env.exposure ?? 1.05;
    requestRender();
  }

  function setEnvironment(name, bay, look = null) {
    if (env) {
      groups.environment.remove(env.group);
      for (const l of env.lights) { groups.environment.remove(l); if (l.target) groups.environment.remove(l.target); }
      env.dispose();
    }
    env = createEnvironment(name, bay, { onUpdate: requestRender });
    groups.environment.add(env.group);
    for (const l of env.lights) { groups.environment.add(l); if (l.target) groups.environment.add(l.target); }
    scene.background = env.background;
    scene.fog = env.fog;
    // Image-based light from the environment's own sky (reflections and soft fill only; the sky
    // texture is never shown as the backdrop).
    scene.environment?.dispose();
    scene.environment = env.reflectionSky ? pmrem.fromEquirectangular(env.reflectionSky).texture : null;
    scene.environmentIntensity = env.reflectionStrength ?? 0;
    renderer.toneMappingExposure = env.exposure ?? 1.05;
    if (look) setLook(look, bay);
    requestRender();
  }

  return {
    scene, camera, renderer, groups, requestRender, resize, setEnvironment, setLook,
    onRender(fn) { renderHooks.push(fn); },
    dispose() { observer.disconnect(); renderer.dispose(); },
  };
}
