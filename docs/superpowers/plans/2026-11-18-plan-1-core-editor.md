# Plan 1 of 3: Core Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working in-browser 3D stage editor: set a bay, place, move, rotate, duplicate and delete
the v1 props, draw fault lines, see live target numbers and round/point counts, and switch between
the Technical and Outdoor surroundings without touching the stage.

**Architecture:** Pure, immutable stage-data modules in `js/model/` (no DOM, no Three.js) are the
single source of truth and are fully covered by `node --test`. `js/render/` turns stage data into a
Three.js scene (`stageGroup`) beside a separate `environmentGroup`. `js/ui/` is Låda Glass DOM that
dispatches edits through the undo history. No build step: ES modules plus an inline import map.

**Tech Stack:** Three.js 0.187.0 (vendored, plus OrbitControls and TransformControls addons), plain
ES2023 modules, Låda Glass 2.3.0, `node --test`, ESLint 9, Playwright MCP for browser checks.

**Spec:** `docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md`

**Later plans** (written after this one ships, against its real interfaces):
Plan 2 Briefing + print (WSB editor, two-page A4 print layout, top-down map, scale bar).
Plan 3 Storage + PWA (IndexedDB autosave, project list, JSON export/import, persist(), "not
exported since" hint, manifest, service worker, install hint). Until Plan 3, a reload loses the stage.

## Global Constraints

- 1 world unit = 1 metre. x across the bay, centred (x ∈ [−width/2, width/2]); z down range,
  0 at the uprange edge (z ∈ [0, depth]); y up. Rotation is degrees about y, normalised to [0, 360).
- Bay default 20 × 30 m; width and depth each 1–200 m. Grid snap default 0.25 m; angle snap 15°.
- Stage data is plain JSON, never holds Three.js objects; every model function returns a new stage
  and never mutates its input.
- Environments touch only `environmentGroup`, lights, background and fog; never stage data.
- CSP stays `script-src 'self'` plus exactly one `sha256-` hash for the inline import map; no
  `unsafe-inline`/`unsafe-eval`; nothing loaded from other hosts.
- Untrusted or user text goes into the DOM with `textContent` only (ESLint no-unsanitized enforces).
- Låda Glass `lg-` components and tokens for all chrome; don't edit `vendor/lada-glass/`.
- Computers and iPads: touch targets ≥ 44 px, every action has an on-screen button, nothing
  hover-only; below 768 px show only "Dynamic-Stagebuilder needs a computer or an iPad." English.
- Scoring constants cite the IPSC rulebook edition they come from.
- Commits: author `25682725+jozeta@users.noreply.github.com`, stage only files you changed,
  end messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Dragging or placing an object beyond the bay edge → it stops at the edge (Task 4 `clampToBay`
   test; Task 11 uses it for every drag and placement).
2. Hand-typed label that collides with an automatic one (user types "T1" while another target is
   auto T1) → reported as a duplicate, and Renumber moves the *automatic* one (Task 5 test).
3. Rotation drift and wrap: 345° + 30° → 15°, −15° → 345°, 24 × 15° steps → exactly 0 (Task 4 test).
4. Undo/redo at the edges: undo with no past and redo with no future are no-ops; a new edit after
   undo clears redo; history caps at 200 steps (Task 3 tests).
5. Malformed or hostile stage JSON (`__proto__` keys, NaN, unknown prop types, 10 000 objects,
   strings of 1 MB) → rejected with readable errors, never partially applied (Task 6 tests); Plan 3
   import relies on this.

---

### Task 1: Tooling, vendored Three.js and module boot

**Files:**
- Modify: `package.json` (devDependencies `three: "0.187.0"` exact, `globals: "^16"`)
- Create: `vendor/three/0.187.0/` with `three.module.js`, `three.core.js`, `addons/controls/OrbitControls.js`,
  `addons/controls/TransformControls.js`, `LICENSE`, `VERSION` (contains `0.187.0`)
- Create: `js/main.js` (boot), `js/render/engine.js`
- Delete: `js/app.js`
- Modify: `index.html` (import map, CSP hash, module script, app layout skeleton), `eslint.config.js`
  (browser globals from `globals.browser`, node globals for `tests/**`)
- Modify: `tests/page.test.mjs`; Create: `tests/vendor.test.mjs`

**Interfaces:**
- Produces: `createEngine(canvas: HTMLCanvasElement) → { scene, camera, renderer,
  groups: { environment: Group, stage: Group, helper: Group }, requestRender(): void, resize(): void,
  onRender(fn): void, dispose(): void }`. Renders on demand (only after `requestRender`), resizes
  with a `ResizeObserver`, `renderer.shadowMap.enabled = true`.
- Import map: `"three"` → `./vendor/three/0.187.0/three.module.js`, `"three/addons/"` →
  `./vendor/three/0.187.0/addons/`. Node tests resolve `three` from `node_modules` (same version).

- [ ] **Step 1: Write the failing tests**

`tests/page.test.mjs` adds:
```js
test("CSP allows the inline import map by its sha256 hash and nothing else inline", () => {
  const map = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1];
  const hash = createHash("sha256").update(map).digest("base64");
  assert.match(html, new RegExp(`script-src 'self' 'sha256-${hash.replace(/[+/]/g, "\\$&")}'`));
  assert.equal((html.match(/<script(?![^>]*\bsrc=)(?![^>]*importmap)/g) || []).length, 0);
});
test("boots js/main.js as a module", () => {
  assert.match(html, /<script type="module" src="js\/main.js"><\/script>/);
});
```
`tests/vendor.test.mjs`:
```js
test("vendored Three.js matches the pinned devDependency", () => {
  assert.equal(readFileSync("vendor/three/0.187.0/VERSION", "utf8").trim(), pkg.devDependencies.three);
});
test("import map points at files that exist", () => { /* parse map, assert existsSync for each target */ });
```

- [ ] **Step 2: Run** `npm install && npm test` — Expected: the three new tests FAIL.

- [ ] **Step 3: Implement.** `npm install` then copy `node_modules/three/build/three.module.js`,
  `three.core.js`, `LICENSE` and the two control files from `node_modules/three/examples/jsm/controls/`
  into the vendor folder (check whether the addons import other addon files; copy those too and keep
  relative paths). Add the import map and hash to `index.html`; replace the starter card with the
  app skeleton: `<header class="toolbar">`, `<aside id="library">`, `<main><canvas id="viewport">`,
  `<aside id="inspector">`, `<p class="small-screen">`. `main.js` creates the engine and a 20 × 30 m
  grey ground plane so something renders.

- [ ] **Step 4: Verify.** `npm test` PASS, `npm run lint` clean. Serve with
  `python3 -m http.server 8002`, open `http://localhost:8002/` with Playwright: canvas shows the
  ground, no console errors, no CSP violations.

- [ ] **Step 5: Commit** `feat: vendor Three.js 0.187.0 and boot an empty 3D viewport`

### Task 2: Prop catalogue and scoring constants, verified against the IPSC rules

**Files:**
- Create: `js/model/props.js`, `js/model/scoring-rules.js`
- Test: `tests/props.test.mjs`

**Interfaces:**
- Produces: `PROPS: Readonly<Record<string, PropDef>>`;
  `PropDef = { type, name, category: "paper"|"steel"|"wall"|"obstacle", scoring: "paper"|"steel"|"noshoot"|null,
  params: Record<string, { default: number|string, min?, max?, step?, options?: string[] }> }`;
  `getProp(type) → PropDef` (throws `Unknown prop type: <type>`);
  `defaultParams(type) → object`; `dimensionsOf(obj) → { w, h, d }` in metres (overall bounding
  box including stand/frame, computed from params).
- Produces: `SCORING = { edition: string, hitsPerPaper: 2, hitsPerSteel: 1, pointsPerPaperHit: 5,
  pointsPerSteelHit: 5, courseLimits: { Short: 12, Medium: 24, Long: 32 } }` (frozen; values as
  found in the rules).
- Types (exact strings): `paper-ipsc`, `paper-mini`, `noshoot`, `noshoot-mini`, `popper`,
  `mini-popper`, `plate-round`, `plate-square`, `wall-mesh`, `wall-wood`, `wall-port`, `barrel`,
  `tyre`, `tyre-stack`, `crate`.
- Params: paper/no-shoot `mountHeight` (0.3–2.0, default 1.0 = height of target bottom);
  steel `baseHeight` (0–1.5, default 0 for poppers, 1.0 for plates);
  walls `length` (0.5–4, default 2), `height` (0.5–2.5, default 2); `wall-mesh` `mesh` options
  `black|blue`, `frame` options `black|wood`; `wall-port` `portWidth` (0.2–1.5, default 0.4),
  `portHeight` (0.2–1.5, default 0.4), `portBottom` (0.1–2.0, default 1.0);
  `tyre-stack` `count` (1–6, default 3); `crate` `size` (0.3–1.2, default 0.6).

- [ ] **Step 1: Research (no code).** With WebSearch/WebFetch, open the current IPSC Handgun
  Competition Rules (ipsc.org) and record: edition/date; hits per paper and steel target in Comstock;
  point values; the course-type definitions (Short/Medium/Long, including any criteria beyond round
  count); and the target appendix dimensions for the IPSC target, mini target, popper, mini popper,
  round and square plates. Put the edition, the rule numbers and the source URL in a comment at the
  top of `scoring-rules.js`. If course types depend on more than rounds, note it there: the UI will
  say "suggested from round count". If any value differs from the Interfaces above, the rules win;
  update the tests accordingly and tell Johan in the task report.

- [ ] **Step 2: Write the failing tests** — every type in the list exists and has a category;
  `getProp("nope")` throws; `defaultParams("wall-mesh")` deep-equals
  `{ length: 2, height: 2, mesh: "black", frame: "black" }`; `dimensionsOf` for `paper-ipsc` with
  default params has `h` = mountHeight + target height from the rules (±0.005); `dimensionsOf` for
  `wall-port` equals the wall's length × height; `SCORING` is frozen and `SCORING.edition` is a
  non-empty string.

- [ ] **Step 3: Run** `npm test` — Expected: FAIL (modules missing).

- [ ] **Step 4: Implement** both modules (freeze nested objects).

- [ ] **Step 5: Run** `npm test` — Expected: PASS. **Commit** `feat: prop catalogue and IPSC scoring constants`

### Task 3: Stage model and undo history

**Files:**
- Create: `js/model/stage.js`, `js/model/history.js`
- Test: `tests/stage.test.mjs`, `tests/history.test.mjs`

**Interfaces:**
- Consumes: `defaultParams`, `getProp` (Task 2).
- Produces (`stage.js`, all pure, return new objects):
  `createStage({ name = "Stage 1", width = 20, depth = 30 } = {}) → Stage` (shape exactly as in
  the spec's "Stage data" section; `start: null`, `camera: null`, `briefing` defaults from the spec);
  `addObject(stage, type, position: [x,z], rotation = 0, params = {}) → { stage, id }` (merges
  `defaultParams`, `label: null`, `labelManual: false`);
  `updateObject(stage, id, patch: { position?, rotation?, params? }) → Stage` (params merged);
  `removeObjects(stage, ids: string[]) → Stage` (also removes lines with those ids);
  `duplicateObjects(stage, ids, offset = [0.5, 0.5]) → { stage, ids }` (new ids, `label: null`,
  `labelManual: false`);
  `addLine(stage, type: "fault-line"|"shooting-area", points: [x,z][], closed: boolean) → { stage, id }`;
  `updateLine(stage, id, points) → Stage`; `setStart(stage, position, facing) → Stage`;
  `setSetting(stage, key: "grid"|"angleSnap"|"environment", value) → Stage`;
  `setBay(stage, width, depth) → Stage`;
  `pruneSelection(selection: string[], stage) → string[]` (keeps ids that still exist).
  Ids from `crypto.randomUUID()`.
- Produces (`history.js`, pure): `createHistory(stage, limit = 200) → History`
  (`{ past: Stage[], present: Stage, future: Stage[], limit }`); `commit(h, stage) → History`
  (no-op if `stage === h.present`); `undo(h)`; `redo(h)`; `canUndo(h)`; `canRedo(h)`. Snapshots,
  not commands: stages are small and immutable, so structural sharing keeps memory low.
  *(Changes the spec's "stack of commands" wording on purpose: same behaviour, simpler.)*

- [ ] **Step 1: Write the failing tests.** `stage.test.mjs`: createStage defaults (`bay` 20 × 30,
  `settings` `{ grid: 0.25, angleSnap: 15, environment: "technical" }`, `schema: 1`); addObject
  returns a new stage and leaves the input deep-equal to a `structuredClone` taken before; updateObject
  merges params; removeObjects; duplicate gives fresh ids and offset positions; pruneSelection drops a
  removed id. `history.test.mjs`: undo/redo round trip; undo on fresh history returns the same
  history; commit after undo empties `future`; 205 commits keep `past.length === 200`.

- [ ] **Step 2: Run** `npm test` — Expected: FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.

- [ ] **Step 5: Commit** `feat: immutable stage model with undo history`

### Task 4: Snapping and bay clamping

**Files:** Create `js/model/snap.js`; Test `tests/snap.test.mjs`

**Interfaces:**
- Produces: `snapValue(v, step) → number` (step 0 = no snap; result rounded to 1e-9 to kill float
  noise); `snapPoint([x,z], step) → [x,z]`; `normalizeAngle(deg) → [0,360)`;
  `snapAngle(deg, step) → [0,360)`; `clampToBay([x,z], bay, margin = 0) → [x,z]`.

- [ ] **Step 1: Write the failing tests:** `snapValue(0.3, 0.25) === 0.25`; `snapValue(0.13, 0.25) === 0.25`;
  `snapValue(-0.13, 0.25) === -0.25`; `snapValue(0.37, 0) === 0.37`; `snapAngle(345 + 30, 15) === 15`;
  `snapAngle(-15, 15) === 345`; 24 additions of 15 from 0 via `snapAngle` → `0`;
  `clampToBay([12, -1], { width: 20, depth: 30 }) ` deep-equals `[10, 0]`;
  `clampToBay([0, 31], bay, 0.5)` deep-equals `[0, 29.5]`.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS). **Step 5: Commit** `feat: grid/angle snapping and bay clamping`

### Task 5: Target numbering and stage statistics

**Files:** Create `js/model/numbering.js`, `js/model/stats.js`; Test `tests/numbering.test.mjs`, `tests/stats.test.mjs`

**Interfaces:**
- Consumes: `getProp` (scoring kind), `SCORING`.
- Produces (`numbering.js`): `labelPrefix(type) → "T"|"P"|"NS"|null` (paper → T, steel → P,
  noshoot → NS, others null); `assignLabels(stage) → Stage` (every scoring object with
  `label === null` gets prefix + (highest number in use for that prefix + 1), in array order; gaps
  are kept); `renumber(stage) → Stage` (non-manual labels become 1…n per prefix in array order,
  skipping numbers taken by manual labels); `setLabel(stage, id, text) → Stage` (trimmed text, max 12
  chars, sets `labelManual: true`; empty text → `label: null, labelManual: false`, then
  `assignLabels`); `duplicateLabels(stage) → string[]`.
- Produces (`stats.js`): `stageStats(stage, rules = SCORING) → { paper, steel, noShoots,
  minRounds, maxPoints, suggestedType: "Short"|"Medium"|"Long"|null, overLimit: boolean }`.
  `minRounds = paper × hitsPerPaper + steel × hitsPerSteel`; `maxPoints` likewise with points;
  type = first limit ≥ minRounds; `minRounds > Long limit` → `"Long"` and `overLimit: true`;
  0 rounds → `null`.

- [ ] **Step 1: Write the failing tests:** three paper + one popper + one no-shoot → T1 T2 T3 P1 NS1;
  delete T2, add paper → T4 (gap kept); renumber → T1 T2 T3; manual "T1" on the third target while
  another is auto T1 → `duplicateLabels` returns `["T1"]`, after renumber the manual one stays T1,
  auto ones become T2, T3; `setLabel(stage, id, "")` restores auto. Stats with the Task 2 values:
  6 paper + 2 steel → `minRounds 14, maxPoints 70, suggestedType "Medium"`; 17 paper → 34 rounds,
  `"Long"`, `overLimit true`; empty stage → `suggestedType null`; no-shoots and walls add nothing.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS). **Step 5: Commit** `feat: automatic target numbering and stage statistics`

### Task 6: Stage schema validation

**Files:** Create `js/model/schema.js`; Test `tests/schema.test.mjs`

**Interfaces:**
- Consumes: `PROPS`, `getProp`.
- Produces: `SCHEMA_VERSION = 1`; `validateStage(json: unknown) → { ok: true, stage } | { ok: false, errors: string[] }`.
  Builds a fresh object from known keys only (unknown keys dropped, `__proto__`/`constructor`
  keys never copied). Limits: `schema === 1`; bay width/depth finite 1–200; ≤ 2 000 objects, ≤ 500
  lines, ≤ 500 points per line (≥ 2); ids strings ≤ 64 chars, unique; `type` in `PROPS`;
  positions finite and within the bay ± 5 m; rotation finite; params only the type's keys, numbers
  within min/max, strings within `options`; labels ≤ 12 chars; name ≤ 120 chars; each briefing field
  ≤ 4 000 chars; `settings.environment` in `["technical", "outdoor"]`. Errors are short English
  sentences naming the path, e.g. `objects[3].type: unknown prop type "laser"`.

- [ ] **Step 1: Write the failing tests:** `validateStage(createStage())` ok and deep-equal; a stage
  with objects round-trips through `JSON.stringify`/`parse` + validate unchanged (positions, rotations,
  params, labels identical); rejects: `schema: 2`, NaN position (as `null` after JSON), unknown type,
  10 000 objects, a 1 MB procedure string, duplicate ids; `JSON.parse('{"__proto__":{"x":1},…}')`
  validates without polluting `Object.prototype` (`({}).x === undefined`); errors array is non-empty
  and every entry is a string.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS). **Step 5: Commit** `feat: strict stage schema validation`

