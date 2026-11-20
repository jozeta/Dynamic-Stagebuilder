// Moving and reactive targets: swinger, drop turner, clamshell and mover (paper), and the Texas
// star, plate rack and dueling tree (steel). Drawn at rest, at the sizes in model/props.js MOVING.
import * as THREE from "three";
import { MOVING, starPlates, paperSize, TARGET_STICK } from "../../model/props.js";
import { getMaterial } from "../materials.js";
import { box as plainBox, worldBox, group } from "./parts.js";
import { steelFaceUV } from "./wear.js";
import { paperCard } from "./paper.js";

// Worn stand steel is mapped in metres, so a long post is not one stretched texture.
const box = (w, h, d, m, ...at) => (m === "steel-dark" ? worldBox : plainBox)(w, h, d, m, ...at);

const FRAME = 0.05;    // square steel tube
const PLATE = 0.012;

function disc(d, mat, x, y, z) {
  const m = new THREE.Mesh(steelFaceUV(new THREE.CylinderGeometry(d / 2, d / 2, PLATE, 32), { axis: "y", round: true, flipV: true }), getMaterial(mat));
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  m.userData.part = "plate";
  return m;
}

// Two uprights on feet with a top bar: the frame most activated targets hang in.
function frame(g, width, height, depth) {
  for (const s of [-1, 1]) {
    const x = s * (width / 2 - FRAME / 2);
    g.add(box(FRAME, height, FRAME, "steel-dark", x, height / 2, 0));
    g.add(box(FRAME, FRAME, depth, "steel-dark", x, FRAME / 2, 0));
  }
  g.add(box(width, FRAME, FRAME, "steel-dark", 0, height - FRAME / 2, 0));
}

export function buildSwinger(obj) {
  const m = MOVING.swinger, c = paperSize(obj), g = group(obj.id);
  frame(g, m.frame, m.pivot + FRAME / 2, m.depth);
  const low = m.pivot - 0.3, top = m.cardBottom + c.h * 0.5;
  g.add(box(0.06, 0.06, 0.08, "steel-dark", 0, m.pivot, -0.02));                                    // pivot
  // Everything that swings hangs from the pivot.
  const swing = new THREE.Group();
  swing.position.set(0, m.pivot, 0);
  swing.userData.anim = { kind: "swing" };
  swing.add(box(TARGET_STICK, top - low, TARGET_STICK, "stick-wood", 0, (low + top) / 2 - m.pivot, -0.04));   // swing arm
  swing.add(box(0.12, 0.12, 0.12, "steel-dark", 0, low - m.pivot, -0.04));                                        // counterweight
  const card = paperCard(obj);
  card.position.set(0, m.cardBottom - m.pivot, -0.04 - TARGET_STICK / 2 - 0.006);
  swing.add(card);
  g.add(swing);
  return g;
}

export function buildDropTurner(obj) {
  const m = MOVING.turner, c = paperSize(obj), g = group(obj.id);
  frame(g, m.frame, m.post, m.depth);
  const top = m.cardBottom + c.h;
  g.add(box(0.025, m.post - top, 0.025, "steel-dark", 0, (m.post + top) / 2, 0));                // turning shaft
  g.add(box(0.08, 0.08, 0.06, "steel-dark", 0, m.post - 0.06, 0));                                 // drop and turn head
  const turn = new THREE.Group();                 // the card turns about the shaft
  turn.userData.anim = { kind: "turn" };
  const card = paperCard(obj);
  card.position.set(0, m.cardBottom, -0.02);
  turn.add(card);
  g.add(turn);
  return g;
}

export function buildClamshell(obj) {
  const m = MOVING.clam, c = paperSize(obj), g = group(obj.id);
  const w = c.w + 0.1, height = m.cardBottom + c.h + 0.05;
  frame(g, w, height, m.depth);
  const card = paperCard(obj);
  card.position.set(0, m.cardBottom, 0.02);
  g.add(card);
  // The steel cover, hinged at the bottom of the card, part way down.
  const hinge = new THREE.Group();
  hinge.position.set(0, m.cardBottom, -0.03);
  const cover = box(c.w + 0.02, c.h * 0.5, 0.01, "steel-white", 0, c.h * 0.25, 0);
  steelFaceUV(cover.geometry);
  hinge.add(cover);
  hinge.rotation.x = -0.7;
  hinge.userData.anim = { kind: "clam", rest: -0.7 };
  g.add(hinge);
  g.add(box(c.w, 0.03, 0.04, "steel-dark", 0, m.cardBottom, -0.03));
  return g;
}

