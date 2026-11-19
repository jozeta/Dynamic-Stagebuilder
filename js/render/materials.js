// Shared materials, created once and reused by every prop (never disposed with a prop). Textures are
// painted on canvases in code (no downloads): square wire mesh, pine, plywood, cardboard. In Node
// (tests) there is no canvas, so plain colours are used.
import * as THREE from "three";
import { STYLES } from "./builders/target-shape.js";
import { PAPER_SIZES, CAR_MODELS } from "../model/props.js";

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

// Orange plastic safety-barrier netting (as on DIY training walls): tall rectangular holes, thick
// horizontal strands, thinner vertical ones, each strand shaded round. One tile = 0.5 m:
// 10 columns × 6 rows of holes.
function barrierNet() {
  return canvasTexture(512, (g, s, r) => {
    g.clearRect(0, 0, s, s);
    const cols = 10, rows = 6, cw = s / cols, rh = s / rows, vt = cw * 0.24, ht = rh * 0.3;
    // Sun-faded orange, each strand a little different, shaded round.
    const strand = (x, y, w, h, horizontal) => {
      const k = 0.85 + r() * 0.2;
      const c = (rr, gg, bb) => `rgb(${rr * k | 0},${gg * k | 0},${bb * k | 0})`;
      const grd = horizontal ? g.createLinearGradient(0, y, 0, y + h) : g.createLinearGradient(x, 0, x + w, 0);
      grd.addColorStop(0, c(196, 74, 26)); grd.addColorStop(0.45, c(236, 118, 54)); grd.addColorStop(1, c(176, 66, 24));
      g.fillStyle = grd; g.fillRect(x, y, w * (0.85 + r() * 0.3), h * (0.85 + r() * 0.3));
    };
    for (let c = 0; c < cols; c++) strand(c * cw + (cw - vt) / 2, 0, vt, s, false);
    for (let k = 0; k < rows; k++) {
      const wob = (r() - 0.5) * 3;
      strand(0, k * rh + wob, s, ht, true);
      for (let c = 0; c < cols; c++) {                          // knots where strands cross
        g.fillStyle = "rgba(170,52,6,0.35)"; g.fillRect(c * cw + (cw - vt) / 2, k * rh + wob, vt, ht);
      }
    }
    g.globalCompositeOperation = "source-atop";                 // grime and fading only on the strands
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(80,58,38,${0.08 + r() * 0.15})`; g.fillRect(r() * s, r() * s, 2 + r() * 6, 1 + r() * 3); }
    for (let i = 0; i < 12; i++) {
      const x = r() * s, y = r() * s, rad = 30 + r() * 80, grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(${r() > 0.5 ? "235,200,170" : "90,60,40"},0.22)`); grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.globalCompositeOperation = "destination-out";            // a few snapped strands
    for (let i = 0; i < 4; i++) g.fillRect(r() * s, r() * s, 4 + r() * 6, 14 + r() * 10);
    g.globalCompositeOperation = "source-over";
  }, { seed: 47 });
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
    g.globalCompositeOperation = "source-atop";                 // rust, dust and faded paint on the wires
    for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(${r() > 0.4 ? "120,64,30" : "150,130,105"},${0.2 + r() * 0.35})`; g.fillRect(r() * s, r() * s, 3 + r() * 10, 3 + r() * 6); }
    g.fillStyle = "rgba(150,140,125,0.12)"; g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = "source-over";
  });
}

// Weathering for outdoor timber: sun-greying, water stains, dirt speckle, fine splits along the
// grain, rust streaks under nails, and a darker, dirtier lower edge.
function weather(g, s, r, { vertical = true, amount = 1 } = {}) {
  g.fillStyle = `rgba(128,124,116,${0.16 * amount})`; g.fillRect(0, 0, s, s);            // sun-greyed
  for (let i = 0; i < 9 * amount; i++) {                                                 // water stains: soft, irregular,
    const x = r() * s, y = r() * s, rad = 18 + r() * 40;                                 // stretched along the grain
    g.save();
    g.translate(x, y);
    g.scale(vertical ? 0.45 + r() * 0.3 : 1.6 + r(), vertical ? 1.6 + r() : 0.45 + r() * 0.3);
    for (let k = 0; k < 3; k++) {
      const ox = (r() - 0.5) * rad * 0.6, oy = (r() - 0.5) * rad * 0.6, rr = rad * (0.5 + r() * 0.5);
      const grd = g.createRadialGradient(ox, oy, 0, ox, oy, rr);
      grd.addColorStop(0, "rgba(80,62,44,0.07)"); grd.addColorStop(0.75, "rgba(70,54,38,0.06)"); grd.addColorStop(1, "rgba(70,54,38,0)");
      g.fillStyle = grd; g.fillRect(ox - rr, oy - rr, rr * 2, rr * 2);
    }
    g.restore();
  }
  for (let i = 0; i < 900 * amount; i++) { g.fillStyle = `rgba(60,45,30,${0.05 + r() * 0.12})`; g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); }
  for (let i = 0; i < 10 * amount; i++) {                                                // splits
    const a = r() * s, b0 = r() * s, len = 20 + r() * 90;
    g.strokeStyle = `rgba(40,28,18,${0.35 + r() * 0.3})`; g.lineWidth = 0.8 + r() * 0.8;
    g.beginPath();
    if (vertical) { g.moveTo(a, b0); g.lineTo(a + (r() - 0.5) * 3, b0 + len); } else { g.moveTo(b0, a); g.lineTo(b0 + len, a + (r() - 0.5) * 3); }
    g.stroke();
  }
  for (let i = 0; i < 5 * amount; i++) {                                                 // rust under nails
    const x = r() * s, y = r() * s * 0.9, len = 15 + r() * 40;
    const grd = g.createLinearGradient(0, y, 0, y + len);
    grd.addColorStop(0, "rgba(110,60,30,0.45)"); grd.addColorStop(1, "rgba(110,60,30,0)");
    g.fillStyle = grd; g.fillRect(x - 1.5, y, 3, len);
  }
  const dirt = g.createLinearGradient(0, s, 0, s * 0.75);                                // dirty bottom
  dirt.addColorStop(0, `rgba(95,72,48,${0.3 * amount})`); dirt.addColorStop(1, "rgba(95,72,48,0)");
  g.fillStyle = dirt; g.fillRect(0, s * 0.75, s, s * 0.25);
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

// Timber: weathered pine for frames and sticks (lighter than old timber, but no longer fresh),
// weathered plywood with plank seams.
const pine = () => canvasTexture(256, (g, s, r) => { grain(g, s, r, { base: "#d8bf94", dark: "120,84,46", vertical: true }); weather(g, s, r, { amount: 0.8 }); }, { seed: 3 });
const plywood = () => canvasTexture(512, (g, s, r) => {
  grain(g, s, r, { base: "#c9aa7e", dark: "110,74,38", lines: 140, vertical: true });
  g.fillStyle = "rgba(80,54,28,0.5)";
  for (let i = 1; i < 4; i++) g.fillRect((i * s) / 4 - 1, 0, 2, s);   // plank seams
  weather(g, s, r, { amount: 1.2 });
}, { seed: 5 });
const cardboard = () => canvasTexture(256, (g, s, r) => {
  g.fillStyle = "#cfa06a"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2500; i++) { const v = r() > 0.5 ? 255 : 60; g.fillStyle = `rgba(${v},${v * 0.8},${v * 0.55},0.05)`; g.fillRect(r() * s, r() * s, 2, 2); }
}, { seed: 7 });


// A painted steel drum's body: enamel with a soft vertical sheen, scuffs to bare metal (most on
// the rolling hoops), dust toward the base. Wraps once round the drum (u), bottom → top (v).
function drumPaint(paint, wear) {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 2) { g.fillStyle = `rgba(255,255,255,${0.015 + 0.02 * Math.sin(x / 9 + r())})`; g.fillRect(x, 0, 2, s); }
    const scuffs = Math.round(60 + wear * 420);
    for (let i = 0; i < scuffs; i++) {
      const onHoop = r() < 0.5, y = onHoop ? s * (r() < 0.5 ? 0.66 : 0.33) + (r() - 0.5) * 30 : r() * s;
      const x = r() * s, l = 3 + r() * (onHoop ? 30 : 14), a = (r() - 0.5) * 0.6;
      g.strokeStyle = `rgba(178,180,182,${0.2 + r() * 0.45 * (0.4 + wear)})`; g.lineWidth = 0.6 + r() * 1.4;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 12 * wear; i++) {                         // a few dents' dark marks
      g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.1})`; g.beginPath(); g.ellipse(r() * s, r() * s, 6 + r() * 14, 3 + r() * 6, r() * 3, 0, 7); g.fill();
    }
    for (let i = 0; i < 26 * wear; i++) {                          // rust patches, mostly low and on the hoops
      const x = r() * s, y = r() < 0.6 ? s * (0.8 + r() * 0.2) : (r() < 0.5 ? s * 0.33 : s * 0.66) + (r() - 0.5) * 20, rad = 4 + r() * 20;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, "rgba(112,58,26,0.75)"); grd.addColorStop(0.6, "rgba(140,80,38,0.35)"); grd.addColorStop(1, "rgba(140,80,38,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 14 * wear; i++) {                          // rust and grime runs
      const x = r() * s, y0 = s * (0.02 + r() * 0.3), len = 30 + r() * 110;
      const grd = g.createLinearGradient(0, y0, 0, y0 + len);
      grd.addColorStop(0, "rgba(100,56,28,0.45)"); grd.addColorStop(1, "rgba(100,56,28,0)");
      g.fillStyle = grd; g.fillRect(x, y0, 1.5 + r() * 2.5, len);
    }
    g.fillStyle = `rgba(150,140,125,${0.08 * wear})`; g.fillRect(0, 0, s, s);   // faded, chalky paint
    const dust = g.createLinearGradient(0, s, 0, s * 0.72);       // dust and dirt toward the base
    dust.addColorStop(0, `rgba(150,124,92,${0.35 + wear * 0.3})`); dust.addColorStop(1, "rgba(150,124,92,0)");
    g.fillStyle = dust; g.fillRect(0, s * 0.72, s, s * 0.28);
  }, { seed: paint.charCodeAt(1) * 7 + Math.round(wear * 10) });
}

