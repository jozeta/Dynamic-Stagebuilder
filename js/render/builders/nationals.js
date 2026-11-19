// Props from the 2012 US IPSC Nationals stage diagrams: step pads and pull levers (activators),
// start X marks, a bobber that rises from behind hard cover, a twister that spins on its post, a
// wobble platform, a balance rope on a frame and a step box.
import * as THREE from "three";
import { ACTIVATORS, paperSize, TARGET_STICK } from "../../model/props.js";
import { box, group, mesh } from "./parts.js";
import { paperCard } from "./paper.js";

export function buildStepPad(obj) {
  const g = group(obj.id), s = ACTIVATORS.pad;
  const spots = obj.params.pads > 1 ? [[-0.35, -0.35], [0.35, -0.35], [0, 0.35]] : [[0, 0]];
  for (const [x, z] of spots) {
    g.add(box(s, 0.035, s, "activator-red", x, 0.0175, z));
    g.add(box(s - 0.1, 0.015, s - 0.1, "steel-dark", x, 0.0425, z));     // the pressure plate on top
  }
  return g;
}

export function buildPullLever(obj) {
  const g = group(obj.id), L = ACTIVATORS.lever;
  g.add(box(L.base, 0.02, L.base, "steel-dark", 0, 0.01, 0));
  g.add(box(0.08, L.pivot, 0.08, "steel-dark", 0, L.pivot / 2, 0));
  g.add(box(0.04, 0.5, 0.04, "activator-red", 0, L.pivot + 0.25, -0.06));
  g.add(box(0.14, 0.04, 0.04, "plastic-dark", 0, L.pivot + 0.5, -0.06));
  return g;
}

export function buildStartMarks(obj) {
  const g = group(obj.id);
  for (const x of [-0.15, 0.15]) for (const a of [Math.PI / 4, -Math.PI / 4]) {
    const bar = box(0.26, 0.004, 0.03, "line-white", x, 0.002, 0);
    bar.rotation.y = a;
    g.add(bar);
  }
  return g;
}

// A bobber: a card on a riser behind a black hard-cover screen; with Animate it drops out of sight
// and rises again.
export function buildBobber(obj) {
  const g = group(obj.id), c = paperSize(obj);
  g.add(box(0.6, 0.05, 0.5, "steel-dark", 0, 0.025, 0));
  g.add(box(0.6, 0.9, 0.02, "hard-cover", 0, 0.45, -0.2));
  g.add(box(0.06, 0.9, 0.06, "steel-dark", 0, 0.45, 0.12));
  const riser = new THREE.Group();
  riser.userData.anim = { kind: "bob", drop: c.h + 0.15 };
  riser.add(box(TARGET_STICK, 0.75 + c.h * 0.5, TARGET_STICK, "stick-wood", 0, 0.25 + (0.75 + c.h * 0.5) / 2, 0));
  const card = paperCard(obj);
  card.position.set(0, 1.0, -TARGET_STICK / 2 - 0.006);
  riser.add(card);
  g.add(riser);
  return g;
}

// A twister: a card on a vertical spindle; with Animate it spins, face then edge.
export function buildTwister(obj) {
  const g = group(obj.id);
  g.add(box(0.5, 0.04, 0.5, "steel-dark", 0, 0.02, 0));
  g.add(box(0.05, 0.9, 0.05, "steel-dark", 0, 0.45, 0));
  const spin = new THREE.Group();
  spin.userData.anim = { kind: "twist" };
  const card = paperCard(obj);
  card.position.set(0, 0.9, -0.003);
  spin.add(card);
  g.add(spin);
  return g;
}

export function buildWobblePlatform(obj) {
  const g = group(obj.id);
  g.add(box(0.3, 0.15, 0.3, "steel-dark", 0, 0.075, 0));                  // the pivot
  const deck = new THREE.Group();
  deck.position.y = 0.2;
  deck.userData.anim = { kind: "wobble" };
  deck.add(box(1.6, 0.05, 1.2, "rough-wood", 0, 0.025, 0));
  g.add(deck);
  return g;
}

export function buildBalanceRope(obj) {
  const g = group(obj.id);
  g.add(box(0.8, 0.04, 0.5, "steel-dark", 0, 0.02, 0));
  g.add(box(0.06, 2.4, 0.06, "steel-dark", -0.37, 1.2, 0));
  g.add(box(0.8, 0.06, 0.06, "steel-dark", 0, 2.37, 0));
  const rope = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), "rope");
  rope.position.set(0.35, 2.34 - 0.75, 0);
  g.add(rope);
  return g;
}

export function buildStepBox(obj) {
  const g = group(obj.id);
  g.add(box(0.6, 0.2, 0.3, "rough-wood", 0, 0.1, 0));
  return g;
}
