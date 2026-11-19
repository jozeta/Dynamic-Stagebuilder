// Shared materials, created once and reused by every prop (never disposed with a prop). Textures are
// painted on canvases in code (no downloads): square wire mesh, pine, plywood, cardboard. In Node
// (tests) there is no canvas, so plain colours are used.
import * as THREE from "three";
import { OUTLINE, ZONES, GRID } from "./builders/target-shape.js";
import { TARGET_SIZES } from "../model/props.js";

const cache = new Map();
const hasDom = typeof document !== "undefined";

// A small seeded random so textures look the same on every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function canvasTexture(size, draw, { repeat = 1, seed = 1, color = true } = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size, rng(seed));
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  return t;
}

// Square welded wire mesh: one texture tile = 0.5 m. Black mesh: 5 × 5 holes of 10 cm with bold
// wires; blue mesh: 8 × 8 denser holes with thicker painted wires, as on the reference range.
function meshTexture(color, n = 5, wire = 11) {
  return canvasTexture(256, (g, s, r) => {
    g.clearRect(0, 0, s, s);
    const step = s / n;
    for (let i = 0; i < n; i++) {
      const p = i * step;
      g.fillStyle = color;
      g.fillRect(p, 0, wire, s);
      g.fillRect(0, p, s, wire);
      g.fillStyle = "rgba(255,255,255,0.16)";         // a highlight on each wire
      g.fillRect(p + 1, 0, 1, s);
      g.fillRect(0, p + 1, s, 1);
    }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${0.1 * r()})`; g.fillRect(r() * s, r() * s, 6, 6); }
  });
}

function grain(g, s, r, { base, dark, lines = 70, vertical = false }) {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < lines; i++) {
    g.strokeStyle = `rgba(${dark},${0.05 + r() * 0.12})`;
    g.lineWidth = 0.6 + r() * 1.8;
    const o = r() * s, w = 3 + r() * 6;
    g.beginPath();
    for (let t = 0; t <= s; t += 8) {
      const a = o + Math.sin(t / (30 + r() * 4)) * w;
      if (vertical) (t ? g.lineTo(a, t) : g.moveTo(a, t)); else (t ? g.lineTo(t, a) : g.moveTo(t, a));
    }
    g.stroke();
  }
  for (let i = 0; i < 3; i++) {                        // a few knots
    const x = r() * s, y = r() * s;
    g.fillStyle = `rgba(${dark},0.35)`;
    g.beginPath(); g.ellipse(x, y, 3 + r() * 4, 2 + r() * 2, 0, 0, Math.PI * 2); g.fill();
  }
}

const pine = () => canvasTexture(256, (g, s, r) => grain(g, s, r, { base: "#d8b47e", dark: "120,78,38", vertical: true }), { seed: 3 });
const plywood = () => canvasTexture(512, (g, s, r) => {
  grain(g, s, r, { base: "#d6b07a", dark: "126,84,42", lines: 140, vertical: true });
  g.fillStyle = "rgba(90,60,30,0.45)";
  for (let i = 1; i < 4; i++) g.fillRect((i * s) / 4 - 1, 0, 2, s);   // plank seams
}, { seed: 5 });
const cardboard = () => canvasTexture(256, (g, s, r) => {
  g.fillStyle = "#cfa06a"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2500; i++) { const v = r() > 0.5 ? 255 : 60; g.fillStyle = `rgba(${v},${v * 0.8},${v * 0.55},0.05)`; g.fillRect(r() * s, r() * s, 2, 2); }
}, { seed: 7 });

// A worn painted steel drum: paint, scratches showing bare metal, rust patches and drips, a
// darker band where the rolling hoops scuff. Wraps once around the barrel (u) and bottom→top (v).
function drumTexture(paint) {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 60; i++) {                          // mottled, faded paint
      const x = r() * s, y = r() * s, rad = 10 + r() * 60;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(255,255,255,${0.03 + r() * 0.05})`); grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 26; i++) {                          // rust patches
      const x = r() * s, y = r() < 0.6 ? s * (0.82 + r() * 0.18) : r() * s, rad = 4 + r() * 22;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, "rgba(122,62,28,0.75)"); grd.addColorStop(0.6, "rgba(150,82,40,0.35)"); grd.addColorStop(1, "rgba(150,82,40,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 18; i++) {                          // rust drips running down
      const x = r() * s, y0 = s * (0.75 + r() * 0.2), len = 30 + r() * 120;
      const grd = g.createLinearGradient(0, y0, 0, y0 - len);
      grd.addColorStop(0, "rgba(120,60,26,0.5)"); grd.addColorStop(1, "rgba(120,60,26,0)");
      g.fillStyle = grd; g.fillRect(x, y0 - len, 1.5 + r() * 2.5, len);
    }
    for (let i = 0; i < 220; i++) {                         // scratches to bare metal
      const x = r() * s, y = r() * s, l = 4 + r() * 26, a = (r() - 0.5) * 0.8;
      g.strokeStyle = `rgba(190,190,185,${0.25 + r() * 0.4})`; g.lineWidth = 0.6 + r();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (const band of [0.33, 0.66]) {                      // scuffed rolling hoops
      g.fillStyle = "rgba(40,30,24,0.35)"; g.fillRect(0, s * (1 - band) - 6, s, 12);
    }
  }, { seed: paint.length * 31 + paint.charCodeAt(1) });
}