### Task 7: Prop builders: targets and steel

**Files:**
- Create: `js/render/materials.js`, `js/render/builders/paper.js`, `js/render/builders/steel.js`,
  `js/render/builders/index.js`
- Test: `tests/builders.test.mjs`

**Interfaces:**
- Consumes: `dimensionsOf`, `getProp`.
- Produces: `buildProp(obj) → THREE.Group` (origin at the object's ground point, y = 0 at the
  bottom, front faces −z i.e. uprange at rotation 0; `group.userData.id = obj.id`; not yet
  positioned/rotated: stage-view does that); `materials.get(name) → Material` (shared, cached;
  names `target-tan`, `noshoot-white`, `steel`, `stick-wood`, `mesh-black`, `mesh-blue`, `frame-black`,
  `wood`, `rubber`, `barrel`, `fault-red`); textures only when `typeof document !== "undefined"`
  (generated on a canvas: mesh wire pattern with alpha, wood grain), so builders run in Node.
- Shapes: IPSC/mini paper targets as their octagonal outline (`THREE.Shape` from the rule-book
  dimensions, thin extrusion) with a thin scoring-zone outline on the front, on one or two wooden
  sticks to the ground; no-shoots white; popper as a lathe/extruded silhouette on a base plate;
  plates as a disc/box on a post (`baseHeight`).