// A drum lid: the paint, a pressed ring, a pale paper label on worn drums, scuffs. Mapped flat.
function drumLid(paint, label) {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 3;
    g.beginPath(); g.arc(s / 2, s / 2, s * 0.36, 0, 7); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    g.beginPath(); g.arc(s / 2, s / 2, s * 0.37, 0, 7); g.stroke();
    if (label) {
      g.save(); g.translate(s * 0.5, s * 0.55); g.rotate(-0.25);
      g.fillStyle = "#e4ded0"; g.fillRect(-s * 0.16, -s * 0.07, s * 0.32, s * 0.14);
      g.fillStyle = "rgba(60,60,60,0.55)";
      for (let i = 0; i < 4; i++) g.fillRect(-s * 0.13, -s * 0.045 + i * s * 0.028, s * (0.12 + r() * 0.12), s * 0.01);
      g.restore();
    }
    for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(180,180,180,${0.1 + r() * 0.3})`; g.lineWidth = 0.7; const x = r() * s, y = r() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 20, y + (r() - 0.5) * 20); g.stroke(); }
  }, { seed: paint.charCodeAt(2) * 11 + (label ? 1 : 0) });
}

// Shipping-crate boards: six light pine boards with dark seams and grain; optionally stencilled
// "this side up" arrows and FRAGILE in dark ink (only on one face).
function crateBoards(stencil) {
  return canvasTexture(512, (g, s, r) => {
    const n = 6, bw = s / n;
    for (let i = 0; i < n; i++) {
      const tone = 200 + (r() - 0.5) * 30;
      g.fillStyle = `rgb(${tone},${tone * 0.84 | 0},${tone * 0.63 | 0})`;
      g.fillRect(i * bw, 0, bw, s);
      for (let k = 0; k < 14; k++) {                       // grain along the board
        g.strokeStyle = `rgba(150,100,55,${0.08 + r() * 0.14})`; g.lineWidth = 0.8 + r() * 1.5;
        const x = i * bw + r() * bw, w = 2 + r() * 5;
        g.beginPath(); for (let y = 0; y <= s; y += 16) g.lineTo(x + Math.sin(y / (40 + r() * 10)) * w, y); g.stroke();
      }
      if (r() < 0.5) { g.fillStyle = "rgba(130,85,45,0.45)"; g.beginPath(); g.ellipse(i * bw + r() * bw, r() * s, 5, 8, 0, 0, 7); g.fill(); }
      g.fillStyle = "rgba(70,45,22,0.6)"; g.fillRect(i * bw, 0, 2, s);   // seam
    }
    if (stencil) {
      g.fillStyle = "rgba(40,32,26,0.78)";
      for (const x of [s * 0.18, s * 0.82]) {             // arrows: this side up
        g.fillRect(x - 6, s * 0.2, 12, s * 0.16);
        g.beginPath(); g.moveTo(x - 20, s * 0.22); g.lineTo(x, s * 0.12); g.lineTo(x + 20, s * 0.22); g.fill();
      }
      g.font = `700 ${Math.round(s * 0.1)}px "Courier New", monospace`;
      g.textAlign = "center";
      g.fillText("FRAGILE", s / 2, s * 0.72);
    }
    weather(g, s, r, { amount: 1.1 });
  }, { seed: stencil ? 59 : 53 });
}

// Crate cleats: thicker pine with a row of nail heads near each long edge.
function crateCleat() {
  return canvasTexture(256, (g, s, r) => {
    grain(g, s, r, { base: "#cfb184", dark: "120,82,42", lines: 40 });
    weather(g, s, r, { vertical: false, amount: 1 });
    for (let x = 10; x < s; x += 34) for (const y of [s * 0.22, s * 0.78]) {
      g.fillStyle = "rgba(40,36,34,0.85)"; g.beginPath(); g.arc(x + (r() - 0.5) * 4, y, 3.2, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.arc(x - 1, y - 1, 1.2, 0, 7); g.fill();
    }
  }, { seed: 61 });
}

// A car's paint, mapped over the whole lofted body by (u along the car, height): the paint with a
// shoulder highlight, door seams and handle recesses where the model has them, a sill line, and
// wear: swirl scratches, a few dents, rust at the arch lips (heavy on the rusty car), mud thrown up
// by the wheels, grime low on the doors and dust on the upper panels. No windows: the glass is
// part of the 3D body.
const beltAt = (M, u) => {
  const p = M.belt;
  for (let i = 0; i < p.length - 1; i++) if (u <= p[i + 1][0]) return p[i][1] + (p[i + 1][1] - p[i][1]) * ((u - p[i][0]) / (p[i + 1][0] - p[i][0] || 1));
  return p[p.length - 1][1];
};
function carSide(paint, rusty, model) {
  const M = CAR_MODELS[model];
  const P = { minX: -M.length / 2, maxX: M.length / 2, minY: 0, maxY: M.height }, W = 1024, H = Math.round((W * (P.maxY - P.minY)) / (P.maxX - P.minX));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  const r = rng(paint.length * 17 + (rusty ? 3 : 0));
  const px = ([x, y]) => [((x - P.minX) / (P.maxX - P.minX)) * W, H - ((y - P.minY) / (P.maxY - P.minY)) * H];
  g.fillStyle = paint; g.fillRect(0, 0, W, H);
  const shade = g.createLinearGradient(0, 0, 0, H);                      // highlight on the shoulder
  shade.addColorStop(0, "rgba(255,255,255,0.10)"); shade.addColorStop(0.45, "rgba(255,255,255,0.0)"); shade.addColorStop(0.85, "rgba(0,0,0,0.18)");
  g.fillStyle = shade; g.fillRect(0, 0, W, H);
  if (rusty) {
    for (let i = 0; i < 70; i++) {
      const [x, y] = px([P.minX + r() * (P.maxX - P.minX), 0.15 + r() * (r() < 0.6 ? 0.5 : 1.1)]), rad = 6 + r() * 40;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, "rgba(110,52,22,0.85)"); grd.addColorStop(0.7, "rgba(140,74,34,0.35)"); grd.addColorStop(1, "rgba(140,74,34,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }
  const L = M.length, uX = (u) => (u - 0.5) * L;
  // Door seams from the sill up to the beltline, the sill line between the arches, a side moulding.
  g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2.2;
  for (const u of M.seams) {
    const [a] = px([uX(u), 0]), [, b] = px([0, M.tyre + 0.05]), [, d] = px([0, beltAt(M, u) - 0.015]);
    g.beginPath(); g.moveTo(a, b); g.lineTo(a, d); g.stroke();
  }
  const sillY = M.tyre * 0.95;
  { const [x0, y] = px([M.wheels[0] + M.arch, sillY]), [x1] = px([M.wheels[1] - M.arch, sillY]); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  { const my = (sillY + beltAt(M, 0.5)) / 2, [x0, y0] = px([-L / 2 + 0.15, my + 0.02]), [x1, y1] = px([L / 2 - 0.15, my]); g.fillStyle = "rgba(20,20,22,0.35)"; g.fillRect(x0, y0, x1 - x0, Math.max(3, y1 - y0)); }
  // Handle recesses (the handles themselves are 3D).
  for (const x of M.handles) { const [hx, hy] = px([x, beltAt(M, x / L + 0.5) - 0.1]); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(hx - 18, hy - 5, 36, 10); }
  // Wear: swirl marks and scratches, a few dents, rust at the arch lips and sills, mud splashed
  // up from the wheels, dust settling on the upper panels.
  for (let i = 0; i < (rusty ? 260 : 140); i++) {
    const [x, y] = px([P.minX + r() * (P.maxX - P.minX), M.tyre * 0.8 + r() * (M.height - M.tyre)]), l = 4 + r() * 30, a = (r() - 0.5) * 0.7;
    g.strokeStyle = `rgba(${r() > 0.3 ? "220,220,215" : "40,40,40"},${0.12 + r() * 0.25})`; g.lineWidth = 0.6 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const [x, y] = px([P.minX + 0.4 + r() * (L - 0.8), M.tyre + r() * (beltAt(M, 0.5) - M.tyre - 0.1)]), rad = 10 + r() * 22;
    const grd = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 0, x, y, rad);
    grd.addColorStop(0, "rgba(255,255,255,0.10)"); grd.addColorStop(0.6, "rgba(0,0,0,0.14)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.beginPath(); g.ellipse(x, y, rad * 1.4, rad, 0, 0, 7); g.fill();
  }
  for (const cx of M.wheels) {
    for (let i = 0; i < (rusty ? 40 : 14); i++) {                       // rust bubbling at the arch lips
      const a = Math.PI * (0.05 + r() * 0.9), rr = M.arch + 0.01 + r() * 0.06;
      const [x, y] = px([cx + Math.cos(a) * rr, M.tyre + Math.sin(a) * rr]), rad = 2 + r() * (rusty ? 12 : 6);
      g.fillStyle = `rgba(118,62,28,${0.35 + r() * 0.4})`; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
    for (let i = 0; i < 90; i++) {                                       // mud thrown up by the wheels
      const a = Math.PI * (r() * 1.0), rr = M.arch + 0.03 + r() * 0.35;
      const [x, y] = px([cx + Math.cos(a) * rr * 1.2, M.tyre * 0.8 + Math.abs(Math.sin(a)) * rr * 0.6]);
      g.fillStyle = `rgba(116,90,62,${0.25 + r() * 0.35})`; g.beginPath(); g.arc(x, y, 1 + r() * 3.5, 0, 7); g.fill();
    }
  }
  const grimeTop = px([0, M.tyre * 1.9])[1];
  const sill = g.createLinearGradient(0, H, 0, grimeTop);                 // road grime low on the doors
  sill.addColorStop(0, "rgba(110,88,62,0.55)"); sill.addColorStop(1, "rgba(110,88,62,0)");
  g.fillStyle = sill; g.fillRect(0, grimeTop, W, H);
  const dustLine = px([0, beltAt(M, 0.5) - 0.02])[1];
  const topDust = g.createLinearGradient(0, 0, 0, dustLine);             // dust on the shoulders and the roof
  topDust.addColorStop(0, "rgba(190,170,140,0.22)"); topDust.addColorStop(1, "rgba(190,170,140,0)");
  g.fillStyle = topDust; g.fillRect(0, 0, W, dustLine);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;     // the body's UVs are already (u, height / car height)
}

// Painted steel targets in use: patchy re-paint layers, bullet splash (grey lead smears with
// radiating splatter, most toward the middle), chipped paint showing dark steel with rust round it.
function steelPaint(paint) {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 18; i++) {                                // uneven re-paint coats
      const x = r() * s, y = r() * s, rad = 40 + r() * 120, grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},0.06)`); grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 45; i++) {                                // bullet splash
      const cx = s * 0.5 + (r() - 0.5) * s * (r() < 0.7 ? 0.5 : 0.95), cy = s * 0.5 + (r() - 0.5) * s * (r() < 0.7 ? 0.5 : 0.95);
      const rad = 3 + r() * 7;
      g.fillStyle = `rgba(120,122,126,${0.55 + r() * 0.35})`;
      g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.fill();
      g.strokeStyle = `rgba(110,112,116,${0.3 + r() * 0.3})`; g.lineWidth = 1 + r();
      for (let k = 0, n = 6 + (r() * 8 | 0); k < n; k++) {
        const a = r() * 6.28, l = rad * (1.5 + r() * 3);
        g.beginPath(); g.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); g.stroke();
      }
      g.fillStyle = "rgba(60,62,66,0.5)"; g.beginPath(); g.arc(cx, cy, rad * 0.4, 0, 7); g.fill();
    }
    for (let i = 0; i < 30; i++) {                                // chips to bare steel, rust round them
      const x = r() * s, y = r() * s, w = 3 + r() * 14, hgt = 2 + r() * 8;
      g.fillStyle = "rgba(118,66,32,0.5)"; g.fillRect(x - 2, y - 2, w + 4, hgt + 4);
      g.fillStyle = "#4a4c50"; g.fillRect(x, y, w, hgt);
    }
  }, { seed: paint.charCodeAt(1) * 13 + 5, repeat: 2.5 });
}

