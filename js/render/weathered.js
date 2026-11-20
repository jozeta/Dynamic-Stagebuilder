// Worn surfaces painted in code for the building pieces and the steel: brickwork, cast concrete,
// weathered boards, steel cladding, a Jersey barrier, ISO container sides and doors, galvanised
// chain link and posts, and painted target steel. Each returns { map, bumpMap? } (canvas
// textures, seeded so they look the same on every load). Repeats are set so that texture
// coordinates in metres (builders/wear.js) give the real size. Browser only: materials.js calls
// these only when there is a DOM.
import * as THREE from "three";
import { brickCourses } from "./builders/wear.js";

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Paint a colour canvas (and, with bump, a height canvas: light = raised) with one draw call. */
function paintSet(w, h, draw, { seed = 1, repeat = [1, 1], offset = [0, 0], bump = false } = {}) {
  const make = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const cc = make(), bc = bump ? make() : null;
  draw({ c: cc.getContext("2d"), b: bc && bc.getContext("2d") }, w, h, rng(seed));
  const tex = (canvas, color) => {
    const t = new THREE.CanvasTexture(canvas);
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.offset.set(offset[0], offset[1]);
    t.anisotropy = 8;
    return t;
  };
  return { map: tex(cc, true), ...(bc ? { bumpMap: tex(bc, false) } : {}) };
}

// Call fn at (x, y) and at its copies across the tile's edges, so features tile seamlessly.
function wrap(w, h, x, y, reach, fn, { wrapY = true } = {}) {
  for (const dx of [-w, 0, w]) for (const dy of (wrapY ? [-h, 0, h] : [0])) {
    if (x + dx + reach < 0 || x + dx - reach > w || y + dy + reach < 0 || y + dy - reach > h) continue;
    fn(x + dx, y + dy);
  }
}

// A soft round stain.
function blot(g, x, y, rad, rgb, a) {
  const grd = g.createRadialGradient(x, y, 0, x, y, rad);
  grd.addColorStop(0, `rgba(${rgb},${a})`); grd.addColorStop(0.6, `rgba(${rgb},${a * 0.6})`); grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}

// An irregular patch: a cluster of small hard-edged circles.
function patch(g, r, x, y, rad, fill, n = 14) {
  g.fillStyle = fill;
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, d = Math.sqrt(r()) * rad;
    g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, rad * (0.15 + r() * 0.35), 0, 6.283); g.fill();
  }
}

// A run of water or rust down the surface (y grows downwards on the canvas).
function streak(g, x, y, len, w, rgb, a) {
  const grd = g.createLinearGradient(0, y, 0, y + len);
  grd.addColorStop(0, `rgba(${rgb},${a})`); grd.addColorStop(0.3, `rgba(${rgb},${a * 0.7})`); grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w * 0.2, y + len); g.lineTo(x - w * 0.2, y + len); g.closePath(); g.fill();
}