- [ ] **Step 1: Write the failing tests:** for each paper and steel type with default params,
  `new Box3().setFromObject(buildProp(obj))` has size within 0.01 m of `dimensionsOf(obj)` and
  `min.y` within 0.001 of 0; `userData.id` set; two builds share the same material instance.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS). **Step 5: Commit** `feat: 3D builders for paper and steel targets`

### Task 8: Prop builders: walls, ports, obstacles, lines and the start marker

**Files:**
- Create: `js/render/builders/walls.js`, `js/render/builders/obstacles.js`, `js/render/builders/lines.js`
- Modify: `js/render/builders/index.js`
- Test: `tests/builders.test.mjs`

**Interfaces:**
- Produces: `buildProp` handles `wall-*`, `barrel`, `tyre`, `tyre-stack`, `crate`;
  `buildLine(line) → THREE.Group` (fault line: 0.1 m wide × 0.05 m high red bars along each segment,
  plus the closing segment when `closed`; shooting area: same bars with a faint fill);
  `buildStartMarker(start) → THREE.Group` (1 × 1 m square on the ground with an arrow toward
  `facing`).
- Walls: frame 0.04 m square posts and rails around a mesh panel; mesh panel colour from
  `params.mesh`, frame from `params.frame`; `wall-wood` solid 0.02 m panel; `wall-port` built with
  `THREE.Shape` + hole + `ExtrudeGeometry` so the port is a real opening.

