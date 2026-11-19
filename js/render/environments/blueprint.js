// Blueprint: the stage drawn on an architect's blueprint. Deep blue paper that runs to the horizon
// (a 3 km plane fading into the background colour), a crisp white drafting grid (1 m, bolder every
// 5 m), and drafting details laid flat on the paper round the stage: a title block, a north arrow,
// a scale bar, dimension lines with the bay size, registration crosses at the bay corners, a
// detail callout and handwritten notes. No bay floor and no walls; props keep their own colours.
// Everything is drawn in code on canvases; no stage data is read.
import * as THREE from "three";
import { canvasTexture, ground, sun, hasDom, reliefMesh } from "./common.js";
import { GROUND_TONE_DEFAULTS } from "../../model/look.js";
import { bayOutline } from "../../model/bay.js";

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

// Recolouring the paper (Settings: ground hue, intensity, brightness): after the texture, the
// colour's hue is turned, its saturation scaled and its value scaled, so white ink stays white.
const TONE_GLSL = `
uniform vec3 uTone;                      // x: hue turn (0–1), y: saturation scale, z: brightness
vec3 lgRgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1.0e-10)), d / (q.x + 1.0e-10), q.x);
}
vec3 lgHsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}
vec3 lgTone(vec3 c) {
  vec3 h = lgRgb2hsv(c);
  h.x = fract(h.x + uTone.x); h.y = clamp(h.y * uTone.y, 0.0, 1.0); h.z *= uTone.z;
  return lgHsv2rgb(h);
}
`;
function toned(mat, uTone) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTone = uTone;
    sh.fragmentShader = sh.fragmentShader.replace("void main() {", `${TONE_GLSL}\nvoid main() {`)
      .replace("#include <map_fragment>", "#include <map_fragment>\n  diffuseColor.rgb = lgTone(diffuseColor.rgb);");
  };
  mat.customProgramCacheKey = () => "lg-blueprint-tone";
  return mat;
}

