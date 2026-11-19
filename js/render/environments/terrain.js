// Terrain maths for the Outdoor range (pure: no DOM, no Three.js, so it runs under node --test).
// Seeded smooth noise, the berm height profile, the ground's tonal mix, and baking a height field
// into tileable normal and ambient-occlusion maps.

/** Fractal value noise in −1…1, seeded; smooth, with four octaves. */
export function fbm(seed, octaves = 4) {
  const hash = (x, y, o) => {
    let h = (x * 374761393 + y * 668265263 + (seed + o * 1013) * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  const value = (x, y, o) => {
    const xi = Math.floor(x), yi = Math.floor(y), tx = smooth(x - xi), ty = smooth(y - yi);
    const a = hash(xi, yi, o), b = hash(xi + 1, yi, o), c = hash(xi, yi + 1, o), d = hash(xi + 1, yi + 1, o);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
  return (x, y) => {
    let sum = 0, amp = 1, norm = 0, f = 1;
    for (let o = 0; o < octaves; o++) { sum += (value(x * f, y * f, o) * 2 - 1) * amp; norm += amp; amp *= 0.5; f *= 2.03; }
    return sum / norm;
  };
}

/** Berms: a flat apron round the bay, then an earth bank 2–3 m high with an irregular face. */
export const BERM = Object.freeze({ setback: 2.5, run: 3.2, height: 2.5, uprangeFade: 10 });

import { isRect, isDrawn, outsideDistance, raisedHeight } from "../../model/bay.js";

const setbackNoise = fbm(101), topNoise = fbm(102), faceNoise = fbm(103), blendNoise = fbm(104);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// How far a point is past the foot of the banks (metres; negative on the floor).
function bankDistance(x, z, bay) {
  const wobble = setbackNoise(x * 0.08, z * 0.08) * 0.8;                  // the bank line wanders
  const sb = BERM.setback + wobble;
  const behind = z - (bay.depth + sb);
  // A tapered or notched bay: the banks follow its outline (sides and back).
  if (!isRect(bay) && !isDrawn(bay)) return { d: outsideDistance([x, z], bay) - sb, behind };     // a drawn bay: its rectangle
  const side = Math.abs(x) - (bay.width / 2 + sb);
  return { d: Math.max(side, behind), behind };
}

/**
 * How much of the banks' raw earth colour a point gets (0 floor … 1 bank): it starts about 2 m
 * out on the floor and builds up over the foot of the bank, along an irregular edge, so there is
 * no line where the floor meets the bank.
 */
export function bankBlend(x, z, bay) {
  const { d } = bankDistance(x, z, bay);
  const edge = d + blendNoise(x * 0.35, z * 0.35) * 0.6;
  const t = clamp01((edge + 2) / 4.2);
  const bank = t * t * (3 - 2 * t);
  // Raised ground in a drawn bay is raw earth too, blending in up its slope.
  return isDrawn(bay) ? Math.max(bank, clamp01(raisedHeight(bay, x, z) / 0.9)) : bank;
}

export function heightAt(x, z, bay) {
  const raised = isDrawn(bay) ? raisedHeight(bay, x, z) * (1 + 0.08 * topNoise(x * 0.11, z * 0.11)) : 0;      // drawn raised ground
  return Math.max(raised, bankHeight(x, z, bay));
}
function bankHeight(x, z, bay) {
  const { d, behind } = bankDistance(x, z, bay);
  if (d <= 0) return 0;
  // Fade the side banks out up range, where the shooters stand.
  const rise = z < 0 && behind <= 0 ? 1 - clamp01(-z / BERM.uprangeFade) : 1;
  const f = clamp01(d / BERM.run);
  // Smootherstep: the slope starts at zero with no crease at the foot, and rounds off at the lip.
  const profile = f * f * f * (f * (6 * f - 15) + 10) * (0.85 + 0.15 * f);
  const top = BERM.height * (1 + 0.15 * topNoise(x * 0.06, z * 0.06));
  const crest = Math.min(0.3, Math.max(0, d - BERM.run) * 0.1);         // gentle rise behind the lip
  const face = faceNoise(x * 0.5, z * 0.5) * 0.12 * f * f * (1 - f) * 6.75;   // lumpy dug earth on the face, fading in from the foot
  return Math.max(0, (top * profile + (f >= 1 ? crest : 0) + face) * rise);
}

const largeNoise = fbm(201), compactNoise = fbm(202), dampNoise = fbm(203);

/**
 * How the floor's colour is mixed at a point: dry light dust, darker compacted earth and a few
 * damp patches (weights summing to 1), plus `wear` (0…1) for the worn lane through the middle of
 * the bay where shooters walk. Generic: it doesn't depend on the stage's props.
 */
export function groundTone(x, z, bay) {
  const damp = clamp01((dampNoise(x * 0.16, z * 0.16) - 0.3) * 3) * 0.85;
  const compact = clamp01(0.5 + largeNoise(x * 0.09, z * 0.09) * 1.1 + compactNoise(x * 0.4, z * 0.4) * 0.35) * (1 - damp);
  const dry = 1 - compact - damp;
  const along = z < 0 ? clamp01(1 + z / 6) : z > bay.depth * 0.75 ? clamp01((bay.depth - z) / (bay.depth * 0.25)) : 1;
  const wear = Math.exp(-((x / 2.4) ** 2)) * along * (0.75 + 0.25 * compactNoise(x * 0.2 + 9, z * 0.2));
  return { dry, compact, damp, wear };
}

const at = (h, size, x, y) => h[((y + size) % size) * size + ((x + size) % size)];

/** A tileable normal map (RGBA bytes) from a height field of size × size (values 0…1). */
export function heightToNormal(h, size, strength) {
  const out = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = at(h, size, x + 1, y) - at(h, size, x - 1, y);
    const dy = at(h, size, x, y + 1) - at(h, size, x, y - 1);
    let nx = -dx * strength, ny = -dy * strength, nz = 1;
    const l = Math.hypot(nx, ny, nz);
    nx /= l; ny /= l; nz /= l;
    const i = (y * size + x) * 4;
    out[i] = Math.round((nx * 0.5 + 0.5) * 255);
    out[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
    out[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    out[i + 3] = 255;
  }
  return out;
}

/** Cavity ambient occlusion (RGBA bytes): points lower than their surroundings get darker. */
export function cavityAO(h, size, radius = 2, strength = 2.5) {
  const out = new Uint8ClampedArray(size * size * 4);
  const n = (2 * radius + 1) ** 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let sum = 0;
    for (let j = -radius; j <= radius; j++) for (let i = -radius; i <= radius; i++) sum += at(h, size, x + i, y + j);
    const occ = clamp01((sum / n - h[y * size + x]) * strength);
    const v = Math.round((1 - occ * 0.6) * 255);
    const k = (y * size + x) * 4;
    out[k] = out[k + 1] = out[k + 2] = v;
    out[k + 3] = 255;
  }
  return out;
}
