// Outdoor: a dirt range at golden hour, after the reference photo. Sandy pebbly ground, earth banks
// round three sides with grass on top, flat-shaded bushes, grass tufts and trees (the slightly
// illustrated feel), a low warm sun with long soft shadows, and a warm-to-blue sky with haze.
import * as THREE from "three";
import { canvasTexture, sun, rng } from "./common.js";

const SAND = "#ad9479";

function dirt(g, s, r) {
  g.fillStyle = SAND; g.fillRect(0, 0, s, s);
  // Large soft patches of lighter and darker earth.
  for (let i = 0; i < 70; i++) {
    const x = r() * s, y = r() * s, rad = 30 + r() * 110;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() > 0.5;
    grd.addColorStop(0, dark ? "rgba(140,108,76,0.07)" : "rgba(232,212,182,0.08)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // Grit and pebbles, each with a highlight and a little shadow.
  for (let i = 0; i < 14000; i++) {
    const x = r() * s, y = r() * s, z = 0.5 + r() * 1.2;
    const v = 160 + r() * 80;
    g.fillStyle = `rgba(${v | 0},${(v * 0.85) | 0},${(v * 0.7) | 0},${0.18 + r() * 0.3})`;
    g.fillRect(x, y, z, z);
  }
  for (let i = 0; i < 1100; i++) {
    const x = r() * s, y = r() * s, rx = 1.2 + r() * 2.6, ry = rx * (0.6 + r() * 0.4), a = r() * Math.PI;
    g.fillStyle = "rgba(70,50,32,0.35)";
    g.beginPath(); g.ellipse(x + 1, y + 1.2, rx, ry, a, 0, Math.PI * 2); g.fill();
    const v = 180 + r() * 60;
    g.fillStyle = `rgb(${v | 0},${(v * 0.9) | 0},${(v * 0.8) | 0})`;
    g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill();
  }
}

function sky() {
  return canvasTexture(256, (g, s) => {
    const grd = g.createLinearGradient(0, 0, 0, s);
    grd.addColorStop(0, "#7fa9d6");
    grd.addColorStop(0.55, "#b9cfe0");
    grd.addColorStop(0.85, "#ecd9b8");
    grd.addColorStop(1, "#f3dcb0");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }, [1, 1]);
}

// Height of the land around the bay: flat inside (with a 3 m apron), banks rising on the two sides
// and down range, gently open up range where the shooters stand.
function heightAt(x, z, bay, noise) {
  const hw = bay.width / 2 + 3, back = bay.depth + 3;
  const side = Math.max(0, Math.abs(x) - hw);
  const behind = Math.max(0, z - back);
  const d = Math.max(side, behind);
  if (d <= 0) return 0;
  const uprange = z < 0 ? Math.min(1, -z / 10) : 0;        // fade the side banks out up range
  const rise = (z < 0 && behind === 0) ? 1 - uprange : 1;
  const bank = Math.min(1, d / 7);
  const h = 4.2 * (bank * bank * (3 - 2 * bank)) * rise;
  return h + noise(x, z) * 0.5 * Math.min(1, d / 3);
}

function makeNoise(seed) {
  const r = rng(seed);
  const waves = Array.from({ length: 6 }, () => ({ fx: 0.05 + r() * 0.3, fz: 0.05 + r() * 0.3, p: r() * 6.28, a: 0.3 + r() * 0.7 }));
  return (x, z) => waves.reduce((s, w) => s + Math.sin(x * w.fx + z * w.fz + w.p) * w.a, 0) / 3;
}

export function outdoor(bay) {
  const group = new THREE.Group();
  const r = rng(11);
  const noise = makeNoise(7);
  const broad = makeNoise(21);
  const large = (x, z) => broad(x * 0.35, z * 0.35);
  const W = bay.width + 120, D = bay.depth + 120;
  const cz = bay.depth / 2;

  // Terrain with vertex colours: dirt below, grassy olive on the bank tops.
  const geo = new THREE.PlaneGeometry(W, D, 220, 220);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, cz);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const dirtC = new THREE.Color("#ffffff"), grass = new THREE.Color("#8d9658"), dry = new THREE.Color("#b89c78");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z, bay, noise);
    pos.setY(i, y);
    const t = Math.min(1, Math.max(0, (y - 2.2) / 1.6));
    // Broad, non-repeating light and dark areas over the whole range hide the texture's tiling.
    const v = 0.93 + 0.07 * large(x, z);
    c.copy(dirtC).multiplyScalar(v).lerp(dry, Math.min(1, y / 2.5) * 0.5).lerp(grass, t * 0.85);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const map = canvasTexture(1024, dirt, [W / 10, D / 10], { seed: 3 });
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0xb8916a, map, vertexColors: true, roughness: 1 }));
  ground.receiveShadow = true;
  ground.userData.ground = true;
  group.add(ground);

  // Vegetation: instanced flat-shaded bushes and grass tufts on the banks, trees beyond.
  const spots = [];
  for (let i = 0; i < 9000 && spots.length < 900; i++) {
    const x = (r() - 0.5) * (bay.width + 44), z = -6 + r() * (bay.depth + 26);
    const y = heightAt(x, z, bay, noise);
    if (y > 1.2) spots.push([x, y, z]);
  }
  const bushGeo = new THREE.IcosahedronGeometry(1, 0);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
  const bushes = new THREE.InstancedMesh(bushGeo, bushMat, spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const greens = ["#6b8a3c", "#7c9a47", "#5d7a35", "#8fa357", "#9c9a52"].map((h) => new THREE.Color(h));
  spots.forEach(([x, y, z], i) => {
    const s = 0.18 + r() * 0.45;
    q.setFromEuler(new THREE.Euler(r(), r() * 6.28, r()));
    m.compose(p.set(x, y + s * 0.4, z), q, sc.set(s * (1 + r() * 0.4), s * (0.6 + r() * 0.4), s));
    bushes.setMatrixAt(i, m);
    bushes.setColorAt(i, greens[(r() * greens.length) | 0]);
  });
  bushes.castShadow = true;
  bushes.receiveShadow = true;
  group.add(bushes);

  const tufts = [];
  for (let i = 0; i < 9000 && tufts.length < 1400; i++) {
    const x = (r() - 0.5) * (bay.width + 40), z = -8 + r() * (bay.depth + 24);
    const y = heightAt(x, z, bay, noise);
    if (y > 0.6) tufts.push([x, y, z]);
  }
  const tuftGeo = new THREE.ConeGeometry(0.05, 0.32, 3, 1);
  tuftGeo.translate(0, 0.17, 0);
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  const grassMesh = new THREE.InstancedMesh(tuftGeo, tuftMat, tufts.length);
  const tuftColors = ["#8d9b4f", "#a3a35a", "#76883f", "#b5a865"].map((h) => new THREE.Color(h));
  tufts.forEach(([x, y, z], i) => {
    const s = 0.6 + r() * 1.2;
    m.compose(p.set(x, y, z), q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6.28, (r() - 0.5) * 0.5)), sc.set(s, s * (0.7 + r()), s));
    grassMesh.setMatrixAt(i, m);
    grassMesh.setColorAt(i, tuftColors[(r() * tuftColors.length) | 0]);
  });
  group.add(grassMesh);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5236, roughness: 1, flatShading: true });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x5a7a34, roughness: 0.95, flatShading: true });
  for (let i = 0; i < 26; i++) {
    const side = i % 3;
    const x = side === 0 ? -(bay.width / 2 + 14 + r() * 12) : side === 1 ? bay.width / 2 + 14 + r() * 12 : (r() - 0.5) * (bay.width + 30);
    const z = side === 2 ? bay.depth + 13 + r() * 10 : r() * bay.depth * 1.1;
    const y = heightAt(x, z, bay, noise);
    const h = 3 + r() * 3;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h * 0.5, 6), trunkMat);
    trunk.position.y = h * 0.25;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.32, 1), crownMat);
    crown.position.y = h * 0.62;
    crown.scale.set(1, 0.85, 1);
    trunk.castShadow = crown.castShadow = true;
    tree.add(trunk, crown);
    tree.position.set(x, y - 0.1, z);
    group.add(tree);
  }

  const lights = [
    new THREE.HemisphereLight(0xf4efe6, 0x8c7a66, 1.5),
    sun(bay, 0xffe0b8, 3.1, [-16, 15, 16]),          // low, warm, from behind the stage: long shadows
  ];
  return { group, lights, background: sky() ?? new THREE.Color(0xb9cfe0), fog: new THREE.Fog(0xe6d6bb, 55, 150), exposure: 1.05 };
}
