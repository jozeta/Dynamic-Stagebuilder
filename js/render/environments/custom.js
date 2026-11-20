// Your own surroundings (a template made in Settings → Surroundings → New from a plan): a plain
// light concrete ground, your plan image laid on it at its measured scale, position and turn, and
// the template's building pieces. Templates live in this browser (see ui/surroundings.js); the
// image is a canvas made from the file, never the file itself.
import * as THREE from "three";
import { canvasTexture, ground, sun } from "./common.js";
import { planSize, planToWorld } from "../../model/surroundings.js";
import { layout } from "../../model/plan-draw.js";
import { getMaterial } from "../materials.js";
import { buildProp } from "../builders/index.js";

const templates = new Map();     // id → { template, image (canvas or ImageBitmap) | null }

/** Make a template (and its plan image) available to the 3D view. */
export function setTemplate(template, image = templates.get(template.id)?.image ?? null) { templates.set(template.id, { template, image }); }
export function removeTemplate(id) { templates.delete(id); }
export const getTemplate = (id) => templates.get(id) ?? null;

// Materials for the drawn building: painted block walls, dark timber door frames, glass.
let drawMats = null;
const drawMaterials = () => (drawMats ??= {
  wall: getMaterial("bld-concrete"),
  lintel: getMaterial("bld-concrete"), sill: getMaterial("bld-concrete"), head: getMaterial("bld-concrete"),
  jamb: new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.8 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fc3d6, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
});
function buildDrawing(drawing, plan) {
  const g = new THREE.Group();
  g.name = "plan-built";
  const mats = drawMaterials();
  for (const p of layout(drawing, plan.metresPerPixel)) {
    // The part's ends on the ground (plan pixels → world), a box between them.
    const toPx = (m) => [m[0] / plan.metresPerPixel, m[1] / plan.metresPerPixel];
    const A = planToWorld(plan, toPx(p.a)), B = planToWorld(plan, toPx(p.b));
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const thick = p.kind === "glass" ? 0.02 : p.kind === "jamb" ? p.thickness * 1.2 : p.thickness;
    const extra = p.kind === "wall" ? thick : 0;              // walls overlap at corners so they meet
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len + extra, p.y1 - p.y0, thick), mats[p.kind] || mats.wall);
    mesh.position.set((A[0] + B[0]) / 2, (p.y0 + p.y1) / 2, (A[1] + B[1]) / 2);
    mesh.rotation.y = -Math.atan2(B[1] - A[1], B[0] - A[0]);
    mesh.castShadow = p.kind !== "glass";
    mesh.receiveShadow = true;
    mesh.userData.kind = p.kind;
    g.add(mesh);
  }
  return g;
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
