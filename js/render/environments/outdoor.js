// Outdoor: a dirt range at golden hour, after the reference photo. Sandy pebbly ground, earth banks
// round three sides with grass on top, flat-shaded bushes, grass tufts and trees (the slightly
// illustrated feel), a low warm sun with long soft shadows, and a warm-to-blue sky with haze.
import * as THREE from "three";
import { canvasTexture, sun, rng } from "./common.js";
import { heightAt } from "./terrain.js";
import { buildGround } from "./ground.js";

// The sky: blue overhead fading to a warm horizon; warmer and deeper toward sunset.
function paintSky(g, s, warmth) {
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, mix([138, 168, 200], [112, 128, 164], warmth));
  grd.addColorStop(0.5, mix([196, 204, 206], [214, 182, 150], warmth));
  grd.addColorStop(0.82, mix([232, 214, 182], [238, 186, 128], warmth));
  grd.addColorStop(1, mix([236, 220, 190], [242, 200, 150], warmth));
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

// A late-afternoon sky as an equirectangular image for reflections (IBL): blue overhead, warm
// haze at the horizon, a bright sun glow low in the west, dusty ground below. Generated in code.
function reflectionSky() {
  const t = canvasTexture(512, (g, s) => {
    const sky = g.createLinearGradient(0, 0, 0, s / 2);
    sky.addColorStop(0, "#7f9cc2"); sky.addColorStop(0.75, "#d8c4a4"); sky.addColorStop(1, "#f2d2a0");
    g.fillStyle = sky; g.fillRect(0, 0, s, s / 2);
    const ground = g.createLinearGradient(0, s / 2, 0, s);
    ground.addColorStop(0, "#b8946a"); ground.addColorStop(1, "#6e5a44");
    g.fillStyle = ground; g.fillRect(0, s / 2, s, s / 2);
    const sun = g.createRadialGradient(s * 0.75, s * 0.4, 0, s * 0.75, s * 0.4, s * 0.12);
    sun.addColorStop(0, "rgba(255,236,200,1)"); sun.addColorStop(1, "rgba(255,210,150,0)");
    g.fillStyle = sun; g.fillRect(0, 0, s, s);
  }, [1, 1], { seed: 61 });
  if (t) t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
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

export function outdoor(bay, { onUpdate } = {}) {
  const group = new THREE.Group();
  const r = rng(11);
  const groundGroup = buildGround(bay, { onUpdate });
  group.add(groundGroup);

  // Vegetation: instanced flat-shaded bushes and grass tufts on the banks, trees beyond.
  const spots = [];
  // Dense shrubs along the bank tops and edges, a few lower down the faces.
  for (let i = 0; i < 20000 && spots.length < 1400; i++) {
    const x = (r() - 0.5) * (bay.width + 44), z = -6 + r() * (bay.depth + 26);
    const y = heightAt(x, z, bay);
    if (y > 2.2 || (y > 1 && r() < 0.08)) spots.push([x, y, z]);
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
    tree.position.set(x, heightAt(x, z, bay) - 0.1, z);
    group.add(tree);
  }

  // Fill: a cool sky above and a warm dusty bounce below, low, so shadow sides stay readable and
  // slightly blue rather than black.
  const hemiLight = new THREE.HemisphereLight(0x9db4d0, 0xb8946a, 0.85);
  const sunLight = sun(bay, 0xffe0b8, 3.1, [-16, 15, 16]);
  const skyTex = canvasTexture(256, (g, s) => paintSky(g, s, 0.5), [1, 1]);
  return {
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 5.4, hemiStrength: 0.95, warmth: 1,
    reflectionSky: reflectionSky(), reflectionStrength: 0.35,
    hazeColor: 0xd9c3a0, background: skyTex ?? new THREE.Color(0xb9cfe0), fog: new THREE.Fog(0xe6d6bb, 55, 150), exposure: 1.05,
    ground: "sand",
    setGround(name) { this.ground = name; groundGroup.userData.setGround(name); },
    paintSky(warmth) {
      if (!skyTex) return;
      paintSky(skyTex.image.getContext("2d"), skyTex.image.width, warmth);
      skyTex.needsUpdate = true;
    },
  };
}
