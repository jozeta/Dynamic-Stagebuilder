// The club on every printed brief: its name and logo, a per-browser setting (ui/prefs.js), not part
// of a stage, so files and share links stay small. Stored values are untrusted: the name is trimmed
// and capped, and the logo is kept only as a PNG or JPEG base64 data URL of limited size (the app
// redraws a chosen image on a canvas, so it is always one of those). Pure: no DOM.
export const LOGO_MAX = 400_000;              // characters of the data URL (about 300 KB)
const NAME_MAX = 120;
const LOGO = /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;

/** { name, logo } from anything; logo null unless it is a valid, small PNG or JPEG data URL. */
export function cleanClub(v) {
  const o = v && typeof v === "object" ? v : {};
  const name = (typeof o.name === "string" ? o.name.trim() : "").slice(0, NAME_MAX);
  const logo = typeof o.logo === "string" && o.logo.length <= LOGO_MAX && LOGO.test(o.logo) ? o.logo : null;
  return { name, logo };
}
