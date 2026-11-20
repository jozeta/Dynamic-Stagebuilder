// Your own surroundings (a template made in Settings → Surroundings → New from a plan): a plain
// light concrete ground, your plan image laid on it at its measured scale, position and turn, and
// the template's building pieces. Templates live in this browser (see ui/surroundings.js); the
// image is a canvas made from the file, never the file itself.
import * as THREE from "three";
import { canvasTexture, ground, sun } from "./common.js";
import { planSize, planToWorld } from "../../model/surroundings.js";
import { layout } from "../../model/plan-draw.js";
import { getMaterial } from "../materials.js";
import { worldUV, grime } from "../builders/wear.js";
import { buildProp } from "../builders/index.js";

const templates = new Map();     // id → { template, image (canvas or ImageBitmap) | null }

/** Make a template (and its plan image) available to the 3D view. */
export function setTemplate(template, image = templates.get(template.id)?.image ?? null) { templates.set(template.id, { template, image }); }
export function removeTemplate(id) { templates.delete(id); }
export const getTemplate = (id) => templates.get(id) ?? null;

// The drawn building: walls in the chosen surface (textures in metres, continuous from piece to piece,
// with grime toward the foot), painted timber door frames and leaves with a handle, aluminium window
// frames with glass and a concrete ledge.
const SURFACE = { concrete: "bld-concrete", block: "bld-block", brick: "bld-brick", plaster: "bld-plaster", wood: "bld-wood", metal: "bld-metal" };
const KIND_MAT = { frame: "door-frame", leaf: "door-leaf", wframe: "window-frame", glass: "window-glass", ledge: "window-ledge" };
const THICK = { frame: (t) => t + 0.03, leaf: () => 0.045, wframe: () => 0.08, glass: () => 0.012, ledge: (t) => t + 0.1 };
function buildDrawing(drawing, plan) {
  const g = new THREE.Group();
  g.name = "plan-built";
  // See-through walls, doors and windows (Settings → the plan's Walls, doors and windows slider):
  // copies of the shared materials at that opacity (the glass a share of its own).
  const op = plan.wallOpacity ?? 1, copies = new Map();
  const mat = (name) => {
    const base = getMaterial(name);
    if (op >= 1) return base;
    if (!copies.has(name)) { const m = base.clone(); m.transparent = true; m.opacity = (base.transparent ? base.opacity : 1) * op; m.depthWrite = false; copies.set(name, m); }
    return copies.get(name);
  };
  g.userData.dispose = () => { for (const m of copies.values()) m.dispose(); };
  const wallMat = SURFACE[drawing.style?.wall] || SURFACE.concrete;
  const toPx = (m) => [m[0] / plan.metresPerPixel, m[1] / plan.metresPerPixel];
  for (const p of layout(drawing, plan.metresPerPixel)) {
    const A = planToWorld(plan, toPx(p.a)), B = planToWorld(plan, toPx(p.b));
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]), h = p.y1 - p.y0;
    const solid = !KIND_MAT[p.kind];                       // wall, lintel, sill, head: the wall's surface
    const t = solid ? p.thickness : THICK[p.kind](p.thickness);
    const extra = p.kind === "wall" ? t : 0;              // walls overlap at corners so they meet
    const angle = -Math.atan2(B[1] - A[1], B[0] - A[0]);
    if (p.kind === "leaf") { g.add(doorLeafNode(A, B, p, angle, mat)); continue; }
    const geo = new THREE.BoxGeometry(len + extra, h, t, solid ? Math.max(1, Math.ceil(len / 0.5)) : 1, solid ? Math.max(2, Math.ceil(h / 0.25)) : 1, 1);
    // Placed in the world in the geometry itself, so the texture (in metres) runs on across pieces.
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3((A[0] + B[0]) / 2, p.y0 + h / 2, (A[1] + B[1]) / 2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0)), new THREE.Vector3(1, 1, 1)));
    const matName = solid ? wallMat : KIND_MAT[p.kind];
    if (solid || p.kind === "ledge") { worldUV(geo); grime(geo, { height: drawing.heights.wall, seed: 31 }); }
    const mesh = new THREE.Mesh(geo, mat(matName));
    mesh.castShadow = p.kind !== "glass";
    mesh.receiveShadow = true;
    mesh.userData.kind = p.kind;
    g.add(mesh);
  }
  return g;
}
// A door leaf hung at A (its hinge side), shut or swung open 90°, with a lever handle on both faces.
function doorLeafNode(A, B, p, angle, mat = getMaterial) {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]), h = p.y1 - p.y0;
  const hinge = new THREE.Group();
  hinge.position.set(A[0], p.y0, A[1]);
  hinge.rotation.y = angle + (p.open ? -Math.PI / 2 * (p.open / 90) : 0);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.045), mat("door-leaf"));
  leaf.position.set(len / 2, h / 2, 0);
  leaf.castShadow = true; leaf.receiveShadow = true;
  hinge.add(leaf);
  for (const side of [-1, 1]) {
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.02), mat("door-handle"));
    lever.position.set(len - 0.12, 1.05, side * 0.05);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 16), mat("door-handle"));
    rose.rotation.x = Math.PI / 2; rose.position.set(len - 0.07, 1.05, side * 0.03);
    hinge.add(lever, rose);
  }
  hinge.userData.kind = "leaf";
  return hinge;
}

