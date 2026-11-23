// Urban: the bay set in a city block, for urban stages. Worn asphalt all round with a concrete slab
// under the bay; a street with kerbs, markings and manholes along the shooter's left (+x); buildings
// of three to five storeys behind and to both sides (render and brick facades, rows of windows,
// ground-floor doors and shutters); stacked shipping containers on the right; chain-link fencing
// between the bay and the buildings; street lamps, bollards, bins and a barrier. Nothing tall stands
// on the shooters' side, so the overviews from behind see in. The sun follows the look settings, as
// outdoors. Every texture is drawn in code from a seed (plain colours where there is no DOM).
import * as THREE from "three";
import { canvasTexture, sun, reliefMesh, lineGrid, rng } from "./common.js";

const GROUND = 180;                                     // metres a side of the asphalt
const ROAD = { gap: 4, width: 8 };                      // the street: from the bay's left edge, its width (m)
const STOREY = 3;                                       // metres a storey

const tex = (size, draw, repeat, seed) => canvasTexture(size, draw, repeat, { seed });
const std = (map, color, opts = {}) => new THREE.MeshStandardMaterial({ color: map ? 0xffffff : color, map, roughness: 0.9, ...opts });
const box = (w, h, d, m, x, y, z, rotY = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = rotY; b.castShadow = true; b.receiveShadow = true; return b; };