export function buildMover(obj) {
  const m = MOVING.mover, c = paperSize(obj), g = group(obj.id);
  const n = Math.max(1, Math.min(4, Math.round(obj.params.targets || 1))), spread = (n - 1) * 0.7;
  const L = Math.max(obj.params.length, spread + c.w);
  for (const z of [-0.1, 0.1]) g.add(box(L, 0.04, 0.04, "steel-dark", 0, 0.02, z));                  // rails
  for (let x = -L / 2 + 0.025; x <= L / 2 - 0.025 + 1e-9; x += Math.max(0.4, (L - 0.05) / Math.round((L - 0.05) / 0.5))) {
    g.add(box(0.05, 0.02, m.depth, "stick-wood", x, 0.01, 0));                                       // sleepers
  }
  const cart = new THREE.Group();                 // the trolley and its target run along the track
  cart.userData.anim = { kind: "slide", range: Math.max(0, (L - spread - c.w) / 2) };
  cart.add(box(Math.max(0.4, spread + 0.4), 0.12, 0.3, "steel-dark", 0, 0.1, 0));                   // trolley (one carrier for every card)
  const top = m.cardBottom + c.h * 0.5;
  for (let i = 0; i < n; i++) {
    const cx = (i - (n - 1) / 2) * 0.7;
    for (const x of [-0.11, 0.11]) cart.add(box(TARGET_STICK, top - 0.16, TARGET_STICK, "stick-wood", cx + x, 0.16 + (top - 0.16) / 2, 0));
    const card = paperCard(obj);
    card.position.set(cx, m.cardBottom, -TARGET_STICK / 2 - 0.006);
    cart.add(card);
  }
  g.add(cart);
  return g;
}

export function buildTexasStar(obj) {
  const s = MOVING.star, g = group(obj.id), paint = `steel-${obj.params.paint || "white"}`;
  g.add(box(s.base, FRAME, FRAME, "steel-dark", 0, FRAME / 2, 0));                                  // foot
  g.add(box(FRAME, FRAME, s.depth, "steel-dark", 0, FRAME / 2, 0));
  g.add(box(0.06, s.hub, 0.06, "steel-dark", 0, s.hub / 2, 0.05));                                  // post
  const star = new THREE.Group();                 // the star spins on the hub
  star.position.set(0, s.hub, 0);
  star.userData.anim = { kind: "spin" };
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20), getMaterial("steel-dark"));
  hub.rotation.x = Math.PI / 2;
  hub.position.set(0, 0, -0.02);
  star.add(hub);
  for (const [x, y] of starPlates(obj.params.plates)) {
    const len = Math.hypot(x, y - s.hub), arm = box(len, 0.04, 0.015, "steel-dark", x / 2, (y - s.hub) / 2, -0.035);
    arm.rotation.z = Math.atan2(y - s.hub, x);
    star.add(arm);
    star.add(disc(s.plate, paint, x, y - s.hub, -0.05));
  }
  g.add(star);
  return g;
}

export function buildPlateRack(obj) {
  const r = MOVING.rack, n = obj.params.plates, g = group(obj.id), w = n * r.pitch + 0.1;
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 - FRAME / 2);
    g.add(box(FRAME, r.centre - 0.05, FRAME, "steel-dark", x, (r.centre - 0.05) / 2, 0));
    g.add(box(FRAME, FRAME, r.depth, "steel-dark", x, FRAME / 2, 0));
  }
  g.add(box(w, 0.1, 0.06, "steel-dark", 0, r.centre - 0.1, 0));                                     // the rack beam
  // Each plate hinges at its foot on the beam and falls back when hit.
  for (let i = 0; i < n; i++) {
    const hinge = new THREE.Group();
    hinge.position.set((i - (n - 1) / 2) * r.pitch, r.centre - r.plate / 2, -0.05);
    hinge.userData.anim = { kind: "fall", delay: i * 0.35, period: n * 0.35 + 2 };
    hinge.add(disc(r.plate, `steel-${obj.params.paint || "white"}`, 0, r.plate / 2, 0));
    g.add(hinge);
  }
  return g;
}

export function buildDuelingTree(obj) {
  const t = MOVING.tree, g = group(obj.id), paint = `steel-${obj.params.paint || "white"}`;
  g.add(box(t.base, 0.04, 0.08, "steel-dark", 0, 0.02, 0));
  g.add(box(0.08, 0.04, t.base, "steel-dark", 0, 0.02, 0));
  g.add(box(0.05, t.post, 0.05, "steel-dark", 0, t.post / 2, 0));
  // Each paddle swings over the top of the post to the other side when hit.
  let k = 0;
  for (const [side, ys] of [[1, t.left], [-1, t.right]]) for (const y of ys) {
    const pivot = new THREE.Group();
    pivot.position.set(0, y + t.paddle / 2 + 0.01, 0);
    pivot.userData.anim = { kind: "flip", side, delay: (k++) * 0.6, period: 6 * 0.6 + 2 };
    pivot.add(box(t.arm, 0.02, 0.02, "steel-dark", side * t.arm / 2, 0, -0.035));
    const paddle = box(t.paddle, t.paddle, PLATE, paint, side * t.arm, -t.paddle / 2 - 0.01, -0.045);
    steelFaceUV(paddle.geometry);
    paddle.userData.part = "plate";
    pivot.add(paddle);
    g.add(pivot);
  }
  return g;
}
