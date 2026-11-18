// Walls: a mesh panel in a black or wooden frame, a solid wooden wall, and a wooden wall with a real
// rectangular port cut through it. Centred on the origin, length along x, thickness along z.
import * as THREE from "three";
import { STICK } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box, extrude, group } from "./parts.js";

const MESH_TILE = 0.25;   // one texture tile of wire mesh, in metres
const PANEL = 0.02;

function frame(g, length, height, material) {
  const posts = [-length / 2 + STICK / 2, length / 2 - STICK / 2];
  const mids = Math.max(0, Math.round(length / 1.2) - 1);
  for (let i = 1; i <= mids; i++) posts.push(-length / 2 + (length * i) / (mids + 1));
  for (const x of posts) g.add(box(STICK, height, STICK, material, x, height / 2, 0));
  const rail = length - 2 * STICK;
  g.add(box(rail, STICK, STICK, material, 0, STICK / 2, 0));
  g.add(box(rail, STICK, STICK, material, 0, height - STICK / 2, 0));
}

function meshPanel(w, h, material) {
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / MESH_TILE, (uv.getY(i) * h) / MESH_TILE);
  const m = new THREE.Mesh(geo, getMaterial(material));
  m.castShadow = true;
  return m;
}

export function buildMeshWall(obj) {
  const { length, height, mesh, frame: frameColour } = obj.params;
  const g = group(obj.id);
  const frameMat = frameColour === "wood" ? "wood" : "frame-black";
  frame(g, length, height, frameMat);
  const panel = meshPanel(length - 2 * STICK, height - 2 * STICK, mesh === "blue" ? "mesh-blue" : "mesh-black");
  panel.position.set(0, height / 2, 0);
  g.add(panel);
  return g;
}

export function buildWoodWall(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) g.add(box(STICK, height, STICK, "wood", x, height / 2, 0));
  g.add(box(length - 2 * STICK, height, PANEL, "wood", 0, height / 2, 0));
  return g;
}

export function buildPortWall(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  for (const x of [-length / 2 + STICK / 2, length / 2 - STICK / 2]) g.add(box(STICK, height, STICK, "wood", x, height / 2, 0));
  // Keep the port inside the panel, at least 5 cm from every edge.
  const inner = length - 2 * STICK;
  const pw = Math.min(obj.params.portWidth, inner - 0.1);
  const ph = Math.min(obj.params.portHeight, height - 0.1);
  const pb = Math.min(Math.max(obj.params.portBottom, 0.05), height - 0.05 - ph);
  const s = new THREE.Shape();
  s.moveTo(-inner / 2, 0); s.lineTo(inner / 2, 0); s.lineTo(inner / 2, height); s.lineTo(-inner / 2, height); s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-pw / 2, pb); hole.lineTo(-pw / 2, pb + ph); hole.lineTo(pw / 2, pb + ph); hole.lineTo(pw / 2, pb); hole.closePath();
  s.holes.push(hole);
  g.add(extrude(s, PANEL, "wood", PANEL / 2));
  return g;
}
