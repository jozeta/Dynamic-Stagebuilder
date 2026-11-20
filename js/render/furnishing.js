// Materials for home and office furniture, drawn in code (seeded): wood veneers (oak, walnut, white
// and black lacquer over wood grain), woven upholstery fabric, leather, quilted bedding, a mattress
// cover, plus brushed steel, black plastic and glass. Wood and fabric are mapped in metres (the
// builders give their geometry metre texture coordinates), so the grain and weave are at true scale.
import * as THREE from "three";
import { rng } from "./environments/common.js";

const hasDom = typeof document !== "undefined";
const std = (o) => new THREE.MeshStandardMaterial(o);

function canvasTex(size, draw, metres, seed) {
  if (!hasDom) return null;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metres, 1 / metres);           // the tile covers `metres` metres
  t.anisotropy = 8;
  return t;
}
const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

// Wood: long grain lines with figure and the odd knot, over a base tone; lacquered finishes show the
// grain faintly through the paint. Each line starts and ends at the same height so the tile wraps
// without a seam; one tile covers 2 m.
const WOODS = { oak: ["#b38a58", "#8c6538"], walnut: ["#6b4630", "#3f281a"], white: ["#ecebe6", "#d6d4cd"], black: ["#2a2a2a", "#161616"] };
function wood(finish) {
  const [base, dark] = WOODS[finish] || WOODS.oak, lacquer = finish === "white" || finish === "black";
  return canvasTex(512, (g, s, r) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    const [dr, dg, db] = rgb(dark);
    for (let y = 0; y < s; y += 1.5) {
      const wave = Math.sin(y * 0.05 + r() * 0.3) * 6;
      g.strokeStyle = `rgba(${dr},${dg},${db},${(lacquer ? 0.05 : 0.12) + r() * (lacquer ? 0.05 : 0.18)})`;
      g.lineWidth = 0.6 + r() * 1.4;
      g.beginPath(); g.moveTo(0, y + wave); g.bezierCurveTo(s * 0.3, y + wave + (r() - 0.5) * 8, s * 0.7, y - wave, s, y + wave); g.stroke();
    }
    if (!lacquer) for (let i = 0; i < 2; i++) { const x = r() * s, y = r() * s; g.fillStyle = `rgba(${dr},${dg},${db},0.5)`; g.beginPath(); g.ellipse(x, y, 5 + r() * 6, 2 + r() * 3, 0, 0, 7); g.fill(); }
  }, 2, 300 + Object.keys(WOODS).indexOf(finish));
}

// Woven upholstery: a fine basket weave with slubs and a little wear.
const FABRICS = { "grey-fabric": "#7b7d80", "beige-fabric": "#b8a990", "blue-fabric": "#3d5878", "green-fabric": "#4d6450", grey: "#8a8c8f", white: "#ecebe7", blue: "#6f8fb4", beige: "#d6c7ab", green: "#8aa58a" };
function fabric(colour, cell = 3) {
  const [cr, cg, cb] = rgb(FABRICS[colour] || "#7b7d80");
  return canvasTex(256, (g, s, r) => {
    g.fillStyle = `rgb(${cr},${cg},${cb})`; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += cell) for (let x = 0; x < s; x += cell) {
      const v = ((x / cell + y / cell) % 2 ? 14 : -14) + (r() - 0.5) * 16;
      g.fillStyle = `rgb(${cr + v},${cg + v},${cb + v})`; g.fillRect(x, y, cell, cell);
    }
    for (let i = 0; i < 70; i++) { const v = (r() - 0.5) * 50; g.fillStyle = `rgba(${cr + v},${cg + v},${cb + v},0.5)`; g.fillRect(r() * s, r() * s, 6 + r() * 20, 1); }   // slubs
  }, 0.25, 320 + (FABRICS[colour] ? Object.keys(FABRICS).indexOf(colour) : 0));
}

