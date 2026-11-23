// The start-position card, a print page for the Range Officer (IPSC Handgun Competition Rules,
// January 2026, rule 3.2.2: the RO must demonstrate the start position, "either by use of a picture
// or physically"): a picture of the posed shooter at the start box and the briefing's start wording.
// Pure: no DOM, no Three.js.
const DIST = 3.4, EYE = 1.55, AIM = 1, SIDE = 28;        // metres, metres, metres, degrees off straight ahead

/**
 * Where to stand to photograph the start: { position: [x, y, z], target: [x, y, z] }, in front of the
 * shooter (the way the start faces), SIDE degrees to one side, looking back at them.
 */
export function startCamera({ position: [x, z], facing = 0 }) {
  const a = ((facing + SIDE) * Math.PI) / 180;
  // Facing 0 looks down range (+z); +x is to the shooter's left (a node's rotation.y = −degrees).
  return { position: [x - Math.sin(a) * DIST, EYE, z + Math.cos(a) * DIST], target: [x, AIM, z] };
}

const dash = (v) => (String(v ?? "").trim() ? String(v).trim() : "–");

/** The card's words: { title, rows: [[label, text]], hasStart }. */
export function startCard(stage) {
  const b = stage.briefing ?? {};
  return {
    title: `Stage ${b.stageNumber ?? 1} – ${stage.name || "Untitled stage"}: start position`,
    rows: [["Start position", dash(b.startPosition)], ["Gun condition", dash(b.gunCondition)], ["Start signal", dash(b.startSignal)]],
    hasStart: Boolean(stage.start),
  };
}
