# Plan 2 of 2: Briefing, Print, Saved Projects and PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish v1: a Written Stage Briefing editor, a two-page A4 print layout ("Save as PDF"),
projects saved in the browser with JSON export/import, and an installable offline PWA.

**Architecture:** Pure modules (`js/model/briefing.js`, `js/model/map.js`, `js/storage/projects.js`,
`js/storage/files.js`) carry the logic and the tests; thin DOM/IndexedDB layers use them. The print
layout is a hidden section of `index.html` shown only by `@media print` (no second page to pass data
to). The map is SVG built with `createElementNS` from `mapModel()`; the 3D view is a PNG snapshot of
the WebGL canvas.

**Tech Stack:** as Plan 1. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md` (Goals 7, 8, 11, 12, 13).
Plan 1 (`2026-11-18-plan-1-core-editor.md`) is done; this plan replaces the "Plan 2" and "Plan 3"
outlined there (one plan, because the remaining parts are small and share the UI).

## Global Constraints

Plan 1's Global Constraints apply, plus:
- The printed map is drawn as seen from above with down range at the top; +x (shooter's left) is on
  the left of the map, so the map matches the 3D view.
- Print: A4 portrait, `@page { size: A4; margin: 12mm }`; page 1 = header, top-down map (fixed
  height), WSB fields; long text flows onto page 2; the 3D view always starts page 2
  (`break-before: page`). Text never shrinks or gets cut.
- Counted WSB fields (targets, minimum rounds, maximum points, suggested type) always come from
  `stageStats`; they are shown read-only in the editor.
- Imports never overwrite: an imported stage always gets a new id and becomes a new project.
- Service worker caches only the app's own files, cache name `dsb-<version>`; old caches are deleted.

## Review Focus

1. A briefing with 4 000-character procedure and notes → print shows all text (flows to page 2),
   nothing cut (Task 2 browser check).
2. Importing a hostile or wrong file (not JSON, schema 2, `__proto__`, 10 MB) → a readable error,
   no project created, current stage untouched (Task 3 tests).
3. Two quick edits then a reload → the last edit is there (autosave flushes on `pagehide`; Task 4).
4. Deleting the open project → the app opens another project or a new one, never a blank state
   without a project (Task 4 test on `nextProjectAfterDelete`).
5. A new app version → the old service-worker cache is deleted and the new files are served
   (Task 5 test that every app file is in the cache list and the name includes the version).

---

### Task 1: Briefing model and editor dialog

**Files:** Create `js/model/briefing.js`, `js/ui/briefing.js`; Modify `js/ui/toolbar.js`, `js/main.js`,
`index.html`, `css/app.css`; Test `tests/briefing.test.mjs`

**Interfaces:**
- Produces: `targetsText(stats) → string` (e.g. `"8 paper, 2 steel, 1 no-shoot"`, plurals
  "no-shoots"; empty stage → `"None"`); `briefingRows(stage) → { label, value, counted }[]` in this
  order: Match, Stage (`"<number> – <name>"`), Designer, Stage type (override, else suggested, else
  "–"), Scoring, Targets, Minimum rounds, Maximum points, Start signal, Start position, Gun condition,
  Stop time; `briefingText(stage) → { procedure, notes }`.
- UI: toolbar button "Briefing" opens an `lg-modal lg-modal-lg` dialog: text fields for match name,
  stage name (`stage.name`), stage number, designer, start signal, start position, gun condition,
  stop time, scoring; a select for stage type (Suggested (<type>) / Short / Medium / Long); textareas
  for procedure and notes; the counted values read-only. Changes dispatch `setBriefing` (and a new
  `rename` action for the stage name) on change.

- [ ] Step 1: failing tests: `targetsText` for 0/1/many of each kind; `briefingRows` takes counted
  values from the stage (add a target → Minimum rounds row changes), uses `briefing.stageType` when
  set and the suggestion otherwise; editor `rename` trims to 120 chars and is undoable.
- [ ] Step 2: run (FAIL); Step 3: implement; Step 4: run (PASS); browser check that the dialog edits
  stick and Escape closes it. Step 5: commit `feat: written stage briefing editor`.

### Task 2: Top-down map model and the A4 print layout

**Files:** Create `js/model/map.js`, `js/ui/print.js`, `css/print.css`; Modify `index.html`,
`js/ui/toolbar.js`, `js/main.js`; Test `tests/map.test.mjs`

**Interfaces:**
- Produces: `mapModel(stage, { width, height, margin = 4 }) → { scale, items }` in millimetres of a
  box `width × height`; `scale` = mm per metre (fits the whole bay); items are
  `{ kind: "bay"|"grid"|"rect"|"circle"|"poly"|"label"|"start"|"scalebar", … }` with points already in
  map mm. World → map: `mx = cx − x·scale`, `my = cy + (depth/2 − z)·scale` (down range up, +x left).
  Objects become rotated footprint rectangles (`dimensionsOf` w × d) except barrels, tyres and plates
  (circles); scoring targets get a `label` item; fault lines `poly` (open), areas `poly` (closed,
  dashed); a `scalebar` of 5 m (2 m if the bay is under 10 m).
- `renderPrint(stage, snapshotDataUrl)` fills `#print` with: header (match, stage number and name),
  the map as SVG (`createElementNS`), the WSB rows table, procedure and notes, then a page-2 section
  with the 3D snapshot; `window.print()` follows.
- Toolbar "Print" button: takes an isometric snapshot (`rig.preset("iso")`, render once,
  `canvas.toDataURL("image/png")`, restore the camera), renders the print section, calls print.

