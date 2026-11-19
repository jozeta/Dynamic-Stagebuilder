// Building pieces for your own surroundings: walls (concrete, brick, wood or metal), square pillars,
// round columns, earth berms, shipping containers, chain-link fences and concrete barriers.
import * as THREE from "three";
import { CONTAINERS, BARRIER } from "../../model/props.js";
import { box, group, mesh } from "./parts.js";

const mat = (m) => `bld-${["concrete", "brick", "wood", "metal"].includes(m) ? m : "concrete"}`;

export function buildBuildingWall(obj) {
  const { length, height, thickness, material } = obj.params;
  const g = group(obj.id);
  g.add(box(length, height, thickness, mat(material), 0, height / 2, 0));
  return g;
}

export function buildPillar(obj) {
  const { size, height, material } = obj.params;
  const g = group(obj.id);
  g.add(box(size, height, size, mat(material), 0, height / 2, 0));
  return g;
}

export function buildColumn(obj) {
  const { diameter, height, material } = obj.params;
  const g = group(obj.id);
  const c = mesh(new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 28), mat(material));
  c.position.y = height / 2;
  g.add(c);
  return g;
}

// An earth bank: a trapezoid in section (flat top a third of the base), extruded along its length.
export function buildBerm(obj) {
  const { length, height, depth } = obj.params;
  const g = group(obj.id);
  const s = new THREE.Shape();
  const top = depth / 6;
  s.moveTo(-depth / 2, 0); s.lineTo(depth / 2, 0); s.lineTo(top, height); s.lineTo(-top, height); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
  geo.translate(0, 0, -length / 2);
  geo.rotateY(Math.PI / 2);
  g.add(mesh(geo, "bld-earth"));
  return g;
}

export function buildContainer(obj) {
  const c = CONTAINERS[obj.params.size] || CONTAINERS["20ft"];
  const g = group(obj.id);
  g.add(box(c.length, c.height, c.width, `container-${obj.params.color || "blue"}`, 0, c.height / 2, 0));
  // Corner castings and the door end's frame.
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    g.add(box(0.18, 0.12, 0.18, "steel-dark", x * (c.length / 2 - 0.09), 0.06, z * (c.width / 2 - 0.09)));
    g.add(box(0.18, 0.12, 0.18, "steel-dark", x * (c.length / 2 - 0.09), c.height - 0.06, z * (c.width / 2 - 0.09)));
  }
  return g;
}

export function buildFence(obj) {
  const { length, height } = obj.params;
  const g = group(obj.id);
  const posts = Math.max(2, Math.round(length / 2.5) + 1);
  for (let i = 0; i < posts; i++) {
    const x = -length / 2 + 0.03 + (i * (length - 0.06)) / (posts - 1);
    g.add(box(0.06, height, 0.06, "bare-steel", x, height / 2, 0));
    g.add(box(0.06, 0.04, 0.5, "bare-steel", x, 0.02, 0));                    // a foot
  }
  g.add(box(length, 0.04, 0.04, "bare-steel", 0, height - 0.02, 0));
  const net = mesh(new THREE.PlaneGeometry(length - 0.06, height - 0.1), "fence-mesh");
  net.position.set(0, (height - 0.1) / 2 + 0.05, 0);
  g.add(net);
  return g;
}

// A concrete jersey barrier: wide sloped foot, narrow top.
export function buildBarrier(obj) {
  const { length } = obj.params;
  const g = group(obj.id);
  const s = new THREE.Shape();
  const b = BARRIER.base / 2, h = BARRIER.height;
  s.moveTo(-b, 0); s.lineTo(b, 0); s.lineTo(b, 0.08); s.lineTo(0.15, 0.33); s.lineTo(0.1, h); s.lineTo(-0.1, h); s.lineTo(-0.15, 0.33); s.lineTo(-b, 0.08); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
  geo.translate(0, 0, -length / 2);
  geo.rotateY(Math.PI / 2);
  g.add(mesh(geo, "bld-concrete"));
  return g;
}
