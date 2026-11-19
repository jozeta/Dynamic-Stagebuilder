// Per-browser preferences: which props the library hides (Settings → Props). A convenience: if
// storage is unavailable, everything is shown.
import { cleanHidden } from "../model/visibility.js";

const KEY = "dsb:hidden-props";
export function loadHidden() { try { return cleanHidden(JSON.parse(localStorage.getItem(KEY) || "null")); } catch { return cleanHidden(null); } }
export function saveHidden(hidden) { try { localStorage.setItem(KEY, JSON.stringify(cleanHidden(hidden))); } catch { /* private mode */ } }
