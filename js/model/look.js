// Environment look settings (saved with the stage, not part of undo) and the sun's position and
// colour from the time of day. Pure: no DOM, no Three.js.
const SPEC = {
  hour: [6, 20], sun: [0, 2], ambient: [0, 2], softness: [0, 8], haze: [0, 1], exposure: [0.5, 1.6],
};

export const LOOK_DEFAULTS = Object.freeze({ hour: 17.5, sun: 1, ambient: 1, shadows: true, softness: 3, haze: 0.35, exposure: 1.05 });

export function cleanLook(look) {
  const src = look && typeof look === "object" ? look : {};
  const out = {};
  for (const [k, def] of Object.entries(LOOK_DEFAULTS)) {
    const v = src[k];
    if (typeof def === "boolean") out[k] = typeof v === "boolean" ? v : def;
    else out[k] = typeof v === "number" && Number.isFinite(v) ? Math.min(SPEC[k][1], Math.max(SPEC[k][0], v)) : def;
  }
  return out;
}

const NOON = 13, HALF_DAY = 7, MAX_ELEVATION = 62;

/**
 * The sun at an hour between 6 and 20: elevation in degrees, a unit direction towards the sun
 * ([x, y, z], east is +x, down range is +z), warmth 0 (white noon) … 1 (orange sunset), and a
 * strength factor that falls toward the horizon.
 */
export function sunFromHour(hour) {
  const h = Math.min(20, Math.max(6, hour));
  const a = ((h - NOON) / HALF_DAY) * (Math.PI / 2);                 // −90° morning … +90° evening
  const elevation = Math.max(2, MAX_ELEVATION * Math.cos(a));
  const e = (elevation * Math.PI) / 180;
  const direction = [-Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
  return { elevation, direction, warmth: 1 - elevation / MAX_ELEVATION, strength: 0.3 + 0.7 * Math.sqrt(Math.sin(e)) };
}