// Tyre tread blocks around the circumference (u) across the tread width (v), plus a bump map.
function treadTexture(bump) {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = bump ? "#707070" : "#202123"; g.fillRect(0, 0, s, s);
    const blocks = 24;
    for (let i = 0; i < blocks; i++) {
      const x = (i / blocks) * s;
      g.fillStyle = bump ? "#d0d0d0" : "#2a2b2d";
      g.fillRect(x + 3, s * 0.38, s / blocks - 8, s * 0.24);           // centre rib
      g.fillRect(x + (i % 2 ? 6 : 0), s * 0.08, s / blocks - 10, s * 0.24);
      g.fillRect(x + (i % 2 ? 0 : 6), s * 0.68, s / blocks - 10, s * 0.24);
    }
    if (!bump) for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(120,110,95,${0.05 + r() * 0.12})`; g.fillRect(r() * s, r() * s, 2 + r() * 4, 1 + r() * 2); }
  }, { seed: 13, color: !bump });
}

function burlap() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#b39a6c"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 4) {
      g.fillStyle = `rgba(90,70,40,${0.12 + r() * 0.1})`; g.fillRect(i, 0, 1.5, s); g.fillRect(0, i, s, 1.5);
    }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,50,30,${0.1 + r() * 0.15})`; g.beginPath(); g.arc(r() * s, r() * s, 5 + r() * 18, 0, 7); g.fill(); }
  }, { seed: 17 });
}

