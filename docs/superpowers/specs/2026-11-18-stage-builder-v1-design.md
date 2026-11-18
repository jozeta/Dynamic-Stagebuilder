# Dynamic-Stagebuilder v1: design

Date: 2026-11-18 · Status: draft for approval (builder check done)

## Intent

A browser-based 3D IPSC stage designer for professional stage builders and enthusiast IPSC
shooters. You lay out one stage at real scale, look at it from any angle, and print a stage brief
(Written Stage Briefing with a diagram, round count and scoring) for range officers and competitors.

The long "master prompt" Johan supplied is the **long-term roadmap**, not v1. v1 is the smallest
version that is genuinely usable end to end: build a stage → see it in 3D → print the brief.

Look and feel (from the two reference images):

- **Technical view** (default): grey tiled floor with a 1 m grid, black mesh walls with black frames,
  tan paper targets on sticks, black barrels, red fault lines on the ground, white target labels
  (T1, T2, …) floating above the targets, a raised isometric camera.
- **Outdoor view**: the *same* stage on dirt ground with sunlight and soft shadows and a light earth
  berm around the bay. Logos in the reference image are not reproduced.
- A wall's mesh colour and frame are properties of the wall (as on a real range), not of the
  environment: a black-framed wall stays black-framed outdoors. Environments change only ground,
  sky, surroundings and light. *(Claude's call.)*

## Goals (v1)

1. Set up a rectangular shooting bay (width × depth in metres, default 20 × 30).
2. Place props from a library by click-to-place or drag-and-drop, then move them by dragging on the
   ground and rotate them (handle or keyboard), snapping to the grid (default 0.25 m, 15°).
3. Select, multi-select (Shift), duplicate, delete, and undo/redo every edit.
4. Prop library (all parametric, drawn in code, real dimensions):
   - Paper: IPSC target, IPSC mini target, no-shoot, mini no-shoot (each on a stick stand,
     adjustable mounting height, optional hard cover top/bottom/left/right not in v1).
   - Steel: IPSC popper, mini popper, round plate, square plate (on a base).
   - Walls: mesh wall (length 0.5–4 m, height 0.5–2.5 m, black or blue mesh, black or wood frame),
     solid wooden wall, wall with a port (rectangular port, adjustable size and height, a real hole).
   - Obstacles: barrel (200 l / 55 gal), tyre, tyre stack, wooden box/crate.
   - Lines and areas: fault line (polyline, click to add points on the ground), shooting area
     (closed polygon), start position marker.
5. Targets are numbered automatically (T1… for paper, P1… for poppers and plates, NS1… for no-shoots,
   numbered in placement order); a label can be overridden by hand. Deleting a target leaves a gap
   until the user presses **Renumber**; Renumber closes gaps and leaves hand-set labels alone.
   *(Claude's call.)*
6. Live stage statistics: paper targets, steel targets, no-shoots, minimum rounds, maximum points,
   suggested stage type (short/medium/long), each recomputed on every edit. Stage type is a
   *suggestion from the round count*: the designer can override it in the briefing, and above 32
   rounds the app shows a warning but does not block. If the rulebook defines course types by more
   than rounds, the UI labels it "suggested from round count". *(Claude's call.)*
7. Written Stage Briefing editor (English): match name, stage name, stage number, designer,
   stage type, scoring method, targets (auto text, e.g. "8 IPSC paper, 2 poppers, 1 no-shoot"),
   minimum rounds, maximum points, start signal (default "Audible"), start position, gun condition,
   procedure, stop time ("Last shot"), notes. Counted fields are filled in from the stage and can't
   drift from it; text fields are free.
8. Printable brief, A4 portrait, two pages (Johan agreed): **page 1** the WSB fields and a top-down
   orthographic map scaled to fit its box (grid, targets with labels, walls, fault lines, start
   position, scale bar); **page 2** one 3D isometric view plus any procedure/notes text that doesn't
   fit on page 1 (text flows, never shrinks or gets cut off). Exported via the browser's print dialog → "Save as PDF" (iPad: Share → Print → Save to Files).
9. Two environments, switchable at any time: **Technical** and **Outdoor dirt**. Switching never
   changes stage data (tested).
10. Camera: orbit/pan/zoom, presets Top, Isometric, Front, and **Shooter's eye** (a camera at 1.6 m
    at the start position, looking down range) for a rough look, plus "frame all".
11. Projects saved in the browser (IndexedDB, autosave), a project list (open, rename, duplicate,
    delete), and JSON export/import of a stage file. Because Safari may clear a site's storage after
    ~7 days without a visit (installed home-screen apps are exempt), the app calls
    `navigator.storage.persist()`, suggests installing it, and shows a "not exported since …" hint
    on each project. *(Claude's call.)*
12. Installable PWA that works fully offline.
13. Version number in the app (About dialog), read from `package.json`.

## Non-goals (v1, kept for later versions)

Matches with several stages; build sheet / construction list with coordinates; numeric position
fields; sight-line and visibility analysis; measurement tools; moving targets (swingers, activators);
irregular bay shapes; the other 18 environments; render modes (wireframe, clay); GLTF/GLB model import
and custom props; templates; version history and stage comparison; random stage generator; IPSC rule
validation beyond the stage-type and round-count calculation; Swedish or other languages; iPhone.

## Anti-goals

- Geometry that isn't real scale (1 world unit = 1 metre, always).
- An environment switch that moves, renames or renumbers anything.
- Buttons that do nothing; placeholder features shown as if they work.
- Silently losing a stage (autosave, and an import never overwrites without a new project).
- Regulatory claims without a source: the scoring constants carry the rulebook edition they come from.
- Network requests to anyone but the app's own origin.

## Constraints

- Static site, no build step, no backend. ES modules loaded from `js/` and `vendor/`.
- Strict CSP already in `index.html` (`script-src 'self'`, `require-trusted-types-for 'script'`).
  The import map for `three` is inline and is allowed by its `sha256` hash in the CSP; no other inline
  script.
- Untrusted data (imported JSON, IndexedDB contents, text typed by the user) rendered with
  `textContent`, never `innerHTML`; imported JSON validated against the schema before use.
- Låda Glass 2.3.0 for all UI chrome (dark default, light alternative). The 3D viewport is the app's
  own canvas.
- Devices: computers (mouse first, keyboard shortcuts) and iPads (touch, every action also reachable
  by an on-screen button). No iPhone: below 768 px the app shows a short "Use a computer or an iPad"
  message. Recorded in `.claude-standards` as a reasoned waiver of the 375 px part of DES-RESP-1.
- `pwa=yes` in `.claude-standards`.

## Approaches

| | Approach | Trade-off |
|---|---|---|
| **A (picked)** | Plain Three.js + addons vendored in `vendor/three/<version>/`, ES modules, no build step; parametric props in code; PDF via a print layout page | No TypeScript; "Save as PDF" goes through the print dialog |
| B | A plus Vite + TypeScript | Types and npm, but breaks the scaffold's no-build setup and CSP/CI assumptions |
| C | Babylon.js | More built in, but ~3× heavier and its GUI clashes with Låda Glass |

Johan picked **A** and the print-dialog PDF (no jsPDF). Why: fits the existing scaffold, works
offline with nothing extra, no licensing questions for assets. JSDoc type checking can be added
later if the code grows painful.

## Decided by Johan

- Users: professional stage builders and enthusiast IPSC shooters.
- Output: printable WSB with diagram, round count and scoring, for ROs and competitors.
- Placement is by eye (drag + grid snap); no build sheet in v1.
- Computer and iPad, mouse first; no phone.
- PWA: yes. Language: English only.
- WSB fields include procedure, start position, minimum rounds, gun condition and the IPSC terms.
- Tech: approach A; PDF via "Save as PDF".
- Printed brief: two A4 pages (map on page 1, 3D view and overflow text on page 2).

## Architecture

Pure modules (no DOM, no Three.js, testable with `node --test`) are kept apart from the
rendering and UI modules.

```
js/
  main.js                 boot: load project, wire UI, start renderer
  model/                  PURE: the stage as data
    schema.js             stage JSON schema version, validate(json) → {ok, errors}
    stage.js              createStage, add/update/remove object, ids (crypto.randomUUID)
    history.js            undo/redo as a stack of commands over the stage data
    numbering.js          assign T/P/NS labels, keep manual overrides, no duplicates
    stats.js              counts, minimum rounds, maximum points, stage type
    scoring-rules.js      constants + rulebook edition (see below)
    snap.js               grid and angle snapping
    props.js              prop catalogue: type, category, default dimensions, parameters
  render/                 Three.js
    engine.js             renderer, scene, resize, render loop (render on demand)
    stage-view.js         builds/updates meshes from stage data (keyed by object id)
    builders/*.js         one geometry builder per prop family (target, steel, wall, port, …)
    environments/*.js     technical.js, outdoor.js: ground, sky, lights, shadows; own scene group
    camera.js             orbit controls, presets, shooter's eye
    picking.js            raycast select, drag on ground plane, rotate handle
    labels.js             T1/P1/NS1 labels (canvas sprites, always face camera)
  ui/                     DOM, Låda Glass
    toolbar.js, library.js, inspector.js, briefing.js, projects.js, about.js
    print.js              fills print.html from stage data + snapshots
  storage/
    db.js                 IndexedDB: projects store, autosave (debounced)
    files.js              JSON export (download) / import (validate first)
print.html + css/print.css  A4 print layout
sw.js + manifest.webmanifest + icons/   PWA
```

Scene graph: `scene → { environmentGroup, stageGroup, helperGroup }`. Environments only touch
`environmentGroup` and lights; `stage-view` only touches `stageGroup`. Stage data never holds
Three.js objects; the view is rebuilt from data.

### Stage data (JSON, schema version 1)

```json
{
  "schema": 1,
  "id": "uuid", "name": "Stage 1", "created": "ISO", "modified": "ISO",
  "bay": { "width": 20, "depth": 30 },
  "settings": { "grid": 0.25, "angleSnap": 15, "environment": "technical" },
  "objects": [
    { "id": "uuid", "type": "paper-ipsc", "label": "T1", "labelManual": false,
      "position": [x, z], "rotation": 0, "params": { "mountHeight": 1.0 } }
  ],
  "lines": [
    { "id": "uuid", "type": "fault-line", "points": [[x, z], …], "closed": false }
  ],
  "start": { "position": [x, z], "facing": 0 },
  "briefing": { "matchName": "", "stageNumber": 1, "designer": "", "startSignal": "Audible",
                "startPosition": "", "gunCondition": "", "procedure": "", "stopTime": "Last shot",
                "notes": "", "scoring": "Comstock" },
  "camera": { "position": [x, y, z], "target": [x, y, z] }
}
```

Coordinates in metres; x = across the bay, z = down range (0 at the uprange edge), y = up.
Objects stand on the ground, so they store `[x, z]` and a rotation about y in degrees. `environment`
is a view setting stored in `settings`, never on objects.

### Scoring rules (to verify before coding)

`scoring-rules.js` holds, with the rulebook edition named in a comment and in the About dialog:
hits per paper target (2), per steel target (1), points per A-zone hit (5), per steel hit (5),
no-shoots count 0 rounds and 0 points, and the stage-type limits (short ≤ 12, medium ≤ 24,
long ≤ 32 rounds). These values are believed correct but **must be checked against the current
IPSC Handgun Competition Rules** in the first implementation task; the edition used is recorded.

## Testing

- `node --test` for all pure modules: schema validation (accepts good, rejects bad/hostile JSON),
  add/move/rotate/delete/duplicate + undo/redo, numbering, stats, snapping, save/load round trip
  (positions and rotations identical), and **environment switch leaves stage JSON byte-identical**.
- Builders tested for real dimensions where they're pure functions of params (bounding box =
  catalogue dimensions).
- Browser checks with Playwright: the app loads with no console errors, place a target, see the
  stats update, print layout renders; screenshots for the README at 768, 1024, 1280 px.
- `responsive-reviewer` and `design:accessibility-review` before shipping.

## Left to the builder

Exact mesh/texture technique for the wire mesh (alpha texture on a framed panel is fine), shadow
quality settings, label styling, the precise toolbar layout within Låda Glass, IndexedDB store
layout, debounce times, and the service worker cache strategy (cache app files per version).