- [ ] **Step 1: Write the failing tests:** wall boxes match `dimensionsOf` (±0.01 m); a `Raycaster`
  from 1 m in front of a `wall-port`, aimed at the port centre, hits nothing in the wall; aimed
  0.3 m beside the port, hits the wall; a 3-point closed fault line produces 3 bars; an open one
  produces 2; changing `params.mesh` to `blue` uses `mesh-blue`.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS). **Step 5: Commit** `feat: walls with real ports, obstacles and fault lines`

### Task 9: Stage view and environments (geometry never changes)

**Files:**
- Create: `js/render/stage-view.js`, `js/render/environments/technical.js`,
  `js/render/environments/outdoor.js`, `js/render/environments/index.js`
- Modify: `js/render/engine.js` (`setEnvironment`), `js/main.js`
- Test: `tests/stage-view.test.mjs`, `tests/environment.test.mjs`

**Interfaces:**
- Consumes: `buildProp`, `buildLine`, `buildStartMarker`, `createEngine`.
- Produces: `createStageView(group, { labelFactory = null } = {}) → { sync(stage): void,
  objectFor(id): Object3D|undefined, idFor(object3d): string|undefined, dispose(): void }`.
  `sync` diffs by id against the last stage: rebuilds an item only when its JSON changed, removes
  deleted ones (disposing their geometries; shared materials are never disposed), sets
  position `(x, 0, z)` and `rotation.y = −deg × π/180`, adds a label from `labelFactory(text)` above
  scoring targets.