// Leather: a pebbled grain, soft creases and a slight sheen.
const LEATHERS = { "black-leather": "#232222", "brown-leather": "#6a4027" };
function leather(colour) {
  const [cr, cg, cb] = rgb(LEATHERS[colour] || "#232222");
  return canvasTex(512, (g, s, r) => {
    g.fillStyle = `rgb(${cr},${cg},${cb})`; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) { const v = (r() - 0.5) * 26; g.fillStyle = `rgba(${cr + v},${cg + v},${cb + v},0.6)`; g.beginPath(); g.arc(r() * s, r() * s, 0.8 + r() * 1.6, 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(0,0,0,${0.15 + r() * 0.15})`; g.lineWidth = 1 + r(); g.beginPath(); const x = r() * s, y = r() * s; g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 30, x + (r() - 0.5) * 120, y + (r() - 0.5) * 20); g.stroke(); }
  }, 0.5, 340 + (colour === "brown-leather" ? 1 : 0));
}

// Bedding: a quilted duvet in the chosen colour, with soft stitched squares and folds.
function bedding(colour) {
  const [cr, cg, cb] = rgb(FABRICS[colour] || FABRICS.white);
  return canvasTex(256, (g, s, r) => {
    g.fillStyle = `rgb(${cr},${cg},${cb})`; g.fillRect(0, 0, s, s);
    const q = s / 4;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const grd = g.createRadialGradient(x * q + q / 2, y * q + q / 2, 2, x * q + q / 2, y * q + q / 2, q * 0.7); grd.addColorStop(0, "rgba(255,255,255,0.12)"); grd.addColorStop(1, "rgba(0,0,0,0.12)"); g.fillStyle = grd; g.fillRect(x * q, y * q, q, q); }
    for (let i = 0; i < 6; i++) { g.strokeStyle = "rgba(0,0,0,0.06)"; g.lineWidth = 6 + r() * 10; g.beginPath(); const y = r() * s; g.moveTo(0, y); g.bezierCurveTo(s / 3, y + (r() - 0.5) * 30, s * 0.66, y + (r() - 0.5) * 30, s, y + (r() - 0.5) * 20); g.stroke(); }
  }, 0.8, 360 + Object.keys(FABRICS).indexOf(colour));
}
function mattress() {
  return canvasTex(256, (g, s) => {
    g.fillStyle = "#e9e6de"; g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(150,145,135,0.35)"; g.lineWidth = 1.5;
    for (let k = -s; k < s * 2; k += 24) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + s, s); g.stroke(); g.beginPath(); g.moveTo(k + s, 0); g.lineTo(k, s); g.stroke(); }
  }, 0.4, 380);
}

const cache = new Map();
/** A furniture material by name: wood-<finish>, fabric-<colour>, leather-<colour>, bedding-<colour>, or steel, plastic, glass, mattress. */
export function furnitureMaterial(name) {
  if (cache.has(name)) return cache.get(name);
  const [kind, ...rest] = name.split("-"), arg = rest.join("-");
  let m;
  if (kind === "wood") { const map = wood(arg); m = std({ color: map ? 0xffffff : (WOODS[arg] || WOODS.oak)[0], map, roughness: arg === "white" || arg === "black" ? 0.35 : 0.55 }); }
  else if (kind === "fabric") { const map = fabric(arg); m = std({ color: map ? 0xffffff : FABRICS[arg] || "#7b7d80", map, roughness: 0.95 }); }
  else if (kind === "leather") { const map = leather(arg); m = std({ color: map ? 0xffffff : LEATHERS[arg] || "#232222", map, roughness: 0.45, metalness: 0.05 }); }
  else if (kind === "bedding") { const map = bedding(arg); m = std({ color: map ? 0xffffff : FABRICS[arg] || "#ecebe7", map, roughness: 0.95 }); }
  else if (kind === "mattress") { const map = mattress(); m = std({ color: map ? 0xffffff : 0xe9e6de, map, roughness: 0.9 }); }
  else if (kind === "steel") m = std({ color: 0xa9adb1, roughness: 0.3, metalness: 0.85 });
  else if (kind === "plastic") m = std({ color: 0x1e1f21, roughness: 0.55 });
  else if (kind === "glass") m = std({ color: 0xa9c4cc, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.4, depthWrite: false });
  else throw new Error(`Unknown furniture material: ${name}`);
  m.name = `furn-${name}`;
  cache.set(name, m);
  return m;
}
