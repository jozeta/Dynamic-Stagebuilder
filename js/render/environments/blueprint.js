// Blueprint: the stage drawn on an architect's blueprint. Deep blue paper that runs to the horizon
// (a 3 km plane fading into the background colour), a crisp white drafting grid (1 m, bolder every
// 5 m), and drafting details laid flat on the paper round the stage: a title block, a north arrow,
// a scale bar, dimension lines with the bay size, registration crosses at the bay corners, a
// detail callout and handwritten notes. No bay floor and no walls; props keep their own colours.
// Everything is drawn in code on canvases; no stage data is read.
import * as THREE from "three";
import { canvasTexture, ground, sun, hasDom } from "./common.js";

const PAPER = "#1b4d8c";
const BG = 0x16396a;
const INK = (a) => `rgba(226,238,255,${a})`;
const HAND = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive";
const MONO = "'Courier New', ui-monospace, monospace";
const TILE = 5;            // metres per grid tile
const SIZE = 3000;         // the paper, metres each way

// A flat drawing on the paper: w × h metres, drawn at 128 px per metre, readable from the shooter's
// side (canvas top points down range).
function decal(w, h, draw, x, z, turn = 0) {
  const PX = 128;
  let map = null;
  if (hasDom) {
    const c = document.createElement("canvas");
    c.width = Math.round(w * PX); c.height = Math.round(h * PX);
    const g = c.getContext("2d");
    g.strokeStyle = INK(0.85); g.fillStyle = INK(0.9); g.lineCap = "round"; g.lineJoin = "round";
    draw(g, PX, c.width, c.height);
    map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map, transparent: true, opacity: map ? 1 : 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.set(-Math.PI / 2, 0, Math.PI + turn);
  m.position.set(x, 0.004, z);
  m.renderOrder = 1;
  m.userData.blueprint = true;
  return m;
}

const arrowHead = (g, x, y, a, s) => {
  g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * Math.cos(a - 0.35), y - s * Math.sin(a - 0.35));
  g.moveTo(x, y); g.lineTo(x - s * Math.cos(a + 0.35), y - s * Math.sin(a + 0.35)); g.stroke();
};
const fmt = (m) => m.toFixed(2);

