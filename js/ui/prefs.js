// Per-browser preferences: which props the library hides (Settings → Props) and the camera view. A convenience: if
// storage is unavailable, everything is shown.
import { cleanHidden } from "../model/visibility.js";
import { cleanCameraView } from "../model/camera-view.js";

const KEY = "dsb:hidden-props";
export function loadHidden() { try { return cleanHidden(JSON.parse(localStorage.getItem(KEY) || "null")); } catch { return cleanHidden(null); } }
export function saveHidden(hidden) { try { localStorage.setItem(KEY, JSON.stringify(cleanHidden(hidden))); } catch { /* private mode */ } }

// The camera view per project, so a reload opens where you left off.
const viewKey = (id) => `dsb:view:${id}`;
export function loadView(id) { try { return cleanCameraView(JSON.parse(localStorage.getItem(viewKey(id)) || "null")); } catch { return null; } }
export function saveView(id, v) { try { const c = cleanCameraView(v); if (c && id) localStorage.setItem(viewKey(id), JSON.stringify(c)); } catch { /* private mode */ } }