function speckle(g, r, n, w, h, rgb, a0, a1, size = 2, y0 = 0, y1 = h) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${rgb},${a0 + r() * (a1 - a0)})`;
    const s = 0.6 + r() * size;
    g.fillRect(r() * w, y0 + r() * (y1 - y0), s, s);
  }
}

const shade = (hex, k) => {
  const v = parseInt(hex.slice(1), 16);
  const c = (x) => Math.max(0, Math.min(255, Math.round(x * k)));
  return `rgb(${c(v >> 16)},${c((v >> 8) & 255)},${c(v & 255)})`;
};
const rgbOf = (hex) => { const v = parseInt(hex.slice(1), 16); return `${v >> 16},${(v >> 8) & 255},${v & 255}`; };

// ---------------------------------------------------------------- brick

/** Brickwork in running bond, 1.8 m tile (8 bricks × 24 courses), mortar recessed in the bump map. */
export function brickwork() {
  const L = brickCourses(8, 24), S = 1024, px = S / L.width;
  return paintSet(S, S, ({ c, b }, w, h, r) => {
    c.fillStyle = "#a09a8e"; c.fillRect(0, 0, w, h);                         // mortar
    speckle(c, r, 9000, w, h, "70,64,56", 0.08, 0.3, 1.6);
    speckle(c, r, 5000, w, h, "205,200,190", 0.08, 0.25, 1.4);
    b.fillStyle = "#3a3a3a"; b.fillRect(0, 0, w, h);
    speckle(b, r, 6000, w, h, "90,90,90", 0.2, 0.6, 2);
    const PAL = [[148, 64, 44], [132, 54, 38], [160, 78, 52], [118, 48, 36], [142, 70, 50], [170, 92, 64], [104, 44, 34], [152, 84, 62], [126, 62, 48]];
    for (const row of L.rows) for (const br of row.bricks) {
      const pick = PAL[(r() * PAL.length) | 0], k = 0.86 + r() * 0.2, dark = r() < 0.08 ? 0.62 : 1;
      const col = pick.map((v) => Math.round(v * k * dark));
      const burnt = r() < 0.18, chips = [];
      for (let i = 0, n = r() < 0.45 ? 1 + ((r() * 3) | 0) : 0; i < n; i++) chips.push([r(), r(), 3 + r() * 7, r()]);
      const sp = Array.from({ length: 50 }, () => [r(), r(), r(), r()]);
      const jit = Array.from({ length: 4 }, () => (r() - 0.5) * 1.6);
      for (const dx of [0, -L.width]) {
        const x = (br.x + dx) * px, y = h - (row.y + row.h) * px, bw = br.w * px, bh = row.h * px;
        if (x + bw < 0 || x > w) continue;
        // The brick, edges a little irregular, lighter on top, darker below.
        c.fillStyle = `rgb(${col})`;
        c.beginPath(); c.moveTo(x + jit[0], y + jit[1]); c.lineTo(x + bw + jit[2], y - jit[1] * 0.5); c.lineTo(x + bw - jit[0] * 0.5, y + bh + jit[3]); c.lineTo(x - jit[2] * 0.5, y + bh - jit[3] * 0.5); c.closePath(); c.fill();
        const gv = c.createLinearGradient(0, y, 0, y + bh);
        gv.addColorStop(0, "rgba(255,230,210,0.10)"); gv.addColorStop(0.5, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(20,8,4,0.18)");
        c.fillStyle = gv; c.fillRect(x, y, bw, bh);
        if (burnt) {                                                           // a dark-fired end
          const end = r() < 0.5, gh = c.createLinearGradient(end ? x : x + bw, 0, end ? x + bw * 0.6 : x + bw * 0.4, 0);
          gh.addColorStop(0, "rgba(40,18,12,0.55)"); gh.addColorStop(1, "rgba(40,18,12,0)");
          c.fillStyle = gh; c.fillRect(x, y, bw, bh);
        }
        for (const [sx, sy, sv, sa] of sp) {                                    // sand and pits
          c.fillStyle = sv > 0.5 ? `rgba(210,150,110,${0.12 + sa * 0.2})` : `rgba(50,20,12,${0.15 + sa * 0.25})`;
          c.fillRect(x + sx * bw, y + sy * bh, 1 + sa * 2, 1 + sa * 1.5);
        }
        c.fillStyle = "rgba(10,6,4,0.35)"; c.fillRect(x, y + bh, bw, 2);       // shadow in the bed joint below
        c.fillStyle = "rgba(255,235,220,0.10)"; c.fillRect(x, y, bw, 1);
        b.fillStyle = "#d0d0d0"; b.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        b.fillStyle = "#a8a8a8"; b.fillRect(x, y, bw, 1); b.fillRect(x, y + bh - 1, bw, 1);
        for (const [cx, cy, size, side] of chips) {                             // chipped corners and arrises
          const px0 = x + (side < 0.5 ? (cx < 0.5 ? 0 : bw) : cx * bw), py0 = side < 0.5 ? (cy < 0.5 ? y : y + bh) : (cy < 0.5 ? y : y + bh);
          const pts = Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * 6.283 + cx; return [px0 + Math.cos(a) * size * (0.5 + cy * 0.5), py0 + Math.sin(a) * size * 0.45]; });
          c.fillStyle = `rgba(${col.map((v) => Math.round(v * 0.78 + 30)).join(",")},0.95)`; c.beginPath(); pts.forEach(([a, bb], i) => (i ? c.lineTo(a, bb) : c.moveTo(a, bb))); c.closePath(); c.fill();
          c.strokeStyle = "rgba(30,16,10,0.6)"; c.lineWidth = 1.2; c.stroke();
          b.fillStyle = "#7a7a7a"; b.beginPath(); pts.forEach(([a, bb], i) => (i ? b.lineTo(a, bb) : b.moveTo(a, bb))); b.closePath(); b.fill();
        }
      }
    }
    // Efflorescence: white salt bloom, strongest along the joints.
    for (let i = 0; i < 9; i++) {
      const x = r() * w, y = r() * h, rad = 30 + r() * 80;
      wrap(w, h, x, y, rad, (X, Y) => { for (let k = 0; k < 40; k++) blot(c, X + (r() - 0.5) * rad * 2, Y + (r() - 0.5) * rad, 6 + r() * 16, "232,228,218", 0.06 + r() * 0.08); });
    }
    // Grime streaks running down, soot speckle.
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = r() * h, len = 80 + r() * 360, sw = 4 + r() * 18;
      wrap(w, h, x, y, len, (X, Y) => streak(c, X, Y, len, sw, "38,32,26", 0.08 + r() * 0.12));
    }
    speckle(c, r, 5000, w, h, "28,22,18", 0.05, 0.16, 1.5);
    c.fillStyle = "rgba(112,100,90,0.14)"; c.fillRect(0, 0, w, h);          // weathered: less saturated
  }, { seed: 92, repeat: [1 / L.width, 1 / L.height], bump: true });
}

// ---------------------------------------------------------------- concrete

function concreteBase(c, b, r, w, h, { base = "#a8a69f", tone = 1 } = {}) {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  b.fillStyle = "#b4b4b4"; b.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {                                               // cloudy cement tones
    const x = r() * w, y = r() * h, rad = 40 + r() * 160, light = r() > 0.5;
    wrap(w, h, x, y, rad, (X, Y) => blot(c, X, Y, rad, light ? "220,218,210" : "70,68,62", (0.05 + r() * 0.08) * tone));
  }
  speckle(c, r, 16000, w, h, "60,58,54", 0.05, 0.22, 1.8);                  // sand and aggregate
  speckle(c, r, 9000, w, h, "215,212,205", 0.05, 0.2, 1.6);
  speckle(b, r, 12000, w, h, "90,90,90", 0.2, 0.7, 1.8);
  speckle(b, r, 8000, w, h, "230,230,230", 0.2, 0.6, 1.6);
  for (let i = 0; i < 260; i++) {                                              // air pockets (bug holes)
    const x = r() * w, y = r() * h, rad = 0.8 + r() * r() * 4;
    c.fillStyle = "rgba(40,38,34,0.7)"; c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill();
    c.fillStyle = "rgba(230,228,220,0.35)"; c.beginPath(); c.arc(x, y + rad * 0.6, rad * 0.8, 0, 3.14); c.fill();
    b.fillStyle = "#303030"; b.beginPath(); b.arc(x, y, rad, 0, 6.283); b.fill();
  }
}

function crack(c, b, r, x, y, len) {
  let a = Math.PI / 2 + (r() - 0.5) * 1.2;
  c.strokeStyle = "rgba(35,33,30,0.6)"; c.lineWidth = 1 + r() * 0.8;
  b.strokeStyle = "#404040"; b.lineWidth = 1.5;
  for (const g of [c, b]) { g.beginPath(); g.moveTo(x, y); }
  for (let s = 0; s < len; s += 6) {
    a += (r() - 0.5) * 0.7; x += Math.cos(a) * 6; y += Math.sin(a) * 6;
    c.lineTo(x, y); b.lineTo(x, y);
  }
  c.stroke(); b.stroke();
}

/** Cast-in-place concrete, 2.4 m tile: form-panel seams, tie holes, bug holes, rain streaks, cracks. */
export function castConcrete() {
  const S = 1024, px = S / 2.4;
  return paintSet(S, S, ({ c, b }, w, h, r) => {
    concreteBase(c, b, r, w, h);
    // Formwork: panel seams every 1.2 m (with a slight lip), tie holes on a 0.6 m grid.
    for (const y of [0, 1.2 * px]) {
      c.fillStyle = "rgba(60,58,52,0.35)"; c.fillRect(0, y, w, 2); c.fillStyle = "rgba(235,232,224,0.25)"; c.fillRect(0, y + 2, w, 1);
      b.fillStyle = "#606060"; b.fillRect(0, y, w, 2);
    }
    c.fillStyle = "rgba(60,58,52,0.3)"; c.fillRect(0, 0, 2, h); b.fillStyle = "#606060"; b.fillRect(0, 0, 2, h);
    for (let gx = 0.3; gx < 2.4; gx += 0.6) for (let gy = 0.3; gy < 2.4; gy += 0.6) {
      const x = gx * px, y = gy * px;
      blot(c, x, y, 13, "80,78,72", 0.25);
      c.fillStyle = "rgba(48,46,42,0.85)"; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill();
      b.fillStyle = "#383838"; b.beginPath(); b.arc(x, y, 5, 0, 6.283); b.fill();
      if (r() < 0.4) streak(c, x, y + 4, 40 + r() * 120, 5, "120,72,40", 0.25);   // rust from a tie
    }
    // Rain streaks and runs, darker damp patches, a few hairline cracks.
    for (let i = 0; i < 46; i++) {
      const x = r() * w, y = r() * h, len = 120 + r() * 520, sw = 3 + r() * 22;
      wrap(w, h, x, y, len, (X, Y) => streak(c, X, Y, len, sw, "52,50,44", 0.06 + r() * 0.12));
    }
    for (let i = 0; i < 12; i++) { const x = r() * w, y = r() * h, rad = 50 + r() * 120; wrap(w, h, x, y, rad, (X, Y) => blot(c, X, Y, rad, "70,72,60", 0.08)); }
    for (let i = 0; i < 5; i++) crack(c, b, r, r() * w, r() * h * 0.8, 80 + r() * 220);
  }, { seed: 91, repeat: [1 / 2.4, 1 / 2.4], bump: true });
}

/**
 * A Jersey barrier's concrete, one 2 m × 1 m tile from the ground (v = 0) up: tyre scuffs and soil
 * at the foot, chipped top arrises at 0.81 m, rust runs from the lifting pockets; above 0.82 m the
 * top face (mapped there by the builder).
 */
export function barrierConcrete() {
  const W = 1024, H = 512, px = W / 2;
  const yAt = (m) => H - m * px;
  return paintSet(W, H, ({ c, b }, w, h, r) => {
    concreteBase(c, b, r, w, h, { base: "#b0ada5", tone: 1.2 });
    // Dirty foot: soil, tyre rubber scuffs and black marks low down.
    const dirt = c.createLinearGradient(0, yAt(0), 0, yAt(0.35));
    dirt.addColorStop(0, "rgba(84,70,52,0.7)"); dirt.addColorStop(0.4, "rgba(96,82,62,0.35)"); dirt.addColorStop(1, "rgba(96,82,62,0)");
    c.fillStyle = dirt; c.fillRect(0, yAt(0.35), w, 0.35 * px);
    speckle(c, r, 2600, w, h, "70,58,44", 0.15, 0.5, 2.5, yAt(0.3), h);
    for (let i = 0; i < 14; i++) {                                              // soft rubber scuffs
      const x = r() * w, y = yAt(0.03 + r() * 0.26), len = 60 + r() * 260, t = 6 + r() * 14, bend = (r() - 0.5) * 16;
      for (let k = 0; k < 4; k++) {
        c.strokeStyle = `rgba(26,26,28,${0.05 + r() * 0.06})`; c.lineWidth = t * (1 - k * 0.2); c.lineCap = "round";
        c.beginPath(); c.moveTo(x, y + k); c.quadraticCurveTo(x + len / 2, y + bend, x + len, y + (r() - 0.5) * 10); c.stroke();
      }
    }
    // Chips along the top arris and the lower slope break.
    for (let i = 0; i < 40; i++) {
      const x = r() * w, top = r() < 0.75, y = top ? yAt(0.81) + r() * 8 : yAt(0.33) + (r() - 0.5) * 8, rad = 3 + r() * 12;
      patch(c, r, x, y, rad, "rgba(150,146,136,0.55)", 8);                  // broken face: rougher, a shade darker
      for (let k = 0; k < 12; k++) { c.fillStyle = `rgba(70,66,58,${0.3 + r() * 0.3})`; c.fillRect(x + (r() - 0.5) * rad * 1.6, y + (r() - 0.5) * rad, 1 + r() * 2, 1 + r() * 2); }
      patch(b, r, x, y, rad, "#6a6a6a", 8);
    }
    // Rust runs from the lifting pockets, rain streaks from the top.
    for (const u of [0.25, 0.75]) for (let k = 0; k < 3; k++) streak(c, u * w + (r() - 0.5) * 30, yAt(0.8), 60 + r() * 160, 4 + r() * 8, "126,74,38", 0.3 + r() * 0.2);
    for (let i = 0; i < 30; i++) { const x = r() * w; wrap(w, h, x, yAt(0.8), 300, (X) => streak(c, X, yAt(0.8), 80 + r() * 280, 4 + r() * 20, "58,56,50", 0.06 + r() * 0.1), { wrapY: false }); }
    // A faded spray-painted mark on some barriers.
    c.fillStyle = "rgba(200,60,40,0.22)"; c.font = "bold 46px sans-serif"; c.fillText("B-12", w * 0.58, yAt(0.5));
    // The top face (above 0.82 m in the tile): weathered, dusty.
    c.fillStyle = "rgba(140,136,126,0.4)"; c.fillRect(0, 0, w, yAt(0.82));
    speckle(c, r, 3000, w, yAt(0.82), "90,84,72", 0.1, 0.4, 2);
  }, { seed: 95, repeat: [1 / 2, 1], bump: true });
}

// ---------------------------------------------------------------- boards and cladding

/** Weathered vertical cladding boards, 2.4 m tile: 145 mm boards, gaps, nails with rust runs. */
export function claddingBoards() {
  const S = 1024, px = S / 2.4, bw = 0.15 * px;
  return paintSet(S, S, ({ c, b }, w, h, r) => {
    c.fillStyle = "#3a3026"; c.fillRect(0, 0, w, h);
    b.fillStyle = "#202020"; b.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) {
      const x = i * bw, t = r(), base = [130 + t * 40, 116 + t * 34, 96 + t * 24].map((v) => v * (0.8 + r() * 0.2) | 0);
      c.fillStyle = `rgb(${base})`; c.fillRect(x + 2, 0, bw - 4, h);
      b.fillStyle = "#c8c8c8"; b.fillRect(x + 2, 0, bw - 4, h);
      for (let k = 0; k < 26; k++) {                                         // grain
        const gx = x + 4 + r() * (bw - 8), a = 0.06 + r() * 0.16;
        c.strokeStyle = `rgba(60,48,36,${a})`; c.lineWidth = 0.6 + r() * 1.6;
        c.beginPath(); c.moveTo(gx, 0); for (let y = 0; y <= h; y += 32) c.lineTo(gx + Math.sin(y / (40 + k * 3) + k) * 2.5, y); c.stroke();
        b.strokeStyle = "rgba(150,150,150,0.5)"; b.lineWidth = 1; b.beginPath(); b.moveTo(gx, 0); b.lineTo(gx + 1, h); b.stroke();
      }
      for (let k = 0; k < 3; k++) { const ky = r() * h; c.fillStyle = "rgba(60,40,26,0.55)"; c.beginPath(); c.ellipse(x + bw * (0.3 + r() * 0.4), ky, 4 + r() * 4, 7 + r() * 6, 0, 0, 6.283); c.fill(); }
      for (let k = 0; k < 2; k++) { const sy = r() * h; c.strokeStyle = "rgba(30,22,16,0.6)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + bw * 0.5, sy); c.lineTo(x + bw * 0.5 + 2, sy + 60 + r() * 140); c.stroke(); }
      for (const ny of [0.3, 0.9, 1.5, 2.1]) {                                 // nails, rust running down
        const y = ny * px;
        for (const nx of [0.25, 0.75]) {
          c.fillStyle = "#3b2a20"; c.beginPath(); c.arc(x + bw * nx, y, 2.5, 0, 6.283); c.fill();
          streak(c, x + bw * nx, y, 20 + r() * 60, 3, "112,60,30", 0.4);
        }
      }
    }
    c.fillStyle = "rgba(150,148,140,0.22)"; c.fillRect(0, 0, w, h);          // silvered by the sun
    for (let i = 0; i < 30; i++) { const x = r() * w, y = r() * h, len = 100 + r() * 400; wrap(w, h, x, y, len, (X, Y) => streak(c, X, Y, len, 6 + r() * 20, "50,40,30", 0.08 + r() * 0.1)); }
    speckle(c, r, 6000, w, h, "40,32,24", 0.05, 0.18, 1.6);
  }, { seed: 41, repeat: [1 / 2.4, 1 / 2.4], bump: true });
}

/** Trapezoidal steel cladding, 2.4 m tile: 200 mm ribs, chalky faded paint, screws, rust and scrapes. */
export function steelCladding() {
  const S = 1024, px = S / 2.4, pitch = 0.2 * px;
  return paintSet(S, S, ({ c, b }, w, h, r) => {
    c.fillStyle = "#8e959b"; c.fillRect(0, 0, w, h);
    b.fillStyle = "#808080"; b.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += pitch) {                                     // rib: crown, flanks, pan
      const g = c.createLinearGradient(x, 0, x + pitch, 0);
      g.addColorStop(0, "rgba(255,255,255,0.12)"); g.addColorStop(0.18, "rgba(255,255,255,0.12)");
      g.addColorStop(0.2, "rgba(0,0,0,0.28)"); g.addColorStop(0.3, "rgba(0,0,0,0.12)");
      g.addColorStop(0.32, "rgba(0,0,0,0)"); g.addColorStop(0.9, "rgba(0,0,0,0)");
      g.addColorStop(0.92, "rgba(255,255,255,0.2)"); g.addColorStop(1, "rgba(255,255,255,0.12)");
      c.fillStyle = g; c.fillRect(x, 0, pitch, h);
      const gb = b.createLinearGradient(x, 0, x + pitch, 0);
      gb.addColorStop(0, "#f0f0f0"); gb.addColorStop(0.18, "#f0f0f0"); gb.addColorStop(0.32, "#303030"); gb.addColorStop(0.9, "#303030"); gb.addColorStop(1, "#f0f0f0");
      b.fillStyle = gb; b.fillRect(x, 0, pitch, h);
      for (const sy of [0.05, 1.25]) { c.fillStyle = "#5d6166"; c.beginPath(); c.arc(x + pitch * 0.6, sy * px, 3, 0, 6.283); c.fill(); streak(c, x + pitch * 0.6, sy * px, 30 + r() * 90, 4, "120,64,30", 0.35); }
    }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rad = 40 + r() * 140; wrap(w, h, x, y, rad, (X, Y) => blot(c, X, Y, rad, "210,210,205", 0.08)); }
    for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h; c.strokeStyle = `rgba(${r() > 0.5 ? "200,200,198" : "120,70,40"},${0.3 + r() * 0.3})`; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + r() * 90, y + (r() - 0.5) * 8); c.stroke(); }
    for (let i = 0; i < 22; i++) { const x = r() * w, y = r() * h, len = 80 + r() * 300; wrap(w, h, x, y, len, (X, Y) => streak(c, X, Y, len, 3 + r() * 10, "124,66,32", 0.15 + r() * 0.2)); }
    for (let i = 0; i < 14; i++) patch(c, r, r() * w, r() * h, 6 + r() * 16, "rgba(112,58,28,0.7)", 10);
    speckle(c, r, 4000, w, h, "60,56,50", 0.05, 0.15, 1.5);
  }, { seed: 43, repeat: [1 / 2.4, 1 / 2.4], bump: true });
}

// ---------------------------------------------------------------- shipping containers

// Shared paint wear for container steel: faded paint, re-painted patches over old markings,
// scrapes to primer, rust spots, runs from the top rail, rusty patches and dirt at the foot.
function containerWear(c, r, w, h, paint, { heavy = false, px = 1 } = {}) {
  c.fillStyle = paint; c.fillRect(0, 0, w, h);
  const fade = c.createLinearGradient(0, 0, 0, h * 0.7);                       // sun-faded from the top
  fade.addColorStop(0, "rgba(235,235,230,0.16)"); fade.addColorStop(1, "rgba(235,235,230,0)");
  c.fillStyle = fade; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, rad = 20 + r() * 90, light = r() > 0.45;
    wrap(w, h, x, y, rad, (X, Y) => blot(c, X, Y, rad, light ? "230,230,225" : "10,10,15", 0.05 + r() * 0.05), { wrapY: false });
  }
  for (let i = 0; i < 4; i++) {                                                // re-painted patches over removed markings
    const x = r() * w, y = h * (0.15 + r() * 0.45), pw = 60 + r() * 220, ph = 30 + r() * 110;
    c.fillStyle = shade(paint, 0.86 + r() * 0.24); c.globalAlpha = 0.7;
    wrap(w, h, x, y, pw, (X, Y) => c.fillRect(X, Y, pw, ph), { wrapY: false });
    c.globalAlpha = 1;
  }
  for (let i = 0; i < 110; i++) {                                              // scrapes and scratches
    const x = r() * w, y = h * (0.25 + r() * 0.72), len = 8 + r() * 70 * px;
    c.strokeStyle = r() < 0.5 ? `rgba(160,160,150,${0.25 + r() * 0.3})` : `rgba(120,62,30,${0.3 + r() * 0.4})`;
    c.lineWidth = 0.6 + r() * 1.4;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y + (r() - 0.5) * 6); c.stroke();
  }
  for (let i = 0; i < (heavy ? 600 : 160); i++) {                              // rust spots, most near top and foot
    const edge = r(), y = edge < 0.35 ? r() * h * 0.12 : edge < 0.75 ? h * (0.82 + r() * 0.18) : r() * h;
    c.fillStyle = `rgba(${r() < 0.5 ? "112,64,32" : "150,90,46"},${0.5 + r() * 0.4})`;
    c.beginPath(); c.arc(r() * w, y, 0.6 + r() * r() * 2.6, 0, 6.283); c.fill();
  }
  for (let i = 0; i < (heavy ? 70 : 34); i++) {                                // rust runs
    const x = r() * w, y = r() < 0.6 ? r() * h * 0.06 : r() * h * 0.8, len = 30 + r() * (heavy ? 300 : 200);
    streak(c, x, y, len, 1.5 + r() * 5, r() < 0.5 ? "120,60,28" : "150,84,40", 0.25 + r() * 0.35);
  }
  for (let i = 0; i < (heavy ? 30 : 10); i++) {                                // rusty patches at the foot (and all over when heavy)
    const x = r() * w, y = heavy && r() < 0.5 ? r() * h : h * (0.86 + r() * 0.14), rad = 6 + r() * (heavy ? 40 : 22);
    blot(c, x, y, rad * 1.6, "120,78,44", 0.35);
    patch(c, r, x, y, rad, `rgba(${r() < 0.5 ? "118,70,36" : "146,88,44"},${0.45 + r() * 0.3})`, 16);
    patch(c, r, x, y, rad * 0.45, "rgba(88,52,28,0.55)", 8);
  }
  const dirt = c.createLinearGradient(0, h, 0, h * 0.7);                       // road dirt at the foot
  dirt.addColorStop(0, "rgba(88,74,56,0.55)"); dirt.addColorStop(1, "rgba(88,74,56,0)");
  c.fillStyle = dirt; c.fillRect(0, h * 0.7, w, h * 0.3);
  speckle(c, r, 3000, w, h, "84,70,52", 0.1, 0.4, 2, h * 0.78, h);
  speckle(c, r, 2500, w, h, "40,36,30", 0.04, 0.14, 1.5);
}

/** A container's long side (and roof, posts, rails): one 6.06 × 2.59 m tile, in metres. */
export function containerSide(paint, heavy = false) {
  return paintSet(1024, 448, ({ c }, w, h, r) => containerWear(c, r, w, h, paint, { heavy }),
    { seed: parseInt(paint.slice(1), 16) % 9973, repeat: [1 / 6.06, 1 / 2.59] });
}

/**
 * The door end: both doors in one tile across the container's width (u from −1.22 to 1.22 m,
 * seen from outside) and its full height. The right-hand door carries a made-up container number,
 * size-type code and weights; the left a data plate.
 */
export function containerDoors(paint, heavy = false) {
  const W = 512, H = 544;
  return paintSet(W, H, ({ c }, w, h, r) => {
    containerWear(c, r, w, h, paint, { heavy, px: 0.5 });
    const u = (m) => ((m + 1.22) / 2.44) * w, y = (m) => h - (m / 2.59) * h;
    const ink = "rgba(236,236,230,0.92)";
    c.fillStyle = ink; c.textBaseline = "alphabetic";
    c.font = "bold 23px Arial, Helvetica, sans-serif";
    c.fillText("DSBU 204817 3", u(0.08), y(2.22));
    c.font = "bold 19px Arial, Helvetica, sans-serif";
    c.fillText("22G1", u(0.08), y(2.08));
    c.font = "bold 10px Arial, Helvetica, sans-serif";
    const lines = [["MAX.GROSS", "30.480 KG"], ["", "67.200 LB"], ["TARE", "2.230 KG"], ["", "4.920 LB"], ["NET", "28.250 KG"], ["", "62.280 LB"], ["CU.CAP.", "33,2 CU.M"], ["", "1.172 CU.FT"]];
    lines.forEach(([a, bb], i) => { c.fillText(a, u(0.4), y(1.72 - i * 0.07)); c.fillText(bb, u(0.72), y(1.72 - i * 0.07)); });
    c.fillStyle = "rgba(170,172,168,0.95)"; c.fillRect(u(-0.95), y(0.95), 34, 24);       // data plate
    c.strokeStyle = "rgba(70,70,70,0.7)"; c.lineWidth = 0.6;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(u(-0.95) + 3, y(0.95) + 4 + k * 4); c.lineTo(u(-0.95) + 31, y(0.95) + 4 + k * 4); c.stroke(); }
    c.fillStyle = "rgba(40,40,40,0.8)"; c.fillRect(u(-0.62), y(1.25), 18, 18);            // a customs seal label, blank
    // Wear over the stencils: scratches and grime.
    for (let i = 0; i < 70; i++) { const x = r() * w, yy = r() * h; c.strokeStyle = `rgba(${rgbOf(paint)},${0.5 + r() * 0.4})`; c.lineWidth = 1 + r(); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + 6 + r() * 30, yy + (r() - 0.5) * 4); c.stroke(); }
    // Dirty, rusty round the handles (about 1.1 m) and along the door bottoms.
    for (let i = 0; i < 18; i++) patch(c, r, r() * w, y(1.0 + r() * 0.3), 2 + r() * 5, "rgba(128,80,42,0.5)", 8);
  }, { seed: (parseInt(paint.slice(1), 16) % 7919) + 3, repeat: [1 / 2.44, 1 / 2.59], offset: [0.5, 0] });
}

// ---------------------------------------------------------------- galvanised fence

/** The tile size of the chain link: two 50 mm diamonds across (each 70.7 mm corner to corner). */
export const CHAIN_TILE = 0.05 * Math.SQRT2 * 2;

/** Galvanised chain link: woven diamond mesh, 3 mm wire, dull zinc with white rust and a few rusty knuckles. */
export function chainLinkMesh() {
  const S = 256;
  return paintSet(S, S, ({ c }, w, h, r) => {
    c.clearRect(0, 0, w, h);
    // Drawn at twice the wire's 3 mm: the real width all but vanishes once the texture is scaled down.
    const P = w / 2, wire = (0.0064 / CHAIN_TILE) * w;
    c.lineCap = "round";
    for (const [lw, col] of [[wire, "#7a8083"], [wire * 0.55, "#a9afb2"], [wire * 0.2, "#d6dbdd"]]) {
      c.strokeStyle = col; c.lineWidth = lw;
      for (let k = -6; k <= 6; k++) {
        const o = k * P;
        c.beginPath(); c.moveTo(-w, -w + o); c.lineTo(2 * w, 2 * w + o); c.stroke();             // y = x + o
        c.beginPath(); c.moveTo(-w, w + o); c.lineTo(2 * w, -2 * w + o); c.stroke();             // y = −x + o
      }
    }
    // Knuckles where the wires hook round each other: a bulge with a dark side.
    for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) for (const [ox, oy] of [[0, 0], [P / 2, P / 2]]) {
      const x = i * P + ox, y = j * P + oy;
      c.fillStyle = "#9aa0a3"; c.beginPath(); c.ellipse(x, y, wire * 0.95, wire * 1.25, 0, 0, 6.283); c.fill();
      c.fillStyle = "rgba(40,44,46,0.55)"; c.beginPath(); c.ellipse(x + wire * 0.3, y, wire * 0.45, wire * 1.1, 0, 0, 6.283); c.fill();
      c.fillStyle = "rgba(235,238,240,0.6)"; c.beginPath(); c.ellipse(x - wire * 0.35, y - wire * 0.3, wire * 0.25, wire * 0.5, 0, 0, 6.283); c.fill();
    }
    c.globalCompositeOperation = "source-atop";                              // white rust, dust, rusty spots on the wire
    for (let i = 0; i < 60; i++) blot(c, r() * w, r() * h, 6 + r() * 20, r() < 0.7 ? "200,200,190" : "70,64,56", 0.25 + r() * 0.2);
    for (let i = 0; i < 14; i++) blot(c, r() * w, r() * h, 3 + r() * 8, "130,70,32", 0.6);
    c.globalCompositeOperation = "source-over";
  }, { seed: 93, repeat: [1 / CHAIN_TILE, 1 / CHAIN_TILE] });
}

/** Galvanised tube for posts and rails: zinc spangle, white rust, grime, a few rust spots. */
export function galvanised() {
  return paintSet(256, 256, ({ c }, w, h, r) => {
    c.fillStyle = "#a3a9ac"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {                                           // spangle
      const x = r() * w, y = r() * h, s = 6 + r() * 18;
      c.fillStyle = `rgba(${r() > 0.5 ? "230,234,236" : "90,96,100"},${0.06 + r() * 0.1})`;
      c.beginPath(); c.moveTo(x, y); for (let k = 1; k < 6; k++) c.lineTo(x + Math.cos(k * 1.2 + r()) * s, y + Math.sin(k * 1.2 + r()) * s); c.closePath(); c.fill();
    }
    for (let i = 0; i < 30; i++) blot(c, r() * w, r() * h, 6 + r() * 26, "215,214,205", 0.18);
    for (let i = 0; i < 14; i++) streak(c, r() * w, r() * h, 20 + r() * 90, 2 + r() * 5, "70,64,54", 0.15);
    for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(128,66,30,${0.4 + r() * 0.4})`; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 2.5, 0, 6.283); c.fill(); }
    speckle(c, r, 900, w, h, "50,48,44", 0.05, 0.2, 1.5);
  }, { seed: 61, repeat: [1, 3] });
}

