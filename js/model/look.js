// Environment look settings (saved with the stage, not part of undo) and the sun's position and
// colour from the time of day. Pure: no DOM, no Three.js.
const SPEC = {
  hour: [6, 20], sun: [0, 2], ambient: [0, 2], softness: [0, 8], shadowStrength: [0, 1], haze: [0, 1], exposure: [0.5, 1.6],
  clouds: [0, 1], cloudSpeed: [0, 3], wind: [0, 359], cloudShadow: [0, 1],
  sunElevation: [2, 90], sunAzimuth: [0, 359], sunColor: [0, 1],
  groundHue: [0, 359], groundIntensity: [0, 1], groundBrightness: [0.4, 1.6], gridIntensity: [0, 1], outdoorGridOpacity: [0, 1],
};
// Clouds (Outdoor only): how much of the sky they cover, how fast they drift (1 = about 8 m/s) and
// the wind they drift with (degrees, 0 = down range, 90 = toward +x). They move only with Play on.
const CLOUDS = { clouds: 0.35, cloudSpeed: 1, wind: 60, cloudShadow: 0.5 };       // cloudShadow: how dark their shadows on the ground are
// The sun by hand (time of day off): height above the horizon, direction (0 = behind the shooter,
// up range; 90 = toward +x, the shooter's left) and colour (0 dark orange … 0.5 yellow … 1 white).
const SUN = { sunAuto: true, sunElevation: 35, sunAzimuth: 20, sunColor: 0.8 };
// The Blueprint paper and the Technical floor can take a colour (null: the surroundings' own), and
// the Technical walls can be hidden (then its floor runs on to the horizon).
const TONE = { groundHue: null, groundIntensity: null, groundBrightness: null, walls: true, gridIntensity: null, gridColor: null };
// Outdoor: a 1 m grid on the ground, off by default, with its own opacity.
const OUTDOOR_GRID = { outdoorGrid: false, outdoorGridOpacity: 0.35 };
/** Each surroundings' own grid: Blueprint's pale ink lines, Technical's dark tile seams (intensity 1 = as drawn). */
export const GRID_DEFAULTS = Object.freeze({
  blueprint: Object.freeze({ intensity: 1, color: "#e2eeff" }),
  technical: Object.freeze({ intensity: 1, color: "#55585c" }),
});
/** The grid a look asks for in a surroundings: its own values, else that surroundings' default. */
export function gridTone(look, environment) {
  const d = GRID_DEFAULTS[environment] || GRID_DEFAULTS.technical;
  return { intensity: look.gridIntensity ?? d.intensity, color: look.gridColor ?? d.color };
}
/** Each surroundings' own ground colour: Blueprint's Prussian blue paper, Technical's grey floor. */
export const GROUND_TONE_DEFAULTS = Object.freeze({
  blueprint: Object.freeze({ hue: 216, intensity: 0.8, brightness: 1 }),
  technical: Object.freeze({ hue: 210, intensity: 0, brightness: 1 }),
});
/** The ground colour a look asks for in a surroundings: its own values, else that surroundings' default. */
export function groundTone(look, environment) {
  const d = GROUND_TONE_DEFAULTS[environment] || GROUND_TONE_DEFAULTS.technical;
  return { hue: look.groundHue ?? d.hue, intensity: look.groundIntensity ?? d.intensity, brightness: look.groundBrightness ?? d.brightness };
}
/** HSV (hue in degrees, saturation and value 0–1) as [r, g, b] 0–1. */
export function hsvToRgb(h, s, v) {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [f(5), f(3), f(1)].map((x) => Math.round(x * 1e6) / 1e6);
}
export const CLOUD_TILE = 340;            // metres across one tile of the cloud texture
const CLOUD_MPS = 8;

// The Outdoor range floor: the same photo-scanned ground, graded to each look (render/environments/ground.js).
export const GROUNDS = Object.freeze([
  Object.freeze({ id: "sand", name: "Sand" }), Object.freeze({ id: "light-sand", name: "Light sand" }),
  Object.freeze({ id: "dark-sand", name: "Dark sand" }), Object.freeze({ id: "red-dirt", name: "Red dirt" }),
  Object.freeze({ id: "gravel", name: "Gravel" }),
]);
const GROUND_IDS = GROUNDS.map((g) => g.id);