// Raw steel for bases, posts and hinges: dark mill scale with rust blooms and scratches.
function rawSteel() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#3b3c3f"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 50; i++) {
      const x = r() * s, y = r() * s, rad = 6 + r() * 30, grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, "rgba(128,66,30,0.7)"); grd.addColorStop(0.7, "rgba(150,82,38,0.3)"); grd.addColorStop(1, "rgba(150,82,38,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 120; i++) { g.strokeStyle = `rgba(170,170,165,${0.15 + r() * 0.3})`; g.lineWidth = 0.7; const x = r() * s, y = r() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 8); g.stroke(); }
  }, { seed: 67, repeat: 2 });
}

// The car's top surfaces (bonnet, roof, boot, bumpers): paint with dust settled on it, faded
// clear-coat patches, swirl scratches, bird-dropping-free but grimy. Tiled over the swept surface.
function carPaintWear(paint, rusty) {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 22; i++) {
      const x = r() * s, y = r() * s, rad = 30 + r() * 110, grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(${rusty ? "120,64,30" : "200,190,170"},${rusty ? 0.5 : 0.12})`); grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(175,155,125,${0.06 + r() * 0.14})`; g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); }
    for (let i = 0; i < 160; i++) {
      const x = r() * s, y = r() * s, rad = 10 + r() * 40, a0 = r() * 6;
      g.strokeStyle = `rgba(230,230,225,${0.05 + r() * 0.1})`; g.lineWidth = 0.6;
      g.beginPath(); g.arc(x, y, rad, a0, a0 + 0.6 + r()); g.stroke();
    }
  }, { seed: paint.charCodeAt(2) * 3 + (rusty ? 9 : 0), repeat: 0.6 });
}

