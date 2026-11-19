# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based 3D IPSC stage builder for professional stage builders and enthusiast shooters:
build one stage at real scale, view it in 3D, print a Written Stage Briefing (WSB) with a stage map.
Static web app, no backend, no build step. Created 2026-11-18.

**The v1 design is `docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md`** (goals,
non-goals, data schema, module layout, my calls). Read it before working on features. Anything in
its non-goals list is a later version, not v1.

## Commands

```sh
python3 -m http.server 8002      # then open http://localhost:8002/ (or: claude-update)
```

Tests:

```sh
npm test            # node --test: tests/*.test.mjs
npm run lint        # ESLint, including the unsafe-DOM rule
```

## Layout

- `index.html`: entry page (strict CSP with the import map's sha256, app grid, small-screen message)
- `css/app.css`: the app's own styles on Låda Glass tokens
- `js/main.js`: boot and wiring; `js/editor.js`: user actions → undoable stage edits (no DOM)
- `js/model/`: pure stage data (props incl. CAR_MODELS and MOVING, arrays = paper target
  presentations and hard cover, scoring-rules incl. TARGET_ARRAY_RULES, stage, history, snap,
  objsnap, numbering, stats, schema, briefing, briefing-options, map, look, visibility = hidden
  props, help-content, positions = shooting positions and the figure's parts, start-pose = the
  posed man at the start, route = the run's route, walk motion and look, planner = suggested
  positions from sight lines (library stages), camera-view = validated remembered view)
- `js/render/`: Three.js (engine, stage-view, builders/, environments/, camera, labels, picking, ground,
  figure-fade = figures fade as the camera comes close)
- `js/ui/`: Låda Glass panels (toolbar, library, inspector, stats, settings with Environment/View/Props tabs,
  projects in the left panel, layers = the On stage list, context-menu = the right-click menu; the side
  panels dock with Låda Glass's `LadaGlass.dock` (main.js), prefs = per-browser preferences, help,
  briefing, print, shortcuts, about, dom helpers)
- `js/render/builders/car.js`: cars lofted from the CAR_MODELS profile curves (glass is a material
  group of the body); `moving.js`: swinger, drop turner, clamshell, mover, Texas star, plate rack,
  dueling tree
- `js/demo.js`: the example stage shown on open (until saved projects exist)
- `vendor/three/0.187.0/`, `vendor/lada-glass/2.5.0/`: self-hosted libraries (don't edit)
- `vendor/textures/polyhaven/gravelly_sand/`: CC0 photo-scanned ground texture (see its SOURCE.md)
- `tests/`: `node --test` (model, editor, builders and environments run in Node; Three.js from
  node_modules, pinned to the vendored version)
- `docs/superpowers/`: the v1 design and the implementation plans

- `js/storage/`: IndexedDB store (db), project records (projects), stage files (files)
- `css/print.css` + `js/ui/print.js` + `js/model/map.js`: the A4 brief (a hidden `#print` section)
- `sw.js` + `manifest.webmanifest` + `icons/`: the PWA. **Add every new app file to `FILES` in
  `sw.js`** (tests/pwa.test.mjs fails otherwise) and update `VERSION` there when bumping the version.

## Architecture rules

- **1 world unit = 1 metre.** x across the bay (centred), z down range (0 at the uprange edge), y up.
  Right-handed: looking down range, +x is to the shooter's left. Rotation is degrees about y;
  a node's `rotation.y = −degrees`.
- **Stage data is plain JSON and the single source of truth.** It never holds Three.js objects; the
  3D view is rebuilt from it. Every edit goes through `model/history.js` so it can be undone.
- **Snapping order** (`editor.js` `landing`): Shift (fine) → no snap; else object snap (wall end to
  wall end, `model/objsnap.js`) → else grid; always clamped to the bay. Groups snap to the grid only.
- **Look settings** (`settings.look`, `model/look.js`) are view choices like the surroundings:
  saved with the stage, applied with `engine.setLook` / `environments/common.js applyLook`, never
  undo steps, and undo/redo keep the current ones.
- **Looks are generated in code** (canvas textures in `render/materials.js` and
  `environments/*.js`, seeded random). The one exception: photo-scanned **CC0** textures kept in
  `vendor/textures/<source>/<name>/` with a `SOURCE.md` (source URL, author, licence), loaded
  same-origin and listed in `sw.js` FILES. Never hotlink, never use non-CC0 or stock images. The Outdoor scene follows the reference
  photo (golden-hour dirt range); keep that feel when changing it.
- **Environments never touch stage data.** Scene groups: `environmentGroup` (ground, sky, lights)
  and `stageGroup` (props). A wall's mesh colour and frame are wall properties. A test asserts the
  stage JSON is identical before and after an environment switch.
- `js/model/` has no DOM and no Three.js imports, so it runs under `node --test`. Put logic there.
- Scoring constants live in `js/model/scoring-rules.js` with the IPSC rulebook edition they come
  from; don't add rule checks without a cited rule and edition.
- Imported JSON is validated by `model/schema.js` before use and never overwrites an existing project.
- Three.js is loaded through an inline import map allowed by its `sha256` hash in the CSP. If you
  change the import map, update the hash.
- The CSP requires Trusted Types for scripts: script URLs (the service worker) go through a policy.

## Design

Låda Glass 2.4.0 (`~/Desktop/code/tools/design`, preview: `design/preview.html` there): dark frosted
glass is the main theme, light the alternative, compact density. Use its `lg-` components and
tokens instead of new styles; don't edit the vendored copy (update it when `claude-check` says it's
old). The 3D viewport is the app's own canvas.

Devices: computers (mouse first, keyboard shortcuts) and iPads (touch; every action also has an
on-screen button, touch targets ≥ 44 px, nothing hover-only). Check at 768, 1024 and 1280 px. No
phones: below 768 px show a "use a computer or an iPad" message (waiver in `.claude-standards`).
English only. Installable PWA (`pwa=yes`): the service worker caches only the app's own files,
versioned with the app.

## Working agreements

- This repo follows the app standards in `~/Desktop/code/tools/standards/STANDARDS.md` (rule IDs,
  severities). `claude-check --repo .` checks it; decisions and reasoned waivers go in `.claude-standards`.
- Plan before building: agree on goals, scope and tech choices first, then implement in small,
  tested steps (failing test first).
- Never commit secrets. `.env` files are gitignored; commit only `.env.example` with placeholders.
- Untrusted data (network, files, URLs, storage, user input) is rendered with `textContent` or a
  sanitizer, never `innerHTML`; no `eval`; no third-party requests (self-host libraries in `vendor/`).
- Keep CI (`.github/workflows/ci.yml`) green; record user-visible changes under "Unreleased" in
  `CHANGELOG.md`.
- Version 0.3.0 (in `package.json`). Show it in the app (an About page, `--version` or a footer, read
  from that file). Bump it on every push that changes the app (patch: fixes, minor: features, major:
  breaking changes), and in the same commit move "Unreleased" under the new version and update the
  README's version and "What's new".
- The README stays detailed: what it is, installation, configuration and settings, how-tos, and
  screenshots in a grid with a caption under each.
- Public repo: github.com/jozeta/Dynamic-Stagebuilder, served by GitHub Pages from `main` at https://jozeta.github.io/Dynamic-Stagebuilder/ (every push to `main` publishes). Push only when asked, with the version bump.