// The Outdoor range's plants (render/environments/foliage.js builds them).
export const FOLIAGE = Object.freeze([
  Object.freeze({ id: "mixed", name: "Mixed broadleaf" }), Object.freeze({ id: "nordic", name: "Nordic (spruce, pine, birch)" }),
  Object.freeze({ id: "desert", name: "Desert (cacti, sagebrush)" }), Object.freeze({ id: "savanna", name: "Savanna (acacia, tall grass)" }),
  Object.freeze({ id: "tropical", name: "Tropical (palms)" }), Object.freeze({ id: "none", name: "Bare banks" }),
]);
const FOLIAGE_IDS = FOLIAGE.map((f) => f.id);

// Outdoor (the user's chosen look): the sun set by hand, high and warm white, 75 % cloud.
export const LOOK_DEFAULTS = Object.freeze({ hour: 15.75, sun: 0.85, ambient: 1.05, shadows: true, softness: 4, shadowStrength: 0.55, haze: 0.15, exposure: 1, ground: "gravel", foliage: "nordic",
  clouds: 0.45, cloudSpeed: 0.5, wind: 70, cloudShadow: 0.5, sunAuto: false, sunElevation: 31, sunAzimuth: 35, sunColor: 0.78, ...TONE, ...OUTDOOR_GRID });
// The Technical surroundings: brighter afternoon light with softer, lighter shadows.
export const TECHNICAL_LOOK = Object.freeze({ hour: 16, sun: 0.85, ambient: 1.05, shadows: true, softness: 4, shadowStrength: 0.55, haze: 0.15, exposure: 1, ground: "sand", foliage: "mixed",
  clouds: 0.45, cloudSpeed: 0.5, wind: 70, cloudShadow: 0.5, sunAuto: false, sunElevation: 31, sunAzimuth: 35, sunColor: 0.78,
  groundHue: 220, groundIntensity: 0, groundBrightness: 1.1, walls: false, gridIntensity: 0.4, gridColor: null, ...OUTDOOR_GRID });

// Blueprint: late-morning light with soft shadows; no haze.
export const BLUEPRINT_LOOK = Object.freeze({ hour: 11, sun: 0.85, ambient: 1.05, shadows: true, softness: 4, shadowStrength: 0.55, haze: 0.15, exposure: 1, ground: "sand", foliage: "mixed",
  clouds: 0.45, cloudSpeed: 0.5, wind: 70, cloudShadow: 0.5, sunAuto: false, sunElevation: 31, sunAzimuth: 35, sunColor: 0.78,
  groundHue: 220, groundIntensity: 0.54, groundBrightness: 0.4, walls: true, gridIntensity: 0.14, gridColor: "#ffffff", ...OUTDOOR_GRID });

// Industrial (indoors): lit by the hall's lamps, a little dust in the air, softer shadows.
export const INDUSTRIAL_LOOK = Object.freeze({ ...TECHNICAL_LOOK, sun: 0.9, ambient: 1, softness: 5, shadowStrength: 0.5, haze: 0.06, exposure: 1.05, walls: true, gridIntensity: null });

/** The light defaults for a surroundings name ("outdoor", "technical", "blueprint" or "industrial"). */
export const lookDefaults = (environment) => (environment === "technical" || String(environment).startsWith("custom:") ? TECHNICAL_LOOK
  : environment === "blueprint" ? BLUEPRINT_LOOK : environment === "industrial" ? INDUSTRIAL_LOOK : LOOK_DEFAULTS);
const sameLook = (a, b) => Object.keys(b).every((k) => a?.[k] === b[k]);
/** The look to use after switching surroundings: an untouched look follows to the new defaults. */
export function lookAfterSwitch(look, from, to) {
  return sameLook(look, lookDefaults(from)) ? { ...lookDefaults(to) } : look;
}