// A plain number plate with characters (fictional), grimy edges.
function numberPlate() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#e9e5dc"; g.fillRect(0, 0, s, s);
    g.fillStyle = "#1e4fa0"; g.fillRect(0, 0, s * 0.12, s);
    g.fillStyle = "#1c1c1c"; g.font = `700 ${Math.round(s * 0.45)}px "Courier New", monospace`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.save(); g.scale(1, 4.2); g.fillText("IPS 2O3", s * 0.56, s * 0.5 / 4.2); g.restore();
    g.strokeStyle = "rgba(90,80,60,0.5)"; g.lineWidth = 10; g.strokeRect(0, 0, s, s);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(110,90,60,${0.05 + r() * 0.1})`; g.fillRect(r() * s, r() * s, 3, 3); }
  }, { seed: 71 });
}

function grilleTexture() {
  return canvasTexture(128, (g, s) => {
    g.fillStyle = "#121212"; g.fillRect(0, 0, s, s);
    g.strokeStyle = "#3a3a3a"; g.lineWidth = 3;
    for (let x = 4; x < s; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke(); }
    for (let y = 6; y < s; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
  }, { seed: 73, repeat: 1 });
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
    grain(g, s, r, { base: "#b9966a", dark: "100,66,32", lines: 60 });
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,40,20,${0.08 + r() * 0.12})`; g.fillRect(r() * s, r() * s, 1 + r() * 3, 8 + r() * 30); }
    weather(g, s, r, { vertical: false, amount: 1.4 });
  }, { seed: 19 });
}