// Asphalt: dark aggregate, cracks, patched repairs, oil stains.
function asphalt(g, s, r) {
  g.fillStyle = "#4b4c4e"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < s * 6; i++) { const v = 50 + r() * 70; g.fillStyle = `rgba(${v},${v},${v + 2},0.5)`; g.fillRect(r() * s, r() * s, 1 + r(), 1 + r()); }
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(${40 + r() * 20},${40 + r() * 20},${42 + r() * 20},0.55)`; g.fillRect(r() * s, r() * s, s * (0.1 + r() * 0.25), s * (0.06 + r() * 0.15)); }
  g.strokeStyle = "rgba(25,25,26,0.7)";
  for (let i = 0; i < 9; i++) { g.lineWidth = 0.8 + r() * 1.5; g.beginPath(); let x = r() * s, y = r() * s; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 5; i++) { const grd = g.createRadialGradient(r() * s, r() * s, 0, r() * s, r() * s, 10 + r() * 30); grd.addColorStop(0, "rgba(20,18,16,0.35)"); grd.addColorStop(1, "rgba(20,18,16,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s); }
}
// The bay's concrete slab: lighter, brushed, with expansion joints.
function slab(g, s, r) {
  g.fillStyle = "#8f8e89"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < s; i += 2) { g.fillStyle = `rgba(${120 + r() * 40},${120 + r() * 40},${116 + r() * 40},0.15)`; g.fillRect(0, i, s, 1); }
  for (let i = 0; i < s * 3; i++) { const v = 100 + r() * 70; g.fillStyle = `rgba(${v},${v},${v},0.3)`; g.fillRect(r() * s, r() * s, 1, 1); }
  g.strokeStyle = "rgba(50,50,48,0.6)"; g.lineWidth = 2; g.strokeRect(0, 0, s, s);
}
// A facade module: one window bay of one storey (3 × 3 m), on render or brick.
function facade(kind) {
  return (g, s, r) => {
    if (kind === "brick") {
      g.fillStyle = "#8a4b36"; g.fillRect(0, 0, s, s);
      const bh = s / 40, bw = s / 12;
      for (let y = 0; y < 40; y++) for (let x = -1; x < 13; x++) { const v = (r() - 0.5) * 30; g.fillStyle = `rgb(${140 + v},${72 + v * 0.6},${52 + v * 0.5})`; g.fillRect(x * bw + (y % 2 ? bw / 2 : 0) + 1, y * bh + 1, bw - 2, bh - 2); }
    } else {
      const base = ["#d8cfc0", "#c9ccc6", "#d9c7a8", "#bfc6c9"][Math.floor(r() * 4)];
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(90,86,78,${r() * 0.08})`; g.fillRect(r() * s, r() * s, 2 + r() * 8, 2 + r() * 8); }
      const grd = g.createLinearGradient(0, s * 0.7, 0, s); grd.addColorStop(0, "rgba(60,55,48,0)"); grd.addColorStop(1, "rgba(60,55,48,0.25)"); g.fillStyle = grd; g.fillRect(0, 0, s, s);   // grime toward the ground
    }
    // The window: frame, sill, glass reflecting the sky, a blind half down in some.
    const wx = s * 0.28, wy = s * 0.2, ww = s * 0.44, wh = s * 0.52;
    g.fillStyle = "#e8e6e0"; g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
    const glass = g.createLinearGradient(0, wy, 0, wy + wh); glass.addColorStop(0, "#7f93a6"); glass.addColorStop(1, "#2f3a44"); g.fillStyle = glass; g.fillRect(wx, wy, ww, wh);
    if (r() < 0.4) { g.fillStyle = "#cfc8b8"; g.fillRect(wx, wy, ww, wh * (0.3 + r() * 0.5)); }
    g.fillStyle = "#e8e6e0"; g.fillRect(wx + ww / 2 - 3, wy, 6, wh);
    g.fillStyle = "#9a958b"; g.fillRect(wx - 10, wy + wh + 6, ww + 20, 8);
  };
}
// Container side: corrugation and paint wear.
function corrugated(color) {
  return (g, s, r) => {
    g.fillStyle = color; g.fillRect(0, 0, s, s);
    const rib = s / 16;
    for (let i = 0; i < 16; i++) { const grd = g.createLinearGradient(i * rib, 0, i * rib + rib, 0); grd.addColorStop(0, "rgba(255,255,255,0.10)"); grd.addColorStop(0.5, "rgba(0,0,0,0.18)"); grd.addColorStop(1, "rgba(255,255,255,0.08)"); g.fillStyle = grd; g.fillRect(i * rib, 0, rib, s); }
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(110,62,32,${0.15 + r() * 0.3})`; g.fillRect(r() * s, r() * s, 2 + r() * 12, 2 + r() * 20); }
  };
}
// Chain-link: a diamond mesh on clear (cut out with alphaTest).
function chainLink(g, s) {
  g.clearRect(0, 0, s, s);
  g.strokeStyle = "rgba(200,204,208,1)"; g.lineWidth = 2.2;
  const n = 8, c = s / n;
  for (let i = -n; i < 2 * n; i++) { g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c + s, s); g.stroke(); g.beginPath(); g.moveTo(i * c, s); g.lineTo(i * c + s, 0); g.stroke(); }
}
// The sky: blue overhead, a pale city haze at the horizon (warmer toward evening).
function paintSky(g, s, warmth) {
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, mix([118, 152, 196], [104, 118, 156], warmth));
  grd.addColorStop(0.6, mix([190, 204, 214], [212, 186, 160], warmth));
  grd.addColorStop(1, mix([222, 224, 222], [236, 200, 160], warmth));
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

export function urban(bay) {
  const group = new THREE.Group();
  const r = rng(707);
  const left = bay.width / 2, right = -bay.width / 2;          // +x is the shooter's left
  const cz = bay.depth / 2;

  // Ground: asphalt everywhere, the bay's concrete slab on it.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GROUND, GROUND), std(tex(512, asphalt, [GROUND / 6, GROUND / 6], 701), 0x4b4c4e, { roughness: 0.92 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, cz);
  ground.receiveShadow = true; ground.userData.ground = true; ground.name = "urban-ground";
  const slabMesh = new THREE.Mesh(new THREE.PlaneGeometry(bay.width + 2, bay.depth + 2), std(tex(512, slab, [(bay.width + 2) / 5, (bay.depth + 2) / 5], 702), 0x8f8e89, { roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -1 }));
  slabMesh.position.set(0, 0, 0.003); slabMesh.receiveShadow = true;
  ground.add(slabMesh);
  group.add(ground);

  // The street along the left: kerbs, a darker carriageway, centre dashes, manholes.
  const street = new THREE.Group(); street.name = "urban-street";
  const x0 = left + ROAD.gap, x1 = x0 + ROAD.width, len = bay.depth + 80;
  const kerb = new THREE.MeshStandardMaterial({ color: 0x9a9893, roughness: 0.8 });
  street.add(box(0.3, 0.15, len, kerb, x0, 0.075, cz), box(0.3, 0.15, len, kerb, x1, 0.075, cz));
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(ROAD.width - 0.3, len), std(tex(512, asphalt, [(ROAD.width) / 5, len / 5], 703), 0x3c3d3f, { roughness: 0.95, color: 0xc8c8c8 }));
  lane.rotation.x = -Math.PI / 2; lane.position.set((x0 + x1) / 2, 0.005, cz); lane.receiveShadow = true; street.add(lane);
  const paint = new THREE.MeshStandardMaterial({ color: 0xe8e4d6, roughness: 0.7 });
  for (let z = cz - len / 2 + 2; z < cz + len / 2; z += 6) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 3), paint); d.rotation.x = -Math.PI / 2; d.position.set((x0 + x1) / 2, 0.008, z); street.add(d); }
  const iron = new THREE.MeshStandardMaterial({ color: 0x2c2b2a, roughness: 0.6, metalness: 0.6 });
  for (const z of [cz - 8, cz + 9]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24), iron); m.position.set((x0 + x1) / 2 - 1.5, 0.012, z); street.add(m); }
  group.add(street);

  // Buildings: behind the bay, across the street, and beyond the containers on the right.
  const buildings = new THREE.Group(); buildings.name = "urban-buildings";
  const roof = new THREE.MeshStandardMaterial({ color: 0x55575a, roughness: 0.95 });
  let seed = 720;
  const building = (x, z, w, d, storeys, rotY) => {
    const kind = r() < 0.4 ? "brick" : "render";
    const h = storeys * STOREY;
    const face = tex(256, facade(kind), [Math.max(1, Math.round(w / 3)), storeys], seed++);
    const side = tex(256, facade(kind), [Math.max(1, Math.round(d / 3)), storeys], seed++);
    const fm = std(face, kind === "brick" ? 0x8a4b36 : 0xd2cbbd), sm = std(side, kind === "brick" ? 0x8a4b36 : 0xd2cbbd);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [sm, sm, roof, roof, fm, fm]);
    b.position.set(x, h / 2, z); b.rotation.y = rotY; b.castShadow = true; b.receiveShadow = true;
    buildings.add(b);
    const parapet = box(w + 0.3, 0.6, d + 0.3, roof, x, h + 0.3, z, rotY); buildings.add(parapet);
  };
  // Behind the backstop, facing the shooters (their front, +z of BoxGeometry, turned to face −z).
  for (let x = right - 14, i = 0; x < left + 14; i++) { const w = 8 + r() * 6; building(x + w / 2, bay.depth + 9 + r() * 2, w, 10, 3 + Math.floor(r() * 3), Math.PI); x += w + 0.4; }
  // Across the street.
  for (let z = -6, i = 0; z < bay.depth + 8; i++) { const w = 8 + r() * 5; building(x1 + 7, z + w / 2, w, 10, 3 + Math.floor(r() * 3), -Math.PI / 2); z += w + 0.4; }
  // Beyond the containers on the right.
  for (let z = 2, i = 0; z < bay.depth + 6; i++) { const w = 9 + r() * 5; building(right - 15, z + w / 2, w, 10, 3 + Math.floor(r() * 2), Math.PI / 2); z += w + 0.4; }
  group.add(buildings);

  // Containers on the right: a row of 40 ft boxes, two high in places.
  const containers = new THREE.Group(); containers.name = "urban-containers";
  const colours = ["#2f5f8a", "#8a2f26", "#3f6b3a", "#b8742a", "#6b6f73"];
  for (let z = 1, i = 0; z < bay.depth; i++) {
    const L = 12.2, Wc = 2.44, Hc = 2.6;
    const m = std(tex(256, corrugated(colours[i % colours.length]), [L / 2.4, 1], 740 + i), parseInt(colours[i % colours.length].slice(1), 16), { roughness: 0.7, metalness: 0.3 });
    containers.add(box(Wc, Hc, L, m, right - 4.2, Hc / 2, z + L / 2));
    if (i % 2 === 0) { const m2 = std(tex(256, corrugated(colours[(i + 2) % colours.length]), [L / 2.4, 1], 760 + i), 0x6b6f73, { roughness: 0.7, metalness: 0.3 }); containers.add(box(Wc, Hc, L, m2, right - 4.2, Hc * 1.5 + 0.02, z + L / 2 + 0.4)); }
    z += L + 0.6;
  }
  group.add(containers);

  // Chain-link fencing behind the bay and along the street side, on steel posts.
  const fences = new THREE.Group(); fences.name = "urban-fences";
  const linkTex = tex(128, chainLink, [1, 1], 780);
  const post = new THREE.MeshStandardMaterial({ color: 0x9da2a6, roughness: 0.4, metalness: 0.7 });
  const fence = (ax, az, bx, bz, h = 2.4) => {
    const L = Math.hypot(bx - ax, bz - az), a = Math.atan2(bx - ax, bz - az);
    const t = linkTex?.clone(); if (t) { t.repeat.set(L / 1.2, h / 1.2); t.needsUpdate = true; }
    const net = new THREE.Mesh(new THREE.PlaneGeometry(L, h), new THREE.MeshStandardMaterial({ color: 0xc9cdd1, map: t, alphaTest: 0.4, transparent: !t, opacity: t ? 1 : 0.25, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5 }));
    net.position.set((ax + bx) / 2, h / 2, (az + bz) / 2); net.rotation.y = a - Math.PI / 2; net.castShadow = true; fences.add(net);
    for (let k = 0; k <= Math.ceil(L / 3); k++) { const f = k / Math.ceil(L / 3); fences.add(box(0.06, h + 0.1, 0.06, post, ax + (bx - ax) * f, (h + 0.1) / 2, az + (bz - az) * f)); }
  };
  fence(right - 1.5, bay.depth + 3, left + 2.5, bay.depth + 3);
  fence(left + 2.5, bay.depth + 3, left + 2.5, 0);
  group.add(fences);

  // Street furniture: lamps along the street, bollards at the bay's front corners, bins, a barrier.
  const furniture = new THREE.Group(); furniture.name = "urban-furniture";
  const grey = new THREE.MeshStandardMaterial({ color: 0x4a4d50, roughness: 0.5, metalness: 0.6 });
  for (let z = -2; z < bay.depth + 10; z += 14) {
    furniture.add(box(0.14, 6, 0.14, grey, x0 - 0.6, 3, z));
    furniture.add(box(1.2, 0.1, 0.12, grey, x0, 6, z));
    furniture.add(box(0.5, 0.12, 0.25, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 0.4 }), x0 + 0.5, 5.92, z));
  }
  const yellow = new THREE.MeshStandardMaterial({ color: 0xd8a62a, roughness: 0.6 });
  for (const x of [right - 1.2, left + 1.2]) for (const z of [-1.2, -2.6]) furniture.add(box(0.2, 0.9, 0.2, yellow, x, 0.45, z));
  const binMat = new THREE.MeshStandardMaterial({ color: 0x2f5a3c, roughness: 0.6 });
  furniture.add(box(0.8, 1.1, 0.7, binMat, x0 - 1, 0.55, bay.depth + 1), box(0.8, 1.1, 0.7, binMat, x0 - 1, 0.55, bay.depth + 2));
  furniture.add(box(4, 0.8, 0.5, new THREE.MeshStandardMaterial({ color: 0xbfbcb4, roughness: 0.85 }), right - 4, 0.4, -3));      // a concrete barrier
  group.add(furniture);

  const relief = reliefMesh(bay, new THREE.MeshStandardMaterial({ color: 0x8f8e89, roughness: 0.9 }));
  if (relief) group.add(relief);

  // Light: the sun (it follows the look), a cool sky fill and warm bounce off the buildings.
  const hemiLight = new THREE.HemisphereLight(0xb7c6d8, 0x8a7f72, 0.9);
  const sunLight = sun(bay, 0xfff0d8, 3, [-16, 18, 14]);
  const sky = canvasTexture(256, (g, s) => paintSky(g, s, 0.3), [1, 1]);
  const grid = lineGrid(bay);
  group.add(grid.group);
  return {
    setOutdoorGrid({ shown, opacity }) { grid.set(shown, opacity); },
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 4.6, hemiStrength: 0.95, warmth: 0.8,
    hazeColor: 0xc9ccd0, background: sky ?? new THREE.Color(0xb9cad9), fog: new THREE.Fog(0xc9ccd0, 70, 190), exposure: 1.02,
    paintSky(warmth) { if (!sky) return; paintSky(sky.image.getContext("2d"), sky.image.width, warmth); sky.needsUpdate = true; },
  };
}
