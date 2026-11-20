// Industrial: an indoor range in an old factory hall. Worn polished concrete floor (saw-cut joints,
// cracks, oil stains, tyre marks, faded yellow safety lines), walls of grimy painted concrete block
// below and dirty corrugated steel cladding above (the front is left open, like a cut-away, so the
// overviews from behind the shooters see in), a roller door in a side wall, steel I-beam
// columns along the sides, lattice roof trusses with skylight strips and high-bay lamps, and a worn
// black rubber backstop on the back wall. Lit from overhead (the lamps), so the time of day only
// changes how bright it is. Every texture is drawn in code from a seed.
import * as THREE from "three";
import { canvasTexture, reliefMesh } from "./common.js";

const MARGIN = { side: 9, back: 6, front: 10 };       // metres from the bay to the hall's walls
const WALL_H = 10, BLOCK_H = 2.6;
const BAY_SPACING = 6;                                // columns and trusses every 6 m

// Mottled concrete: big soft blotches, fine speckle, hairline cracks, oil and rubber stains.
function concrete(g, s, r, { base = [128, 126, 120], stains = 18, cracks = 6, joints = false } = {}) {
  g.fillStyle = `rgb(${base.join(",")})`; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 220; i++) {
    const v = (r() - 0.5) * 30, rad = s * (0.03 + r() * 0.12);
    const grd = g.createRadialGradient(r() * s, r() * s, 0, r() * s, r() * s, rad);
    grd.addColorStop(0, `rgba(${base[0] + v},${base[1] + v},${base[2] + v},0.35)`); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }
  for (let i = 0; i < s * s * 0.02; i++) {
    const v = base[0] + (r() - 0.5) * 70;
    g.fillStyle = `rgba(${v},${v},${v * 0.97},${0.25 + r() * 0.3})`;
    g.fillRect(r() * s, r() * s, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  for (let i = 0; i < stains; i++) {                   // oil and tyre rubber: dark, soft-edged
    const x = r() * s, y = r() * s, rad = s * (0.02 + r() * 0.07);
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(30,28,24,${0.25 + r() * 0.3})`); grd.addColorStop(1, "rgba(30,28,24,0)");
    g.fillStyle = grd; g.beginPath(); g.ellipse(x, y, rad, rad * (0.4 + r() * 0.6), r() * 3, 0, 7); g.fill();
  }
  g.lineCap = "round";
  for (let i = 0; i < cracks; i++) {                   // hairline cracks wandering across
    g.strokeStyle = `rgba(40,38,34,${0.35 + r() * 0.3})`; g.lineWidth = 0.6 + r();
    let x = r() * s, y = r() * s, a = r() * 6.28;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 14; k++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * s * 0.03; y += Math.sin(a) * s * 0.03; g.lineTo(x, y); }
    g.stroke();
  }
  if (joints) {                                        // saw-cut joints at the tile's edges, chipped
    g.strokeStyle = "rgba(48,46,42,0.75)"; g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, s - 3, s - 3);
    for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(60,58,52,0.5)"; const e = r() < 0.5; g.fillRect(e ? r() * s : (r() < 0.5 ? 0 : s - 4), e ? (r() < 0.5 ? 0 : s - 4) : r() * s, 3 + r() * 4, 3 + r() * 4); }
  }
}

// Concrete block (CMU) courses, 40 × 20 cm, painted grey, grimy toward the floor, scuffed.
function blocks(g, s, r) {
  g.fillStyle = "#8d8f8c"; g.fillRect(0, 0, s, s);
  const bw = s / 2.5, bh = s / 5;                    // the tile is 1 m: 2.5 blocks across, 5 courses
  for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) {
    const x = i * bw + (row % 2 ? bw / 2 : 0), y = row * bh, v = (r() - 0.5) * 18;
    g.fillStyle = `rgb(${141 + v},${143 + v},${140 + v})`;
    g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
  }
  g.strokeStyle = "rgba(70,70,66,0.55)"; g.lineWidth = 2.5;
  for (let row = 0; row <= 5; row++) { g.beginPath(); g.moveTo(0, row * bh); g.lineTo(s, row * bh); g.stroke(); }
  for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) { const x = i * bw + (row % 2 ? bw / 2 : 0); g.beginPath(); g.moveTo(x, row * bh); g.lineTo(x, row * bh + bh); g.stroke(); }
  for (let i = 0; i < 260; i++) { const v = 90 + r() * 60; g.fillStyle = `rgba(${v},${v},${v},${r() * 0.25})`; g.fillRect(r() * s, r() * s, 1 + r() * 6, 1 + r() * 3); }
  for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(60,56,50,${0.08 + r() * 0.12})`; g.fillRect(r() * s, r() * s * 0.3, 2 + r() * 10, s * (0.3 + r() * 0.7)); }   // run-down grime
}

// Corrugated steel cladding: ribs, faded paint, rust bleeding down from the fixings, dirt streaks.
function cladding(g, s, r) {
  g.fillStyle = "#6f7579"; g.fillRect(0, 0, s, s);
  const rib = s / 8;
  for (let i = 0; i < 8; i++) {
    const grd = g.createLinearGradient(i * rib, 0, i * rib + rib, 0);
    grd.addColorStop(0, "rgba(255,255,255,0.10)"); grd.addColorStop(0.35, "rgba(0,0,0,0.18)"); grd.addColorStop(0.5, "rgba(255,255,255,0.14)"); grd.addColorStop(1, "rgba(0,0,0,0.12)");
    g.fillStyle = grd; g.fillRect(i * rib, 0, rib, s);
  }
  for (let i = 0; i < 14; i++) {                       // rust bleeding from the screws
    const x = Math.floor(r() * 8) * rib + rib * 0.5, y = r() * s * 0.4, len = s * (0.15 + r() * 0.5);
    const grd = g.createLinearGradient(0, y, 0, y + len);
    grd.addColorStop(0, `rgba(122,66,30,${0.45 + r() * 0.3})`); grd.addColorStop(1, "rgba(122,66,30,0)");
    g.fillStyle = grd; g.fillRect(x - 2 - r() * 3, y, 4 + r() * 6, len);
  }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(40,38,34,${0.05 + r() * 0.1})`; g.fillRect(r() * s, r() * s, 1 + r() * 3, s * r() * 0.6); }
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(150,98,60,${0.15 + r() * 0.2})`; g.beginPath(); g.arc(r() * s, r() * s, 4 + r() * 16, 0, 7); g.fill(); }
}