function roughBoards() {
  return canvasTexture(256, (g, s, r) => {
    grain(g, s, r, { base: "#c79c63", dark: "110,70,34", lines: 60 });
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,40,20,${0.08 + r() * 0.12})`; g.fillRect(r() * s, r() * s, 1 + r() * 3, 8 + r() * 30); }
  }, { seed: 19 });
}

function coneTexture() {
  return canvasTexture(128, (g, s) => {
    g.fillStyle = "#f06a1a"; g.fillRect(0, 0, s, s);
    g.fillStyle = "#f4f4f0"; g.fillRect(0, s * 0.25, s, s * 0.14); g.fillRect(0, s * 0.52, s, s * 0.1);
  }, { seed: 23 });
}

// The printed face of a cardboard target: tan board with darker brown scoring-zone outlines.
// Extrude cap UVs are in metres, so the texture is placed with repeat/offset over the card size.
function cardTexture({ base, line, fibres }, size) {
  const W = 512, H = Math.round((W * GRID.h) / GRID.w);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  const r = (() => { let x = 7; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const px = ([x, y]) => [((x + GRID.w / 2) / GRID.w) * W, H - (y / GRID.h) * H];
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { const v = r() > 0.5 ? 255 : 70; g.fillStyle = `rgba(${v},${v * 0.82},${v * 0.6},${fibres})`; g.fillRect(r() * W, r() * H, 2, 2); }
  g.strokeStyle = line; g.lineJoin = "round";
  g.lineWidth = 5;
  g.beginPath(); OUTLINE.forEach((p, i) => { const [x, y] = px(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.stroke();
  g.lineWidth = 4;
  for (const [x, y, w, h] of ZONES) {
    const [x0, y0] = px([x, y + h]), [x1, y1] = px([x + w, y]);
    g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / size.w, 1 / size.h);
  t.offset.set(0.5, 0);
  return t;
}

function steelSheet() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#b9bec2"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "60,66,72"},${0.04 + r() * 0.06})`; g.fillRect(r() * s, r() * s, 1 + r() * 30, 1); }
    for (let i = 0; i < 12; i++) { g.fillStyle = "rgba(90,96,102,0.25)"; g.beginPath(); g.arc(r() * s, r() * s, 1.5, 0, 7); g.fill(); }
  }, { seed: 43 });
}

const std = (o) => new THREE.MeshStandardMaterial(o);
const mapped = (tex, fallback, extra = {}) => std({ roughness: 0.85, ...(hasDom ? { map: tex() } : { color: fallback }), ...extra });

