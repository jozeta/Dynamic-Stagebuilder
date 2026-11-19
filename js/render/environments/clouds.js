// Clouds over the Outdoor range, painted in code from seeded, tileable value noise: a high layer
// (160 m up) overhead, and a distant ring of clouds just above the horizon (800 m out, behind the
// banks and trees), so they show from the overview cameras too, not only from the ground. Look
// settings set how much of the sky they cover; with Play on they drift with the wind (look.js
// cloudDrift). The evening sun warms them, and their soft shadows drift across the range floor
// (seen from above, where no sky is in view), as strong as the look's shadow strength.
import * as THREE from "three";
import { rng, hasDom } from "./common.js";
import { CLOUD_TILE } from "../../model/look.js";

const SIZE = 512, HEIGHT = 160, SPAN = 1700;
const RING = { radius: 800, bottom: -60, top: 190, w: 1024, h: 256, repeat: 3 };
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Tileable fractal value noise on a SIZE × SIZE grid, 0…1 (made once per layer).
function noiseField(seed) {
  const r = rng(seed), field = new Float32Array(SIZE * SIZE);
  const smooth = (t) => t * t * (3 - 2 * t);
  let amp = 1, total = 0;
  for (const period of [4, 8, 16, 32, 64]) {
    const lattice = Float32Array.from({ length: period * period }, () => r());
    const cell = SIZE / period;
    for (let y = 0; y < SIZE; y++) {
      const gy = y / cell, y0 = Math.floor(gy), ty = smooth(gy - y0), y1 = (y0 + 1) % period;
      for (let x = 0; x < SIZE; x++) {
        const gx = x / cell, x0 = Math.floor(gx), tx = smooth(gx - x0), x1 = (x0 + 1) % period;
        const a = lattice[y0 * period + x0], b = lattice[y0 * period + x1], c = lattice[y1 * period + x0], d = lattice[y1 * period + x1];
        field[y * SIZE + x] += amp * ((a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty);
      }
    }
    total += amp;
    amp *= 0.52;
  }
  for (let i = 0; i < field.length; i++) field[i] /= total;
  return field;
}

export function createClouds(bay = { width: 20, depth: 30 }) {
  if (!hasDom) return null;
  const field = noiseField(29);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const g = canvas.getContext("2d");
  const image = g.createImageData(SIZE, SIZE);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(SPAN / CLOUD_TILE, SPAN / CLOUD_TILE);
  map.anisotropy = 8;
  // Fade toward the edges of the layer, so the clouds thin out to a clear horizon.
  const fade = document.createElement("canvas");
  fade.width = fade.height = 256;
  const fg = fade.getContext("2d"), grad = fg.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "#fff"); grad.addColorStop(0.45, "#fff"); grad.addColorStop(1, "#000");
  fg.fillStyle = grad; fg.fillRect(0, 0, 256, 256);
  const alphaMap = new THREE.CanvasTexture(fade);
  const material = new THREE.MeshBasicMaterial({ map, alphaMap, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SPAN, SPAN), material);
  mesh.rotation.x = Math.PI / 2;                    // facing down, seen from the range
  mesh.position.set(0, HEIGHT, 0);
  mesh.renderOrder = -1;
  mesh.castShadow = mesh.receiveShadow = false;
  mesh.name = "clouds";

  // The horizon ring: a band of clouds, densest a little above the horizon, thinning upward.
  const ringCanvas = document.createElement("canvas");
  ringCanvas.width = RING.w; ringCanvas.height = RING.h;
  const rg = ringCanvas.getContext("2d");
  const ringImage = rg.createImageData(RING.w, RING.h);
  const ringMap = new THREE.CanvasTexture(ringCanvas);
  ringMap.colorSpace = THREE.SRGBColorSpace;
  ringMap.wrapS = THREE.RepeatWrapping;
  ringMap.repeat.set(RING.repeat, 1);
  const ringMat = new THREE.MeshBasicMaterial({ map: ringMap, transparent: true, depthWrite: false, fog: false, side: THREE.BackSide });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(RING.radius, RING.radius, RING.top - RING.bottom, 96, 1, true), ringMat);
  ring.renderOrder = -2;
  ring.name = "horizon-clouds";
  mesh.add(ring);
  // The ring hangs from the overhead layer's group position but must stay level and centred.
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0, HEIGHT - (RING.top + RING.bottom) / 2);   // the parent's +90° turn maps local +z to world −y
  // Where the horizon (eye height) falls in the band: rows above it hold the clouds.
  const horizonRow = RING.h * (RING.top / (RING.top - RING.bottom));

  // Cloud shadows on the floor: the same pattern in black, at a fraction of its opacity.
  const shadowMap = map.clone();
  const floorW = bay.width + 16, floorD = bay.depth + 16;
  shadowMap.repeat.set(floorW / CLOUD_TILE, floorD / CLOUD_TILE);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: shadowMap, transparent: true, opacity: 0.3, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.02, bay.depth / 2);
  shadow.renderOrder = 1;
  shadow.name = "cloud-shadows";

  let coverage = -1;
  // Paint the clouds for an amount 0 (clear) … 1 (overcast): soft-edged, white tops, grey bellies.
  function setCoverage(c) {
    if (Math.abs(c - coverage) < 1e-3) return;
    coverage = c;
    mesh.visible = c > 0.01;
    const t0 = 0.72 - c * 0.42, soft = 0.16;
    const px = image.data;
    for (let i = 0; i < field.length; i++) {
      const n = field[i];
      const k = Math.min(1, Math.max(0, (n - t0) / soft)), a = k * k * (3 - 2 * k);
      const shade = Math.min(1, Math.max(0, (n - t0) / 0.35));      // thicker: greyer underneath
      const v = 250 - shade * 70;
      px[i * 4] = v; px[i * 4 + 1] = v + 2; px[i * 4 + 2] = v + 8; px[i * 4 + 3] = a * 235;
    }
    g.putImageData(image, 0, 0);
    map.needsUpdate = true;
    shadowMap.needsUpdate = true;
    shadow.visible = mesh.visible;
    // The ring: the same noise stretched sideways (wide, flat cumulus), above the horizon only.
    const rp = ringImage.data;
    for (let y = 0; y < RING.h; y++) {
      const above = (horizonRow - y) / horizonRow;                       // 0 at the horizon … 1 at the top
      const band = smoothstep(-0.02, 0.12, above) * (1 - smoothstep(0.45, 1, above));
      for (let x = 0; x < RING.w; x++) {
        const n = field[((y * 2) % SIZE) * SIZE + ((x >> 1) % SIZE)];
        const dens = n + band * 0.3 - 0.15;
        const k = Math.min(1, Math.max(0, (dens - t0) / soft)), a = k * k * (3 - 2 * k) * band;
        const v = 248 - Math.min(1, Math.max(0, (dens - t0) / 0.35)) * 60 - (1 - above) * 20;
        const i = (y * RING.w + x) * 4;
        rp[i] = v; rp[i + 1] = v + 3; rp[i + 2] = v + 10; rp[i + 3] = a * 240;
      }
    }
    rg.putImageData(ringImage, 0, 0);
    ringMap.needsUpdate = true;
  }
  const WHITE = new THREE.Color(0xffffff), WARM = new THREE.Color(0xffc896);
  return {
    mesh,
    setCoverage,
    shadow,
    /** How dark the cloud shadows are: the look's shadow strength (0 with shadows off). */
    setShadow(strength) { shadowMat.opacity = 0.6 * strength; shadow.visible = mesh.visible && strength > 0.01; },
    setWarmth(w) { material.color.copy(WHITE).lerp(WARM, Math.pow(w, 1.5) * 0.7); ringMat.color.copy(material.color); },
    setDrift([u, v]) {
      map.offset.set(-u, -v);                          // the pattern moves +x / +z with the wind
      ringMap.offset.x = (u + v) * 0.06;               // far away, the ring creeps slowly sideways
      shadowMap.offset.set(-u, v);                     // on the floor (turned the other way up), the same drift
    },
    dispose() { map.dispose(); alphaMap.dispose(); material.dispose(); mesh.geometry.dispose(); ringMap.dispose(); ringMat.dispose(); ring.geometry.dispose(); shadowMap.dispose(); shadowMat.dispose(); shadow.geometry.dispose(); },
  };
}