function coneTexture() {
  return canvasTexture(128, (g, s) => {
    g.fillStyle = "#f06a1a"; g.fillRect(0, 0, s, s);
    g.fillStyle = "#f4f4f0"; g.fillRect(0, s * 0.25, s, s * 0.14); g.fillRect(0, s * 0.52, s, s * 0.1);
  }, { seed: 23 });
}

// The printed face of a cardboard target: corrugated tan board (or off-white for no-shoots) with
// darker dotted scoring-zone outlines and their letters, for the given style (classic / head).
// Extrude cap UVs are in metres, so the texture is placed with repeat/offset over the card size.
function cardTexture({ base, line, fibres }, style, size) {
  const { grid, outline, zones, letters } = STYLES[style];
  const W = 512, H = Math.round((W * grid.h) / grid.w);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  const r = (() => { let x = 7; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const px = ([x, y]) => [((x + grid.w / 2) / grid.w) * W, H - (y / grid.h) * H];
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 6) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.03})`; g.fillRect(x, 0, 2, H); }  // corrugation
  for (let i = 0; i < 2600; i++) { const v = r() > 0.5 ? 255 : 70; g.fillStyle = `rgba(${v},${v * 0.82},${v * 0.6},${fibres})`; g.fillRect(r() * W, r() * H, 2, 2); }
  const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => { const [x, y] = px(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.stroke(); };
  g.strokeStyle = line; g.lineJoin = "round"; g.lineWidth = 4;
  poly(outline);
  g.setLineDash([7, 5]); g.lineWidth = 3.2;
  for (const z of zones) poly(z);
  g.setLineDash([]);
  g.fillStyle = line; g.font = `600 ${Math.round(W * 0.05)}px -apple-system, "Segoe UI", sans-serif`;
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const [t, x, y] of letters) { const [cx, cy] = px([x, y]); g.fillText(t, cx, cy); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / size.w, 1 / size.h);
  t.offset.set(0.5, 0);
  return t;
}

const CARD_INK = { base: "#d0a16a", line: "#7d5430", fibres: 0.05 };
const NOSHOOT_INK = { base: "#ece8de", line: "#8f8a80", fibres: 0.03 };
const card = (ink, style, size) => () => std({ roughness: 0.95, ...(hasDom ? { map: cardTexture(ink, style, PAPER_SIZES[style][size]) } : { color: ink.base }) });

function steelSheet() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#b9bec2"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "60,66,72"},${0.04 + r() * 0.06})`; g.fillRect(r() * s, r() * s, 1 + r() * 30, 1); }
    for (let i = 0; i < 12; i++) { g.fillStyle = "rgba(90,96,102,0.25)"; g.beginPath(); g.arc(r() * s, r() * s, 1.5, 0, 7); g.fill(); }
  }, { seed: 43 });
}

