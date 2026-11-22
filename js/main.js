// Boot: wire the editor (stage data + undo) to the 3D view and the Låda Glass panels.
import * as THREE from "three";
import { createEngine } from "./render/engine.js";
import { createStageView } from "./render/stage-view.js";
import { createLabel } from "./render/labels.js";
import { createCameraRig } from "./render/camera.js";
import { attachPicking } from "./render/picking.js";
import { createEditor } from "./editor.js";
import { getProp } from "./model/props.js";
import { demoStage } from "./demo.js";
import { createToolbar } from "./ui/toolbar.js";
import { createCameraPad } from "./ui/camera-pad.js";
import { askName } from "./ui/name-prompt.js";
import { selectionCentre } from "./model/camera-move.js";
import { createLibrary } from "./ui/library.js";
import { createBayDrawer } from "./ui/bay-draw.js";
import { onEarthLoaded } from "./render/environments/ground.js";
import { MAX_SHAPES } from "./model/bay.js";
import { createInspector } from "./ui/inspector.js";
import { createStats } from "./ui/stats.js";
import { attachShortcuts } from "./ui/shortcuts.js";
import { createAbout } from "./ui/about.js";
import { createBriefing } from "./ui/briefing.js";
import { createSettings } from "./ui/settings.js";
import { renderPrint, renderMatchPrint } from "./ui/print.js";
import { h, icon } from "./ui/dom.js";
import { createStage } from "./model/stage.js";
import { validateStage } from "./model/schema.js";
import { openStore, memoryStore } from "./storage/db.js";
import { decodeShare, encodeShare, shareHash, MAX_LINK } from "./storage/share.js";
import { cleanMatch, briefingFor, dropStageEverywhere } from "./model/match.js";
import { projectRecord, sortProjects, nextProjectAfterDelete } from "./storage/projects.js";
import { exportFileName, stageToJson, matchToJson, matchFileName } from "./storage/files.js";

