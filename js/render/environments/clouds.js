// Clouds over the Outdoor range: a high layer (160 m up) painted in code from seeded, tileable
// value noise, fading out toward the horizon. Look settings set how much of the sky they cover;
// with Play on they drift with the wind (look.js cloudDrift). The evening sun warms them.
import * as THREE from "three";
import { rng, hasDom } from "./common.js";
import { CLOUD_TILE } from "../../model/look.js";

const SIZE = 512, HEIGHT = 160, SPAN = 1700;

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

export function createClouds() {
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
  }
  const WHITE = new THREE.Color(0xffffff), WARM = new THREE.Color(0xffc896);
  return {
    mesh,
    setCoverage,
    setWarmth(w) { material.color.copy(WHITE).lerp(WARM, Math.pow(w, 1.5) * 0.7); },
    setDrift([u, v]) { map.offset.set(-u, -v); },     // the pattern moves +x / +z with the wind
    dispose() { map.dispose(); alphaMap.dispose(); material.dispose(); mesh.geometry.dispose(); },
  };
}
