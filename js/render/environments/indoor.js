// Indoor range: a small club range built tight round the bay, the kind clubs train in all winter.
// A sealed concrete floor with a painted firing line, walls of painted block with dark acoustic
// panels, a low ceiling of acoustic tiles with rows of fluorescent tubes, angled safety baffles
// (steel faced with plywood) hung across the range, a steel bullet trap with a sand catch at the
// back, and a gallery behind the shooters: a glass screen, a bench and the door to the clubroom.
// The front is left open above the gallery's screen and walls between an outside camera and the
// stage hide, so the overviews see in. Lit from the ceiling, whatever the time of day. Every
// texture is drawn in code from a seed (plain colours where there is no DOM).
import * as THREE from "three";
import { canvasTexture, reliefMesh, lineGrid } from "./common.js";

const MARGIN = { side: 1.5, back: 3.2, front: 4.5 };   // metres from the bay to the walls; the gallery is in the front margin
const CEIL = 3.6;                                       // the ceiling (m)
const BAFFLE_EVERY = 5;                                 // a baffle across the range every 5 m

const tex = (size, draw, repeat, seed) => canvasTexture(size, draw, repeat, { seed });
const mat = (map, color, opts = {}) => new THREE.MeshStandardMaterial({ color: map ? 0xffffff : color, map, roughness: 0.85, ...opts });
const box = (w, h, d, m, x, y, z, name = "") => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.receiveShadow = true; b.castShadow = true; if (name) b.name = name; return b; };

// Sealed floor: smooth light concrete, slightly mottled, with scuffs and a few dark spots.
function floorTex(g, s, r) {
  g.fillStyle = "#9c9d98"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 40; i++) {                                  // faint mottling, a few patches a slab
    const x = r() * s, y = r() * s, rad = s * (0.04 + r() * 0.1), v = (r() - 0.5) * 18;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad); grd.addColorStop(0, `rgba(${150 + v},${151 + v},${146 + v},0.18)`); grd.addColorStop(1, "rgba(150,151,146,0)");
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < s * 3; i++) { const v = 130 + r() * 60; g.fillStyle = `rgba(${v},${v},${v},0.25)`; g.fillRect(r() * s, r() * s, 1, 1); }
  g.strokeStyle = "rgba(60,60,58,0.18)"; for (let i = 0; i < 18; i++) { g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * s, y = r() * s; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 20); g.stroke(); }
  g.strokeStyle = "rgba(70,70,66,0.5)"; g.lineWidth = 2; g.strokeRect(0, 0, s, s);          // saw-cut joints at the slab edges
}
// Painted block: 40 × 20 cm courses, off-white, a darker band of scuffs low down.
function blockTex(g, s, r) {
  g.fillStyle = "#c9c8c1"; g.fillRect(0, 0, s, s);
  const bw = s / 2.5, bh = s / 5;
  g.strokeStyle = "rgba(120,118,110,0.6)"; g.lineWidth = 2;
  for (let row = 0; row <= 5; row++) { g.beginPath(); g.moveTo(0, row * bh); g.lineTo(s, row * bh); g.stroke(); }
  for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) { const x = i * bw + (row % 2 ? bw / 2 : 0); g.beginPath(); g.moveTo(x, row * bh); g.lineTo(x, row * bh + bh); g.stroke(); }
  for (let i = 0; i < 160; i++) { const v = 150 + r() * 50; g.fillStyle = `rgba(${v},${v},${v - 6},${r() * 0.18})`; g.fillRect(r() * s, r() * s, 1 + r() * 5, 1 + r() * 3); }
}
// Acoustic tiles: 60 cm squares in a white grid, fissured.
function tileTex(g, s, r) {
  g.fillStyle = "#e4e3de"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < s * 2; i++) { g.fillStyle = `rgba(120,118,110,${0.1 + r() * 0.2})`; g.fillRect(r() * s, r() * s, 1 + r() * 2, 1); }
  g.strokeStyle = "#f4f4f2"; g.lineWidth = 4; g.strokeRect(0, 0, s, s);
  g.strokeStyle = "rgba(90,90,86,0.35)"; g.lineWidth = 1; g.strokeRect(3, 3, s - 6, s - 6);
}
// Acoustic panel: dark grey felt with a faint weave.
function feltTex(g, s, r) {
  g.fillStyle = "#3b3e43"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < s * 4; i++) { const v = 50 + r() * 30; g.fillStyle = `rgba(${v},${v + 2},${v + 6},0.35)`; g.fillRect(r() * s, r() * s, 2, 1); }
}
// The trap's steel: dark plates, polished where the bullets strike, with lead smears.
function trapTex(g, s, r) {
  g.fillStyle = "#3d3f42"; g.fillRect(0, 0, s, s);
  const grd = g.createLinearGradient(0, 0, 0, s); grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(0.55, "rgba(200,205,210,0.25)"); grd.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${150 + r() * 60},${150 + r() * 60},${160 + r() * 60},${0.15 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * s, s * (0.3 + r() * 0.5), 1 + r() * 4, 0.5 + r() * 1.5, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(20,20,22,0.8)"; g.lineWidth = 3; for (let y = s / 4; y < s; y += s / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
}
// Plywood baffle faces: grain and the odd bullet strike.
function plyTex(g, s, r) {
  g.fillStyle = "#b9946a"; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 2) { const v = (r() - 0.5) * 24; g.fillStyle = `rgba(${150 + v},${112 + v},${74 + v},0.35)`; g.fillRect(0, y, s, 1 + r() * 2); }
  for (let i = 0; i < 10; i++) { g.fillStyle = "rgba(40,30,22,0.8)"; g.beginPath(); g.arc(r() * s, r() * s, 1.5 + r() * 2, 0, 7); g.fill(); }
}

