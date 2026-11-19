// Per-browser preferences: which props the library hides (Settings → Props) and the camera view. A convenience: if
// storage is unavailable, everything is shown.
import { cleanHidden } from "../model/visibility.js";
import { cleanCameraView } from "../model/camera-view.js";
import { walkSpeed } from "../model/route.js";
import { cleanRunLook } from "../model/run-look.js";

const KEY = "dsb:hidden-props";
export function loadHidden() { try { return cleanHidden(JSON.parse(localStorage.getItem(KEY) || "null")); } catch { return cleanHidden(null); } }
export function saveHidden(hidden) { try { localStorage.setItem(KEY, JSON.stringify(cleanHidden(hidden))); } catch { /* private mode */ } }

// The camera view per project, so a reload opens where you left off.
const viewKey = (id) => `dsb:view:${id}`;
export function loadView(id) { try { return cleanCameraView(JSON.parse(localStorage.getItem(viewKey(id)) || "null")); } catch { return null; } }
export function saveView(id, v) { try { const c = cleanCameraView(v); if (c && id) localStorage.setItem(viewKey(id), JSON.stringify(c)); } catch { /* private mode */ } }

// How fast Shooter's eye walks between positions (Settings → View).
const SPEED = "dsb:walk-speed";
export function loadWalkSpeed() { try { return walkSpeed(localStorage.getItem(SPEED)).id; } catch { return walkSpeed().id; } }
export function saveWalkSpeed(id) { try { localStorage.setItem(SPEED, walkSpeed(id).id); } catch { /* private mode */ } }

// How the shooter's run is drawn: shown, colour, see-through (Settings → View).
const RUN = "dsb:run-look";
export function loadRunLook() { try { return cleanRunLook(JSON.parse(localStorage.getItem(RUN) || "null")); } catch { return cleanRunLook(null); } }
export function saveRunLook(v) { const c = cleanRunLook(v); try { localStorage.setItem(RUN, JSON.stringify(c)); } catch { /* private mode */ } return c; }