- Produces: `createEnvironment(name: "technical"|"outdoor", bay) → { group, lights: Light[],
  background: Color|Texture, fog: Fog|null, dispose() }`; `engine.setEnvironment(name, bay)` swaps
  the environment group, lights, `scene.background` and `scene.fog`, disposing the old ones.
  Technical: grey tile ground (1 m tiles, grid lines), low light grey walls round the bay, soft
  hemisphere + directional light. Outdoor: dirt ground (canvas noise texture), earth berm, warm
  directional sun with shadows, sky colour.

- [ ] **Step 1: Write the failing tests:** `stage-view.test.mjs`: sync of a stage with 3 objects and
  1 line gives 4 children whose `idFor` round-trips; moving one object and syncing again rebuilds only
  that child (others are the same instances); removing one removes its child. `environment.test.mjs`:
  build a stage with every prop type, a fault line and a start; take `before = structuredClone(stage)`;
  create a stage view and `sync(stage)`; create, dispose and create both environments twice; assert
  `stage` deep-equals `before`, and the stage group's children (ids, positions, rotations) are
  unchanged; `createEnvironment` never adds to the stage group.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS).

- [ ] **Step 5: Verify in browser:** `main.js` builds a hard-coded demo stage (a few targets, walls,
  a barrel and a fault line) and a temporary environment toggle; Playwright screenshots in both
  environments look like the reference images in spirit; no console errors.

