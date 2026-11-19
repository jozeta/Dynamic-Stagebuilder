// Fault lines and shooting areas as red bars on the ground (world coordinates), and the start marker.
import * as THREE from "three";
import { figureMeshes } from "./position.js";
import { startFigure, startFacing } from "../../model/start-pose.js";
import { getMaterial } from "../materials.js";
import { box, group } from "./parts.js";

const BAR_W = 0.05;  // red-painted timber, 5 × 4 cm
const BAR_H = 0.04;

export function buildLine(line) {
  const g = group(line.id);
  const pts = line.points;
  const n = line.closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 1e-6) continue;
    const bar = box(len + BAR_W, BAR_H, BAR_W, "fault-red", (x1 + x2) / 2, BAR_H / 2, (z1 + z2) / 2);
    bar.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    bar.userData.bar = true;
    g.add(bar);
  }
  if (line.type === "shooting-area" && line.closed && pts.length >= 3) {
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, z)));
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), getMaterial("area-fill"));
    fill.rotation.x = Math.PI / 2;   // shape x/y → world x/z
    fill.position.y = 0.003;
    g.add(fill);
  }
  return g;
}

/** A 1 × 1 m square with an arrow pointing in the facing direction (0° = down range, +z). */
// The start box, with the shooter in it (posed from the briefing; turned round when the text
// says he faces up range). `stage` is optional (no figure without it).
export function buildStartMarker(start, stage = null) {
  const g = group("start");
  const t = 0.05, h = 0.01;
  g.add(box(1, h, t, "start-marker", 0, h / 2, -0.5 + t / 2));
  g.add(box(1, h, t, "start-marker", 0, h / 2, 0.5 - t / 2));
  g.add(box(t, h, 1 - 2 * t, "start-marker", -0.5 + t / 2, h / 2, 0));
  g.add(box(t, h, 1 - 2 * t, "start-marker", 0.5 - t / 2, h / 2, 0));
  const arrow = new THREE.Shape([new THREE.Vector2(-0.2, -0.15), new THREE.Vector2(0.2, -0.15), new THREE.Vector2(0, 0.3)]);
  const a = new THREE.Mesh(new THREE.ShapeGeometry(arrow), getMaterial("start-marker"));
  a.rotation.x = Math.PI / 2;
  a.position.y = 0.004;
  g.add(a);
  if (stage) {
    const man = new THREE.Group();
    man.userData.runPart = "figure";            // Settings → View can hide the figures
    man.add(...figureMeshes(startFigure(stage.briefing || {})));
    man.rotation.y = (-(startFacing(stage) - (start.facing || 0)) * Math.PI) / 180;
    g.add(man);
  }
  g.position.set(start.position[0], 0, start.position[1]);
  g.rotation.y = (-(start.facing || 0) * Math.PI) / 180;
  return g;
}