export function indoor(bay) {
  const group = new THREE.Group();
  const x0 = -bay.width / 2 - MARGIN.side, x1 = bay.width / 2 + MARGIN.side, z0 = -MARGIN.front, z1 = bay.depth + MARGIN.back;
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  let showCeiling = true;                               // Show roof (look.roof)

  // Floor, and a painted firing line in front of the gallery.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(tex(512, floorTex, [W / 3, D / 3], 601), 0x9c9d98, { roughness: 0.5, metalness: 0.03 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0, cz);
  floor.receiveShadow = true; floor.userData.ground = true; floor.name = "indoor-floor";
  const line = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, 0.1), new THREE.MeshStandardMaterial({ color: 0xc8362b, roughness: 0.6 }));
  line.rotation.x = -Math.PI / 2; line.position.set(cx, 0.004, -0.6); line.receiveShadow = true; line.name = "indoor-firing-line";
  group.add(floor, line);

  // Walls: painted block, dark acoustic panels along the sides above head height.
  const walls = new THREE.Group(); walls.name = "indoor-walls";
  const block = mat(tex(256, blockTex, [1, 1], 602), 0xc9c8c1);
  const felt = mat(tex(256, feltTex, [1, 1], 603), 0x3b3e43, { roughness: 1 });
  const sides = {};
  const side = (name, w, x, z, rotY) => {
    const g = new THREE.Group(); g.name = `indoor-side-${name}`;
    const t = block.map?.clone(); if (t) { t.repeat.set(w / 2, CEIL / 2); t.needsUpdate = true; }
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, CEIL), t ? new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }) : block);
    wall.position.set(0, CEIL / 2, 0); wall.receiveShadow = true; g.add(wall);
    for (let p = -w / 2 + 1.2; p < w / 2 - 1; p += 2.4) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2, 1.1, 0.06), felt);
      panel.position.set(p + 1, 2.45, 0.04); panel.receiveShadow = true; g.add(panel);
    }
    g.position.set(x, 0, z); g.rotation.y = rotY;
    sides[name] = g; walls.add(g);
  };
  side("left", D, x1, cz, -Math.PI / 2);        // +x is the shooter's left
  side("right", D, x0, cz, Math.PI / 2);
  side("back", W, cx, z1, Math.PI);
  group.add(walls);

  // The bullet trap across the back: angled steel plates over a sand catch, between two side cheeks.
  const trap = new THREE.Group(); trap.name = "indoor-trap";
  const steel = mat(tex(256, trapTex, [W / 3, 1], 604), 0x3d3f42, { roughness: 0.45, metalness: 0.7 });
  const upper = box(W - 0.2, 1.8, 0.06, steel, cx, 2.35, z1 - 1.9); upper.rotation.x = -0.55; trap.add(upper);
  const lower = box(W - 0.2, 1.6, 0.06, steel, cx, 0.75, z1 - 1.5); lower.rotation.x = 0.45; trap.add(lower);
  const sand = box(W - 0.2, 0.35, 1.1, new THREE.MeshStandardMaterial({ color: 0x8e7553, roughness: 1 }), cx, 0.17, z1 - 0.9); trap.add(sand);
  for (const x of [x0 + 0.1, x1 - 0.1]) trap.add(box(0.2, CEIL, 2.8, steel, x, CEIL / 2, z1 - 1.4));
  group.add(trap);

  // Overhead: the ceiling (acoustic tiles), rows of fluorescent tubes and the baffles.
  const overhead = new THREE.Group(); overhead.name = "indoor-overhead";
  const tileMap = tex(256, tileTex, [W / 0.6, D / 0.6], 605);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(tileMap, 0xe4e3de, { roughness: 0.95 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(cx, CEIL, cz); ceiling.name = "indoor-ceiling";
  overhead.add(ceiling);
  const lights = new THREE.Group(); lights.name = "indoor-lights";
  const tube = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f8ff, emissiveIntensity: 2.2, roughness: 0.3 });
  const housing = new THREE.MeshStandardMaterial({ color: 0xd9d9d6, roughness: 0.5, metalness: 0.3 });
  for (let z = z0 + 2; z < z1 - 1; z += 3) for (let x = x0 + W / 6; x < x1; x += W / 3) {
    lights.add(box(1.5, 0.06, 0.25, housing, x, CEIL - 0.04, z));
    lights.add(box(1.4, 0.03, 0.08, tube, x, CEIL - 0.085, z));
  }
  overhead.add(lights);
  const baffles = new THREE.Group(); baffles.name = "indoor-baffles";
  const ply = mat(tex(256, plyTex, [W / 2.4, 1], 606), 0xb9946a);
  const plate = new THREE.MeshStandardMaterial({ color: 0x55585c, roughness: 0.5, metalness: 0.6 });
  for (let z = BAFFLE_EVERY; z < bay.depth; z += BAFFLE_EVERY) {
    const b = new THREE.Group();
    b.add(box(W - 0.2, 0.9, 0.04, ply, 0, 0, -0.03), box(W - 0.2, 0.9, 0.012, plate, 0, 0, 0.005));     // plywood toward the shooters, the steel behind it
    b.position.set(cx, CEIL - 0.6, z); b.rotation.x = -0.6;              // tilted to send a stray shot down into the floor
    baffles.add(b);
  }
  overhead.add(baffles);
  group.add(overhead);

  // The gallery behind the shooters: a low wall with a glass screen above it, a bench, the door.
  const gallery = new THREE.Group(); gallery.name = "indoor-gallery";
  const gz = -1.6;
  gallery.add(box(W - 0.2, 1.05, 0.2, block, cx, 0.525, gz));
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 1.4, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xcfe2e8, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, metalness: 0.1 }));
  glass.position.set(cx, 1.05 + 0.7, gz); gallery.add(glass);
  for (const k of [0, 1, 2, 3, 4]) gallery.add(box(0.05, 1.4, 0.06, housing, k === 0 ? x0 + 0.1 : k === 4 ? x1 - 0.1 : x0 + (W * (2 * k - 1)) / 6, 1.75, gz));   // none on the centre line
  gallery.add(box(3, 0.45, 0.4, new THREE.MeshStandardMaterial({ color: 0x6b5a46, roughness: 0.8 }), cx - W / 4, 0.23, z0 + 1));
  gallery.add(box(1.0, 2.1, 0.06, new THREE.MeshStandardMaterial({ color: 0x5f6b74, roughness: 0.6 }), x1 - 1.2, 1.05, z0 + 0.05));
  group.add(gallery);

  const relief = reliefMesh(bay, new THREE.MeshStandardMaterial({ color: 0x8e8c86, roughness: 0.9 }));
  if (relief) group.add(relief);

  // Light from the ceiling: a soft key from above (the tube rows), and a bright, even fill.
  const hemiLight = new THREE.HemisphereLight(0xf4f6f8, 0x8a8781, 1.35);
  const sunLight = new THREE.DirectionalLight(0xf6f8ff, 1.8);
  sunLight.castShadow = true;
  const r = Math.max(bay.width, bay.depth) * 0.75 + 4;
  Object.assign(sunLight.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 60 });
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  sunLight.shadow.mapSize.set(touch ? 2048 : 4096, touch ? 2048 : 4096);
  sunLight.shadow.bias = -0.0003; sunLight.shadow.normalBias = 0.03;
  const grid = lineGrid(bay);
  group.add(grid.group);
  return {
    setOutdoorGrid({ shown, opacity }) { grid.set(shown, opacity); },
    beforeRender(camera) {
      const c = camera.position;
      overhead.visible = showCeiling && c.y < CEIL + 0.3;
      const show = { back: c.z <= z1, right: c.x >= x0, left: c.x <= x1 };
      for (const [n, g] of Object.entries(sides)) g.visible = show[n];
    },
    // Show roof (look.roof): the ceiling, its lights and the baffles.
    setRoof(shown) { showCeiling = shown; overhead.visible = shown; ceiling.visible = shown; lights.visible = shown; baffles.visible = shown; },
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.9, hemiStrength: 1.35, warmth: 0,
    indoor: { direction: [0.12, 1, -0.2], color: 0xf6f8ff },
    hazeColor: 0x8c8b86, background: new THREE.Color(0x2e2f31), fog: new THREE.Fog(0x2e2f31, 60, 160), baseFog: new THREE.Fog(0x2e2f31, 60, 160), exposure: 1,
  };
}