- [ ] **Step 6: Commit** `feat: stage view and Technical/Outdoor environments kept separate`

### Task 10: Camera presets and labels

**Files:** Create `js/render/camera.js`, `js/render/labels.js`; Modify `js/main.js`

**Interfaces:**
- Consumes: `engine`, `OrbitControls`.
- Produces: `createCameraRig(engine, domElement) → { controls, preset(name: "top"|"iso"|"front"|"shooter", stage), frameAll(stage), dispose() }`.
  `iso`: from uprange-left, ~35° down, whole bay in view; `top`: straight down; `front`: from behind
  the uprange edge at 1.7 m; `shooter`: eye at 1.6 m at `stage.start.position` facing `start.facing`
  (falls back to the uprange centre if no start). Orbit controls emit `change` → `requestRender`.
  Touch: one finger rotates, two fingers pan/zoom (OrbitControls defaults).
- Produces: `createLabel(text) → THREE.Sprite` (white bold text on a transparent canvas texture,
  sized ~0.25 m high, `depthTest: false`, always readable), used as the stage view's `labelFactory`.

- [ ] **Step 1: Verify in browser (no unit test: needs WebGL).** Each preset via a temporary key
  press shows the expected view in a Playwright screenshot; labels T1/P1/NS1 float above targets.

