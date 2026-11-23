// More library entries (see stage-library.js): practice drills researched from Ben Stoeger's
// live-fire drills (benstoeger.com, docs/stage-library-sources.md), set up on IPSC targets, and
// three original stages. Wording and layouts are written for this app. Positions in metres: x across
// the bay (+x the shooter's left), z down range; target rotation 0 faces the shooter.
const YD = 0.9144;
const at = (yards) => Math.round(yards * YD * 100) / 100;
// A shooting area: a rectangle centred on (x, z).
const area = (x, z, w = 1.2, d = 1.2) => ({ type: "shooting-area", points: [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]], closed: true });
const paper = (x, z, params = {}, rotation = 0) => ({ type: "paper-ipsc", position: [x, z], rotation, params });
const DRAW = { scoring: "Comstock", startSignal: "Audible", startPosition: "Standing in the start box facing down range, arms hanging naturally", gunCondition: "Loaded and holstered, ready condition", stopTime: "Last shot" };
const drill = (o) => ({ discipline: "both", category: "practice", fixed: true, ...o, briefing: { ...DRAW, ...o.briefing } });

export const MORE_STAGES = Object.freeze([
  drill({
    id: "blake-drill", name: "Blake Drill", rounds: 6, summary: "Draw and put two hits on each of three targets a yard apart: fast, decisive transitions.",
    bay: { width: 10, depth: 12 },
    briefing: { procedure: "On the start signal, draw and engage T1–T3 with two rounds each.", notes: `6 rounds at ${at(7)} m (7 yards), targets about 0.9 m (1 yard) apart. A good goal is about 2 s, the same as a Bill Drill; not worth shooting much past 15 yards. Named after Blake Miguez's fast transitions.` },
    objects: [paper(0.91, 2 + at(7)), paper(0, 2 + at(7)), paper(-0.91, 2 + at(7))],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  drill({
    id: "accelerator", name: "Accelerator", rounds: 12, summary: "Three targets at 7, 15 and 25 yards: change gears between easy and hard shots, with a reload.",
    bay: { width: 12, depth: 28 },
    briefing: { startPosition: "Standing in the start box facing down range, hands relaxed at the sides", procedure: "On the start signal, engage T1–T3 with two rounds each, perform a reload, then engage T1–T3 again with two rounds each.", notes: `12 rounds. T1 at ${at(7)} m, T2 at ${at(15)} m, T3 at ${at(25)} m (7, 15 and 25 yards), about a yard apart across. Goal: about 6 s with a couple of C hits. The point is to drive the close target and slow down for the far one.` },
    objects: [paper(1, 2 + at(7)), paper(0, 2 + at(15)), paper(-1, 2 + at(25))],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  drill({
    id: "four-aces", name: "Four Aces", rounds: 4, summary: "Two hits, reload, two more on one target: the reload under the timer.",
    bay: { width: 10, depth: 12 },
    briefing: { procedure: "On the start signal, draw and engage T1 with two rounds, perform a reload, then engage T1 with two more rounds.", notes: `4 rounds at ${at(7)} m (7 yards); also shot at 3 and 5 yards. A-zone hits only. Goals: about 2.2 s at 3 yards, 2.3 s at 5 yards, 2.5 s at 7 yards. Also called Double Reload Double.` },
    objects: [paper(0, 2 + at(7))],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  drill({
    id: "the-heads", name: "The Heads", rounds: 6, summary: "Two hits on the head of each of three targets at 5, 15 and 25 yards.",
    bay: { width: 12, depth: 28 },
    briefing: { procedure: "On the start signal, draw and engage the head of T1–T3 with two rounds each.", notes: `6 rounds, head only. T1 at ${at(5)} m: A hits only; T2 at ${at(15)} m: B hits are fine; T3 at ${at(25)} m: any two hits on the head. Goal at 25 yards: about 6 s. The targets show the head (With head style).` },
    objects: [paper(1.2, 2 + at(5), { style: "head" }), paper(0, 2 + at(15), { style: "head" }), paper(-1.2, 2 + at(25), { style: "head" })],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  drill({
    id: "distance-changeup", name: "Distance Changeup", rounds: 6, summary: "Near, far, near: two hits each on targets at very different distances.",
    bay: { width: 12, depth: 24 },
    briefing: { startPosition: "Standing in the start box facing down range, hands relaxed at the sides", procedure: "On the start signal, engage T1, T2 and T3 with two rounds each.", notes: `6 rounds. T1 at ${at(5)} m, T2 at ${at(20)} m, T3 at ${at(5)} m (5, 20 and 5 yards), so the shooter must slow down for T2 and speed up again. Goal: under 3 s; head-box hits on the far target make it harder.` },
    objects: [paper(1.5, 2 + at(5)), paper(0, 2 + at(20)), paper(-1.5, 2 + at(5))],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  drill({
    id: "exit-drill", name: "Exit Drill", rounds: 6, summary: "Shoot two targets from area A, move to B behind a wall and shoot the third: leave A while the last shots break.",
    bay: { width: 14, depth: 14 },
    briefing: { startPosition: "Standing in shooting area A facing down range, arms hanging naturally", procedure: "On the start signal, engage T1 and T2 from shooting area A with two rounds each, then move to shooting area B and engage T3 with two rounds.", notes: "6 rounds. T3 is hidden from A by the wall. Easy version: T1 and T2 close and open; hard version: move T2 farther away. Work on starting the move out of A while still shooting." },
    objects: [paper(2.5, 8), paper(1.5, 8.5), { type: "wall-mesh", position: [-1.5, 6], rotation: 90, params: { length: 3, height: 2 } }, paper(-4, 9.5)],
    lines: [area(2.5, 2), area(-3.5, 3)], start: { position: [2.5, 2], facing: 0 },
  }),
  drill({
    id: "doubles", name: "Doubles", rounds: 10, summary: "Five fast pairs on one target from low ready, with a short pause between pairs.",
    bay: { width: 10, depth: 12 },
    briefing: { startPosition: "Standing in the start box facing down range, handgun at low ready", gunCondition: "Loaded, in the hand at low ready, finger off the trigger", procedure: "On the start signal, engage T1 with a pair of rounds, pause about a second, and repeat for five pairs.", notes: `10 rounds at ${at(7)} m (7 yards). Each pair as fast as the trigger can be pulled; the pause length doesn't matter. Watch where the second hit of each pair lands.` },
    objects: [paper(0, 2 + at(7))],
    lines: [area(0, 2)], start: { position: [0, 2], facing: 0 },
  }),
  // Original stages.
  {
    id: "coffee-break", name: "Coffee Break", discipline: "IPSC", category: "short", rounds: 12,
    summary: "Seated at a table with the pistol on it: pick it up and shoot five targets and two poppers without leaving the chair.",
    bay: { width: 16, depth: 16 },
    briefing: { scoring: "Comstock", startSignal: "Audible", startPosition: "Seated on the chair, hands flat on the thighs", gunCondition: "Loaded, on the table, muzzle toward the berm, hammer down", procedure: "On the start signal, pick up the handgun and engage T1–T5 and P1–P2 from the chair.", stopTime: "Last shot", notes: "12 rounds, 60 points. The shooter stays seated; the steel is to the sides." },
    objects: [{ type: "table", position: [0, 3], rotation: 0, params: { length: 1.2 } }, { type: "chair", position: [0, 2.3], rotation: 180, params: {} },
      paper(-2.4, 9), paper(-1.2, 10, { presentation: "ns-right" }), paper(0, 11), paper(1.2, 10, { hardCover: "lower-1/4" }), paper(2.4, 9),
      { type: "popper", position: [-4.5, 10.5], rotation: 25, params: {} }, { type: "popper", position: [4.5, 10.5], rotation: -25, params: {} }],
    lines: [area(0, 2.6, 2, 2)], start: { position: [0, 2.3], facing: 0 },
  },
  {
    id: "off-hand", name: "Off Hand", discipline: "IPSC", category: "short", rounds: 10,
    summary: "Weak hand only after the start: four targets behind a low wall and two plates.",
    bay: { width: 16, depth: 16 },
    briefing: { scoring: "Comstock", startSignal: "Audible", startPosition: "Standing in the start box, arms hanging naturally", gunCondition: "Loaded and holstered, ready condition", procedure: "On the start signal, draw and engage T1–T4 and the two plates weak hand only.", stopTime: "Last shot", notes: "10 rounds, 50 points. The strong hand may draw and pass the handgun to the weak hand; then weak hand only." },
    objects: [{ type: "wall-wood", position: [0, 7], rotation: 0, params: { length: 4, height: 1 } }, paper(-1.5, 9, { hardCover: "lower-1/3" }), paper(-0.5, 9.5), paper(0.5, 9.5, { presentation: "ns-left" }), paper(1.5, 9, { hardCover: "lower-1/3" }),
      { type: "plate-round", position: [-3.5, 10], rotation: 0, params: { baseHeight: 1 } }, { type: "plate-round", position: [3.5, 10], rotation: 0, params: { baseHeight: 1 } }],
    lines: [area(0, 2, 2, 1.5)], start: { position: [0, 2], facing: 0 },
  },
  {
    id: "box-to-box", name: "Box to Box", discipline: "IPSC", category: "medium", rounds: 20,
    summary: "Two shooting areas 8 m apart: shoot an array from each, steel in the middle seen from both.",
    bay: { width: 22, depth: 22 },
    briefing: { scoring: "Comstock", startSignal: "Audible", startPosition: "Standing in shooting area A, wrists above the shoulders", gunCondition: "Loaded and holstered, ready condition", procedure: "On the start signal, engage all targets from within the shooting areas.", stopTime: "Last shot", notes: "20 rounds, 100 points. The walls split the stage: one paper array is shot from A, the other from B; the poppers in the middle can be shot from either." },
    objects: [{ type: "wall-mesh", position: [0, 6], rotation: 90, params: { length: 4, height: 2 } }, { type: "wall-mesh", position: [0, 12], rotation: 0, params: { length: 3, height: 2 } },
      paper(6, 12), paper(5, 13, { presentation: "ns-right" }), paper(7, 14), paper(4.5, 15, { hardCover: "lower-1/4" }),
      paper(-6, 12), paper(-5, 13, { presentation: "ns-left" }), paper(-7, 14), paper(-4.5, 15, { hardCover: "lower-1/4" }),
      { type: "popper", position: [-1.5, 16], rotation: 0, params: {} }, { type: "popper", position: [-0.5, 16.5], rotation: 0, params: {} }, { type: "popper", position: [0.5, 16.5], rotation: 0, params: {} }, { type: "popper", position: [1.5, 16], rotation: 0, params: {} }],
    lines: [area(4, 3, 2, 2), area(-4, 3, 2, 2)], start: { position: [4, 3], facing: 0 },
  },
].map((s) => Object.freeze(s)));