// Save text as a file download (a same-origin blob link, removed straight after).
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = h("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
import { createProjects } from "./ui/projects.js";
import { createHelp } from "./ui/help.js";
import { createAnimator } from "./render/animate.js";
import { fadeFigures } from "./render/figure-fade.js";
import { createSurroundings } from "./ui/surroundings.js";
import { takeBuildingPieces } from "./model/surroundings.js";
import { libraryStage, STAGE_LIBRARY } from "./model/stage-library.js";
import { loadHidden, saveHidden, loadView, saveView, loadWalkSpeed, saveWalkSpeed, loadRunLook, saveRunLook, loadShapes, saveShapes } from "./ui/prefs.js";
import { withRunPart } from "./model/run-look.js";
import { setRunLook } from "./render/materials.js";
import { walkSpeed } from "./model/route.js";
import { revealOnSelect } from "./model/layout.js";
import { activationLinks } from "./model/activation.js";
import { isHidden } from "./model/layers.js";
import { measureText } from "./model/measure.js";
import { sightFrom, safetyRings } from "./model/safety.js";
import { eyeHeight } from "./model/positions.js";
import { createContextMenu } from "./ui/context-menu.js";
import { createLayers } from "./ui/layers.js";
import { createAutosave } from "./storage/autosave.js";
import { newId } from "./model/id.js";

const canvas = document.getElementById("viewport");
let engine;
try {
  engine = createEngine(canvas);
} catch (err) {
  showViewportError(err);
  throw err;
}

// DES-STATES-1: if WebGL can't start, say so in the viewport instead of leaving it blank.
function showViewportError(err) {
  console.error(err);
  document.getElementById("boot-state")?.remove();
  canvas.hidden = true;
  canvas.parentElement.append(h("div", { class: "lg-state lg-state-error viewport-state", role: "alert" }, [
    h("p", { class: "lg-state-title", text: "The 3D view could not start" }),
    h("p", { class: "lg-state-text", text: "Your browser may have WebGL turned off. Try the latest Safari, Chrome or Edge, or restart the browser." }),
  ]));
}
const view = createStageView(engine.groups.stage, { labelFactory: createLabel });
const rig = createCameraRig(engine, canvas);
let speed = loadWalkSpeed();                     // Shooter's eye walking speed (per browser)
let runLook = loadRunLook();                     // how the shooter's run is drawn (per browser)
setRunLook(runLook);
rig.setPace(walkSpeed(speed).pace);
const about = createAbout();

let envKey = "";
let lookShown = null;
const highlight = new THREE.Group();
const preview = new THREE.Group();
const measuring = new THREE.Group();
const rings = new THREE.Group();                 // safety distances round the targets that ask for them
engine.groups.helper.add(highlight, preview, measuring, rings);
const RING_COLOR = { bad: 0xd9483b, warn: 0xf0b93a };
let ringsFor = null;

// Rebuilt when the stage changes: a flat ring and a distance label (on the shooter's side) for each
// rulebook distance of every target with Show safety distances on (and not hidden).
function drawRings(stage) {
  if (stage === ringsFor) return;
  ringsFor = stage;
  for (const c of [...rings.children]) { rings.remove(c); c.geometry?.dispose(); c.material?.map?.dispose(); c.material?.dispose(); }
  for (const o of stage.objects) {
    if (!o.safetyRings || isHidden(stage, o)) continue;
    for (const r of safetyRings(o)) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r.radius - 0.05, r.radius + 0.05, 128),
        new THREE.MeshBasicMaterial({ color: RING_COLOR[r.level], transparent: true, opacity: 0.9, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(o.position[0], 0.025, o.position[1]);
      ring.renderOrder = 4;
      const label = createLabel(r.label);
      label.scale.multiplyScalar(2);
      label.position.set(o.position[0], 0.35, o.position[1] - r.radius);
      rings.add(ring, label);
    }
  }
}
const ACCENT = 0x5a93c4;

const hint = document.getElementById("hint");
const updaters = [];
let playButton = null;
const folds = {};                  // the side panels' fold controls (panels.js)
let surroundingsVersion = 0;       // bumped when your own surroundings change, so the 3D view rebuilds them
// Animated props: the animator moves the ones switched on while Play is on; the view then draws
// every frame, and only then.
const animator = createAnimator(engine.groups.stage);
let animStart = performance.now();
function animationFrame() {
  if (!animator.active()) return;
  animator.update((performance.now() - animStart) / 1000);
  engine.requestRender();
}
engine.onRender(animationFrame);
// Clouds drift with the wind while Play is on (and hold still on Pause); they keep the view
// drawing while they move.
let cloudTime = 0, lastFrame = performance.now();
engine.onRender(() => {
  const now = performance.now();
  const playing = animator.playing();
  if (playing) cloudTime += Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (engine.driftClouds(editor.stage().settings.look, cloudTime) && playing) engine.requestRender();
});
engine.onRender(() => fadeFigures(engine.groups.stage, engine.camera));   // figures fade as the camera comes close

// Selecting something new brings its settings into view: the inspector unfolds.
let shownSelection = [];
function revealInspector(selection) {
  const reveal = revealOnSelect(shownSelection, selection);
  shownSelection = [...selection];
  if (!reveal) return;
  dock.activate("inspector");                // its tab comes forward, unfolded
}

function render(state) {
  const stage = state.history.present;
  revealInspector(state.selection);
  view.sync(stage);
  animator.sync(stage);
  playButton?.update();
  if (animator.active()) engine.requestRender();
  if (editor) applyVisibility();            // rebuilt nodes: keep the viewed markers (and a hidden run) hidden
  const key = `${stage.settings.environment}|${JSON.stringify(stage.bay)}|${surroundingsVersion}`;      // size and shape
  if (key !== envKey) { envKey = key; lookShown = stage.settings.look; engine.setEnvironment(stage.settings.environment, stage.bay, stage.settings.look); }
  else if (stage.settings.look !== lookShown) { lookShown = stage.settings.look; engine.setLook(stage.settings.look, stage.bay); }

  // Selection outline.
  for (const c of [...highlight.children]) { highlight.remove(c); c.geometry?.dispose(); c.material?.map?.dispose(); c.material?.dispose(); }
  for (const id of state.selection) {
    const node = view.objectFor(id);
    if (node) highlight.add(new THREE.BoxHelper(node, ACCENT));
  }
  // Activation links of the selection: an orange dashed line on the ground, activator → target.
  for (const { target, activator } of activationLinks(stage)) {
    if (!state.selection.includes(target.id) && !state.selection.includes(activator.id)) continue;
    const pts = [activator.position, target.position].map(([x, z]) => new THREE.Vector3(x, 0.03, z));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xff9a2e, dashSize: 0.3, gapSize: 0.18, depthTest: false }));
    line.computeLineDistances();
    line.renderOrder = 5;
    highlight.add(line);
  }

  drawRings(stage);

  // Sight lines from a selected shooting position: thin green lines from its eye to each target seen.
  const pos = state.selection.length === 1 && !state.drag ? stage.objects.find((o) => o.id === state.selection[0] && o.type === "shooting-position") : null;
  if (pos) {
    const eye = eyeHeight(pos.params.stance);
    for (const { aim } of sightFrom(stage, pos.position, eye).seen) {
      const pts = [new THREE.Vector3(pos.position[0], eye, pos.position[1]), new THREE.Vector3(aim[0], aim[2], aim[1])];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x4fd18b, transparent: true, opacity: 0.85, depthTest: false }));
      line.renderOrder = 6;
      highlight.add(line);
    }
  }

  // Measurements: a dashed line on the ground with its length over the middle, and the first point
  // of the one being taken.
  for (const c of [...measuring.children]) { measuring.remove(c); c.geometry?.dispose(); c.material?.map?.dispose(); c.material?.dispose(); }
  for (const { a, b } of state.measures) {
    const pts = [a, b].map(([x, z]) => new THREE.Vector3(x, 0.05, z));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffd23f, dashSize: 0.25, gapSize: 0.12, depthTest: false }));
    line.computeLineDistances();
    line.renderOrder = 9;
    const label = createLabel(measureText(a, b));
    label.scale.multiplyScalar(3);             // readable from an overview, not only up close
    label.position.set((a[0] + b[0]) / 2, 0.45, (a[1] + b[1]) / 2);
    measuring.add(line, label);
  }
  if (state.mode?.measure && state.mode.from) {
    const [x, z] = state.mode.from;
    const dot = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.14, 20), new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false }));
    dot.rotation.x = -Math.PI / 2; dot.position.set(x, 0.06, z); dot.renderOrder = 9;
    measuring.add(dot);
  }

  // The line being drawn.
  for (const c of [...preview.children]) { preview.remove(c); c.geometry.dispose(); c.material.dispose(); }
  if (state.mode?.draw && state.mode.points.length) {
    const pts = state.mode.points.map(([x, z]) => new THREE.Vector3(x, 0.06, z));
    preview.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff5a4f })));
    preview.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ color: 0xff5a4f, size: 8, sizeAttenuation: false })));
  }

  picking?.updateGizmo();
  for (const u of updaters) u(state);
  updateHint(state);
  engine.requestRender();
}