- [ ] **Step 2: Commit** `feat: camera presets, shooter's eye and target labels`

### Task 11: Editing: select, place, drag, rotate, draw lines

**Files:**
- Create: `js/render/ground.js` (pure), `js/render/picking.js`, `js/editor.js` (no DOM, no Three.js)
- Test: `tests/ground.test.mjs`, `tests/editor.test.mjs`

**Interfaces:**
- Produces (`ground.js`): `groundPoint(origin: [x,y,z], dir: [x,y,z]) → [x,z] | null` (ray hits
  y = 0 in front of the origin; null if parallel or behind).
- Produces (`editor.js`): `createEditor({ onChange }) → { state: { history, selection, mode },
  dispatch(action), stage(), }` where `mode` is `"select" | { place: type } | { draw: lineType, points } | "start"`
  and actions are `{ type: "place"|"move"|"rotate"|"setParams"|"delete"|"duplicate"|"select"|
  "undo"|"redo"|"renumber"|"setLabel"|"setEnvironment"|"setBay"|"beginDraw"|"addPoint"|
  "finishDraw"|"cancel"|"setStart", … }`. Each edit action runs the Task 3–5 functions, then
  `assignLabels`, then `commit`, then `pruneSelection`, then `onChange`. Positions are snapped with
  `settings.grid` and clamped with `clampToBay`; rotations with `settings.angleSnap`. A whole drag is
  **one** history step (commit on pointer-up, preview during the drag). `setEnvironment` changes
  only `settings.environment` and replaces `history.present` without adding an undo step (it is a
  view choice, not an edit).
- Produces (`picking.js`): `attachPicking(engine, stageView, editor, cameraRig)`: pointer events
  on the canvas; tap/click selects (Shift adds); drag on a selected object moves it on the ground
  (orbit disabled during the drag); in place mode a tap places at the snapped point; in draw mode
  taps add points, double-click / Enter / "Finish" ends, Escape cancels; TransformControls in
  rotate mode, Y axis only, on a single selection. Mouse DnD: dropping a library item on the canvas
  places it at the drop point.

