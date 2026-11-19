// Environment look settings (saved with the stage, not part of undo) and the sun's position and
// colour from the time of day. Pure: no DOM, no Three.js.
const SPEC = {
  hour: [6, 20], sun: [0, 2], ambient: [0, 2], softness: [0, 8], shadowStrength: [0, 1], haze: [0, 1], exposure: [0.5, 1.6],
  clouds: [0, 1], cloudSpeed: [0, 3], wind: [0, 359],
};
// Clouds (Outdoor only): how much of the sky they cover, how fast they drift (1 = about 8 m/s) and
// the wind they drift with (degrees, 0 = down range, 90 = toward +x). They move only with Play on.
const CLOUDS = { clouds: 0.35, cloudSpeed: 1, wind: 60 };
export const CLOUD_TILE = 340;            // metres across one tile of the cloud texture
const CLOUD_MPS = 8;

// The Outdoor range floor: the same photo-scanned ground, graded to each look (render/environments/ground.js).
export const GROUNDS = Object.freeze([
  Object.freeze({ id: "sand", name: "Sand" }), Object.freeze({ id: "light-sand", name: "Light sand" }),
  Object.freeze({ id: "dark-sand", name: "Dark sand" }), Object.freeze({ id: "red-dirt", name: "Red dirt" }),
  Object.freeze({ id: "gravel", name: "Gravel" }),
]);
const GROUND_IDS = GROUNDS.map((g) => g.id);

export const LOOK_DEFAULTS = Object.freeze({ hour: 15.75, sun: 0.5, ambient: 1, shadows: true, softness: 4, shadowStrength: 0.5, haze: 0.35, exposure: 1, ground: "sand", ...CLOUDS });
// The Technical surroundings: brighter afternoon light with softer, lighter shadows.
export const TECHNICAL_LOOK = Object.freeze({ hour: 16, sun: 1.15, ambient: 1.1, shadows: true, softness: 3, shadowStrength: 0.55, haze: 0.2, exposure: 1, ground: "sand", ...CLOUDS });

// Blueprint: late-morning light with soft shadows; no haze.
export const BLUEPRINT_LOOK = Object.freeze({ hour: 11, sun: 1, ambient: 1.15, shadows: true, softness: 4, shadowStrength: 0.7, haze: 0, exposure: 1.05, ground: "sand", ...CLOUDS });

/** The light defaults for a surroundings name ("outdoor", "technical" or "blueprint"). */
export const lookDefaults = (environment) => (environment === "technical" || String(environment).startsWith("custom:") ? TECHNICAL_LOOK
  : environment === "blueprint" ? BLUEPRINT_LOOK : LOOK_DEFAULTS);
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
    else if (typeof def === "boolean") out[k] = typeof v === "boolean" ? v : def;
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