export function blueprint(bay) {
  const group = new THREE.Group();
  const W = bay.width, D = bay.depth;

  // The paper: blue with a faint mottle, the 1 m grid and a bolder line every 5 m.
  const grid = canvasTexture(640, (g, s, r) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,20,60"},${0.015 + r() * 0.03})`; g.fillRect(r() * s, r() * s, 2 + r() * 6, 2 + r() * 6); }
    const step = s / TILE;
    g.strokeStyle = INK(0.34); g.lineWidth = 2.2;
    for (let i = 1; i < TILE; i++) { g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, s); g.moveTo(0, i * step); g.lineTo(s, i * step); g.stroke(); }
    g.strokeStyle = INK(0.78); g.lineWidth = 4.2;
    g.strokeRect(0, 0, s, s);
    g.strokeStyle = INK(0.1); g.lineWidth = 1;                       // a fine quarter-metre ticks along the major lines
    for (let i = 1; i < TILE * 4; i++) { const p = (i * step) / 4; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 10); g.moveTo(0, p); g.lineTo(10, p); g.stroke(); }
  }, [SIZE / TILE, SIZE / TILE], { seed: 7 });
  if (grid) grid.anisotropy = 16;
  // Toned down so the lit paper reads as deep Prussian blue, not bright royal blue.
  const paper = new THREE.MeshStandardMaterial({ color: grid ? 0x8f9cb4 : 0x173f72, map: grid, roughness: 0.95 });
  const g0 = ground(SIZE, SIZE, paper, D / 2);
  // Line the grid up with the world: whole metres on whole metres, a bold line on the bay's centre.
  if (grid) grid.offset.set(((SIZE / 2) % TILE) / TILE, ((SIZE / 2 - D / 2) % TILE) / TILE);
  group.add(g0);

  // Registration crosses at the bay corners (the bay itself is not drawn as a floor).
  for (const [x, z] of [[-W / 2, 0], [W / 2, 0], [-W / 2, D], [W / 2, D]]) {
    group.add(decal(1.2, 1.2, (g, px, w, h) => {
      g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 6); g.lineTo(w / 2, h - 6); g.moveTo(6, h / 2); g.lineTo(w - 6, h / 2); g.stroke();
      g.beginPath(); g.arc(w / 2, h / 2, w * 0.22, 0, 7); g.stroke();
    }, x, z));
  }

  // Dimension lines: the bay width in front of the stage, the depth along its left side.
  const dimension = (len, label) => (g, px, w, h) => {
    const y = h * 0.62, a = 0.15 * px;
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(a, y); g.lineTo(w - a, y); g.stroke();
    g.beginPath(); g.moveTo(a, h * 0.25); g.lineTo(a, h * 0.95); g.moveTo(w - a, h * 0.25); g.lineTo(w - a, h * 0.95); g.stroke();
    arrowHead(g, a, y, Math.PI, 0.35 * px); arrowHead(g, w - a, y, 0, 0.35 * px);
    g.font = `700 ${Math.round(0.42 * px)}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "bottom";
    const t = `${label} = ${fmt(len)} m`, tw = g.measureText(t).width + 0.4 * px;
    g.clearRect(w / 2 - tw / 2, y - 0.6 * px, tw, 0.75 * px);
    g.fillText(t, w / 2, y + 0.12 * px);
  };
  group.add(decal(W + 0.3, 1.4, dimension(W, "W"), 0, -2.6));
  group.add(decal(D + 0.3, 1.4, dimension(D, "D"), W / 2 + 2.6, D / 2, Math.PI / 2));

  // Title block, front right of the stage (the shooter's right is −x).
  group.add(decal(7.2, 3.2, (g, px, w, h) => {
    g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
    const row = (y) => { g.beginPath(); g.moveTo(14, y); g.lineTo(w - 14, y); g.stroke(); };
    row(h * 0.42); row(h * 0.64); row(h * 0.84);
    g.beginPath(); g.moveTo(w * 0.55, h * 0.42); g.lineTo(w * 0.55, h - 14); g.stroke();
    g.textBaseline = "middle"; g.textAlign = "left";
    g.font = `700 ${Math.round(0.5 * px)}px ${MONO}`; g.fillText("STAGE PLAN", 0.35 * px, h * 0.17);
    g.font = `600 ${Math.round(0.3 * px)}px ${MONO}`; g.fillText("DYNAMIC-STAGEBUILDER · IPSC", 0.35 * px, h * 0.32);
    g.font = `600 ${Math.round(0.24 * px)}px ${MONO}`;
    g.fillText(`BAY  ${fmt(W)} × ${fmt(D)} m`, 0.35 * px, h * 0.53);
    g.fillText("SCALE  1:100", w * 0.55 + 0.25 * px, h * 0.53);
    g.fillText("UNITS  METRES", 0.35 * px, h * 0.74);
    g.fillText("GRID  1.00 m", w * 0.55 + 0.25 * px, h * 0.74);
    g.fillText("SHEET  1 / 1", 0.35 * px, h * 0.92);
    g.fillText("REV.  A", w * 0.55 + 0.25 * px, h * 0.92);
  }, -W / 2 - 5, -1.5));

  // Scale bar under the title block: 0–5 m in alternating blocks.
  group.add(decal(6, 1.1, (g, px, w, h) => {
    const x0 = 0.4 * px, y = h * 0.35, bw = px;
    for (let i = 0; i < 5; i++) { g.lineWidth = 2; if (i % 2 === 0) g.fillRect(x0 + i * bw, y, bw, 0.18 * px); g.strokeRect(x0 + i * bw, y, bw, 0.18 * px); }
    g.font = `600 ${Math.round(0.24 * px)}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "top";
    for (let i = 0; i <= 5; i++) g.fillText(String(i), x0 + i * bw, y + 0.26 * px);
    g.textAlign = "left"; g.fillText("m", x0 + 5 * bw + 0.15 * px, y + 0.26 * px);
  }, -W / 2 - 5, -3.9));

  // North arrow and compass rose, far left corner (down range is north on the drawing).
  group.add(decal(3, 3, (g, px, w, h) => {
    const cx = w / 2, cy = h / 2, r = w * 0.36;
    g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.beginPath(); g.arc(cx, cy, r * 0.82, 0, 7); g.stroke();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, l = i % 4 ? 0.08 : 0.16; g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * r * (1 - l), cy + Math.sin(a) * r * (1 - l)); g.stroke(); }
    g.beginPath(); g.moveTo(cx, cy - r * 1.02); g.lineTo(cx + r * 0.2, cy); g.lineTo(cx, cy - r * 0.12); g.lineTo(cx - r * 0.2, cy); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx, cy + r * 0.8); g.lineTo(cx + r * 0.2, cy); g.lineTo(cx - r * 0.2, cy); g.closePath(); g.stroke();
    g.font = `700 ${Math.round(0.42 * px)}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "bottom";
    g.fillText("N", cx, cy - r * 1.05);
    g.font = `600 ${Math.round(0.2 * px)}px ${MONO}`; g.textBaseline = "top"; g.fillText("DOWN RANGE", cx, cy + r * 1.05);
  }, W / 2 + 5, D - 2.5));

  // A detail callout: the target stand drawn small with its sizes.
  group.add(decal(4.2, 3.6, (g, px, w, h) => {
    const k = px * 2.6, ox = w * 0.38, oy = h * 0.82;
    const pts = [[-11.5, 0], [11.5, 0], [22.5, 10], [22.5, 38], [7.5, 57], [-7.5, 57], [-22.5, 38], [-22.5, 10]].map(([a, b]) => [ox + (a / 100) * k, oy - 0.7 * k - (b / 100) * k]);
    g.lineWidth = 2.5; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(ox - 0.11 * k, oy); g.lineTo(ox - 0.11 * k, oy - 0.98 * k); g.moveTo(ox + 0.11 * k, oy); g.lineTo(ox + 0.11 * k, oy - 0.98 * k); g.stroke();
    g.beginPath(); g.moveTo(ox - 0.2 * k, oy); g.lineTo(ox + 0.2 * k, oy); g.stroke();
    g.setLineDash([8, 6]); g.beginPath(); g.moveTo(ox + 0.3 * k, oy); g.lineTo(ox + 0.3 * k, oy - 0.7 * k); g.stroke(); g.setLineDash([]);
    g.font = `600 ${Math.round(0.2 * px)}px ${MONO}`; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText("0.70", ox + 0.34 * k, oy - 0.35 * k);
    g.fillText("0.45", ox - 0.1 * k, oy - 1.34 * k);
    g.beginPath(); g.arc(w * 0.84, h * 0.2, 0.32 * px, 0, 7); g.stroke();
    g.font = `700 ${Math.round(0.34 * px)}px ${HAND}`; g.textAlign = "center"; g.fillText("A", w * 0.84, h * 0.2);
    g.font = `600 ${Math.round(0.22 * px)}px ${HAND}`; g.fillText("DETAIL A · TARGET STAND", w / 2, h * 0.95);
  }, -W / 2 - 4.5, D * 0.45));

  // Handwritten notes with leaders.
  const note = (text, w, lead) => (g, px, cw, ch) => {
    g.font = `600 ${Math.round(0.62 * px)}px ${HAND}`; g.textBaseline = "middle"; g.textAlign = "left";
    g.fillText(text, 0.2 * px, ch / 2);
    if (lead) { g.lineWidth = 2.5; const x = g.measureText(text).width + 0.35 * px; g.beginPath(); g.moveTo(x, ch / 2); g.lineTo(cw - 0.3 * px, ch * 0.15); g.stroke(); arrowHead(g, cw - 0.3 * px, ch * 0.15, -0.5, 0.25 * px); }
  };
  group.add(decal(10, 1.1, note("All dimensions in metres", 10, false), W / 2 + 7, 1.5));
  group.add(decal(12, 1.1, note("Check sight lines from the start", 12, true), W / 2 + 8, D * 0.3));
  group.add(decal(10, 1.1, note("Safety angles 90° / 180°", 10, false), -W / 2 - 7, D * 0.8));
  group.add(decal(8, 1.1, note("Berm: 3 m min.", 8, false), 0, D + 3));

  // Section marks A–A either side of the stage.
  for (const [x, flip] of [[-W / 2 - 1.8, 1], [W / 2 + 1.8, -1]]) {
    group.add(decal(1.4, 1.4, (g, px, w, h) => {
      g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, w * 0.3, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(w / 2 - w * 0.3 * flip, h / 2); g.lineTo(w / 2 + w * 0.48 * flip, h / 2); g.stroke();
      g.font = `700 ${Math.round(0.42 * px)}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A", w / 2, h / 2);
    }, x, D / 2));
  }

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x355d97, 1.8);
  const sunLight = sun(bay, 0xffffff, 1.5, [-10, 34, -12]);
  const background = new THREE.Color(BG);
  const fog = new THREE.Fog(BG, 70, 320);           // the endless paper fades into the background
  return { group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.5, hemiStrength: 1.8, warmth: 0,
    hazeColor: null, background, fog, baseFog: fog, exposure: 1 };
}
