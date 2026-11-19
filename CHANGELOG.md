# Changelog

All notable changes to Dynamic-Stagebuilder are listed here, newest first.

## Unreleased

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