function updateHint(state) {
  const m = state.mode;
  const stage = state.history.present;
  const cancel = h("button", { type: "button", class: "lg-btn", onclick: () => editor.dispatch({ type: "cancel" }), text: "Cancel" });
  let nodes = null;
  if (m?.place) nodes = [h("span", { text: `Tap the ground to place: ${getProp(m.place).name}.` }), cancel];
  else if (m?.draw) {
    const need = m.draw === "fault-line" ? 2 : 3;
    nodes = [h("span", { text: `Tap to add points (${m.points.length}). Double-click, Enter or Finish to end.` }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", disabled: m.points.length < need, onclick: () => editor.dispatch({ type: "finishDraw" }), text: "Finish" }), cancel];
  } else if (m === "start") nodes = [h("span", { text: "Tap the ground to set the start position." }), cancel];
  else if (m?.measure) {
    const last = state.measures.at(-1);
    const text = m.from ? "Tap the second point." : last ? `Last: ${measureText(last.a, last.b)}. Tap two more points for another.` : "Tap two points to measure. Near a prop they snap to it (Shift: don't).";
    nodes = [h("span", { text }),
      h("button", { type: "button", class: "lg-btn", disabled: !state.measures.length, onclick: () => editor.dispatch({ type: "clearMeasures" }), text: "Clear" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => editor.dispatch({ type: "cancel" }), text: "Done" })];
  }
  else if (!stage.objects.length && !stage.lines.length) nodes = [h("span", { text: "Empty stage. Pick a prop on the left, then tap the ground to place it." })];
  hint.hidden = !nodes;
  if (nodes) hint.replaceChildren(...nodes);
}

// Print: an isometric snapshot of the stage (without selection helpers), then the browser's print
// dialog, where "Save as PDF" makes the PDF.
function snapshot() {
  if (!canvas.clientWidth || !canvas.clientHeight) return null;   // hidden (already in print layout): no picture
  const cam = engine.camera.position.clone();
  const target = rig.controls.target.clone();
  const helperWas = engine.groups.helper.visible;
  engine.groups.helper.visible = false;
  rig.preset("iso", editor.stage());
  rig.frameAll(editor.stage());
  // Render about 2000 px wide whatever the screen, so the printed view is sharp on A4.
  const ratio = engine.renderer.getPixelRatio();
  engine.renderer.setPixelRatio(Math.min(4, 2000 / canvas.clientWidth));
  engine.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  engine.renderer.render(engine.scene, engine.camera);
  const url = canvas.toDataURL("image/jpeg", 0.92);    // much smaller than PNG, so it loads in time
  engine.renderer.setPixelRatio(ratio);
  engine.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  engine.groups.helper.visible = helperWas;
  engine.camera.position.copy(cam);
  rig.controls.target.copy(target);
  rig.controls.update();
  engine.requestRender();
  return url;
}
// The brief is built, and its 3D image fully decoded, before the print dialog opens: a large image
// that is still loading prints as a blank page 2. ⌘P / Ctrl+P (beforeprint) builds it too.
let printReady = false;
let printedStage = null;           // the stage the brief was last built from
async function buildPrint() {
  const root = document.getElementById("print");
  printedStage = editor.stage();
  renderPrint(root, printedStage, snapshot());
  const img = root.querySelector(".print-3d img");
  try { await img?.decode(); } catch { /* print without it rather than not at all */ }
}
async function printBrief() {
  await buildPrint();
  printReady = true;
  window.print();
  printReady = false;
}
window.addEventListener("beforeprint", () => {
  if (printReady || printedStage === editor.stage()) return;      // already built for this stage
  printedStage = editor.stage();
  renderPrint(document.getElementById("print"), printedStage, snapshot());
});

// While Shooter's eye looks from the start ("start") or a shooting position, that marker (with its
// man) and the selection helpers are hidden, as they would sit right round the camera; walking from
// one to the next, both are hidden until it arrives. Settings → View can hide the figures, the
// position marks or the route (the start box stays).
let viewing = "";
let viewingList = [];
function applyVisibility() {
  const stage = editor.stage();
  const byId = new Map(stage.objects.map((o) => [o.id, o]));
  for (const node of engine.groups.stage.children) {
    const id = node.userData.id;
    const o = byId.get(id);
    node.visible = !viewingList.includes(id) && (id !== "route" || runLook.route.show) && !(o && isHidden(stage, o));
    node.traverse((c) => { const part = c.userData.runPart; if (part) c.visible = runLook[part].show; });
  }
  engine.groups.helper.visible = !viewingList.length;
  engine.requestRender();
}
function viewingFrom(ids) {
  const list = [].concat(ids ?? []).filter(Boolean);
  const key = list.join(" ");
  if (viewing === key) return;
  viewing = key;
  viewingList = list;
  applyVisibility();
}

let picking = null;
let briefing = null;
let settings = null;
const editor = createEditor({ stage: demoStage(), onChange: (state) => { render(state); scheduleSave(); } });
picking = attachPicking({ engine, stageView: view, editor, cameraRig: rig, canvas });

// --- Saved projects: autosave 600 ms after the last change, and when the page is hidden. ---
const LAST = "dsb:last";
// The save alert (a Låda Glass alert under the toolbar): "Saved" fades in and out again after a few
// seconds; a problem stays until closed or the next good save.
const status = h("div", { class: "lg-alert lg-alert-ok save-alert", role: "status", "aria-live": "polite", hidden: true });
document.body.append(status);
let statusTimer = null;
let store = null;
let autosave = null;

const remember = (id) => { try { localStorage.setItem(LAST, id); } catch { /* private mode */ } };
const recall = () => { try { return localStorage.getItem(LAST); } catch { return null; } };
function hideStatus() { status.classList.remove("is-shown"); clearTimeout(statusTimer); statusTimer = setTimeout(() => { status.hidden = true; }, 300); }
function setStatus(text, tone = "lg-ok") {
  const ok = tone === "lg-ok";
  status.className = `lg-alert ${tone.replace("lg-", "lg-alert-")} save-alert`;
  status.replaceChildren(icon(ok ? "check" : "info"), h("span", { text }),
    ...(ok ? [] : [h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon save-alert-close", "aria-label": "Close", onclick: hideStatus }, [icon("x")])]));
  clearTimeout(statusTimer);
  status.hidden = false;
  requestAnimationFrame(() => status.classList.add("is-shown"));
  if (ok) statusTimer = setTimeout(hideStatus, 2500);             // "Saved" goes away by itself
}
function onSaveStatus(kind, err) {
  if (kind === "saving") return;                                  // only the outcome is worth showing
  else if (kind === "saved") setStatus(store.memory ? "Not saved: this browser blocks storage" : "Saved", store.memory ? "lg-warn" : "lg-ok");
  else { console.error(err); setStatus("Not saved: storage error", "lg-bad"); }
}
function scheduleSave() { autosave?.schedule(); }
const saveNow = () => autosave?.flush();
addEventListener("pagehide", () => { saveNow(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });

/** Open a stored project; false if it is missing or can't be read. */
async function openProject(id) {
  await saveNow();
  const rec = await store.get(id);
  const r = rec ? validateStage(rec.stage) : { ok: false };
  if (!r.ok) { setStatus("That project could not be read", "lg-bad"); return false; }
  editor.dispatch({ type: "load", stage: r.stage });
  settings?.refresh();                       // an open Settings panel shows this stage's surroundings
  autosave.markSaved(editor.stage(), rec.exportedAt ?? null);
  remember(id);
  const view = loadView(id);                // where you left the camera, else the overview
  if (view) rig.setView(view); else rig.preset("iso", editor.stage());        // the high oblique overview of the whole bay
  // Shooter's eye, if it was on in this project (and where you stood).
  let eye = null;
  try { eye = JSON.parse(localStorage.getItem(`dsb:eye:${id}`) || "null"); } catch { /* private mode */ }
  const steps = document.getElementById("toolbar")?.eyeSteps;
  if (eye?.on && typeof eye.at === "string" && view) steps?.restore(eye.at); else steps?.hide();
  return true;
}
async function addProject(stage) {
  await saveNow();
  await store.put(projectRecord(stage, { now: Date.now() }));
  await openProject(stage.id);
}
// A library stage opens in the surroundings and light you're using now.
const withView = (s) => { const cur = editor.stage().settings; return { ...s, settings: { ...s.settings, environment: cur.environment, look: cur.look } }; };
// A new stage is clean: no props, no lines, and the default surroundings and light (it does not take
// over the open stage's surroundings, which may be a hall or your own buildings).
const freshStage = (name = "New stage") => createStage({ name });

// A match writes its name and the stage's number into the stage's briefing. The open stage gets it
// through the editor (so autosave keeps it); others in their saved record. With onlyIf, only when
// the stage still carries that match name (taking it out of a match).
async function applyBriefing(id, patch, { onlyIf = null } = {}) {
  if (!patch) return;
  if (id === editor.stage().id) {
    const b = editor.stage().briefing;
    if (onlyIf !== null && b.matchName !== onlyIf) return;
    if (Object.entries(patch).every(([k, v]) => b[k] === v)) return;
    editor.dispatch({ type: "applyMatch", patch });          // not an undo step
    return;
  }
  const rec = await store.get(id);
  if (!rec) return;
  const b = rec.stage.briefing || {};
  if (onlyIf !== null && b.matchName !== onlyIf) return;
  if (Object.entries(patch).every(([k, v]) => b[k] === v)) return;
  await store.put({ ...rec, modified: Date.now(), stage: { ...rec.stage, briefing: { ...b, ...patch } } });
}

// My shapes: drawn bay shapes saved in this browser. Saving one puts it on the stage too (a stage
// keeps its own copy, so it travels in files and share links).
const myShapes = (() => {
  let list = loadShapes(), version = 0;
  const changed = () => { version++; render(editor.state); };
  const drawer = createBayDrawer({
    async onSave(bay, id) {
      const shapeId = id || newId();
      const next = [...list.filter((x) => x.id !== shapeId), { id: shapeId, ...bay }];
      if (next.length > MAX_SHAPES) { globalThis.LadaGlass?.toast?.(`My shapes holds ${MAX_SHAPES}; delete one first.`, { type: "bad" }); return; }
      if (!saveShapes(next)) globalThis.LadaGlass?.toast?.("The shape is on this stage, but this browser couldn't save it to My shapes (storage full or blocked).", { type: "bad", duration: 8000 });
      else list = loadShapes();
      editor.dispatch({ type: "setBay", ...bay, shapeId });
      changed();
    },
    async onDelete(id) { list = list.filter((x) => x.id !== id); saveShapes(list); changed(); },
  });
  return { list: () => list, get version() { return version; }, draw: (opts) => drawer.open(opts) };
})();

// A berm's drawn outline: the same drawing window, up to 10 × 10 m, saved on that berm.
const bermDrawer = (() => {
  let target = null;
  const drawer = createBayDrawer({ kind: "berm", onSave: async (outline) => { if (target) editor.dispatch({ type: "setOutline", id: target, outline }); } });
  return { draw(o) { target = o.id; drawer.open(o.outline ? { shape: o.outline } : {}); } };
})();
onEarthLoaded(() => engine.requestRender());           // a berm's ground textures arrived

let dock = null;                   // the side panels' dock (Låda Glass), set up below
const projects = createProjects({
  onOpenLibrary: (spec) => addProject(withView(libraryStage(spec))),
  // A match takes the example stage or a library stage: saved as a new project (not opened).
  onCreateFrom: async (key) => {
    const spec = key.startsWith("lib:") ? STAGE_LIBRARY.find((s) => s.id === key.slice(4)) : null;
    const st = key === "demo" ? demoStage() : spec ? libraryStage(spec) : null;
    if (!st) return null;
    const s = withView(st);
    await store.put(projectRecord(s, { now: Date.now() }));
    return s.id;
  },
  panel: document.getElementById("projects"),
  docked: true,
  onToggle: (open) => {
    document.querySelector('[aria-label="Projects"].tool')?.setAttribute("aria-pressed", String(open));
    dock?.activate(open ? "projects" : "props");            // its tab comes forward (and unfolds); closing goes back to Props
  },
  store: {
    list: () => store.list(),
    matches: { list: () => store.matches.list(), put: (r) => store.matches.put(r), remove: (id) => store.matches.remove(id) },
  },
  // A new stage made from a match's page: saved and opened like New stage; its id goes in the match.
  // New stage (here or in a match): asks for its name first; Cancel makes none.
  onNewStage: async () => { const name = await askName({ title: "New stage in this match", value: "" }); if (!name) return null; const st = freshStage(name); await addProject(st); return st.id; },
  onApplyBriefing: applyBriefing,
  // Print a match: a cover page, then each stage's brief page (the open stage as it is now).
  onPrintMatch: (match, stages) => {
    const now = stages.map((st) => (st.id === editor.stage().id ? editor.stage() : st));
    renderMatchPrint(document.getElementById("print"), match, now);
    printedStage = null;
    printReady = true;
    window.print();
    printReady = false;
  },
  currentId: () => editor.stage().id,
  onOpen: openProject,
  onNew: async () => { const name = await askName({ title: "New stage", value: "" }); if (!name) return false; await addProject(freshStage(name)); return true; },
  onDuplicate: async (id) => {
    await saveNow();
    const rec = await store.get(id);
    if (rec) await store.put(projectRecord({ ...rec.stage, id: newId(), name: `${rec.stage.name} (copy)`.slice(0, 120) }, { now: Date.now() }));
  },
  onDelete: async (id) => {
    const open = id === editor.stage().id;
    if (open) { autosave.cancel(); autosave.markSaved(editor.stage()); }   // no pending save may bring it back
    const all = await store.list();
    await store.remove(id);
    // It leaves every match it was in; the stages after it move up a number.
    for (const m of dropStageEverywhere((await store.matches.list()).map(cleanMatch).filter(Boolean), id)) {
      await store.matches.put(m);
      for (const sid of m.stageIds) await applyBriefing(sid, briefingFor(m, sid));
    }
    if (!open) return;
    const next = nextProjectAfterDelete(all, id);
    if (!(next && await openProject(next))) await addProject(freshStage());
  },
  onImport: (stage) => addProject(stage),
  // A share link for the open stage: the stage itself is in the link (after the #).
  onShareLink: async () => {
    const code = await encodeShare(editor.stage());
    if (code.length > MAX_LINK) return { ok: false, error: "This stage is too large for a link. Export a file instead." };
    return { ok: true, url: `${location.origin}${location.pathname}#${shareHash}${code}` };
  },
  // A match file's stages: saved as new projects (not opened), in order; their ids go in the match.
  onImportMatch: async (stages) => {
    const now = Date.now();
    for (const [i, st] of stages.entries()) await store.put(projectRecord(st, { now: now - i }));
    return stages.map((st) => st.id);
  },
  onExportMatch: async (match, stages) => {
    await saveNow();
    const now = stages.map((st) => (st.id === editor.stage().id ? editor.stage() : st));
    download(matchToJson(match, now), matchFileName(match));
  },
  onExport: async () => {
    await saveNow();
    const stage = editor.stage();
    download(stageToJson(stage), exportFileName(stage));
    const at = Date.now();
    await store.put(projectRecord(stage, { now: at - 1, exportedAt: at }));
    autosave.markSaved(stage, at);
  },
});

const help = createHelp();
let hiddenProps = loadHidden();
const library = createLibrary(document.getElementById("library-body"), { editor, hidden: hiddenProps });
// The right-click menu (long press on an iPad) on the 3D view and the On stage list.
const menu = createContextMenu({ editor, rig, onShooterEye: () => document.getElementById("toolbar")?.eyeSteps?.reset() });
menu.attach(canvas, { target: (e) => picking.objectAt(e, { locked: true }), ground: (e) => picking.groundAt(e) });
// Picking a prop in the On stage list slides the camera over to it (no zoom).
const layers = createLayers(document.getElementById("layers"), { editor, menu, onFocus: (ids) => rig.focusOn(selectionCentre(editor.stage(), ids)) });
const selectedCentre = () => selectionCentre(editor.stage(), editor.state.selection);
createCameraPad(document.getElementById("camera-slot"), { rig, around: selectedCentre });
// The stage's name over the view, in the gap between the view buttons and the camera arrows (below
// the buttons when the view is too narrow for both). Text only, never in the way of the view.
const stageTitle = h("div", { class: "stage-title", "aria-hidden": "true" });
document.getElementById("camera-slot").append(stageTitle);
function placeStageTitle() {
  const slot = document.querySelector(".viewport-wrap").getBoundingClientRect();
  const bar = document.querySelector(".camera-bar")?.getBoundingClientRect(), pad = document.querySelector(".camera-pad")?.getBoundingClientRect();
  if (!bar || !pad || !slot.width) return;
  const left = bar.right - slot.left + 12, right = slot.right - pad.left + 12;
  const roomy = slot.width - left - right >= 120 && pad.top - slot.top < 60;
  stageTitle.classList.toggle("is-below", !roomy);
  stageTitle.style.setProperty("--title-left", `${roomy ? left : bar.left - slot.left}px`);
  stageTitle.style.setProperty("--title-right", `${roomy ? right : slot.right - bar.right}px`);
  stageTitle.style.setProperty("--title-top", `${roomy ? bar.top - slot.top : bar.bottom - slot.top + 6}px`);
  stageTitle.style.setProperty("--title-h", `${bar.height}px`);
}
updaters.push((state) => { const name = state.history.present.name || "Untitled stage"; if (stageTitle.textContent !== name) stageTitle.textContent = name; requestAnimationFrame(placeStageTitle); });
new ResizeObserver(() => placeStageTitle()).observe(document.querySelector(".viewport-wrap"));
// Turning the view (left drag on empty ground, one finger) with something selected turns it round
// the selection: the pivot glides onto it as the drag starts. Dragging a prop doesn't move the camera.
let viewButton = -1;
canvas.addEventListener("pointerdown", (e) => { viewButton = e.button; }, true);
rig.controls.addEventListener("start", () => setTimeout(() => {
  const c = viewButton === 0 && rig.controls.enabled ? selectedCentre() : null;
  if (c) rig.glideTarget(c);
}, 0));
updaters.push(
  createToolbar(document.getElementById("toolbar"), {
    editor, rig, onAbout: () => about.open(), onHelp: () => help.open(), onBriefing: () => briefing.open(), onPrint: () => printBrief(),
    onSettings: () => settings.open(), onViewing: viewingFrom, walking: () => animator.playing(),
    onEyeState: (st) => { try { localStorage.setItem(`dsb:eye:${editor.stage().id}`, JSON.stringify(st)); } catch { /* private mode */ } },
  }),
  library,
  layers.update,
  createInspector(document.getElementById("inspector-body"), { editor, shapes: myShapes, berms: bermDrawer }),
  createStats(document.getElementById("stats")),
);
attachShortcuts({ editor, rig });
// Play / pause for animated props, in the bar over the 3D view (shown when any prop is animated).
playButton = (() => {
  const b = h("button", { type: "button", class: "lg-btn lg-btn-ghost tool-text anim-play", "aria-pressed": "true", hidden: true,
    onclick: () => {
      animator.setPlaying(!animator.playing());
      if (animator.playing()) animStart = performance.now() - pausedAt * 1000;
      else pausedAt = (performance.now() - animStart) / 1000;
      try { localStorage.setItem("dsb:playing", String(animator.playing())); } catch { /* private mode */ }   // remembered
      b.update();
      engine.requestRender();
    } });
  let pausedAt = 0;
  try { if (localStorage.getItem("dsb:playing") === "false") animator.setPlaying(false); } catch { /* private mode */ }
  b.update = () => {
    // Shown when props are animated, or when there are shooting positions to walk between.
    const st = editor.stage();
    const positions = st.objects.some((o) => o.type === "shooting-position");
    const clouds = st.settings.environment === "outdoor" && (st.settings.look?.clouds ?? 0) > 0.01 && (st.settings.look?.cloudSpeed ?? 0) > 0;
    b.hidden = animator.count() === 0 && !positions && !clouds;
    b.setAttribute("aria-pressed", String(animator.playing()));
    b.replaceChildren(icon(animator.playing() ? "pause" : "play"), animator.playing() ? "Pause" : "Play");
    b.title = animator.playing() ? "Pause: animated props and clouds stop, and Shooter's eye jumps between positions" : "Play: animated props and clouds move, and Shooter's eye walks between positions";
  };
  document.querySelector(".camera-bar")?.append(b);
  b.update();
  return b;
})();
// Dockable side panels (Låda Glass dock): the Props panel and the Inspector move to the left, the
// right or under the view (drag the grip, or click it), fold to a rail and resize; remembered per
// browser. On a narrow screen (an iPad upright) the Inspector starts under the view.
const dockEl = document.getElementById("dock");
if (matchMedia("(max-width: 1099px)").matches) for (const id of ["inspector"]) document.getElementById(id).setAttribute("data-lg-dock-side", "bottom");
dock = window.LadaGlass.dock.init(dockEl, { key: "dsb", onChange: () => { engine.resize?.(); syncDockTabs(); placeToolbar(); } });
// The toolbar sits at the top of the right-hand column (else the left), so the 3D view reaches the
// top of the window; with no side column wide enough, it is a bar across the top as before.
function placeToolbar() {
  const app = document.querySelector(".app"), bar = document.getElementById("toolbar");
  const cols = ["right", "left"].map((side) => dockEl.querySelector(`.lg-dock[data-side="${side}"]`)).filter(Boolean);
  for (const c of cols) c.classList.remove("has-toolbar");
  const appBox = app.getBoundingClientRect();
  const col = cols.find((c) => { const r = c.getBoundingClientRect(); return r.width >= 260 && r.height > 200 && c.querySelector(".lg-dock-frame"); });
  app.classList.toggle("toolbar-rail", Boolean(col));
  if (!col) return;
  const frame = col.querySelector(".lg-dock-frame").getBoundingClientRect();
  app.style.setProperty("--rail-left", `${frame.left - appBox.left}px`);
  app.style.setProperty("--rail-width", `${frame.width}px`);
  col.classList.add("has-toolbar");
  app.style.setProperty("--rail-toolbar-h", `${bar.getBoundingClientRect().height}px`);
}
addEventListener("resize", () => requestAnimationFrame(placeToolbar));
requestAnimationFrame(placeToolbar);
// A tab shown by the dock (clicked, or still shown after a reload) is filled in.
function syncDockTabs() {
  if (!dock) return;                         // still being set up
  // Projects needs the store, which opens a moment after start-up (that end of start-up calls this again).
  if (store && dock.active("projects") && !dock.folded("projects") && projects && !projects.isOpen) projects.ensureOpen();
}
const fold = (id) => ({ set: (f) => dock.fold(id, f), get collapsed() { return dock.folded(id); } });
folds.library = fold("props");
folds.inspector = fold("inspector");
briefing = createBriefing({ editor });
// Your own surroundings (templates in this browser); the store is ready once projects have opened.
let mine = null;
const mineApi = {
  list: () => mine?.list() ?? [],
  get: (id) => mine?.get(id) ?? null,
  newFromPlan: () => mine?.newFromPlan() ?? Promise.resolve(null),
  editPlan: async (id) => { const ok = await mine?.editPlan(id); if (ok) { surroundingsVersion++; render(editor.state); } return ok; },     // rebuild the drawn walls
  hasImage: (id) => mine?.hasImage(id) ?? false,
  update: (id, patch) => mine?.update(id, patch),
  remove: (id) => mine?.remove(id),
  // Save: the building pieces leave the stage (one undo step) and join the template.
  async savePieces(id) {
    const t = mine?.get(id);
    if (!t) return;
    const { pieces } = takeBuildingPieces(editor.stage());
    await mine.update(id, { pieces: [...t.pieces, ...pieces] });
    editor.dispatch({ type: "takeBuilding" });
  },
  // Edit: the template's pieces come back onto the stage as ordinary props.
  async editPieces(id) {
    const t = mine?.get(id);
    if (!t) return;
    editor.dispatch({ type: "putBackBuilding", pieces: t.pieces });
    await mine.update(id, { pieces: [] });
  },
};
settings = createSettings({
  mine: mineApi,
  editor,
  panel: document.getElementById("settings-panel"),
  // A modal window over the app (Done or Escape closes it).
  onToggle: (open) => { document.querySelector('[aria-label="Settings"].tool')?.setAttribute("aria-pressed", String(open)); },
  getHidden: () => hiddenProps,
  onHidden: (next) => { hiddenProps = next; saveHidden(next); library.setHidden(next); },
  getSpeed: () => speed,
  onSpeed: (id) => { speed = walkSpeed(id).id; saveWalkSpeed(speed); rig.setPace(walkSpeed(speed).pace); },
  getRunLook: () => runLook,
  onRunLook: (part, patch) => {
    runLook = saveRunLook(withRunPart(runLook, part, patch));
    setRunLook(runLook);
    applyVisibility();
  },
});

render(editor.state);
document.getElementById("boot-state")?.remove();
// Remember the camera (per project, in this browser) a moment after it stops moving, and on leaving.
let viewTimer = 0, viewReady = false;
const keepView = () => { if (viewReady) saveView(editor.stage().id, rig.getView()); };
rig.controls.addEventListener("change", () => { clearTimeout(viewTimer); viewTimer = setTimeout(keepView, 400); });
addEventListener("pagehide", keepView);
rig.preset("iso", editor.stage());

// A share link (#stage=…) opens its stage as a new project, and the link leaves the address bar.
// true when it opened one.
async function openSharedLink() {
  const shared = await decodeShare(location.hash);
  if (!shared) return false;
  history.replaceState(null, "", location.pathname + location.search);
  if (!shared.ok) { globalThis.LadaGlass?.toast?.(shared.error, { type: "bad", duration: 8000 }); return false; }
  await addProject(shared.stage);
  globalThis.LadaGlass?.toast?.(`Opened the shared stage "${shared.stage.name}" as a new project.`, { type: "ok" });
  return true;
}

// Open the last project, else the newest, else save the example stage as the first project.
(async () => {
  try { store = await openStore({ beforeClose: () => autosave?.flush() }); } catch (err) { console.warn(err); store = memoryStore(); }
  mine = createSurroundings({ store: store.surroundings, onChange: () => { surroundingsVersion++; render(editor.state); } });
  try { await mine.load(); surroundingsVersion++; } catch (err) { console.warn(err); }
  autosave = createAutosave({ store, getStage: () => editor.stage(), onStatus: onSaveStatus });
  autosave.markSaved(editor.stage());   // the example stage on screen is not a project until chosen below
  const all = sortProjects(await store.list());
  const last = recall();
  const pick = all.find((r) => r.id === last) ?? all[0];
  // A share link (#stage=…) opens its stage as a new project; the link leaves the address bar.
  if (!(await openSharedLink()) && !(pick && await openProject(pick.id))) await addProject(demoStage());
  // A share link pasted into this tab while it is open changes only the hash: open it too.
  addEventListener("hashchange", () => { openSharedLink(); });
  viewReady = true;                        // from now on the camera belongs to an opened project
  syncDockTabs();                          // a Settings or Projects tab still shown after a reload is filled in
})();

// Offline support (PWA). Not on file:// pages or browsers without service workers.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // The page requires Trusted Types for script URLs; this policy allows only our own worker.
  const policy = globalThis.trustedTypes?.createPolicy("dsb-sw", {
    createScriptURL: (url) => { if (url !== "./sw.js") throw new TypeError(`Blocked script URL ${url}`); return url; },
  });
  navigator.serviceWorker.register(policy ? policy.createScriptURL("./sw.js") : "./sw.js")
    .catch((err) => console.warn("Offline support unavailable", err));
}