- [ ] **Step 1: Write the failing tests:** `groundPoint([0,10,0],[0,-1,0])` → `[0,0]`;
  `groundPoint([0,1.6,0],[0,0,1])` → `null`; ray pointing up → `null`; 45° ray from y = 2 lands
  2 m away. `editor` (pure enough for Node: no DOM): place → stage has 1 object labelled T1 and
  `canUndo`; move to `[11.1, 3.13]` in a 20 m bay → `[10, 3.25]`; rotate by 30 from 345 → 15;
  delete selected → selection empty; undo restores object and label; `setEnvironment("outdoor")`
  leaves `bay`, `objects`, `lines` and `start` deep-equal to before and `canUndo` unchanged.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS).

- [ ] **Step 5: Commit** `feat: select, place, drag, rotate and draw on the stage`

### Task 12: Låda Glass UI: toolbar, library, inspector, stats, shortcuts, About

**Files:**
- Create: `js/ui/toolbar.js`, `js/ui/library.js`, `js/ui/inspector.js`, `js/ui/stats.js`,
  `js/ui/shortcuts.js`, `js/ui/about.js`
- Modify: `index.html`, `css/app.css`, `js/main.js`, `README.md`, `CHANGELOG.md`, `CLAUDE.md`
- Test: `tests/page.test.mjs` (small-screen message and About element present)

**Interfaces:**
- Consumes: `editor.dispatch`, `editor.state`, `stageStats`, `duplicateLabels`, `PROPS`,
  `cameraRig.preset`, `cameraRig.frameAll`.
- Toolbar (left to right, each an `lg-` icon button with a visible tooltip label and `aria-label`):
  Undo, Redo | Duplicate, Delete | Fault line, Shooting area, Start position | Renumber |
  Environment (Technical/Outdoor segmented control) | Top, Iso, Front, Shooter's eye, Frame all |
  About. Disabled state when an action can't run.
- Library: search field + categories Paper, Steel, Walls, Obstacles; each item a ≥ 44 px button
  (tap = place mode, mouse drag = drag-and-drop); Escape leaves place mode.
- Inspector: for one selection, label field (`setLabel`), rotation number field + −15°/+15°
  buttons, and a field per param from `PropDef.params` (number with min/max/step, or select for
  options); for several, count + Duplicate/Delete; with nothing selected, bay width/depth and grid
  and angle snap.
- Stats panel: Paper, Steel, No-shoots, Min rounds, Max points, Suggested type ("suggested from
  round count" if Task 2 found other criteria); warning chip when `overLimit` or duplicate labels.
- Shortcuts: ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z, ⌘/Ctrl+D, Delete/Backspace, Escape, Q/E rotate −/+ angle
  snap, F frame all, 1–4 camera presets; ignored while typing in a field.
- About: `lg-` dialog with name, version (fetched from `./package.json`), the IPSC rulebook edition
  from `SCORING.edition`, and "MIT licence".
- Below 768 px: only the `.small-screen` message is shown (CSS media query, no JS).

- [ ] **Step 1: Write the failing test:** `index.html` contains the `.small-screen` text from Global
  Constraints and an About trigger; `css/app.css` has a `max-width: 767px` rule.

- [ ] **Step 2–4:** Run (FAIL), implement, run (PASS); `npm run lint` clean.

- [ ] **Step 5: Verify in browser (Playwright):** at 1280 and 1024 px, place a paper target from the
  library → stats show Min rounds 2, Max points 10 and a T1 label; drag it, rotate with E, Undo;
  draw a 3-point fault line; switch to Outdoor and back, nothing moves; open About and see 0.1.0;
  no console errors. At 768 px the layout fits with no sideways scrolling; at 375 px only the
  message shows. Then run the `responsive-reviewer` agent and `design:accessibility-review` and fix
  what they find that is in scope.

- [ ] **Step 6: Docs:** README "How to" for build a stage, number targets, switch surroundings;
  screenshots grid (editor in Technical, Outdoor, shooter's eye) via `claude-shots --write`;
  CHANGELOG Unreleased entries; CLAUDE.md layout section updated to the real files.

- [ ] **Step 7: Commit** `feat: editor UI with library, inspector, stats and shortcuts`