// ---------------------------------------------------------------- target steel

/**
 * Painted target steel in use. The face shows the whole texture once (builders/wear.js
 * steelFaceUV): coats of re-paint over old hits, fresh hits most toward the middle (grey lead
 * splash, a dark crater, fine spatter round it, flaked paint), and the border (where the edges are
 * mapped) chipped to bare, rusting steel. The paint colour stays clearly readable.
 */
export function targetPaint(paint) {
  const S = 512;
  return paintSet(S, S, ({ c, b }, w, h, r) => {
    const hit = (x, y, rad, a, fresh) => {
      if (fresh) {                                                               // flaked paint round the hit
        c.fillStyle = "rgba(66,66,68,0.55)"; patch(c, r, x, y, rad * 1.35, "rgba(70,70,72,0.5)", 7);
      }
      c.fillStyle = `rgba(150,152,156,${a})`; c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill();   // lead smear
      c.fillStyle = `rgba(190,192,196,${a * 0.6})`; c.beginPath(); c.arc(x - rad * 0.2, y - rad * 0.2, rad * 0.55, 0, 6.283); c.fill();
      c.fillStyle = `rgba(52,52,56,${a})`; c.beginPath(); c.arc(x, y, rad * 0.35, 0, 6.283); c.fill();   // crater
      c.strokeStyle = `rgba(128,130,134,${a * 0.8})`; c.lineCap = "round";
      for (let k = 0, n = 8 + (r() * 10 | 0); k < n; k++) {                   // spatter radiating out
        const ang = r() * 6.283, l0 = rad * 0.9, l1 = rad * (1.3 + r() * 1.4);
        c.lineWidth = 1 + r() * 1.8;
        c.beginPath(); c.moveTo(x + Math.cos(ang) * l0, y + Math.sin(ang) * l0); c.lineTo(x + Math.cos(ang) * l1, y + Math.sin(ang) * l1); c.stroke();
        c.fillStyle = `rgba(120,122,126,${a * 0.7})`; c.beginPath(); c.arc(x + Math.cos(ang) * l1 * 1.15, y + Math.sin(ang) * l1 * 1.15, 0.8 + r() * 1.3, 0, 6.283); c.fill();
      }
      b.fillStyle = "#505050"; b.beginPath(); b.arc(x, y, rad, 0, 6.283); b.fill();
      b.fillStyle = "#262626"; b.beginPath(); b.arc(x, y, rad * 0.4, 0, 6.283); b.fill();
    };
    const spot = (spread) => [w / 2 + (r() + r() + r() - 1.5) * w * spread, h * 0.46 + (r() + r() + r() - 1.5) * h * spread];
    c.fillStyle = paint; c.fillRect(0, 0, w, h);
    b.fillStyle = "#b0b0b0"; b.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const [x, y] = spot(0.55); hit(x, y, 3 + r() * 6, 0.8, false); }   // old hits
    // Re-painted over them, sprayed unevenly, so the old hits show through faintly.
    c.globalAlpha = 0.82; c.fillStyle = paint; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
    b.globalAlpha = 0.6; b.fillStyle = "#b0b0b0"; b.fillRect(0, 0, w, h); b.globalAlpha = 1;
    for (let i = 0; i < 30; i++) blot(c, r() * w, r() * h, 30 + r() * 110, r() > 0.5 ? "255,255,255" : "0,0,0", 0.05);
    for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h * 0.8; streak(c, x, y, 10 + r() * 40, 3 + r() * 3, rgbOf(paint), 0.6); }   // paint runs
    // Fresh hits (most in the middle), a few strays.
    for (let i = 0; i < 26; i++) { const [x, y] = spot(i < 20 ? 0.32 : 0.7); hit(x, y, 4 + r() * 7, 0.85 + r() * 0.15, true); }
    // Worn border: chips to dark steel with rust, the very edge (bottom rows) bare and rusty.
    const border = (x, y) => { const rad = 2 + r() * 9; patch(c, r, x, y, rad + 2, "rgba(128,64,28,0.65)", 7); patch(c, r, x, y, rad, "rgba(64,62,62,0.95)", 7); patch(b, r, x, y, rad, "#606060", 6); };
    for (let i = 0; i < 90; i++) {
      const t = r() * w, d = r() * r() * 22, side = (r() * 4) | 0;
      border(side === 0 ? t : side === 1 ? t : side === 2 ? d : w - d, side === 0 ? d : side === 1 ? h - d - 16 : t, d);
    }
    const edge = c.createLinearGradient(0, h, 0, h - 14);
    edge.addColorStop(0, "rgba(96,58,34,0.95)"); edge.addColorStop(1, "rgba(80,74,70,0.75)");
    c.fillStyle = edge; c.fillRect(0, h - 14, w, 14);
    speckle(c, r, 700, w, h, "140,72,32", 0.4, 0.9, 2, h - 14, h);
    speckle(c, r, 900, w, h, "110,96,76", 0.05, 0.2, 2, h * 0.75, h - 14);     // dust toward the foot
  }, { seed: paint.charCodeAt(1) * 13 + 5, bump: true });
}

