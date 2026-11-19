// Outdoor: a dirt range at golden hour, after the reference photo. Sandy pebbly ground, earth banks
// round three sides with grass on top, flat-shaded bushes, grass tufts and trees (the slightly
// illustrated feel), a low warm sun with long soft shadows, and a warm-to-blue sky with haze.
import * as THREE from "three";
import { canvasTexture, sun, rng } from "./common.js";

const SAND = "#a48a6f";

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

// The sky: blue overhead fading to a warm horizon; warmer and deeper toward sunset.
function paintSky(g, s, warmth) {
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, mix([127, 169, 214], [86, 112, 168], warmth));
  grd.addColorStop(0.55, mix([185, 207, 224], [214, 170, 140], warmth));
  grd.addColorStop(0.85, mix([236, 217, 184], [244, 176, 110], warmth));
  grd.addColorStop(1, mix([243, 220, 176], [250, 190, 120], warmth));
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

// Tree prototypes: a bent, barked trunk with a few branches and a crown of leafy clusters.
function barkTexture() {
  return canvasTexture(128, (g, s, r) => {
    g.fillStyle = "#6e5236"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "40,28,18" : "150,120,90"},${0.15 + r() * 0.3})`; g.fillRect(r() * s, 0, 1 + r() * 3, s); }
  }, [1, 2], { seed: 29 });
}
function leafTexture() {
  return canvasTexture(256, (g, s, r) => {
    g.fillStyle = "#5d7c35"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1600; i++) {
      const v = r();
      g.fillStyle = v > 0.66 ? "rgba(160,180,90,0.5)" : v > 0.33 ? "rgba(60,90,40,0.5)" : "rgba(40,60,28,0.45)";
      g.beginPath(); g.ellipse(r() * s, r() * s, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, 7); g.fill();
    }
  }, [2, 2], { seed: 31 });
}

function jitter(geo, r, amount) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + (r() - 0.5) * amount), p.getY(i) * (1 + (r() - 0.5) * amount), p.getZ(i) * (1 + (r() - 0.5) * amount));
  geo.computeVertexNormals();
  return geo;
}

function makeTree(r, mats) {
  const tree = new THREE.Group();
  const h = 3.2 + r() * 2.6;
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.2, h * 0.62, 8, 5);
  const p = trunkGeo.attributes.position;
  const bend = (r() - 0.5) * 0.5;
  for (let i = 0; i < p.count; i++) { const t = p.getY(i) / (h * 0.62) + 0.5; p.setX(i, p.getX(i) + bend * t * t); }
  trunkGeo.computeVertexNormals();
  const trunk = new THREE.Mesh(trunkGeo, mats.bark);
  trunk.position.y = h * 0.31;
  trunk.castShadow = true;
  tree.add(trunk);
  const tips = [];
  for (let b = 0; b < 4; b++) {
    const a = (b / 4) * Math.PI * 2 + r(), len = 0.8 + r() * 0.8, y = h * (0.5 + r() * 0.15);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.07, len, 5), mats.bark);
    br.position.set(bend * 0.6 + Math.cos(a) * len * 0.35, y + len * 0.3, Math.sin(a) * len * 0.35);
    br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    br.castShadow = true;
    tree.add(br);
    tips.push([bend * 0.6 + Math.cos(a) * len * 0.7, y + len * 0.6, Math.sin(a) * len * 0.7]);
  }
  tips.push([bend, h * 0.85, 0]);
  for (const [x, y, z] of tips) {
    for (let k = 0; k < 3; k++) {
      const rad = 0.55 + r() * 0.6;
      const c = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(rad, 1), r, 0.35), k % 2 ? mats.leaf : mats.leafDark);
      c.position.set(x + (r() - 0.5) * 0.8, y + (r() - 0.3) * 0.6, z + (r() - 0.5) * 0.8);
      c.castShadow = true;
      tree.add(c);
    }
  }
  return tree;
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
  // A cut bank like the reference range: a steep earth face over about 2.5 m, then a gentle top.
  const face = Math.min(1, d / 2.5);
  const top = Math.max(0, d - 2.5) * 0.12;
  const h = (3.6 * (face * face * (3 - 2 * face)) + Math.min(1.2, top)) * rise;
  return h + noise(x, z) * 0.35 * Math.min(1, d / 2);
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
  const dirtC = new THREE.Color("#ffffff"), grass = new THREE.Color("#7f9a4c"), dry = new THREE.Color("#b98a62");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z, bay, noise);
    pos.setY(i, y);
    const t = Math.min(1, Math.max(0, (y - 3.3) / 0.6));      // grass only on the bank tops
    // Broad, non-repeating light and dark areas over the whole range hide the texture's tiling.
    const v = 0.93 + 0.07 * large(x, z);
    // Bank faces show reddish cut earth; the range floor stays light gravel.
    c.copy(dirtC).multiplyScalar(v).lerp(dry, Math.min(1, y / 1.2) * 0.75).lerp(grass, t * 0.9);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const map = canvasTexture(1024, dirt, [W / 10, D / 10], { seed: 3 });
  // A finer second layer of grit as a bump map gives the dirt relief in low sun.
  const bump = canvasTexture(512, (g, s, rr) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 7000; i++) { const v = rr() > 0.5 ? 200 : 40; g.fillStyle = `rgba(${v},${v},${v},${0.3 + rr() * 0.4})`; g.beginPath(); g.arc(rr() * s, rr() * s, 0.6 + rr() * 2.2, 0, 7); g.fill(); }
  }, [W / 3, D / 3], { color: false, seed: 41 });
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0xb8916a, map, bumpMap: bump, bumpScale: 2.2, vertexColors: true, roughness: 1 }));
  ground.receiveShadow = true;
  ground.userData.ground = true;
  group.add(ground);

  // Vegetation: instanced flat-shaded bushes and grass tufts on the banks, trees beyond.
  const spots = [];
  // Dense shrubs along the bank tops and edges, a few lower down the faces.
  for (let i = 0; i < 20000 && spots.length < 1400; i++) {
    const x = (r() - 0.5) * (bay.width + 44), z = -6 + r() * (bay.depth + 26);
    const y = heightAt(x, z, bay, noise);
    if (y > 3.2 || (y > 1 && r() < 0.12)) spots.push([x, y, z]);
  }
  // Bushes: rounded, lumpy clusters sunk into the slope (not floating blobs).
  const bushGeo = jitter(new THREE.IcosahedronGeometry(1, 1), rng(53), 0.3);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
  const bushes = new THREE.InstancedMesh(bushGeo, bushMat, spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const greens = ["#5f8a32", "#73a03c", "#4f7a2c", "#86ab4c", "#6c8f3a"].map((h) => new THREE.Color(h));
  spots.forEach(([x, y, z], i) => {
    const s = 0.25 + r() * 0.5;
    q.setFromEuler(new THREE.Euler(r(), r() * 6.28, r()));
    m.compose(p.set(x, y + s * 0.15, z), q, sc.set(s * (1 + r() * 0.4), s * (0.55 + r() * 0.3), s));
    bushes.setMatrixAt(i, m);
    bushes.setColorAt(i, greens[(r() * greens.length) | 0]);
  });
  bushes.castShadow = false;     // outside the bay: no need to pay for them in the shadow pass
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

  // Stones scattered over the range: many small ones everywhere, a few larger at the banks' foot.
  const rockSpots = [];
  for (let i = 0; i < 1500; i++) {
    const x = (r() - 0.5) * (bay.width + 30), z = -10 + r() * (bay.depth + 24);
    const y = heightAt(x, z, bay, noise);
    const big = y > 0.15 && y < 1.2 && r() < 0.25;
    rockSpots.push([x, y, z, big ? 0.1 + r() * 0.18 : 0.02 + r() * 0.05]);
  }
  const rockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rockMat, rockSpots.length);
  const rockColors = ["#9c8c78", "#8a7a66", "#b3a38c", "#76695a"].map((h) => new THREE.Color(h));
  rockSpots.forEach(([x, y, z, sz], i) => {
    m.compose(p.set(x, y + sz * 0.1, z), q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), sc.set(sz * (1 + r() * 0.5), sz * 0.6, sz));
    rocks.setMatrixAt(i, m);
    rocks.setColorAt(i, rockColors[(r() * rockColors.length) | 0]);
  });
  rocks.receiveShadow = true;
  group.add(rocks);

  const mats = {
    bark: new THREE.MeshStandardMaterial({ color: 0xffffff, map: barkTexture(), roughness: 1, flatShading: true }),
    leaf: new THREE.MeshStandardMaterial({ color: 0xffffff, map: leafTexture(), roughness: 0.9, flatShading: true }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0xb8c8a8, map: leafTexture(), roughness: 0.9, flatShading: true }),
  };
  if (!mats.bark.map) { mats.bark.color.set(0x6e5236); mats.leaf.color.set(0x5d7c35); mats.leafDark.color.set(0x48652c); }
  const prototypes = Array.from({ length: 4 }, () => makeTree(r, mats));
  for (let i = 0; i < 30; i++) {
    const side = i % 3;
    const x = side === 0 ? -(bay.width / 2 + 13 + r() * 14) : side === 1 ? bay.width / 2 + 13 + r() * 14 : (r() - 0.5) * (bay.width + 34);
    const z = side === 2 ? bay.depth + 12 + r() * 12 : r() * bay.depth * 1.1;
    const tree = prototypes[i % prototypes.length].clone();
    const k = 0.8 + r() * 0.5;
    tree.scale.set(k, k * (0.9 + r() * 0.3), k);
    tree.rotation.y = r() * 6.28;
    tree.position.set(x, heightAt(x, z, bay, noise) - 0.1, z);
    group.add(tree);
  }

  const hemiLight = new THREE.HemisphereLight(0xf4efe6, 0x8c7a66, 1.1);
  const sunLight = sun(bay, 0xffe0b8, 3.1, [-16, 15, 16]);
  const skyTex = canvasTexture(256, (g, s) => paintSky(g, s, 0.5), [1, 1]);
  return {
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 4.0, hemiStrength: 1.1, warmth: 1,
    hazeColor: 0xe6d6bb, background: skyTex ?? new THREE.Color(0xb9cfe0), fog: new THREE.Fog(0xe6d6bb, 55, 150), exposure: 1.05,
    paintSky(warmth) {
      if (!skyTex) return;
      paintSky(skyTex.image.getContext("2d"), skyTex.image.width, warmth);
      skyTex.needsUpdate = true;
    },
  };
}