export function custom(bay, { templateId } = {}) {
  const entry = templates.get(templateId) ?? null;
  const group = new THREE.Group();
  const size = 400;
  const tiles = canvasTexture(256, (g, s) => {
    g.fillStyle = "#a7a9ab"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 700; i++) { const v = 140 + Math.random() * 50; g.fillStyle = `rgba(${v},${v},${v},0.2)`; g.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
    g.strokeStyle = "rgba(80,82,86,0.35)"; g.lineWidth = 2; g.strokeRect(0, 0, s, s);
  }, [size / 5, size / 5]);
  group.add(ground(size, size, new THREE.MeshStandardMaterial({ color: tiles ? 0xffffff : 0xa7a9ab, map: tiles, roughness: 0.95 }), bay.depth / 2));

  const plan = entry?.template.plan;
  if (plan) {
    const { w, d } = planSize(plan);
    let map = null;
    if (entry.image && typeof document !== "undefined") {
      map = new THREE.CanvasTexture(entry.image);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({
      map, color: map ? 0xffffff : 0xe8ecf2, roughness: 1, transparent: plan.opacity < 1, opacity: plan.opacity,
      polygonOffset: true, polygonOffsetFactor: -2, depthWrite: plan.opacity >= 1 }));
    // Lying flat, read from above with the drawing's top toward down range.
    m.rotation.set(-Math.PI / 2, 0, Math.PI - (plan.rotation * Math.PI) / 180);
    m.position.set(plan.x, 0.004, plan.z);
    m.receiveShadow = true;
    m.userData.plan = true;
    group.add(m);
  }
  // The walls, doors and windows drawn on the plan, in 3D at their heights (cut if chosen).
  if (plan && entry.template.drawing) group.add(buildDrawing(entry.template.drawing, plan));
  for (const p of entry?.template.pieces ?? []) {
    const node = buildProp({ id: "", ...p });
    node.position.set(p.position[0], 0, p.position[1]);
    node.rotation.y = (-p.rotation * Math.PI) / 180;
    node.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    node.userData.piece = true;
    group.add(node);
  }
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5c6066, 1.6);
  const sunLight = sun(bay, 0xffffff, 1.6, [-12, 30, -10]);
  return { group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.8, hemiStrength: 1.6, warmth: 0.1,
    hazeColor: null, background: new THREE.Color(0xc3c7cc), fog: null, missing: !entry };
}
