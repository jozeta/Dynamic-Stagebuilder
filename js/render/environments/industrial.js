// Industrial: an indoor range in an old factory hall, all of it worn. Sealed concrete floor with a
// slight sheen (saw-cut joints, faint cracks, oil and tyre marks, a worn walking lane, faded yellow
// walkway lines, pools of lamp light), walls of grimy painted block below and corrugated cladding
// above with a band of high translucent windows, steel I-beam columns with hazard-striped bases,
// a pale insulated roof on purlins and lattice trusses, glowing high-bay lamps and faint light
// shafts under the skylights, overhead steel-and-timber safety baffles across the range, a black
// rubber backstop with a sand trap at its foot, and the clutter of a working hall (pallets, drums,
// a pallet rack, an electrical cabinet, a fire extinguisher) along the walls. The front is left open,
// like a cut-away, so the overviews from behind the shooters see in. Lit from overhead (the lamps),
// so the time of day only changes how bright it is. Every texture is drawn in code from a seed.
import * as THREE from "three";
import { canvasTexture, reliefMesh, lineGrid } from "./common.js";

const MARGIN = { side: 9, back: 6, front: 10 };       // metres from the bay to the hall's walls
const WALL_H = 14, BLOCK_H = 2.6, WIN = [9.6, 11.6];  // a high hall (room to fly the camera); the window band, from … to (m)
const SPACING = 6;                                     // columns, trusses and baffles every 6 m

const tex = (size, draw, repeat, seed) => canvasTexture(size, draw, repeat, { seed });
const soft = (g, x, y, r, rgba) => { const grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, rgba); grd.addColorStop(1, rgba.replace(/[\d.]+\)$/, "0)")); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); };

// Sealed concrete: soft mottling, fine aggregate speckle, a few faint cracks, light oil spots, and
// saw-cut joints with chipped arrises at the tile's edges (a tile is one 4 m slab).
function slab(g, s, r) {
  g.fillStyle = "#9a9892"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 160; i++) { const v = (r() - 0.5) * 26; soft(g, r() * s, r() * s, s * (0.05 + r() * 0.16), `rgba(${154 + v},${152 + v},${146 + v},0.35)`); }
  for (let i = 0; i < s * s * 0.018; i++) { const v = 150 + (r() - 0.5) * 80; g.fillStyle = `rgba(${v},${v},${v * 0.98},${0.18 + r() * 0.25})`; g.fillRect(r() * s, r() * s, 1 + r(), 1 + r()); }
  for (let i = 0; i < 6; i++) soft(g, r() * s, r() * s, s * (0.015 + r() * 0.04), `rgba(48,44,38,${0.1 + r() * 0.12})`);
  g.lineCap = "round";
  for (let i = 0; i < 2; i++) {
    g.strokeStyle = `rgba(70,66,60,${0.2 + r() * 0.15})`; g.lineWidth = 0.7;
    let x = r() * s, y = r() * s, a = r() * 6.28;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 12; k++) { a += (r() - 0.5) * 0.8; x += Math.cos(a) * s * 0.025; y += Math.sin(a) * s * 0.025; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = "rgba(58,56,52,0.55)"; g.lineWidth = 2; g.strokeRect(1, 1, s - 2, s - 2);
  for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(72,70,64,0.35)"; const e = r() < 0.5; g.fillRect(e ? r() * s : (r() < 0.5 ? 0 : s - 3), e ? (r() < 0.5 ? 0 : s - 3) : r() * s, 2 + r() * 3, 2 + r() * 3); }
}