// Building surfaces: board-formed concrete, brick courses, corrugated steel, chain link.
function concreteTex() {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = "#b8b6b0"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 3000; i++) { const v = 150 + r() * 70; g.fillStyle = `rgba(${v},${v},${v - 4},0.25)`; g.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 3); }
    g.strokeStyle = "rgba(70,70,70,0.25)"; g.lineWidth = 2;
    for (let y = 0; y <= s; y += s / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
    for (let i = 0; i < 10; i++) { g.fillStyle = "rgba(90,85,80,0.12)"; g.beginPath(); g.ellipse(r() * s, r() * s, 30 + r() * 60, 8 + r() * 20, 0, 0, 7); g.fill(); }
  }, { seed: 91, repeat: 0.5 });
}
function brickTex() {
  return canvasTexture(512, (g, s, r) => {
    g.fillStyle = "#c8c2b6"; g.fillRect(0, 0, s, s);
    const bh = s / 8, bw = s / 4;
    for (let row = 0; row < 8; row++) for (let i = -1; i < 5; i++) {
      const x = i * bw + (row % 2 ? bw / 2 : 0), t = 0.8 + r() * 0.35;
      g.fillStyle = `rgb(${Math.round(150 * t)},${Math.round(72 * t)},${Math.round(52 * t)})`;
      g.fillRect(x + 3, row * bh + 3, bw - 6, bh - 6);
    }
  }, { seed: 92, repeat: 1 });
}
function corrugated(paint) {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = paint; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 16) { const grd = g.createLinearGradient(x, 0, x + 16, 0); grd.addColorStop(0, "rgba(0,0,0,0.25)"); grd.addColorStop(0.5, "rgba(255,255,255,0.12)"); grd.addColorStop(1, "rgba(0,0,0,0.25)"); g.fillStyle = grd; g.fillRect(x, 0, 16, s); }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(120,70,40,${r() * 0.15})`; g.fillRect(r() * s, r() * s, 2 + r() * 6, 1 + r() * 4); }
  }, { seed: paint.length * 7, repeat: 1 });
}
function chainLink() {
  return canvasTexture(128, (g, s) => {
    g.clearRect(0, 0, s, s);
    g.strokeStyle = "#c4c9cc"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, s / 2); g.lineTo(s / 2, 0); g.lineTo(s, s / 2); g.lineTo(s / 2, s); g.closePath(); g.stroke();
  }, { seed: 93, repeat: 8, alpha: true });
}

const std = (o) => new THREE.MeshStandardMaterial(o);
const carPaint = (color, roughness, clearcoat) => new THREE.MeshPhysicalMaterial({
  roughness: roughness + 0.12, metalness: 0.5, clearcoat: clearcoat * 0.6, clearcoatRoughness: 0.3,
  ...(hasDom ? { map: carPaintWear(`#${color.toString(16).padStart(6, "0")}`, false) } : { color }),
});
const carBodyMat = (paint, rusty, model) => new THREE.MeshPhysicalMaterial({
  roughness: rusty ? 0.78 : 0.38, metalness: rusty ? 0.25 : 0.5, clearcoat: rusty ? 0.05 : 0.65, clearcoatRoughness: 0.28,
  ...(hasDom ? { map: carSide(paint, rusty, model) } : { color: paint }),
});
const CAR_PAINTS = { white: "#e6e4dd", red: "#9e1e1b", blue: "#1f4386", grey: "#7a7f86", rust: "#7c5236" };
const drum = (paint, wear, roughness, clearcoat) => new THREE.MeshPhysicalMaterial({
  roughness, metalness: 0.4, clearcoat, clearcoatRoughness: 0.35,
  ...(hasDom ? { map: drumPaint(paint, wear) } : { color: paint }),
});
const drumLidMat = (paint, label, roughness) => new THREE.MeshPhysicalMaterial({
  roughness, metalness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.4,
  ...(hasDom ? { map: drumLid(paint, label) } : { color: paint }),
});
const mapped = (tex, fallback, extra = {}) => std({ roughness: 0.85, ...(hasDom ? { map: tex() } : { color: fallback }), ...extra });