const specs = {
  "target-tan": () => mapped(cardboard, 0xcfa06a, { roughness: 0.95 }),
  "card-ipsc": () => std({ roughness: 0.95, ...(hasDom ? { map: cardTexture({ base: "#d0a16a", line: "#8a5d33", fibres: 0.05 }, TARGET_SIZES.ipsc) } : { color: 0xd0a16a }) }),
  "card-mini": () => std({ roughness: 0.95, ...(hasDom ? { map: cardTexture({ base: "#d0a16a", line: "#8a5d33", fibres: 0.05 }, TARGET_SIZES.mini) } : { color: 0xd0a16a }) }),
  "noshoot-ipsc": () => std({ roughness: 0.95, ...(hasDom ? { map: cardTexture({ base: "#f2efe6", line: "#9a958a", fibres: 0.03 }, TARGET_SIZES.ipsc) } : { color: 0xf2efe6 }) }),
  "noshoot-mini": () => std({ roughness: 0.95, ...(hasDom ? { map: cardTexture({ base: "#f2efe6", line: "#9a958a", fibres: 0.03 }, TARGET_SIZES.mini) } : { color: 0xf2efe6 }) }),
  "panel-grey": () => mapped(steelSheet, 0xc9ced2, { roughness: 0.55, metalness: 0.12 }),
  "card-edge": () => std({ color: 0x8b6a45, roughness: 1 }),
  "steel-white": () => std({ color: 0xeeece4, roughness: 0.55, metalness: 0.15 }),
  "steel-yellow": () => std({ color: 0xf2c81e, roughness: 0.45, metalness: 0.1 }),
  "steel-dark": () => std({ color: 0x3a3d42, roughness: 0.6, metalness: 0.5 }),
  "stand-blue": () => std({ color: 0x2a58c0, roughness: 0.45, metalness: 0.35 }),
  "stick-wood": () => mapped(pine, 0xd8b47e),
  // Alpha-to-coverage keeps the thin wires visible (and smooth) at a distance, where plain alpha
  // testing would mip them away; alphaTest also gives the lattice shadow on the ground.
  "mesh-black": () => std({ color: 0xffffff, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide, alphaTest: 0.18, alphaToCoverage: true,
    ...(hasDom ? { map: meshTexture("#141517") } : { color: 0x141517 }) }),
  "mesh-blue": () => std({ color: 0xffffff, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide, alphaTest: 0.18, alphaToCoverage: true,
    ...(hasDom ? { map: meshTexture("#2f6af0") } : { color: 0x2459d8 }) }),
  "frame-black": () => std({ color: 0x1b1c1e, roughness: 0.55, metalness: 0.3 }),
  wood: () => mapped(pine, 0xd8b47e),
  plywood: () => mapped(plywood, 0xd6b07a),
  rubber: () => std({ color: 0x1d1e20, roughness: 0.92 }),
  "rubber-inner": () => std({ color: 0x151617, roughness: 0.95, side: THREE.DoubleSide }),
  tread: () => std({ roughness: 0.95, ...(hasDom ? { map: treadTexture(false), bumpMap: treadTexture(true), bumpScale: 3 } : { color: 0x202123 }) }),
  barrel: () => std({ color: 0x1f2124, roughness: 0.4, metalness: 0.1 }),
  "barrel-black": () => mapped(() => drumTexture("#1e1f22"), 0x1e1f22, { roughness: 0.55, metalness: 0.35 }),
  "barrel-blue": () => mapped(() => drumTexture("#1f4fa8"), 0x1f4fa8, { roughness: 0.55, metalness: 0.35 }),
  "barrel-red": () => mapped(() => drumTexture("#a8282a"), 0xa8282a, { roughness: 0.55, metalness: 0.35 }),
  "barrel-green": () => mapped(() => drumTexture("#3d5f33"), 0x3d5f33, { roughness: 0.55, metalness: 0.35 }),
  "bare-steel": () => std({ color: 0x8e9094, roughness: 0.45, metalness: 0.7 }),
  "rough-wood": () => mapped(roughBoards, 0xc79c63, { roughness: 0.95 }),
  burlap: () => mapped(burlap, 0xb39a6c, { roughness: 1 }),
  cone: () => mapped(coneTexture, 0xf06a1a, { roughness: 0.6 }),
  "car-white": () => std({ color: 0xe8e6df, roughness: 0.35, metalness: 0.4 }),
  "car-red": () => std({ color: 0xa3221f, roughness: 0.35, metalness: 0.4 }),
  "car-blue": () => std({ color: 0x23488f, roughness: 0.35, metalness: 0.4 }),
  "car-grey": () => std({ color: 0x7c8086, roughness: 0.35, metalness: 0.45 }),
  "car-rust": () => mapped(() => drumTexture("#7a4a2c"), 0x7a4a2c, { roughness: 0.8, metalness: 0.3 }),
  glass: () => std({ color: 0x24313d, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.82 }),
  chrome: () => std({ color: 0xc8cbd0, roughness: 0.25, metalness: 0.9 }),
  "plastic-dark": () => std({ color: 0x2a2c2f, roughness: 0.7 }),
  "light-red": () => std({ color: 0xb0201a, roughness: 0.3, emissive: 0x300000 }),
  "light-white": () => std({ color: 0xf4f0d8, roughness: 0.2, emissive: 0x302a10 }),
  "anti-slip": () => std({ color: 0x2b2a28, roughness: 1 }),
  "fault-red": () => std({ color: 0xc4291f, roughness: 0.6 }),
  "area-fill": () => new THREE.MeshBasicMaterial({ color: 0xd8322a, transparent: true, opacity: 0.08, depthWrite: false }),
  "start-marker": () => std({ color: 0xf0f0f0, roughness: 0.8 }),
  leaf: () => std({ color: 0x5b8f3a, roughness: 0.8, flatShading: true, side: THREE.DoubleSide }),
  "leaf-dark": () => std({ color: 0x3f6f2c, roughness: 0.8, flatShading: true, side: THREE.DoubleSide }),
  soil: () => std({ color: 0x4a3626, roughness: 1 }),
  trunk: () => std({ color: 0x8a6a45, roughness: 0.9, flatShading: true }),
  pot: () => std({ color: 0x1c1d1f, roughness: 0.6 }),
};

export function getMaterial(name) {
  if (!cache.has(name)) {
    if (!specs[name]) throw new Error(`Unknown material: ${name}`);
    cache.set(name, specs[name]());
  }
  return cache.get(name);
}

export const materials = { get: getMaterial };