/** Stands, bases, frames and hinges: dark painted steel worn to rust, scratched, lead-spattered. */
export function standSteel() {
  return paintSet(512, 512, ({ c, b }, w, h, r) => {
    c.fillStyle = "#3a3b3e"; c.fillRect(0, 0, w, h);
    b.fillStyle = "#909090"; b.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) blot(c, r() * w, r() * h, 20 + r() * 80, r() > 0.5 ? "90,92,96" : "20,20,22", 0.12);
    for (let i = 0; i < 45; i++) {                                              // rust blooms where the paint is gone
      const x = r() * w, y = r() * h, rad = 4 + r() * 26;
      wrap(w, h, x, y, rad, (X, Y) => { blot(c, X, Y, rad * 1.4, "118,64,32", 0.3); patch(c, r, X, Y, rad * 0.5, `rgba(${r() < 0.5 ? "100,52,26" : "130,74,38"},0.6)`, 10); patch(b, r, X, Y, rad * 0.6, "#6c6c6c", 8); });
    }
    for (let i = 0; i < 24; i++) streak(c, r() * w, r() * h, 30 + r() * 120, 2 + r() * 6, "130,68,30", 0.35);
    for (let i = 0; i < 200; i++) {                                             // scratches to bright steel
      const x = r() * w, y = r() * h; c.strokeStyle = `rgba(180,180,176,${0.15 + r() * 0.35})`; c.lineWidth = 0.6 + r() * 0.8;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 10); c.stroke();
    }
    speckle(c, r, 900, w, h, "150,152,156", 0.3, 0.7, 2.2);                    // lead spatter
    speckle(c, r, 2500, w, h, "110,94,72", 0.05, 0.22, 1.8);                   // dust
  }, { seed: 67, repeat: [2, 2], bump: true });
}