const specs = {
  "target-tan": () => mapped(cardboard, 0xcfa06a, { roughness: 0.95 }),
  "card-classic-ipsc": card(CARD_INK, "classic", "ipsc"),
  "card-classic-mini": card(CARD_INK, "classic", "mini"),
  "card-head-ipsc": card(CARD_INK, "head", "ipsc"),
  "card-head-mini": card(CARD_INK, "head", "mini"),
  "noshoot-classic-ipsc": card(NOSHOOT_INK, "classic", "ipsc"),
  "noshoot-classic-mini": card(NOSHOOT_INK, "classic", "mini"),
  "noshoot-head-ipsc": card(NOSHOOT_INK, "head", "ipsc"),
  "noshoot-head-mini": card(NOSHOOT_INK, "head", "mini"),
  "panel-grey": () => mapped(steelSheet, 0xc9ced2, { roughness: 0.55, metalness: 0.12 }),
  "card-edge": () => std({ color: 0x8b6a45, roughness: 1 }),
  "route-line": () => new THREE.MeshBasicMaterial({ color: 0x2f7bff, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }),
  "route-handle": () => std({ color: 0xffffff, emissive: 0x2f7bff, emissiveIntensity: 0.5, roughness: 0.4 }),
  "route-pick": () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false, side: THREE.DoubleSide }),
  "position-ring": () => new THREE.MeshBasicMaterial({ color: 0xd2d6dc, side: THREE.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }),
  "position-ghost": () => new THREE.MeshStandardMaterial({ color: 0xd8dbe0, transparent: true, opacity: 0.5, roughness: 0.6, depthWrite: false, side: THREE.DoubleSide }),
  "position-ghost-depth": () => new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, depthWrite: true, side: THREE.DoubleSide }),
  // Building pieces.
  "bld-concrete": () => mapped(concreteTex, 0xb4b2ac, { roughness: 0.95 }),
  "bld-brick": () => mapped(brickTex, 0x9a4b34, { roughness: 0.9 }),
  "bld-wood": () => mapped(roughBoards, 0xb08a5a, { roughness: 0.9 }),
  "bld-metal": () => mapped(() => corrugated("#8d949a"), 0x8d949a, { roughness: 0.55, metalness: 0.5 }),
  "bld-earth": () => std({ color: 0x8a6a4a, roughness: 1 }),
  "container-blue": () => mapped(() => corrugated("#2f5a8a"), 0x2f5a8a, { roughness: 0.6, metalness: 0.4 }),
  "container-red": () => mapped(() => corrugated("#8e2f25"), 0x8e2f25, { roughness: 0.6, metalness: 0.4 }),
  "container-green": () => mapped(() => corrugated("#3f5f3a"), 0x3f5f3a, { roughness: 0.6, metalness: 0.4 }),
  "container-grey": () => mapped(() => corrugated("#8a8f93"), 0x8a8f93, { roughness: 0.6, metalness: 0.4 }),
  "container-rust": () => mapped(() => corrugated("#7c4a2e"), 0x7c4a2e, { roughness: 0.75, metalness: 0.3 }),
  "fence-mesh": () => std({ color: 0xffffff, roughness: 0.6, metalness: 0.5, side: THREE.DoubleSide, alphaTest: 0.3, alphaToCoverage: true,
    ...(hasDom ? { map: chainLink() } : { color: 0x9aa0a4, transparent: true, opacity: 0.4 }) }),
  "line-white": () => std({ color: 0xf2f2ee, roughness: 0.7 }),
  "activator-red": () => std({ color: 0xb3261e, roughness: 0.6, metalness: 0.3 }),
  rope: () => std({ color: 0xb79a6a, roughness: 1 }),
  "hard-cover": () => std({ color: 0x141414, roughness: 0.95, side: THREE.DoubleSide }),
  "steel-white": () => mapped(() => steelPaint("#e2ded4"), 0xe2ded4, { roughness: 0.7, metalness: 0.1 }),
  "steel-yellow": () => mapped(() => steelPaint("#dcb52a"), 0xdcb52a, { roughness: 0.65, metalness: 0.1 }),
  "steel-dark": () => mapped(rawSteel, 0x3b3c3f, { roughness: 0.7, metalness: 0.55 }),
  "stand-blue": () => std({ color: 0x2a58c0, roughness: 0.45, metalness: 0.35 }),
  "stick-wood": () => mapped(pine, 0xd8b47e),
  // Alpha-to-coverage keeps the thin wires visible (and smooth) at a distance, where plain alpha
  // testing would mip them away; alphaTest also gives the lattice shadow on the ground.
  "mesh-black": () => std({ color: 0xffffff, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide, alphaTest: 0.18, alphaToCoverage: true,
    ...(hasDom ? { map: meshTexture("#141517") } : { color: 0x141517 }) }),
  "mesh-orange": () => std({ color: 0xffffff, roughness: 0.65, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.3, alphaToCoverage: true,
    ...(hasDom ? { map: barrierNet() } : { color: 0xff6a1a }) }),
  "mesh-blue": () => std({ color: 0xffffff, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide, alphaTest: 0.18, alphaToCoverage: true,
    ...(hasDom ? { map: meshTexture("#2f6af0") } : { color: 0x2459d8 }) }),
  "frame-black": () => std({ color: 0x1b1c1e, roughness: 0.55, metalness: 0.3 }),
  wood: () => mapped(pine, 0xd8b47e),
  plywood: () => mapped(plywood, 0xd6b07a),
  rubber: () => std({ color: 0x1d1e20, roughness: 0.92 }),
  "rubber-inner": () => std({ color: 0x151617, roughness: 0.95, side: THREE.DoubleSide }),
  tread: () => std({ roughness: 0.95, ...(hasDom ? { map: treadTexture(false), bumpMap: treadTexture(true), bumpScale: 3 } : { color: 0x202123 }) }),
  barrel: () => std({ color: 0x1f2124, roughness: 0.4, metalness: 0.1 }),
  // Steel drums: glossy enamel with a clear-coat sheen (blue, red, green), the black one more
  // worn and matte, like a used drum. Lids get their own texture with a pressed ring.
  "barrel-black": () => drum("#2b2b2c", 1, 0.62, 0.12),
  "barrel-blue": () => drum("#2f4a72", 0.85, 0.55, 0.2),
  "barrel-red": () => drum("#7a3128", 0.85, 0.56, 0.18),
  "barrel-green": () => drum("#424f38", 0.9, 0.6, 0.15),
  "barrel-lid-black": () => drumLidMat("#303031", true, 0.62),
  "barrel-lid-blue": () => drumLidMat("#344f78", true, 0.56),
  "barrel-lid-red": () => drumLidMat("#80362c", true, 0.58),
  "barrel-lid-green": () => drumLidMat("#46543b", true, 0.6),
  "bare-steel": () => std({ color: 0x8e9094, roughness: 0.45, metalness: 0.7 }),
  "rough-wood": () => mapped(roughBoards, 0xc79c63, { roughness: 0.95 }),
  "crate-boards": () => mapped(() => crateBoards(false), 0xe0c391, { roughness: 0.9 }),
  "crate-stencil": () => mapped(() => crateBoards(true), 0xe0c391, { roughness: 0.9 }),
  "crate-cleat": () => mapped(crateCleat, 0xe0c391, { roughness: 0.88 }),
  burlap: () => mapped(burlap, 0xb39a6c, { roughness: 1 }),
  cone: () => mapped(coneTexture, 0xf06a1a, { roughness: 0.6 }),
  // Car paint: metallic base with a clear coat; the rusty one faded and rough.
  "car-white": () => carPaint(0xe6e4dd, 0.3, 0.9),
  "car-red": () => carPaint(0x9e1e1b, 0.28, 1),
  "car-blue": () => carPaint(0x1f4386, 0.28, 1),
  "car-grey": () => carPaint(0x7a7f86, 0.3, 1),
  "car-rust": () => new THREE.MeshPhysicalMaterial({ roughness: 0.8, metalness: 0.25, clearcoat: 0.05,
    ...(hasDom ? { map: carPaintWear("#7c5236", true) } : { color: 0x7c5236 }) }),
  alloy: () => std({ color: 0xb4b8bd, roughness: 0.3, metalness: 0.85 }),
  "plate-white": () => std({ color: 0xe8e4dc, roughness: 0.5 }),
  "number-plate": () => mapped(numberPlate, 0xe8e4dc, { roughness: 0.5 }),
  "wheel-well": () => std({ color: 0x141414, roughness: 1, side: THREE.DoubleSide }),
  "light-amber": () => std({ color: 0xd98a1e, roughness: 0.3, emissive: 0x2a1400 }),
  grille: () => mapped(grilleTexture, 0x1c1c1c, { roughness: 0.6, metalness: 0.3 }),
  exhaust: () => std({ color: 0x5a4a40, roughness: 0.7, metalness: 0.6 }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0x3d4e5c, roughness: 0.06, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, transparent: true, opacity: 0.94, side: THREE.DoubleSide }),
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

// One painted body per car model and colour.
for (const model of Object.keys(CAR_MODELS)) for (const [color, paint] of Object.entries(CAR_PAINTS)) {
  specs[`car-body-${model}-${color}`] = () => carBodyMat(paint, color === "rust", model);
}

export function getMaterial(name) {
  if (!cache.has(name)) {
    if (!specs[name]) throw new Error(`Unknown material: ${name}`);
    cache.set(name, specs[name]());
  }
  return cache.get(name);
}

export const materials = { get: getMaterial };
