// Shared materials, created once and reused by every prop (never disposed with a prop).
// Canvas textures (mesh wire, wood grain) only exist in a browser; in Node the plain colours are used.
import * as THREE from "three";

const cache = new Map();
const hasDom = typeof document !== "undefined";

function canvasTexture(size, draw, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

// Diamond wire mesh with transparent holes, one texture tile = 0.25 m.
function meshTexture(color) {
  return canvasTexture(128, (g, s) => {
    g.clearRect(0, 0, s, s);
    g.strokeStyle = color;
    g.lineWidth = 7;
    for (let i = -1; i <= 2; i++) {
      g.beginPath(); g.moveTo(i * s / 2 - s, 0); g.lineTo(i * s / 2 + s, s * 2); g.stroke();
      g.beginPath(); g.moveTo(i * s / 2 + s, 0); g.lineTo(i * s / 2 - s, s * 2); g.stroke();
    }
  });
}

function woodTexture() {
  return canvasTexture(256, (g, s) => {
    g.fillStyle = "#b98a55"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = `rgba(90,55,25,${0.08 + Math.random() * 0.12})`;
      g.lineWidth = 1 + Math.random() * 2;
      const y = Math.random() * s;
      g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(s / 3, y + 6, s * 2 / 3, y - 6, s, y); g.stroke();
    }
  });
}

const specs = {
  "target-tan": () => new THREE.MeshStandardMaterial({ color: 0xc9a273, roughness: 0.95 }),
  "noshoot-white": () => new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.95 }),
  "zone-line": () => new THREE.LineBasicMaterial({ color: 0x6b5438 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0xd8d8d0, roughness: 0.55, metalness: 0.3 }),
  "steel-dark": () => new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.6, metalness: 0.5 }),
  "stick-wood": () => new THREE.MeshStandardMaterial({ color: 0xc8a978, roughness: 0.9 }),
  "mesh-black": () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide,
    transparent: true, alphaTest: 0.4, ...(hasDom ? { map: meshTexture("#1b1d20") } : { color: 0x1b1d20, opacity: 0.35 }) }),
  "mesh-blue": () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide,
    transparent: true, alphaTest: 0.4, ...(hasDom ? { map: meshTexture("#1f4fb4") } : { color: 0x1f4fb4, opacity: 0.35 }) }),
  "frame-black": () => new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.6, metalness: 0.2 }),
  wood: () => new THREE.MeshStandardMaterial({ roughness: 0.9, ...(hasDom ? { map: woodTexture() } : { color: 0xb98a55 }) }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x1e1f21, roughness: 0.95 }),
  barrel: () => new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.5, metalness: 0.4 }),
  "fault-red": () => new THREE.MeshStandardMaterial({ color: 0xd8322a, roughness: 0.7 }),
  "area-fill": () => new THREE.MeshBasicMaterial({ color: 0xd8322a, transparent: true, opacity: 0.08, depthWrite: false }),
  "start-marker": () => new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.8 }),
};

export function getMaterial(name) {
  if (!cache.has(name)) {
    if (!specs[name]) throw new Error(`Unknown material: ${name}`);
    cache.set(name, specs[name]());
  }
  return cache.get(name);
}

export const materials = { get: getMaterial };
