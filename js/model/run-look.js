// How the shooter's run is drawn (Settings → View, a per-browser view choice), part by part: the
// figures (at the start and the shooting positions), the position marks (ring and facing arrow) and
// the route on the ground. Each is shown or hidden, has its own colour and how see-through it is.
// Pure: no DOM, no Three.js.
export const RUN_COLORS = Object.freeze([
  { id: "grey", name: "Light grey", hex: "#d4d8de" },
  { id: "white", name: "White", hex: "#ffffff" },
  { id: "blue", name: "Blue", hex: "#4f8fff" },
  { id: "orange", name: "Orange", hex: "#ff9a2e" },
  { id: "green", name: "Green", hex: "#4fd17a" },
  { id: "yellow", name: "Yellow", hex: "#ffd23f" },
  { id: "black", name: "Black", hex: "#2a2d33" },
].map((c) => Object.freeze(c)));

export const RUN_PARTS = Object.freeze([
  { id: "figure", name: "Figures" },
  { id: "mark", name: "Position marks" },
  { id: "route", name: "Route line" },
]);

export const RUN_LOOK_DEFAULTS = Object.freeze({
  figure: Object.freeze({ show: true, opacity: 0.2, color: "#d4d8de" }),
  mark: Object.freeze({ show: true, opacity: 0.3, color: "#d4d8de" }),
  route: Object.freeze({ show: true, opacity: 0.15, color: "#d4d8de" }),
});

function cleanPart(v, d) {
  const o = v && typeof v === "object" ? v : {};
  const op = typeof o.opacity === "number" && Number.isFinite(o.opacity) ? Math.min(1, Math.max(0.1, o.opacity)) : d.opacity;
  return {
    show: typeof o.show === "boolean" ? o.show : d.show,
    opacity: Math.round(op * 100) / 100,
    color: typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color.toLowerCase() : d.color,
  };
}

/** A stored run look, checked part by part: anything missing or wrong falls back to the default. */
export function cleanRunLook(v) {
  const o = v && typeof v === "object" ? v : {};
  return Object.fromEntries(RUN_PARTS.map(({ id }) => [id, cleanPart(o[id], RUN_LOOK_DEFAULTS[id])]));
}

/** The look with one part changed (patch: { show?, opacity?, color? }). */
export const withRunPart = (look, part, patch) => cleanRunLook({ ...look, [part]: { ...cleanRunLook(look)[part], ...patch } });
