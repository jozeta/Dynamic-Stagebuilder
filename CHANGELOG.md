# Changelog

All notable changes to Dynamic-Stagebuilder are listed here, newest first.

## Unreleased

- Look rework, step 2 (ground and berms): a compacted dirt-and-gravel floor with colour, normal,
  roughness and ambient-occlusion maps baked in code from a tileable gravel height field
  (256 px per metre); large-scale tones of dry dust, compacted earth and damp patches, a worn lane
  through the middle; stones in three sizes sunk into the ground, denser toward the berms and
  sparser in the lane; berms 2–3 m high with an irregular line and lumpy raw-earth faces, patchy
  grass on top and grass cards on the tops, faces and foot. The overview now frames what is on
  the stage (the bay when empty), with the berm edges at the frame's borders.

- Look rework, step 1 (lighting and camera): a low golden sun (about 24° at the new default
  18:15) with long diagonal shadows and crisp edges (4096 shadow map on computers, tuned bias),
  a cool-sky / warm-ground fill light, image-based reflections from a generated late-afternoon
  sky (not shown as the backdrop), a warmer hazy sky, ACES tone mapping. The default view is a
  high oblique overview (45° down, 25° yaw, 32° lens) that frames the whole bay; the shooter's
  eye and Front views use a natural 55° lens.

- Library: each prop group (Paper, Steel, Walls, Structures, Obstacles and range furniture) is
  a collapsible section; the folded state is remembered per browser and a search opens groups
  with matches.
- Reference range look: 6 cm pine frames with a post at every panel, bold black wire mesh and a
  denser royal-blue mesh, a new Solid panel wall (grey sheet, snaps like other walls), targets
  with printed scoring-zone outlines, bevelled yellow/white poppers, 10 × 8 cm red fault-line
  timber, dense areca palms, steep cut dirt banks with shrubs on top, crisper light (default
  16:30, sharper shadows, exposure 0.92); the sun now passes on the shooter's side so target
  faces are lit.

- Environment settings dialog (toolbar *Settings*): surroundings (moved from the toolbar), time
  of day 06:00–20:00 driving the sun's position and colour, sunlight, ambient light, shadows,
  shadow softness, haze and exposure; `settings.look` in stage files (older files get defaults).
- New props: ramp, platform (structures); car, table, chair, pallets, sandbag wall, traffic cone;
  mesh doorway (a wall, it snaps). Barrels get a colour (black, blue, red, green).
- More detail and texture: worn steel drums with hoops, chimes, bungs, scratches and rust;
  treaded tyres; board crates with battens; palms with leaflets; trees with bark, branches and
  leafy crowns; a bump-mapped gravel ground with scattered stones.
- IPSC target outline after the rulebook drawing (43 cm body, 15 × 15 cm head); targets stand
  lower (default 0.7 m to the card's bottom) on sticks reaching half way up; poppers get a hinge.

- Object snapping: walls (mesh, mesh with port, wooden) snap end to end to nearby walls (35 cm),
  grid snap otherwise; *Grid* and *Objects* toggles in the toolbar; `settings.objectSnap` in stage
  files (older files read as on).
- Shift while dragging: slow fine moves (1/5 speed) without snapping.
- New props: Mesh wall with port (a real, framed opening) and Potted plant (decoration). Poppers
  and plates get a paint setting (white/yellow). The wooden "Wall with port" is now "Wooden wall
  with port".
- New look after the reference photo: pine frames and 10 cm square wire mesh, plywood walls,
  cardboard targets on blue steel stands; Outdoor has earth banks with grass, bushes and trees, a
  low warm sun with soft shadows, a gradient sky and haze; ACES tone mapping. Outdoor is now the
  default for new stages, and mesh walls default to a pine frame.
- Fixed: the service worker no longer stores stale files from the browser's HTTP cache.
- Steel saved before the paint setting keeps its white paint; a wall dropped close behind a
  parallel wall no longer jumps on top of it; lighter shadows on iPads.

- 3D stage editor (Three.js 0.187.0, self-hosted): shooting bay, prop library with IPSC and mini
  targets, no-shoots, poppers, plates, mesh/wooden walls, a wall with a real port, barrels, tyres and
  crates, all at real size; fault lines, shooting areas and the start position.
- Place by tap or drag-and-drop, drag to move with grid snap, rotate with a ring, buttons or Q/E,
  multi-select, duplicate, delete, undo/redo, New stage.
- Automatic target numbers (T/P/NS) with Renumber and hand-set labels; live statistics (rounds,
  points, suggested stage type, warnings for over 32 rounds and duplicate labels).
- Technical and Outdoor surroundings that never change the stage; camera presets including the
  shooter's eye; About dialog with the version and the rulebook edition.
- Computers and iPads; phones get a "use a larger screen" message.
- Written Stage Briefing editor; the counted fields (targets, rounds, points) come from the stage.
- Print: a two-page A4 brief with a top-down map, scale bar and 3D view (Save as PDF).
- Projects saved in the browser with autosave, a Projects dialog (open, duplicate, delete, new),
  JSON export and safe import (validated, always a new project), and a "not exported" hint.
- Installable PWA that works offline (network first, the app's own files cached per version).

- v1 design agreed (docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md); README and CLAUDE.md describe the plan.

## 0.1.0 (2026-11-18)

- Project created.