// Black rubber backstop blocks: dull, chewed by hits, patched.
function rubber(g, s, r) {
  g.fillStyle = "#1d1d1e"; g.fillRect(0, 0, s, s);
  const bw = s / 2, bh = s / 4;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 2; x++) {
    const v = 26 + r() * 14; g.fillStyle = `rgb(${v},${v},${v + 1})`; g.fillRect(x * bw + 3, y * bh + 3, bw - 6, bh - 6);
  }
  for (let i = 0; i < 900; i++) { const v = r() < 0.5 ? 10 : 55 + r() * 30; g.fillStyle = `rgba(${v},${v},${v},${0.4 + r() * 0.4})`; g.beginPath(); g.arc(r() * s, r() * s, 0.8 + r() * 2.6, 0, 7); g.fill(); }
}

const tex = (size, draw, repeat, seed) => canvasTexture(size, draw, repeat, { seed });

export function industrial(bay) {
  const group = new THREE.Group();
  const x0 = -bay.width / 2 - MARGIN.side, x1 = bay.width / 2 + MARGIN.side, z0 = -MARGIN.front, z1 = bay.depth + MARGIN.back;
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;

  // Floor: 4 m slabs of worn concrete, and a hall-wide layer of stains and safety lines on top.
  const slab = tex(512, (g, s, r) => concrete(g, s, r, { joints: true }), [W / 4, D / 4], 401);
  const floorMat = new THREE.MeshStandardMaterial({ color: slab ? 0xffffff : 0x807e78, map: slab, roughness: 0.78, metalness: 0.02 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0, cz);
  floor.receiveShadow = true; floor.userData.ground = true; floor.name = "hall-floor";
  group.add(floor);
  const marks = canvasTexture(1024, (g, s, r) => {
    const px = (m) => (m / W) * s, pz = (m) => (1 - (m - z0) / D) * s;
    for (let i = 0; i < 26; i++) {                      // tyre marks: long faint arcs
      g.strokeStyle = `rgba(20,20,20,${0.05 + r() * 0.08})`; g.lineWidth = 6 + r() * 8;
      g.beginPath(); const y = r() * s; g.moveTo(0, y); g.bezierCurveTo(s * 0.3, y + (r() - 0.5) * s * 0.4, s * 0.7, y + (r() - 0.5) * s * 0.4, s, y + (r() - 0.5) * s * 0.3); g.stroke();
    }
    // Faded yellow walkway lines along both sides of the bay, worn through in places.
    g.setLineDash([]);
    for (const x of [-bay.width / 2 - 1.5, bay.width / 2 + 1.5]) {
      for (let z = z0 + 1; z < z1 - 1; z += 0.5) {
        if (r() < 0.12) continue;
        g.fillStyle = `rgba(214,170,40,${0.35 + r() * 0.25})`;
        g.fillRect(px(x - x0) - 6, pz(z + 0.5), 12, (0.5 / D) * s + 1);
      }
    }
  }, [1, 1], { seed: 402 });
  if (marks) {
    marks.wrapS = marks.wrapT = THREE.ClampToEdgeWrapping;
    const overlay = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: marks, transparent: true, depthWrite: false, roughness: 0.8,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    overlay.rotation.x = -Math.PI / 2; overlay.position.set(cx, 0.001, cz); overlay.receiveShadow = true;
    group.add(overlay);
  }

  // Walls: block below, cladding above, at the sides and the back (a roller door in a side wall).
  const walls = new THREE.Group(); walls.name = "hall-walls"; group.add(walls);
  const blockTex = (len) => tex(512, blocks, [len, BLOCK_H], 403);
  const cladTex = (len) => tex(512, cladding, [len / 1.6, 1], 404);
  const wall = (len, x, z, rotY) => {
    const lower = new THREE.Mesh(new THREE.BoxGeometry(len, BLOCK_H, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff, map: blockTex(len), roughness: 0.95 }));
    lower.position.set(x, BLOCK_H / 2, z); lower.rotation.y = rotY; lower.receiveShadow = true;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(len, WALL_H - BLOCK_H, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, map: cladTex(len), roughness: 0.7, metalness: 0.35 }));
    upper.position.set(x, BLOCK_H + (WALL_H - BLOCK_H) / 2, z); upper.rotation.y = rotY; upper.receiveShadow = true;
    walls.add(lower, upper);
  };
  wall(W, cx, z1, 0);                       // back
  wall(D, x0, cz, Math.PI / 2);             // sides
  wall(D, x1, cz, Math.PI / 2);
  const door = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, (g, s, r) => {
    g.fillStyle = "#7d8286"; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += s / 24) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, y, s, 2); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, y + 2, s, 2); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,64,32,${r() * 0.3})`; g.fillRect(r() * s, s * (0.7 + r() * 0.3), 2 + r() * 8, 2 + r() * 10); }
  }, [1, 1], 405), roughness: 0.6, metalness: 0.4 }));
  door.position.set(x1 - 0.2, 2.5, cz + D * 0.25);
  door.rotation.y = Math.PI / 2;                        // in a side wall
  walls.add(door);

  // Steel I-beam columns along the side walls, worn yellow paint with dark scuffs at the base.
  const columns = new THREE.Group(); columns.name = "hall-columns"; group.add(columns);
  const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(256, (g, s, r) => {
    g.fillStyle = "#b8962e"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? `rgba(80,70,50,${r() * 0.25})` : `rgba(120,80,50,${r() * 0.3})`; g.fillRect(r() * s, r() * s, 1 + r() * 5, 1 + r() * 5); }
    const grd = g.createLinearGradient(0, s * 0.75, 0, s); grd.addColorStop(0, "rgba(40,36,30,0)"); grd.addColorStop(1, "rgba(40,36,30,0.55)");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }, [1, 1], 406), roughness: 0.6, metalness: 0.45 });
  const iBeam = (x, z) => {
    const c = new THREE.Group();
    for (const [w, d, ox] of [[0.3, 0.02, 0], [0.02, 0.36, 0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), colMat); m.position.set(ox, WALL_H / 2, 0); m.castShadow = false; m.receiveShadow = true; c.add(m); }
    for (const dz of [-0.17, 0.17]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.3, WALL_H, 0.02), colMat); f.position.set(0, WALL_H / 2, dz); c.add(f); }
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.5), colMat); plate.position.y = 0.015; c.add(plate);
    c.position.set(x, 0, z);
    columns.add(c);
  };
  for (let z = z0 + BAY_SPACING / 2; z < z1; z += BAY_SPACING) { iBeam(x0 + 0.4, z); iBeam(x1 - 0.4, z); }

  // Roof: dark underside, lattice trusses every 6 m, skylight strips; high-bay lamps under the trusses.
  const roof = new THREE.Group(); roof.name = "hall-roof"; group.add(roof);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, cladding, [W / 3, D / 3], 407), roughness: 0.8, metalness: 0.3 }));            // seen from below only: the overviews look in from above
  under.rotation.x = Math.PI / 2; under.position.set(cx, WALL_H + 1.2, cz);
  roof.add(under);
  const steel = new THREE.MeshStandardMaterial({ color: 0x5a5f63, roughness: 0.55, metalness: 0.6 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xfff3dc, emissiveIntensity: 2.2 });
  const skyMat = new THREE.MeshStandardMaterial({ color: 0x9aa7b0, emissive: 0xcfd9e0, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });
  const lamps = new THREE.Group(); lamps.name = "hall-lamps"; group.add(lamps);
  for (let z = z0 + BAY_SPACING / 2; z < z1; z += BAY_SPACING) {
    for (const [y, h] of [[WALL_H + 1.1, 0.12], [WALL_H - 0.2, 0.12]]) { const chord = new THREE.Mesh(new THREE.BoxGeometry(W, h, 0.12), steel); chord.position.set(cx, y, z); roof.add(chord); }
    for (let x = x0 + 1; x < x1 - 1; x += 1.6) {        // diagonal web members
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), steel); web.position.set(x, WALL_H + 0.45, z); web.rotation.z = (Math.round((x - x0) / 1.6) % 2 ? 1 : -1) * 0.6; roof.add(web);
    }
    for (let x = x0 + W / 6; x < x1; x += W / 3) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.35, 20), lampMat); lamp.position.set(x, WALL_H - 0.6, z); lamps.add(lamp);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), steel); wire.position.set(x, WALL_H - 0.2, z); lamps.add(wire);
    }
  }
  for (const x of [cx - W / 6, cx + W / 6]) { const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.4, D - 2), skyMat); strip.rotation.x = Math.PI / 2; strip.position.set(x, WALL_H + 1.15, cz); roof.add(strip); }

  // Backstop: black rubber blocks across the back wall, the height of the cladding line.
  const backstop = new THREE.Mesh(new THREE.BoxGeometry(bay.width + 4, 4, 0.8), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(512, rubber, [(bay.width + 4) / 2, 2], 408), roughness: 0.98 }));
  backstop.position.set(0, 2, z1 - 0.55); backstop.receiveShadow = true; backstop.name = "hall-backstop";
  group.add(backstop);

  // A drawn bay's raised ground, in the floor's concrete.
  const relief = reliefMesh(bay, new THREE.MeshStandardMaterial({ color: 0x8a8882, roughness: 0.9 }));
  if (relief) group.add(relief);

  // Light: the lamps (one shadow-casting light straight down, a little off-centre so props model),
  // and a dim, slightly warm fill bouncing off the floor.
  const hemiLight = new THREE.HemisphereLight(0xe8ecf0, 0x6b6660, 1.1);
  const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sunLight.castShadow = true;
  const r = Math.max(bay.width, bay.depth) * 0.75 + 5;
  Object.assign(sunLight.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 80 });
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  sunLight.shadow.mapSize.set(touch ? 2048 : 4096, touch ? 2048 : 4096);
  sunLight.shadow.bias = -0.0003; sunLight.shadow.normalBias = 0.03;
  return {
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 2.6, hemiStrength: 1.15, warmth: 0,
    // Overhead lamps instead of the sun: this direction, whatever the time of day.
    indoor: { direction: [0.18, 1, -0.12], color: 0xfff1dc },
    hazeColor: 0x6d6a64, background: new THREE.Color(0x2b2c2d), fog: new THREE.Fog(0x2b2c2d, 60, 160), baseFog: new THREE.Fog(0x2b2c2d, 60, 160), exposure: 1,
  };
}