- [ ] Step 1: failing tests: scale fits a 20 × 30 bay into 186 × 120 mm; an object at x = +5 maps
  left of centre and z = depth maps to the top; a 3-point fault line gives a 3-point open `poly`;
  every scoring target has a `label` with its text; the scale bar is 5 m long in mm.
- [ ] Step 2–4: run, implement, run. Browser check with `page.emulateMedia({ media: "print" })` and
  `page.pdf()`: two A4 pages, map on page 1, 3D view on page 2, a 4 000-character procedure flows,
  nothing cut. Step 5: commit `feat: two-page A4 stage brief with top-down map`.

### Task 3: Project records and JSON files

**Files:** Create `js/storage/projects.js`, `js/storage/files.js`; Test `tests/projects.test.mjs`, `tests/files.test.mjs`

**Interfaces:**
- `projects.js`: `projectRecord(stage, { now, exportedAt = null }) → { id, name, modified, exportedAt, stage }`;
  `sortProjects(records) → records` (newest `modified` first); `nextProjectAfterDelete(records, deletedId) → id|null`;
  `exportAge(record, now) → string|null` (`null` if exported after the last change, else
  `"Not exported yet"` / `"Not exported since 3 days"`-style text: minutes, hours, days).
- `files.js`: `exportFileName(stage) → "stage-<slug>.json"` (slug from the name, `[a-z0-9-]`, max 40,
  fallback "stage"); `stageToJson(stage) → string` (pretty, 2 spaces);
  `parseStageFile(text, { maxBytes = 5_000_000 }) → { ok: true, stage } | { ok: false, error }` (size
  check, JSON.parse in try, `validateStage`, then a fresh `id`; error strings are short English).

- [ ] Step 1: failing tests: slug cases ("Stage 1 – Pistol!" → `stage-stage-1-pistol.json`, "" →
  `stage-stage.json`); parse rejects "not json", `schema: 2`, a 6 MB string and keeps
  `Object.prototype` clean; a valid file round-trips with a new id; `exportAge` cases;
  `nextProjectAfterDelete` picks the newest remaining or `null`.
- [ ] Step 2–4: run, implement, run. Step 5: commit `feat: project records and stage JSON files`.

### Task 4: IndexedDB storage, autosave and the Projects dialog

**Files:** Create `js/storage/db.js`, `js/ui/projects.js`; Modify `js/main.js`, `js/editor.js`
(`load` action), `js/ui/toolbar.js`, `index.html`, `css/app.css`; Test `tests/editor.test.mjs`

**Interfaces:**
- `db.js` (browser only): `openStore() → { list(), get(id), put(record), remove(id) }` over database
  `dynamic-stagebuilder`, store `projects` (keyPath `id`); calls `navigator.storage.persist()` once.
- Editor: `load({ stage })` replaces the history with a fresh one (not undoable), clears selection.
- main.js: on boot open the last project (`localStorage` key `dsb:last`, wrapped in try/catch), else
  the newest, else save the example stage as the first project. Autosave 600 ms after the last change
  and on `pagehide`/`visibilitychange` hidden; a save-status chip in the toolbar ("Saved"/"Saving…"/
  "Not saved: <reason>").
- Projects dialog (toolbar "Projects"): list with name, modified time and the `exportAge` hint;
  Open, Duplicate, Delete (confirm inside the dialog, not `window.confirm`), New, Import JSON (file
  input; errors shown with `lg-alert-bad`), Export current (download via a Blob URL; sets
  `exportedAt`). Rename is the briefing's stage name.

- [ ] Step 1: failing test: editor `load` replaces stage, empties past/future and selection.
- [ ] Step 2–4: run, implement, run. Browser check: edit, reload → kept; import a valid and an invalid
  file; delete the open project → another opens. Step 5: commit `feat: saved projects with autosave, import and export`.

### Task 5: PWA: manifest, icons, service worker

**Files:** Create `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`; Modify
`index.html`, `js/main.js`; Test `tests/pwa.test.mjs`

**Interfaces:**
- `sw.js`: `const VERSION = "<package.json version>"`, `CACHE = "dsb-" + VERSION`, `FILES = [...]`
  (every app file: html, css, js, vendor files, icons, manifest, package.json); install caches
  FILES; activate deletes other `dsb-` caches; fetch: cache first for same-origin GET, else network.
- main.js registers `sw.js` when `serviceWorker` exists and the page is not `file:`.
- About dialog: one line on installing (Safari: Share → Add to Home Screen; Chrome/Edge: Install).

- [ ] Step 1: failing tests: manifest parses, has name, `start_url "./"`, `display "standalone"`, the
  two PNG icons exist; `sw.js` VERSION equals package.json; every file under `js/`, `css/`,
  `vendor/three/0.187.0/`, the Låda Glass css and `icons/` is in FILES, and every FILES entry exists.
- [ ] Step 2–4: run, implement, run. Browser check: SW installs, page loads offline
  (`context.setOffline(true)` and reload). Step 5: commit `feat: installable offline PWA`.

### Task 6: Docs and release notes

- [ ] README: How-to for briefing, printing (incl. iPad: Share → Print → Save to Files), projects,
  export/import, installing; Configuration additions; screenshots of the briefing dialog and the
  printed page added to the grid; "What v1 does" all ✓. CHANGELOG Unreleased; CLAUDE.md layout.
- [ ] Commit `docs: describe briefing, printing, projects and installing`.