export function cleanLook(look) {
  const src = look && typeof look === "object" ? look : {};
  const out = {};
  for (const [k, def] of Object.entries(LOOK_DEFAULTS)) {
    const v = src[k];
    if (k === "ground") out[k] = GROUND_IDS.includes(v) ? v : def;
    else if (k === "gridColor") out[k] = typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null;
    else if (k === "foliage") out[k] = FOLIAGE_IDS.includes(v) ? v : def;
    else if (typeof def === "boolean") out[k] = typeof v === "boolean" ? v : def;
    else if (def === null) out[k] = typeof v === "number" && Number.isFinite(v) ? Math.min(SPEC[k][1], Math.max(SPEC[k][0], v)) : null;
    else out[k] = typeof v === "number" && Number.isFinite(v) ? Math.min(SPEC[k][1], Math.max(SPEC[k][0], v)) : def;
  }
  return out;
}

const NOON = 13, HALF_DAY = 7, MAX_ELEVATION = 62;

/**
 * The sun at an hour between 6 and 20: elevation in degrees, a unit direction towards the sun
 * ([x, y, z], east is +x, down range is +z), warmth 0 (white noon) … 1 (orange sunset), and a
 * strength factor that falls toward the horizon. The sun's path runs from east through the
 * shooter's side (up range, −z) to west, so target faces (which face up range) are lit and
 * shadows fall forward and sideways, as on the reference range.
 */
export function sunFromHour(hour) {
  const h = Math.min(20, Math.max(6, hour));
  const a = ((h - NOON) / HALF_DAY) * (Math.PI / 2);                 // −90° morning … +90° evening
  const elevation = Math.max(2, MAX_ELEVATION * Math.cos(a));
  const e = (elevation * Math.PI) / 180;
  // The extra up-range lean keeps late-afternoon shadows falling diagonally across the stage.
  const horiz = [-Math.sin(a), -Math.cos(a) - 0.4];
  const hl = Math.hypot(...horiz);
  const direction = [(horiz[0] / hl) * Math.cos(e), Math.sin(e), (horiz[1] / hl) * Math.cos(e)];
  return { elevation, direction, warmth: 1 - elevation / MAX_ELEVATION, strength: 0.3 + 0.7 * Math.sqrt(Math.sin(e)) };
}

/** How far the cloud pattern has drifted after `seconds` of Play: a texture offset [u, v] in tiles. */
export function cloudDrift(look, seconds) {
  const metres = (look.cloudSpeed ?? CLOUDS.cloudSpeed) * CLOUD_MPS * seconds;
  const a = ((look.wind ?? CLOUDS.wind) * Math.PI) / 180;
  return [(Math.sin(a) * metres) / CLOUD_TILE, (Math.cos(a) * metres) / CLOUD_TILE];
}

/** The sun's colour by hand: 0 dark orange, 0.5 yellow, 1 bright white ([r, g, b], 0–1). */
export function sunColorAt(t) {
  const stops = [[0, [0.78, 0.3, 0.08]], [0.5, [1, 0.82, 0.38]], [1, [1, 1, 1]]];
  const x = Math.min(1, Math.max(0, t));
  const i = x <= 0.5 ? 0 : 1;
  const [t0, a] = stops[i], [t1, b] = stops[i + 1];
  const k = (x - t0) / (t1 - t0);
  return a.map((v, j) => Math.round((v + (b[j] - v) * k) * 1e6) / 1e6);
}

/**
 * The sun for a look: from the time of day, or (time of day off) from its height, direction and
 * colour. Same shape as sunFromHour, plus `color` when set by hand.
 */
export function sunFromLook(look) {
  if (look.sunAuto !== false) return sunFromHour(look.hour);
  const e = (Math.min(90, Math.max(2, look.sunElevation ?? SUN.sunElevation)) * Math.PI) / 180;
  const a = ((look.sunAzimuth ?? SUN.sunAzimuth) * Math.PI) / 180;
  const direction = [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)].map((v) => (Math.abs(v) < 1e-12 ? 0 : v));
  const t = Math.min(1, Math.max(0, look.sunColor ?? SUN.sunColor));
  return { elevation: (e * 180) / Math.PI, direction, warmth: 1 - t, strength: 0.3 + 0.7 * Math.sqrt(Math.sin(e)), color: sunColorAt(t) };
}
