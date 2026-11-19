// Blueprint: the stage drawn on an architect's blueprint. Deep blue paper that runs to the horizon
// (a 3 km plane fading into the background colour), a crisp white drafting grid (1 m, bolder every
// 5 m), and drafting details laid flat on the paper round the stage: a title block, a north arrow,
// a scale bar, dimension lines with the bay size, registration crosses at the bay corners, a
// detail callout and handwritten notes. No bay floor and no walls; props keep their own colours.
// Everything is drawn in code on canvases; no stage data is read.
import * as THREE from "three";
import { canvasTexture, ground, sun, hasDom } from "./common.js";

const PAPER = "#1f63cc";
const BG = 0x3a78d0;
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
    g.strokeStyle = INK(0.16); g.lineWidth = 1.2;                    // a fine quarter-metre grid
    for (let i = 1; i < TILE * 4; i++) { if (i % 4 === 0) continue; const q = (i * step) / 4; g.beginPath(); g.moveTo(q, 0); g.lineTo(q, s); g.moveTo(0, q); g.lineTo(s, q); g.stroke(); }
    g.strokeStyle = INK(0.34); g.lineWidth = 2.2;
    for (let i = 1; i < TILE; i++) { g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, s); g.moveTo(0, i * step); g.lineTo(s, i * step); g.stroke(); }
    g.strokeStyle = INK(0.78); g.lineWidth = 4.2;
    g.strokeRect(0, 0, s, s);
    g.strokeStyle = INK(0.1); g.lineWidth = 1;                       // a fine quarter-metre ticks along the major lines
    for (let i = 1; i < TILE * 4; i++) { const p = (i * step) / 4; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 10); g.moveTo(0, p); g.lineTo(10, p); g.stroke(); }
  }, [SIZE / TILE, SIZE / TILE], { seed: 7 });
  if (grid) grid.anisotropy = 16;
  // Toned down so the lit paper reads as deep Prussian blue, not bright royal blue.
  const paper = new THREE.MeshStandardMaterial({ color: grid ? 0xdce6f6 : 0x2a6fd6, map: grid, roughness: 0.95 });
  const g0 = ground(SIZE, SIZE, paper, D / 2);
  // Line the grid up with the world: whole metres on whole metres, a bold line on the bay's centre.
  if (grid) grid.offset.set(((SIZE / 2) % TILE) / TILE, ((SIZE / 2 - D / 2) % TILE) / TILE);
  group.add(g0);

  // The drafting sheet of floor plans round the stage.
  {
    const { S, cz } = sheetExtent(bay);
    let map = null;
    if (hasDom) {
      const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
      const c = document.createElement("canvas");
      c.width = c.height = touch ? 2048 : 4096;
      drawSheet(c, bay);
      map = new THREE.CanvasTexture(c);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 16;
    }
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(S, S),
      new THREE.MeshBasicMaterial({ map, transparent: true, opacity: map ? 1 : 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    sheet.rotation.set(-Math.PI / 2, 0, Math.PI);
    sheet.position.set(0, 0.003, cz);
    sheet.userData.sheet = true;
    group.add(sheet);
  }

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

// ---------------------------------------------------------------------------------------------
// The drafting sheet round the stage: floor plans drawn like an architect's blueprint (hatched
// double-line walls, rooms, door swings, windows, stairs, furniture, room names and areas,
// dimension chains with ticks, callouts), over a faint ghosted layer of older drawings. The bay
// itself (and 3 m round it) stays clear so the stage reads cleanly.

const ROOM_NAMES = { bed: "BEDROOM", living: "LIVING", kitchen: "KITCHEN", bath: "BATH", dining: "DINING", stair: "STAIR", store: "STORAGE", office: "OFFICE", hall: "HALL", garage: "GARAGE" };
const KINDS = ["bed", "living", "kitchen", "bath", "dining", "stair", "store", "office", "hall", "bed", "living"];

/** World extent of the sheet: centred on the bay, at least 90 m a side. */
export function sheetExtent(bay) {
  const S = Math.max(90, Math.max(bay.width, bay.depth) + 64);
  return { S, cx: 0, cz: bay.depth / 2 };
}

/**
 * The floor plans on the sheet (world metres): each { x0, x1, z0, z1, rooms: [{ x0, x1, z0, z1, kind }] },
 * placed round the bay without touching it (3 m clear) or each other. Seeded, so it's the same on
 * every load.
 */
export function sheetPlans(bay, seed = 7) {
  const r = mulberry(seed);
  const { S, cz } = sheetExtent(bay);
  const clear = { x0: -bay.width / 2 - 3, x1: bay.width / 2 + 3, z0: -3, z1: bay.depth + 3 };
  const hits = (a, b, pad = 2) => !(a.x1 + pad <= b.x0 || b.x1 + pad <= a.x0 || a.z1 + pad <= b.z0 || b.z1 + pad <= a.z0);
  const plans = [];
  for (let i = 0; i < 400 && plans.length < 12; i++) {
    const w = 9 + r() * 12, d = 7 + r() * 9;
    const x0 = -S / 2 + 2 + r() * (S - w - 4), z0 = cz - S / 2 + 2 + r() * (S - d - 4);
    const p = { x0, x1: x0 + w, z0, z1: z0 + d };
    if (hits(p, clear, 0.5) || plans.some((q) => hits(p, q))) continue;
    p.rooms = split(p, 0, r);
    plans.push(p);
  }
  return plans;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Split a plan into rooms (a few cuts along the longer side).
function split(rect, depth, r) {
  const w = rect.x1 - rect.x0, d = rect.z1 - rect.z0;
  if (depth >= 3 || (w < 5.5 && d < 5.5) || (depth >= 1 && r() < 0.25)) return [{ ...rect, kind: KINDS[Math.floor(r() * KINDS.length)] }];
  const t = 0.35 + r() * 0.3;
  if (w >= d) {
    const x = rect.x0 + w * t;
    return [...split({ ...rect, x1: x }, depth + 1, r), ...split({ ...rect, x0: x }, depth + 1, r)];
  }
  const z = rect.z0 + d * t;
  return [...split({ ...rect, z1: z }, depth + 1, r), ...split({ ...rect, z0: z }, depth + 1, r)];
}

function drawSheet(c, bay) {
  const g = c.getContext("2d");
  const { S, cz } = sheetExtent(bay);
  const k = c.width / S;                                       // px per metre
  const P = (x, z) => [(S / 2 - x) * k, (S / 2 - (z - cz)) * k];
  const r = mulberry(11);
  g.lineCap = "round"; g.lineJoin = "round";
  const ink = (a, w) => { g.strokeStyle = INK(a); g.fillStyle = INK(a); g.lineWidth = Math.max(1, w * k); };
  const line = (x0, z0, x1, z1) => { g.beginPath(); g.moveTo(...P(x0, z0)); g.lineTo(...P(x1, z1)); g.stroke(); };
  const rect = (x0, z0, x1, z1) => { const [a, b] = P(x1, z1), [cx2, dd] = P(x0, z0); g.strokeRect(a, b, cx2 - a, dd - b); };
  const text = (t, x, z, size, a = 0.9, font = MONO) => { g.font = `600 ${Math.max(6, size * k)}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK(a); g.fillText(t, ...P(x, z)); };

  // Ghosted older drawings underneath: big faint plans, turned a little.
  g.save();
  for (let i = 0; i < 4; i++) {
    const [px, py] = [r() * c.width, r() * c.height];
    g.translate(px, py); g.rotate((r() - 0.5) * 0.5); g.translate(-px, -py);
    g.strokeStyle = INK(0.12); g.lineWidth = Math.max(1, 0.06 * k);
    const w = (14 + r() * 20) * k, h = (10 + r() * 14) * k;
    g.strokeRect(px - w / 2, py - h / 2, w, h);
    for (let j = 0; j < 7; j++) { const yy = py - h / 2 + r() * h; g.beginPath(); g.moveTo(px - w / 2, yy); g.lineTo(px - w / 2 + r() * w, yy); g.stroke(); }
    for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(px + (r() - 0.5) * w, py + (r() - 0.5) * h, (0.8 + r()) * k, 0, Math.PI / 2); g.stroke(); }
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  g.restore();

  for (const p of sheetPlans(bay)) {
    const T = 0.3;                                               // outer wall thickness
    // Outer walls: two lines with diagonal hatching between.
    ink(0.95, 0.05);
    rect(p.x0, p.z0, p.x1, p.z1); rect(p.x0 + T, p.z0 + T, p.x1 - T, p.z1 - T);
    g.save();
    g.beginPath();
    { const [a, b] = P(p.x1, p.z1), [e, f] = P(p.x0, p.z0); g.rect(a, b, e - a, f - b); }
    { const [a, b] = P(p.x1 - T, p.z1 - T), [e, f] = P(p.x0 + T, p.z0 + T); g.rect(a, b, e - a, f - b); }
    g.clip("evenodd");
    ink(0.55, 0.025);
    for (let s = p.x0 - (p.z1 - p.z0); s < p.x1; s += 0.22) line(s, p.z0, s + (p.z1 - p.z0), p.z1);
    g.restore();
    // Rooms: inner walls as double lines, a door with its swing, furniture, name and area.
    for (const rm of p.rooms) {
      ink(0.85, 0.035);
      const ix0 = Math.max(rm.x0, p.x0 + T) + 0.07, ix1 = Math.min(rm.x1, p.x1 - T) - 0.07;
      const iz0 = Math.max(rm.z0, p.z0 + T) + 0.07, iz1 = Math.min(rm.z1, p.z1 - T) - 0.07;
      rect(ix0, iz0, ix1, iz1);
      // Door: a gap in the room's lower wall with a quarter-circle swing.
      const dw = 0.9, dx = ix0 + 0.4 + r() * Math.max(0.1, ix1 - ix0 - dw - 0.8);
      g.save(); g.globalCompositeOperation = "destination-out"; ink(1, 0.2); line(dx, iz0, dx + dw, iz0); g.restore();
      ink(0.85, 0.03);
      line(dx, iz0, dx, iz0 + dw);
      g.beginPath(); g.arc(...P(dx, iz0), dw * k, Math.PI * 1.0, Math.PI * 1.5, false); g.stroke();
      furniture(rm, { ix0, ix1, iz0, iz1 });
      const cxr = (ix0 + ix1) / 2, czr = (iz0 + iz1) / 2;
      text(ROOM_NAMES[rm.kind], cxr, czr + 0.45, 0.42, 0.95);
      text(`${((ix1 - ix0) * (iz1 - iz0)).toFixed(1)} m²`, cxr, czr - 0.1, 0.28, 0.75);
    }
    // Windows on the outer walls: a gap with three thin lines.
    for (let i = 0; i < 3; i++) {
      const along = 0.25 + r() * 0.5, wl = 1.2;
      const onX = r() < 0.5, side = r() < 0.5 ? p.z0 : p.z1 - T;
      if (onX) {
        const x = p.x0 + (p.x1 - p.x0) * along;
        g.save(); g.globalCompositeOperation = "destination-out"; g.fillRect(...P(x + wl, side + T), wl * k, T * k); g.restore();
        ink(0.9, 0.025);
        for (const f of [0, 0.5, 1]) line(x, side + T * f, x + wl, side + T * f);
      }
    }
    // Dimension chains under and beside the plan: ticks at the plan edges and room cuts, sizes in cm.
    ink(0.8, 0.025);
    const cutsX = [...new Set([p.x0, ...p.rooms.flatMap((q) => [q.x0, q.x1]), p.x1].map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);
    const cutsZ = [...new Set([p.z0, ...p.rooms.flatMap((q) => [q.z0, q.z1]), p.z1].map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);
    for (const [zz, all] of [[p.z0 - 1.1, cutsX], [p.z0 - 2.1, [p.x0, p.x1]]]) {
      line(p.x0, zz, p.x1, zz);
      all.forEach((x, i) => { line(x - 0.18, zz - 0.18, x + 0.18, zz + 0.18); line(x, zz - 0.35, x, zz + 0.35); if (i) text(String(Math.round((x - all[i - 1]) * 100)), (x + all[i - 1]) / 2, zz + 0.35, 0.3, 0.85); });
    }
    const xx = p.x1 + 1.1;
    line(xx, p.z0, xx, p.z1);
    cutsZ.forEach((z, i) => {
      line(xx - 0.18, z - 0.18, xx + 0.18, z + 0.18); line(xx - 0.35, z, xx + 0.35, z);
      if (i) { g.save(); const [tx, ty] = P(xx - 0.4, (z + cutsZ[i - 1]) / 2); g.translate(tx, ty); g.rotate(-Math.PI / 2); g.font = `600 ${Math.max(6, 0.3 * k)}px ${MONO}`; g.textAlign = "center"; g.fillStyle = INK(0.85); g.fillText(String(Math.round((z - cutsZ[i - 1]) * 100)), 0, 0); g.restore(); }
    });
    // A callout circle with a leader.
    const cxp = p.x0 + (p.x1 - p.x0) * r(), czp = p.z1 + 1.5;
    ink(0.85, 0.03);
    g.beginPath(); g.arc(...P(cxp, czp), 0.5 * k, 0, 7); g.stroke();
    text(String(1 + Math.floor(r() * 9)), cxp, czp, 0.4, 0.95);
    line(cxp, czp - 0.5, cxp + 0.8, p.z1 - 0.3);
  }

  function furniture(rm, b) {
    const cx = (b.ix0 + b.ix1) / 2, cz = (b.iz0 + b.iz1) / 2, w = b.ix1 - b.ix0, d = b.iz1 - b.iz0;
    ink(0.8, 0.03);
    if (rm.kind === "bed" && w > 2.2 && d > 2.4) { rect(cx - 0.8, b.iz1 - 2.2, cx + 0.8, b.iz1 - 0.1); rect(cx - 0.7, b.iz1 - 0.65, cx - 0.1, b.iz1 - 0.2); rect(cx + 0.1, b.iz1 - 0.65, cx + 0.7, b.iz1 - 0.2); }
    else if (rm.kind === "dining" && w > 2 && d > 2) {
      rect(cx - 0.8, cz - 0.45, cx + 0.8, cz + 0.45);
      for (const sx of [-0.5, 0, 0.5]) for (const sz of [-0.75, 0.75]) rect(cx + sx - 0.2, cz + sz - 0.2, cx + sx + 0.2, cz + sz + 0.2);
    } else if (rm.kind === "living" && w > 3 && d > 2.5) {
      rect(b.ix0 + 0.3, b.iz0 + 0.3, b.ix0 + 2.4, b.iz0 + 1.2); rect(b.ix0 + 0.3, b.iz0 + 1.2, b.ix0 + 1.2, b.iz0 + 2.2);
      g.beginPath(); g.arc(...P(cx + 0.6, cz + 0.3), 0.45 * k, 0, 7); g.stroke();
    } else if (rm.kind === "kitchen") {
      rect(b.ix0 + 0.05, b.iz1 - 0.65, b.ix1 - 0.05, b.iz1 - 0.05);
      for (const o of [0.5, 1.0]) { g.beginPath(); g.arc(...P(b.ix0 + o, b.iz1 - 0.35), 0.15 * k, 0, 7); g.stroke(); }
    } else if (rm.kind === "bath") {
      g.beginPath(); g.ellipse(...P(b.ix0 + 0.45, b.iz1 - 0.55), 0.22 * k, 0.3 * k, 0, 0, 7); g.stroke();
      rect(b.ix0 + 0.25, b.iz1 - 0.2, b.ix0 + 0.65, b.iz1 - 0.05);
      rect(b.ix1 - 0.95, b.iz1 - 0.95, b.ix1 - 0.05, b.iz1 - 0.05); line(b.ix1 - 0.95, b.iz1 - 0.95, b.ix1 - 0.05, b.iz1 - 0.05); line(b.ix1 - 0.05, b.iz1 - 0.95, b.ix1 - 0.95, b.iz1 - 0.05);
    } else if (rm.kind === "stair" && w > 1.2 && d > 2) {
      const sw = Math.min(1.2, w - 0.2), x0 = cx - sw / 2;
      for (let z = b.iz0 + 0.3; z < b.iz1 - 0.3; z += 0.28) line(x0, z, x0 + sw, z);
      line(cx, b.iz0 + 0.3, cx, b.iz1 - 0.4); line(cx, b.iz1 - 0.4, cx - 0.15, b.iz1 - 0.65); line(cx, b.iz1 - 0.4, cx + 0.15, b.iz1 - 0.65);
    } else if (rm.kind === "office" && w > 2) { rect(b.ix0 + 0.1, b.iz1 - 0.8, b.ix0 + 1.7, b.iz1 - 0.1); g.beginPath(); g.arc(...P(b.ix0 + 0.9, b.iz1 - 1.15), 0.25 * k, 0, 7); g.stroke(); }
    else if (rm.kind === "garage" || rm.kind === "store") { for (let i = 0; i < 3; i++) rect(b.ix0 + 0.1 + i * 0.7, b.iz0 + 0.1, b.ix0 + 0.7 + i * 0.7, b.iz0 + 0.6); }
  }

  // Keep the bay and 3 m round it clear.
  const [ax, ay] = P(bay.width / 2 + 3, bay.depth + 3), [bx, by] = P(-bay.width / 2 - 3, -3);
  g.clearRect(ax, ay, bx - ax, by - ay);
}