export function blueprint(bay) {
  const uTone = { value: new THREE.Vector3(0, 1, 1) };
  const group = new THREE.Group();
  const W = bay.width, D = bay.depth;

  // The paper: blue with a faint mottle, the 1 m grid and a bolder line every 5 m.
  const grid = canvasTexture(640, (g, s, r) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,20,60"},${0.015 + r() * 0.03})`; g.fillRect(r() * s, r() * s, 2 + r() * 6, 2 + r() * 6); }
    // Grit and paper fibre: fine dark and light specks, short hair-like strokes.
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.55 ? `rgba(0,14,48,${0.06 + r() * 0.16})` : `rgba(230,240,255,${0.04 + r() * 0.1})`; g.fillRect(r() * s, r() * s, 1 + r() * 1.6, 1 + r() * 1.6); }
    for (let i = 0; i < 260; i++) { const x = r() * s, y = r() * s, a = r() * Math.PI; g.strokeStyle = `rgba(230,240,255,${0.04 + r() * 0.06})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (4 + r() * 10), y + Math.sin(a) * (4 + r() * 10)); g.stroke(); }
  }, [SIZE / TILE, SIZE / TILE], { seed: 7 });
  // The grid on its own layer just above the paper (white lines on clear; Settings sets its colour
  // and intensity): a fine quarter-metre grid, a line every metre, a bold one every 5 m, and ticks.
  const ink = (a) => `rgba(255,255,255,${a})`;
  const lines = canvasTexture(640, (g, s) => {
    const step = s / TILE;
    g.strokeStyle = ink(0.2); g.lineWidth = 1.2;
    for (let i = 1; i < TILE * 4; i++) { if (i % 4 === 0) continue; const q = (i * step) / 4; g.beginPath(); g.moveTo(q, 0); g.lineTo(q, s); g.moveTo(0, q); g.lineTo(s, q); g.stroke(); }
    g.strokeStyle = ink(0.42); g.lineWidth = 2.2;
    for (let i = 1; i < TILE; i++) { g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, s); g.moveTo(0, i * step); g.lineTo(s, i * step); g.stroke(); }
    g.strokeStyle = ink(0.9); g.lineWidth = 4.2;
    g.strokeRect(0, 0, s, s);
    g.strokeStyle = ink(0.14); g.lineWidth = 1;
    for (let i = 1; i < TILE * 4; i++) { const p = (i * step) / 4; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 10); g.moveTo(0, p); g.lineTo(10, p); g.stroke(); }
  }, [SIZE / TILE, SIZE / TILE], { seed: 8 });
  if (lines) lines.anisotropy = 16;
  if (grid) grid.anisotropy = 16;
  // Toned down so the lit paper reads as deep Prussian blue, not bright royal blue.
  const paper = toned(new THREE.MeshStandardMaterial({ color: grid ? 0xdce6f6 : 0x2a6fd6, map: grid, roughness: 0.95 }), uTone);
  const g0 = ground(SIZE, SIZE, paper, D / 2);
  // Line the grid up with the world: whole metres on whole metres, a bold line on the bay's centre.
  if (grid) grid.offset.set(((SIZE / 2) % TILE) / TILE, ((SIZE / 2 - D / 2) % TILE) / TILE);
  group.add(g0);
  if (lines) lines.offset.copy(grid.offset);
  const gridMat = new THREE.MeshStandardMaterial({ color: 0xe2eeff, map: lines, transparent: true, opacity: lines ? 1 : 0, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, roughness: 0.95 });
  const gridMesh = ground(SIZE, SIZE, gridMat, D / 2);
  gridMesh.position.y = 0.001;
  gridMesh.userData.grid = true;
  group.add(gridMesh);

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
      toned(new THREE.MeshBasicMaterial({ map, transparent: true, opacity: map ? 1 : 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), uTone));
    sheet.rotation.set(-Math.PI / 2, 0, Math.PI);
    sheet.position.set(0, 0.003, cz);
    sheet.userData.sheet = true;
    group.add(sheet);
  }

  // Registration crosses at the bay corners (the bay itself is not drawn as a floor).
  for (const [x, z] of bayOutline(bay)) {
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
  // A drawn bay's raised ground: pale sheet colour, toned with the paper.
  const relief = reliefMesh(bay, toned(new THREE.MeshStandardMaterial({ color: 0xc9d6ea, roughness: 0.9 }), uTone));
  if (relief) group.add(relief);
  const sunLight = sun(bay, 0xffffff, 1.5, [-10, 34, -12]);
  const background = new THREE.Color(BG);
  const fog = new THREE.Fog(BG, 70, 320);           // the endless paper fades into the background
  const bgHsl = new THREE.Color(BG).getHSL({});
  return { group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.5, hemiStrength: 1.8, warmth: 0,
    hazeColor: null, background, fog, baseFog: fog, exposure: 1,
    toneName: "blueprint",
    /** The grid's colour and intensity (Settings). */
    setGrid({ intensity, color }) { gridMat.color.set(color); gridMat.opacity = lines ? intensity : 0; gridMesh.visible = intensity > 0.01; },
    // The paper's colour: hue turned from its own Prussian blue, saturation and brightness scaled;
    // the background and the distance fade follow.
    setGroundTone({ hue, intensity, brightness }) {
      const d = GROUND_TONE_DEFAULTS.blueprint;
      const turn = (((hue - d.hue) % 360) + 360) % 360 / 360, sat = intensity / d.intensity;
      uTone.value.set(turn, sat, brightness);
      background.setHSL((bgHsl.h + turn) % 1, Math.min(1, bgHsl.s * sat), Math.min(1, bgHsl.l * brightness));
      fog.color.copy(background);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// The drafting sheet: a worn, much-handled blueprint. Grit, stains, faded patches, scratches and
// fold creases over the whole sheet, and round the stage the marks people leave on a working
// drawing: handwritten comments, leader arrows, revision clouds, circled callouts, loose dimension
// lines, level marks, section marks, stamps, check marks, pencil scribbles, tape and a coffee ring.
// The bay itself (and 3 m round it) gets wear but no marks, so the stage reads cleanly.

const NOTES = ["VERIFY ON SITE", "CHECK BERM HEIGHT", "SEE DETAIL 4", "MOVE FAULT LINE?", "SAFETY ANGLE 90°", "RO POSITION",
  "ADD 2 POPPERS", "LOWER PORT 10 cm", "WALL 2.0 m TYP.", "BACKSTOP 4 m", "REV. B: WIDER BAY", "SIGHT LINE OK", "3 BAYS ON MATCH DAY",
  "DRAINAGE", "ACCESS ROAD", "PARKING", "RO TENT", "STATS OFFICE", "CHECK WITH CLUB", "FINAL?", "TBD", "APPROX.", "N.T.S.",
  "KEEP CLEAR", "AMMO TABLE", "SAFE AREA", "SHADE NET", "WATER", "NO ENTRY", "FIRST AID", "RELOCATE BARRELS"];
const STAMPS = ["CHECKED", "REVISED", "APPROVED", "FOR REVIEW", "AS BUILT", "PRELIMINARY"];

/** World extent of the sheet: centred on the bay, at least 90 m a side. */
export function sheetExtent(bay) {
  const S = Math.max(90, Math.max(bay.width, bay.depth) + 64);
  return { S, cx: 0, cz: bay.depth / 2 };
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * The marks on the sheet (world metres): { kind, x, z, size, turn, text? }, scattered round the bay
 * but never in it (3 m clear, plus the mark's own size). Seeded, so they are the same every load.
 */
export function sheetMarks(bay, seed = 7) {
  const r = mulberry(seed);
  const { S, cz } = sheetExtent(bay);
  const plan = [["note", 26], ["arrow", 14], ["cloud", 5], ["callout", 9], ["stamp", 4], ["scribble", 6], ["stain", 4], ["dimension", 7], ["level", 5], ["section", 3], ["check", 6], ["tape", 4]];
  const marks = [];
  for (const [kind, n] of plan) {
    for (let i = 0, tries = 0; i < n && tries < 400; tries++) {
      const size = { note: 0.6, arrow: 3, cloud: 4, callout: 0.6, stamp: 2.2, scribble: 2, stain: 1.4, dimension: 6, level: 0.8, section: 1, check: 0.6, tape: 2 }[kind] * (0.7 + r() * 0.6);
      const x = -S / 2 + 3 + r() * (S - 6), z = cz - S / 2 + 3 + r() * (S - 6);
      const pad = 3 + (kind === "note" ? 4 : size);
      if (x > -bay.width / 2 - pad && x < bay.width / 2 + pad && z > -pad && z < bay.depth + pad) continue;
      marks.push({ kind, x, z, size, turn: (r() - 0.5) * (kind === "stamp" ? 0.6 : 0.25), text: kind === "note" ? NOTES[Math.floor(r() * NOTES.length)] : kind === "stamp" ? STAMPS[Math.floor(r() * STAMPS.length)] : null, seed: Math.floor(r() * 1e9) });
      i++;
    }
  }
  return marks;
}

function drawSheet(c, bay) {
  const g = c.getContext("2d");
  const { S, cz } = sheetExtent(bay);
  const k = c.width / S;                                       // px per metre
  const P = (x, z) => [(S / 2 - x) * k, (S / 2 - (z - cz)) * k];
  const r = mulberry(13);
  g.lineCap = "round"; g.lineJoin = "round";

  // Wear over the whole sheet: faded and darker patches, grit, scratches, fold creases.
  for (let i = 0; i < 70; i++) {
    const x = r() * c.width, y = r() * c.height, rad = (2 + r() * 9) * k, light = r() < 0.55;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, light ? `rgba(226,238,255,${0.05 + r() * 0.07})` : `rgba(0,18,60,${0.08 + r() * 0.1})`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < (c.width / 4096) * 60000; i++) {
    g.fillStyle = r() < 0.6 ? `rgba(226,238,255,${0.04 + r() * 0.12})` : `rgba(0,15,50,${0.06 + r() * 0.14})`;
    const sz = 1 + r() * 2.2;
    g.fillRect(r() * c.width, r() * c.height, sz, sz);
  }
  for (let i = 0; i < 160; i++) {
    const x = r() * c.width, y = r() * c.height, l = (0.5 + r() * 4) * k, a = r() * Math.PI;
    g.strokeStyle = `rgba(226,238,255,${0.05 + r() * 0.1})`; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // Fold creases: a light ridge with a soft shadow beside it, the sheet folded in quarters and eighths.
  for (const f of [0.25, 0.5, 0.75]) for (const vertical of [true, false]) {
    const p = f * c.width;
    const grd = vertical ? g.createLinearGradient(p - 10, 0, p + 10, 0) : g.createLinearGradient(0, p - 10, 0, p + 10);
    grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(0.45, "rgba(0,15,50,0.16)"); grd.addColorStop(0.55, "rgba(230,240,255,0.18)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    if (vertical) g.fillRect(p - 10, 0, 20, c.height); else g.fillRect(0, p - 10, c.width, 20);
  }

  const ink = (a, w) => { g.strokeStyle = INK(a); g.fillStyle = INK(a); g.lineWidth = Math.max(1, w * k); };
  const at = (m, draw) => { g.save(); const [x, y] = P(m.x, m.z); g.translate(x, y); g.rotate(m.turn); g.scale(k, k); draw(mulberry(m.seed)); g.restore(); };
  const write = (t, size, x = 0, y = 0, font = HAND, align = "center") => { g.font = `600 ${size * 100}px ${font}`; g.save(); g.scale(0.01, 0.01); g.textAlign = align; g.textBaseline = "middle"; g.fillText(t, x * 100, y * 100); g.restore(); };
  const head = (x, y, a, s) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * Math.cos(a - 0.4), y - s * Math.sin(a - 0.4)); g.moveTo(x, y); g.lineTo(x - s * Math.cos(a + 0.4), y - s * Math.sin(a + 0.4)); g.stroke(); };

  for (const m of sheetMarks(bay)) {
    const s = m.size;
    at(m, (rr) => {
      const lw = (w) => { g.lineWidth = w; };
      switch (m.kind) {
        case "note": ink(0.9, 0); lw(0.05); write(m.text, s); if (rr() < 0.5) { g.beginPath(); g.moveTo(-m.text.length * s * 0.28, s * 0.55); g.lineTo(m.text.length * s * 0.28, s * 0.62); g.stroke(); } break;
        case "arrow": {
          ink(0.85, 0); lw(0.05);
          const a = rr() * Math.PI * 2, ex = Math.cos(a) * s, ey = Math.sin(a) * s, bend = (rr() - 0.5) * s;
          g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(ex / 2 - ey * 0.3 + bend * 0.2, ey / 2 + ex * 0.3, ex, ey); g.stroke();
          head(ex, ey, Math.atan2(ey - (ey / 2 + ex * 0.3), ex - (ex / 2 - ey * 0.3)), 0.35);
          g.beginPath(); g.arc(0, 0, 0.08, 0, 7); g.fill();
          break;
        }
        case "cloud": {
          ink(0.8, 0); lw(0.06);
          const n = 18, rx = s, ry = s * (0.55 + rr() * 0.3);
          g.beginPath();
          for (let i = 0; i < n; i++) {
            const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
            const x0 = Math.cos(a0) * rx, y0 = Math.sin(a0) * ry, x1 = Math.cos(a1) * rx, y1 = Math.sin(a1) * ry;
            const mx = (x0 + x1) / 2 * 1.12, my = (y0 + y1) / 2 * 1.12;
            if (!i) g.moveTo(x0, y0);
            g.quadraticCurveTo(mx, my, x1, y1);
          }
          g.stroke();
          g.beginPath(); g.moveTo(rx * 0.9, -ry * 1.1); g.lineTo(rx * 0.9 + 0.5, -ry * 1.1); g.lineTo(rx * 0.9 + 0.25, -ry * 1.1 - 0.45); g.closePath(); g.stroke();
          write(String(1 + Math.floor(rr() * 4)), 0.3, rx * 0.9 + 0.25, -ry * 1.1 - 0.15, MONO);
          break;
        }
        case "callout": ink(0.9, 0); lw(0.05); g.beginPath(); g.arc(0, 0, s, 0, 7); g.stroke(); write(String.fromCharCode(65 + Math.floor(rr() * 8)) + (1 + Math.floor(rr() * 9)), s * 0.8, 0, 0, MONO); g.beginPath(); g.moveTo(s, 0); g.lineTo(s + 1.5, -0.8); g.lineTo(s + 2.6, -0.8); g.stroke(); break;
        case "stamp": {
          ink(0.6, 0); lw(0.08);
          const w = s * 2.2, h = s * 0.75;
          g.strokeRect(-w / 2, -h / 2, w, h); lw(0.03); g.strokeRect(-w / 2 + 0.12, -h / 2 + 0.12, w - 0.24, h - 0.24);
          write(m.text, h * 0.42, 0, -h * 0.08, MONO); write("19.11.26", h * 0.2, 0, h * 0.26, MONO);
          break;
        }
        case "scribble": {
          ink(0.35, 0); lw(0.04);
          g.beginPath(); g.moveTo(-s, 0);
          for (let i = 0; i < 14; i++) g.lineTo(-s + (i / 13) * 2 * s, (rr() - 0.5) * s * 0.6);
          g.stroke();
          if (rr() < 0.5) { g.beginPath(); g.moveTo(-s, -s * 0.4); g.lineTo(s, s * 0.4); g.moveTo(-s, s * 0.4); g.lineTo(s, -s * 0.4); g.stroke(); }
          break;
        }
        case "stain": {
          g.strokeStyle = "rgba(10,20,40,0.22)"; lw(0.12); g.beginPath(); g.ellipse(0, 0, s, s * 0.93, 0, 0.3, Math.PI * 1.85); g.stroke();
          g.strokeStyle = "rgba(10,20,40,0.12)"; lw(0.05); g.beginPath(); g.ellipse(0.1, 0.05, s * 0.86, s * 0.8, 0, 0, 7); g.stroke();
          g.fillStyle = "rgba(10,20,40,0.08)"; g.beginPath(); g.ellipse(s * 0.7, s * 0.6, s * 0.3, s * 0.2, 0.5, 0, 7); g.fill();
          break;
        }
        case "dimension": {
          ink(0.85, 0); lw(0.035);
          g.beginPath(); g.moveTo(-s / 2, 0); g.lineTo(s / 2, 0); g.stroke();
          for (const x of [-s / 2, s / 2]) { g.beginPath(); g.moveTo(x - 0.18, 0.18); g.lineTo(x + 0.18, -0.18); g.moveTo(x, -0.4); g.lineTo(x, 0.4); g.stroke(); }
          write(`${Math.round(s * 1000).toLocaleString("en").replace(",", " ")}`, 0.35, 0, -0.35, MONO);
          break;
        }
        case "level": ink(0.85, 0); lw(0.04); g.beginPath(); g.arc(0, 0, 0.3, 0, 7); g.moveTo(-0.3, 0); g.lineTo(0.3, 0); g.moveTo(0, -0.3); g.lineTo(0, 0.3); g.stroke(); write(`+${(rr() * 1.5).toFixed(2)}`, 0.32, 0.45, -0.3, MONO, "left"); break;
        case "section": ink(0.9, 0); lw(0.06); g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); for (const x of [-s, s]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -0.6); g.lineTo(x + (x < 0 ? 0.4 : -0.4), -0.6); g.closePath(); g.fill(); } write("B", 0.45, -s, 0.4, MONO); write("B", 0.45, s, 0.4, MONO); break;
        case "check": ink(0.8, 0); lw(0.07); g.beginPath(); g.moveTo(-s * 0.6, 0); g.lineTo(-s * 0.15, s * 0.5); g.lineTo(s * 0.7, -s * 0.6); g.stroke(); write("OK", 0.3, s * 1.1, 0, HAND, "left"); break;
        case "tape": g.fillStyle = "rgba(235,240,250,0.16)"; g.fillRect(-s / 2, -s * 0.18, s, s * 0.36); g.strokeStyle = "rgba(235,240,250,0.12)"; lw(0.02); g.strokeRect(-s / 2, -s * 0.18, s, s * 0.36); break;
      }
    });
  }
}