// Concrete block (CMU) courses, 40 × 20 cm, painted grey, scuffed, grimy toward the floor.
function blocks(g, s, r) {
  g.fillStyle = "#a3a5a1"; g.fillRect(0, 0, s, s);
  const bw = s / 2.5, bh = s / 5;
  for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) {
    const x = i * bw + (row % 2 ? bw / 2 : 0), y = row * bh, v = (r() - 0.5) * 14;
    g.fillStyle = `rgb(${165 + v},${167 + v},${163 + v})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
  }
  g.strokeStyle = "rgba(90,90,86,0.5)"; g.lineWidth = 2.5;
  for (let row = 0; row <= 5; row++) { g.beginPath(); g.moveTo(0, row * bh); g.lineTo(s, row * bh); g.stroke(); }
  for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) { const x = i * bw + (row % 2 ? bw / 2 : 0); g.beginPath(); g.moveTo(x, row * bh); g.lineTo(x, row * bh + bh); g.stroke(); }
  for (let i = 0; i < 220; i++) { const v = 100 + r() * 60; g.fillStyle = `rgba(${v},${v},${v},${r() * 0.22})`; g.fillRect(r() * s, r() * s, 1 + r() * 6, 1 + r() * 3); }
  const grd = g.createLinearGradient(0, s * 0.6, 0, s); grd.addColorStop(0, "rgba(70,64,56,0)"); grd.addColorStop(1, "rgba(70,64,56,0.3)"); g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

// Corrugated cladding on a 3 m sheet: ribs, a lap joint, rust bleeding from the fixings, grime.
function cladding(g, s, r) {
  g.fillStyle = "#8e959a"; g.fillRect(0, 0, s, s);
  const rib = s / 10;
  for (let i = 0; i < 10; i++) {
    const grd = g.createLinearGradient(i * rib, 0, i * rib + rib, 0);
    grd.addColorStop(0, "rgba(255,255,255,0.10)"); grd.addColorStop(0.3, "rgba(0,0,0,0.16)"); grd.addColorStop(0.55, "rgba(255,255,255,0.14)"); grd.addColorStop(1, "rgba(0,0,0,0.10)");
    g.fillStyle = grd; g.fillRect(i * rib, 0, rib, s);
  }
  g.fillStyle = "rgba(40,40,40,0.35)"; g.fillRect(0, s - 3, s, 3);                       // the lap joint
  for (let i = 0; i < 10; i++) {                                                          // fixings and their rust runs
    const x = i * rib + rib * 0.45, y = s * 0.04;
    g.fillStyle = "rgba(60,50,40,0.6)"; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill();
    if (r() < 0.55) { const len = s * (0.1 + r() * 0.45), grd = g.createLinearGradient(0, y, 0, y + len); grd.addColorStop(0, `rgba(128,70,32,${0.4 + r() * 0.3})`); grd.addColorStop(1, "rgba(128,70,32,0)"); g.fillStyle = grd; g.fillRect(x - 1.5 - r() * 2, y, 3 + r() * 4, len); }
  }
  for (let i = 0; i < 24; i++) { g.fillStyle = `rgba(48,46,42,${0.04 + r() * 0.08})`; g.fillRect(r() * s, r() * s, 1 + r() * 3, s * r() * 0.6); }
  for (let i = 0; i < 4; i++) soft(g, r() * s, r() * s, 6 + r() * 18, `rgba(150,96,56,${0.12 + r() * 0.15})`);
}

// The roof's underside: pale foil-faced insulation between the purlins, stained in places.
function insulation(g, s, r) {
  g.fillStyle = "#c9cbc8"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 4; i++) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, (i * s) / 4, s, 2); }
  for (let i = 0; i < 60; i++) { const v = 180 + r() * 40; g.fillStyle = `rgba(${v},${v},${v},${r() * 0.3})`; g.fillRect(r() * s, r() * s, 4 + r() * 30, 2 + r() * 6); }
  for (let i = 0; i < 5; i++) soft(g, r() * s, r() * s, 10 + r() * 30, `rgba(120,104,80,${0.1 + r() * 0.12})`);       // old leaks
}

// Black rubber blocks (50 × 25 cm), chewed by hits, a few newer ones, dust settled on the ledges.
function rubber(g, s, r) {
  g.fillStyle = "#141415"; g.fillRect(0, 0, s, s);                 // the joints between the blocks
  const bw = s / 2, bh = s / 4;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 2; x++) {
    const v = 46 + r() * 26; g.fillStyle = `rgb(${v},${v},${v + 2})`; g.fillRect(x * bw + 4, y * bh + 4, bw - 8, bh - 8);
    const sh = g.createLinearGradient(0, y * bh, 0, y * bh + bh); sh.addColorStop(0, "rgba(255,255,255,0.06)"); sh.addColorStop(1, "rgba(0,0,0,0.18)"); g.fillStyle = sh; g.fillRect(x * bw + 4, y * bh + 4, bw - 8, bh - 8);
    g.fillStyle = "rgba(150,140,120,0.18)"; g.fillRect(x * bw + 2, y * bh + 2, bw - 4, 2);           // dust on the top edge
  }
  for (let i = 0; i < 700; i++) { const hit = r() < 0.6; g.fillStyle = hit ? `rgba(12,12,12,${0.5 + r() * 0.4})` : `rgba(${80 + r() * 40},${80 + r() * 40},${80 + r() * 40},0.4)`; g.beginPath(); g.arc(s * (0.15 + r() * 0.7), s * (0.25 + r() * 0.6), 0.8 + r() * 2.4, 0, 7); g.fill(); }
}

// Worn plywood facing on the baffles: grain, screws, bullet strikes (they are there to catch them).
function plywood(g, s, r) {
  g.fillStyle = "#b08a5a"; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 2) { const v = (r() - 0.5) * 22; g.fillStyle = `rgba(${140 + v},${104 + v},${66 + v},0.35)`; g.fillRect(0, y, s, 1 + r() * 2); }
  for (let i = 0; i < 24; i++) { g.fillStyle = "rgba(50,40,30,0.7)"; g.beginPath(); g.arc(r() * s, r() * s, 1.2 + r() * 2.5, 0, 7); g.fill(); }
  const grd = g.createLinearGradient(0, 0, 0, s); grd.addColorStop(0, "rgba(40,30,20,0.25)"); grd.addColorStop(1, "rgba(40,30,20,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

// A soft round glow (lamps, light pools): white in the middle, fading out.
const glowTex = () => tex(128, (g, s) => { const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); grd.addColorStop(0, "rgba(255,246,228,1)"); grd.addColorStop(0.25, "rgba(255,240,214,0.45)"); grd.addColorStop(1, "rgba(255,236,200,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s); }, [1, 1], 409);

const box = (w, h, d, mat, x, y, z, rotY = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = rotY; m.receiveShadow = true; return m; };

export function industrial(bay) {
  const group = new THREE.Group();
  const x0 = -bay.width / 2 - MARGIN.side, x1 = bay.width / 2 + MARGIN.side, z0 = -MARGIN.front, z1 = bay.depth + MARGIN.back;
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const rows = []; for (let z = z0 + SPACING / 2; z < z1; z += SPACING) rows.push(z);          // truss lines
  const lampsAt = []; for (const z of rows) for (let x = x0 + W / 6; x < x1; x += W / 3) lampsAt.push([x, z]);

  // Floor: 4 m slabs of sealed concrete with a slight sheen, and a hall-wide layer on top.
  const slabTex = tex(512, slab, [W / 4, D / 4], 401);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: slabTex ? 0xffffff : 0x9a9892, map: slabTex, roughness: 0.55, metalness: 0.04 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0, cz);
  floor.receiveShadow = true; floor.userData.ground = true; floor.name = "hall-floor";
  group.add(floor);
  const marks = canvasTexture(1024, (g, s, r) => {
    const px = (x) => ((x - x0) / W) * s, pz = (z) => (1 - (z - z0) / D) * s;
    // Pools of light under the lamps.
    for (const [x, z] of lampsAt) soft(g, px(x), pz(z), s * 0.11, "rgba(255,244,222,0.22)");
    // A worn lane where people walk, along each side of the bay.
    for (const x of [-bay.width / 2 - 3, bay.width / 2 + 3]) { g.fillStyle = "rgba(180,176,168,0.18)"; g.fillRect(px(x) - s * 0.03, 0, s * 0.06, s); }
    // Tyre marks: long faint arcs from the forklift.
    for (let i = 0; i < 18; i++) {
      g.strokeStyle = `rgba(24,22,20,${0.04 + r() * 0.06})`; g.lineWidth = 5 + r() * 6;
      const y = r() * s; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(s * 0.3, y + (r() - 0.5) * s * 0.4, s * 0.7, y + (r() - 0.5) * s * 0.4, s, y + (r() - 0.5) * s * 0.3); g.stroke();
    }
    // Faded yellow walkway lines just outside the bay, worn through in places.
    for (const x of [-bay.width / 2 - 1.5, bay.width / 2 + 1.5]) for (let z = z0 + 1; z < z1 - 1; z += 0.5) {
      if (r() < 0.15) continue;
      g.fillStyle = `rgba(214,172,44,${0.3 + r() * 0.25})`; g.fillRect(px(x) - 5, pz(z + 0.5), 10, (0.5 / D) * s + 1);
    }
  }, [1, 1], { seed: 402 });
  if (marks) {
    marks.wrapS = marks.wrapT = THREE.ClampToEdgeWrapping;
    const overlay = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: marks, transparent: true, depthWrite: false, roughness: 0.6,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    overlay.rotation.x = -Math.PI / 2; overlay.position.set(cx, 0.001, cz); overlay.receiveShadow = true;
    group.add(overlay);
  }

  // Walls at the sides and the back: block below, cladding above with a band of high windows.
  const walls = new THREE.Group(); walls.name = "hall-walls"; group.add(walls);
  const windows = new THREE.Group(); windows.name = "hall-windows"; group.add(windows);
  // Ribbed polycarbonate, grey-green with age and dust, daylight glowing through it unevenly.
  const winTex = tex(256, (g, s, r) => {
    g.fillStyle = "#b9c3c2"; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 8) { g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(x, 0, 3, s); g.fillStyle = "rgba(60,70,70,0.12)"; g.fillRect(x + 4, 0, 2, s); }
    for (let i = 0; i < 10; i++) soft(g, r() * s, r() * s, 20 + r() * 60, `rgba(90,96,88,${0.1 + r() * 0.15})`);
    const grd = g.createLinearGradient(0, s * 0.7, 0, s); grd.addColorStop(0, "rgba(80,80,70,0)"); grd.addColorStop(1, "rgba(80,80,70,0.3)"); g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }, [1, 1], 413);
  const winMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: winTex, emissive: 0xc9d2d0, emissiveMap: winTex, emissiveIntensity: 0.35, roughness: 0.5, transparent: true, opacity: 0.92 });
  const mullion = new THREE.MeshStandardMaterial({ color: 0x4b5054, roughness: 0.6, metalness: 0.5 });
  // Each wall in its own group: one between the camera (outside) and the stage hides (beforeRender).
  const sides = {};
  const wall = (len, x, z, rotY, name) => {
    const side = new THREE.Group(); side.name = `hall-side-${name}`; walls.add(side); sides[name] = side;
    const winSide = new THREE.Group(); windows.add(winSide); side.userData.windows = winSide;
    const lower = box(len, BLOCK_H, 0.3, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, blocks, [len, BLOCK_H], 403), roughness: 0.95 }), x, BLOCK_H / 2, z, rotY);
    const cladMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, cladding, [len / 3, 1], 404), roughness: 0.65, metalness: 0.35 });
    const midH = WIN[0] - BLOCK_H, topH = WALL_H - WIN[1];
    side.add(lower, box(len, midH, 0.12, cladMat, x, BLOCK_H + midH / 2, z, rotY), box(len, topH, 0.12, cladMat, x, WIN[1] + topH / 2, z, rotY));
    // The window band: translucent panels between mullions every 1.5 m.
    winSide.add(box(len, WIN[1] - WIN[0], 0.05, winMat, x, (WIN[0] + WIN[1]) / 2, z, rotY));
    const dir = [Math.cos(rotY), -Math.sin(rotY)];
    for (let k = -len / 2; k <= len / 2 + 1e-6; k += 1.5) winSide.add(box(0.08, WIN[1] - WIN[0], 0.1, mullion, x + dir[0] * k, (WIN[0] + WIN[1]) / 2, z + dir[1] * k, rotY));
  };
  wall(W, cx, z1, 0, "back");
  wall(D, x0, cz, Math.PI / 2, "right");             // − x: the shooter's right
  wall(D, x1, cz, Math.PI / 2, "left");
  const door = box(6, 5, 0.1, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, (g, s, r) => {
    g.fillStyle = "#858a8e"; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += s / 24) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, y, s, 2); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, y + 2, s, 2); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,64,32,${r() * 0.3})`; g.fillRect(r() * s, s * (0.7 + r() * 0.3), 2 + r() * 8, 2 + r() * 10); }
    g.fillStyle = "#c9a227"; for (let i = 0; i < 8; i++) { g.save(); g.translate(i * s / 8, s - 14); g.fillRect(0, 0, s / 16, 14); g.restore(); }    // a worn yellow kick strip
  }, [1, 1], 405), roughness: 0.6, metalness: 0.4 }), x1 - 0.2, 2.5, cz + D * 0.25, Math.PI / 2);
  sides.left.add(door);

  // Steel I-beam columns along the side walls: worn grey paint, a yellow-and-black hazard band at the foot.
  const columns = new THREE.Group(); columns.name = "hall-columns"; group.add(columns);
  const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, (g, s, r) => {
    g.fillStyle = "#7d8388"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? `rgba(60,60,60,${r() * 0.2})` : `rgba(130,84,48,${r() * 0.25})`; g.fillRect(r() * s, r() * s, 1 + r() * 4, 1 + r() * 4); }
    const band = s * 0.12;                                // the bottom 1.2 m of the 10 m column
    for (let k = -band; k < s; k += band / 2) { g.fillStyle = (Math.round(k / (band / 2)) % 2) ? "#222" : "#d4a82a"; g.beginPath(); g.moveTo(k, s); g.lineTo(k + band / 2, s); g.lineTo(k + band, s - band); g.lineTo(k + band / 2, s - band); g.fill(); }
    g.fillStyle = "rgba(60,54,44,0.35)"; g.fillRect(0, s - band, s, band);
  }, [1, 1], 406), roughness: 0.6, metalness: 0.45 });
  const iBeam = (x, z) => {
    const c = new THREE.Group();
    c.add(box(0.02, WALL_H, 0.36, colMat, 0, WALL_H / 2, 0));
    for (const dz of [-0.17, 0.17]) c.add(box(0.3, WALL_H, 0.02, colMat, 0, WALL_H / 2, dz));
    c.add(box(0.5, 0.03, 0.5, colMat, 0, 0.015, 0));
    c.position.set(x, 0, z);
    columns.add(c);
  };
  for (const z of rows) { iBeam(x0 + 0.4, z); iBeam(x1 - 0.4, z); }

  // Roof: the insulated underside on purlins, lattice trusses, skylight strips.
  // Everything overhead (roof structure, lamps, baffles) hides when the camera is above the roof, so
  // the overviews look straight in.
  const overhead = new THREE.Group(); overhead.name = "hall-overhead"; group.add(overhead);
  const roof = new THREE.Group(); roof.name = "hall-roof"; overhead.add(roof);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, insulation, [W / 6, D / 6], 407), roughness: 0.85, emissive: 0x6a6c6a, emissiveIntensity: 0.5 }));   // bounced light
  under.rotation.x = Math.PI / 2; under.position.set(cx, WALL_H + 1.2, cz);           // seen from below only: the overviews look in from above
  roof.add(under);
  const steel = new THREE.MeshStandardMaterial({ color: 0x6a7075, roughness: 0.55, metalness: 0.6 });
  for (let x = x0 + 1.5; x < x1; x += 1.5) roof.add(box(0.08, 0.16, D, steel, x, WALL_H + 1.08, cz));     // purlins
  for (const z of rows) {
    roof.add(box(W, 0.14, 0.14, steel, cx, WALL_H + 1.0, z), box(W, 0.14, 0.14, steel, cx, WALL_H - 0.3, z));
    for (let i = 0, x = x0 + 0.8; x < x1 - 0.8; x += 1.3, i++) {           // a zigzag web between the chords
      const web = box(0.06, 1.55, 0.06, steel, x, WALL_H + 0.35, z);
      web.rotation.z = (i % 2 ? 1 : -1) * 0.7;
      roof.add(web);
    }
  }
  const skyMat = new THREE.MeshStandardMaterial({ color: 0xe9eef0, emissive: 0xeef3f5, emissiveIntensity: 1, roughness: 0.3 });
  for (const x of [cx - W / 6, cx + W / 6]) { const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.4, D - 2), skyMat); strip.rotation.x = Math.PI / 2; strip.position.set(x, WALL_H + 1.15, cz); roof.add(strip); }

  // High-bay lamps that glow, with a soft halo; faint shafts of daylight under the skylights.
  const lamps = new THREE.Group(); lamps.name = "hall-lamps"; overhead.add(lamps);
  const glow = new THREE.Group(); glow.name = "hall-glow"; overhead.add(glow);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.5, metalness: 0.6 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3dc, emissiveIntensity: 3 });
  const halo = glowTex();
  for (const [x, z] of lampsAt) {
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, 0.4, 24, 1, true), lampMat); shade.position.set(x, WALL_H - 0.75, z); lamps.add(shade);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.43, 24), lensMat); lens.rotation.x = Math.PI / 2; lens.position.set(x, WALL_H - 0.95, z); lamps.add(lens);
    lamps.add(box(0.015, 0.5, 0.015, steel, x, WALL_H - 0.3, z));
    if (halo) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); sp.scale.set(2.6, 2.6, 1); sp.position.set(x, WALL_H - 1.05, z); glow.add(sp); }
  }
  const shafts = new THREE.Group(); shafts.name = "hall-shafts"; overhead.add(shafts);
  const shaftTex = tex(64, (g, s) => { const grd = g.createLinearGradient(0, 0, 0, s); grd.addColorStop(0, "rgba(255,255,255,0.5)"); grd.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s); }, [1, 1], 410);
  if (shaftTex) for (const x of [cx - W / 6, cx + W / 6]) for (const rot of [0, Math.PI / 2]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rot ? D - 4 : 1.4, WALL_H), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.position.set(x, WALL_H / 2 + 0.6, cz); m.rotation.y = rot ? Math.PI / 2 : 0;
    shafts.add(m);
  }

  // Overhead safety baffles across the range: angled steel plate faced with plywood, hung from the trusses.
  const baffles = new THREE.Group(); baffles.name = "hall-baffles"; overhead.add(baffles);
  const ply = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, plywood, [3, 1], 411), roughness: 0.9, emissive: 0x3a2c1c, emissiveIntensity: 0.35 });   // light bounced up from the floor
  for (let z = 4; z < bay.depth - 2; z += SPACING) {
    const b = box(bay.width + 4, 1.4, 0.06, ply, 0, 5.2, z);
    b.rotation.x = -0.6;                                    // leaning toward the shooters: a shot rising off the line hits it
    baffles.add(b, box(bay.width + 4, 0.1, 0.1, steel, 0, 5.9, z - 0.35));
    for (const x of [-bay.width / 2 - 1.5, bay.width / 2 + 1.5]) lamps.add(box(0.04, WALL_H - 0.3 - 5.9, 0.04, steel, x, (WALL_H - 0.3 + 5.9) / 2, z - 0.35));
  }

  // Backstop: black rubber blocks across the back wall, a sand trap at its foot.
  const backstop = box(bay.width + 4, 4.2, 0.8, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, rubber, [(bay.width + 4) / 2, 4.2 / 2], 408), roughness: 0.97 }), 0, 2.1, z1 - 0.55);
  backstop.name = "hall-backstop";
  backstop.add(box(bay.width + 4.2, 0.12, 1, new THREE.MeshStandardMaterial({ color: 0x5c6166, roughness: 0.5, metalness: 0.6 }), 0, 2.16, 0));   // a steel cap on top
  group.add(backstop);
  const trapShape = new THREE.Shape(); trapShape.moveTo(0, 0); trapShape.lineTo(1.6, 0); trapShape.quadraticCurveTo(0.2, 0.25, 0, 0.7); trapShape.closePath();
  const trapGeo = new THREE.ExtrudeGeometry(trapShape, { depth: bay.width + 4, bevelEnabled: false });
  trapGeo.rotateY(-Math.PI / 2); trapGeo.translate((bay.width + 4) / 2, 0, 0);
  const trap = new THREE.Mesh(trapGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, (g, s, r) => { g.fillStyle = "#8e7c62"; g.fillRect(0, 0, s, s); for (let i = 0; i < 3000; i++) { const v = 110 + r() * 60; g.fillStyle = `rgba(${v},${v * 0.9},${v * 0.75},0.5)`; g.fillRect(r() * s, r() * s, 1, 1); } }, [6, 1], 412), roughness: 1 }));
  trap.position.set(0, 0, z1 - 0.95); trap.rotation.y = Math.PI; trap.receiveShadow = true; trap.name = "hall-trap";
  group.add(trap);

  // The clutter of a working hall, along the walls (never in the bay).
  const clutter = new THREE.Group(); clutter.name = "hall-clutter"; group.add(clutter);
  const wood = new THREE.MeshStandardMaterial({ color: 0xa68459, roughness: 0.9 });
  const pallet = (x, z, n, rot) => { for (let i = 0; i < n; i++) { clutter.add(box(1.2, 0.022, 0.8, wood, x, 0.14 * i + 0.13, z, rot)); for (const k of [-0.5, 0, 0.5]) clutter.add(box(0.1, 0.1, 0.8, wood, x + Math.cos(rot) * k, 0.14 * i + 0.06, z - Math.sin(rot) * k, rot)); } };
  pallet(x0 + 2.2, z0 + 5, 8, 0.1); pallet(x0 + 3.6, z0 + 5.4, 5, -0.05); pallet(x1 - 2.5, z1 - 3.5, 6, 0.3);
  const drumMat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.4 });
  for (const [x, z, c] of [[x1 - 1.6, z0 + 6, 0x2f4a72], [x1 - 2.3, z0 + 6.4, 0x2f4a72], [x1 - 1.7, z0 + 7.1, 0x7a1f1a], [x0 + 1.5, z1 - 4, 0x3b4a2a]]) {
    const dr = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.88, 24), drumMat(c)); dr.position.set(x, 0.44, z); dr.receiveShadow = true; clutter.add(dr);
  }
  // A pallet rack against the side wall: orange beams, grey uprights, boxes on the shelves.
  const upright = new THREE.MeshStandardMaterial({ color: 0x4f5a66, roughness: 0.6, metalness: 0.5 }), beam = new THREE.MeshStandardMaterial({ color: 0xd2621f, roughness: 0.6, metalness: 0.4 });
  const cardboard = new THREE.MeshStandardMaterial({ color: 0xa98457, roughness: 0.95 });
  const rx = x0 + 0.9, rz = cz + 4;
  for (const dz of [-2.7, 0, 2.7]) for (const dx of [-0.45, 0.45]) clutter.add(box(0.08, 4.5, 0.08, upright, rx + dx, 2.25, rz + dz));
  for (const y of [0.15, 1.6, 3.05]) for (const dx of [-0.45, 0.45]) clutter.add(box(0.06, 0.12, 5.4, beam, rx + dx, y, rz));
  for (const y of [0.21, 1.66, 3.11]) for (let k = -2.2; k < 2.4; k += 1.1) if ((k * 7 + y * 3) % 2 > 0.4) clutter.add(box(0.8, 0.5 + ((k + y) % 0.4), 0.9, cardboard, rx, y + 0.3, rz + k));
  // An electrical cabinet with conduit, and a red fire extinguisher on a sign, on the other side wall.
  clutter.add(box(0.8, 1.2, 0.3, new THREE.MeshStandardMaterial({ color: 0xb9bcb8, roughness: 0.6, metalness: 0.3 }), x1 - 0.35, 1.6, cz - 6, Math.PI / 2));
  clutter.add(box(0.05, WALL_H - 2.2, 0.05, steel, x1 - 0.3, 2.2 + (WALL_H - 2.2) / 2, cz - 6.2));
  const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.4, metalness: 0.2 }));
  ext.position.set(x1 - 0.3, 0.75, cz + 2); clutter.add(ext);
  clutter.add(box(0.3, 0.3, 0.02, new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.6 }), x1 - 0.17, 1.45, cz + 2, Math.PI / 2));

  // A drawn bay's raised ground, in the floor's concrete.
  const relief = reliefMesh(bay, new THREE.MeshStandardMaterial({ color: 0x8e8c86, roughness: 0.9 }));
  if (relief) group.add(relief);

  // Light: the lamps (one shadow-casting light from above, a little off-centre so props model),
  // and a slightly warm fill bouncing off the pale roof and floor.
  const hemiLight = new THREE.HemisphereLight(0xeef1f3, 0x77726b, 1.25);
  const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sunLight.castShadow = true;
  const r = Math.max(bay.width, bay.depth) * 0.75 + 5;
  Object.assign(sunLight.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 80 });
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  sunLight.shadow.mapSize.set(touch ? 2048 : 4096, touch ? 2048 : 4096);
  sunLight.shadow.bias = -0.0003; sunLight.shadow.normalBias = 0.03;
  // A 1 m line grid on the floor (Settings → Grid on the floor), off until turned on.
  const grid = lineGrid(bay);
  group.add(grid.group);
  return {
    setOutdoorGrid({ shown, opacity }) { grid.set(shown, opacity); },
    beforeRender(camera) {
      const c = camera.position;
      overhead.visible = c.y < WALL_H + 0.8;
      // Seen from outside, a wall between the camera and the stage hides (like a cut-away drawing).
      const show = { back: c.z <= z1, right: c.x >= x0, left: c.x <= x1 };
      for (const [n, g] of Object.entries(sides)) { g.visible = show[n]; g.userData.windows.visible = show[n]; }
    },
    // Show roof (look.roof): the roof, its trusses, lamps, light shafts and the overhead baffles.
    setRoof(shown) { for (const o of [roof, lamps, glow, shafts, baffles]) o.visible = shown; },
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 2.6, hemiStrength: 1.25, warmth: 0,
    // Overhead lamps instead of the sun: this direction, whatever the time of day.
    indoor: { direction: [0.18, 1, -0.12], color: 0xfff1dc },
    hazeColor: 0x7d7a74, background: new THREE.Color(0x3a3b3c), fog: new THREE.Fog(0x3a3b3c, 70, 180), baseFog: new THREE.Fog(0x3a3b3c, 70, 180), exposure: 1,
  };
}
