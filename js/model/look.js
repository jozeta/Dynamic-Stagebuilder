// Environment look settings (saved with the stage, not part of undo) and the sun's position and
// colour from the time of day. Pure: no DOM, no Three.js.
const SPEC = {
  hour: [6, 20], sun: [0, 2], ambient: [0, 2], softness: [0, 8], haze: [0, 1], exposure: [0.5, 1.6],
};

export const LOOK_DEFAULTS = Object.freeze({ hour: 16.5, sun: 1, ambient: 1, shadows: true, softness: 1.5, haze: 0.25, exposure: 0.92 });

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
 * strength factor that falls toward the horizon. The sun's path runs from east through the
 * shooter's side (up range, −z) to west, so target faces (which face up range) are lit and
 * shadows fall forward and sideways, as on the reference range.
 */
export function sunFromHour(hour) {
  const h = Math.min(20, Math.max(6, hour));
  const a = ((h - NOON) / HALF_DAY) * (Math.PI / 2);                 // −90° morning … +90° evening
  const elevation = Math.max(2, MAX_ELEVATION * Math.cos(a));
  const e = (elevation * Math.PI) / 180;
  const horiz = [-Math.sin(a), -0.6 * Math.cos(a)];
  const hl = Math.hypot(...horiz);
  const direction = [(horiz[0] / hl) * Math.cos(e), Math.sin(e), (horiz[1] / hl) * Math.cos(e)];
  return { elevation, direction, warmth: 1 - elevation / MAX_ELEVATION, strength: 0.3 + 0.7 * Math.sqrt(Math.sin(e)) };
}
