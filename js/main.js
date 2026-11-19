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
import { createLibrary } from "./ui/library.js";
import { createInspector } from "./ui/inspector.js";
import { createStats } from "./ui/stats.js";
import { attachShortcuts } from "./ui/shortcuts.js";
import { createAbout } from "./ui/about.js";
import { createBriefing } from "./ui/briefing.js";
import { createSettings } from "./ui/settings.js";
import { renderPrint } from "./ui/print.js";
import { h, icon } from "./ui/dom.js";
import { createStage } from "./model/stage.js";
import { validateStage } from "./model/schema.js";
import { openStore, memoryStore } from "./storage/db.js";
import { projectRecord, sortProjects, nextProjectAfterDelete } from "./storage/projects.js";
import { exportFileName, stageToJson } from "./storage/files.js";
import { createProjects } from "./ui/projects.js";
import { createHelp } from "./ui/help.js";
import { createAnimator } from "./render/animate.js";
import { fadeFigures } from "./render/figure-fade.js";
import { createSurroundings } from "./ui/surroundings.js";
import { takeBuildingPieces } from "./model/surroundings.js";
import { libraryStage } from "./model/stage-library.js";
import { loadHidden, saveHidden, loadView, saveView, loadWalkSpeed, saveWalkSpeed, loadRunLook, saveRunLook } from "./ui/prefs.js";
import { withRunPart } from "./model/run-look.js";
import { setRunLook } from "./render/materials.js";
import { walkSpeed } from "./model/route.js";
import { revealOnSelect } from "./model/layout.js";
import { activationLinks } from "./model/activation.js";
import { isHidden } from "./model/layers.js";
import { createContextMenu } from "./ui/context-menu.js";
import { createLayers } from "./ui/layers.js";
import { createAutosave } from "./storage/autosave.js";

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
engine.groups.helper.add(highlight, preview);
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

// Selecting something new brings its settings into view: the inspector unfolds, and Settings (which
// shares that panel) closes.
let shownSelection = [];
function revealInspector(selection) {
  const reveal = revealOnSelect(shownSelection, selection);
  shownSelection = [...selection];
  if (!reveal) return;
  if (settings?.isOpen) settings.close();
  if (folds.inspector?.collapsed) folds.inspector.set(false);
}

function render(state) {
  const stage = state.history.present;
  revealInspector(state.selection);
  view.sync(stage);
  animator.sync(stage);
  playButton?.update();
  if (animator.active()) engine.requestRender();
  if (editor) applyVisibility();            // rebuilt nodes: keep the viewed markers (and a hidden run) hidden
  const key = `${stage.settings.environment}|${stage.bay.width}|${stage.bay.depth}|${surroundingsVersion}`;
  if (key !== envKey) { envKey = key; lookShown = stage.settings.look; engine.setEnvironment(stage.settings.environment, stage.bay, stage.settings.look); }
  else if (stage.settings.look !== lookShown) { lookShown = stage.settings.look; engine.setLook(stage.settings.look, stage.bay); }

  // Selection outline.
  for (const c of [...highlight.children]) { highlight.remove(c); c.geometry.dispose(); c.material.dispose(); }
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
const status = h("span", { class: "lg-chip save-status", role: "status", "aria-live": "polite", text: "…" });
let store = null;
let autosave = null;

const remember = (id) => { try { localStorage.setItem(LAST, id); } catch { /* private mode */ } };
const recall = () => { try { return localStorage.getItem(LAST); } catch { return null; } };
function setStatus(text, tone = "") { status.textContent = text; status.className = `lg-chip save-status ${tone}`; }
function onSaveStatus(kind, err) {
  if (kind === "saving") setStatus("Saving…");
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
  autosave.markSaved(editor.stage(), rec.exportedAt ?? null);
  remember(id);
  setStatus("Saved", "lg-ok");
  const view = loadView(id);                // where you left the camera, else the overview
  if (view) rig.setView(view); else rig.preset("iso", editor.stage());        // the high oblique overview of the whole bay
  return true;
}
async function addProject(stage) {
  await saveNow();
  await store.put(projectRecord(stage, { now: Date.now() }));
  await openProject(stage.id);
}
// A library stage opens in the surroundings and light you're using now.
const withView = (s) => { const cur = editor.stage().settings; return { ...s, settings: { ...s.settings, environment: cur.environment, look: cur.look } }; };
const freshStage = () => {
  const s = createStage({ name: "New stage" });
  const cur = editor.stage().settings;
  return { ...s, settings: { ...s.settings, environment: cur.environment, look: cur.look } };
};

const projects = createProjects({
  onOpenLibrary: (spec) => addProject(withView(libraryStage(spec))),
  panel: document.getElementById("projects"),
  hide: [document.getElementById("left-main")],
  onToggle: (open) => {
    document.querySelector('[aria-label="Projects"].tool')?.setAttribute("aria-pressed", String(open));
    if (open && folds.library?.collapsed) folds.library.set(false);      // never open a view inside a folded panel
  },
  store: { list: () => store.list() },
  currentId: () => editor.stage().id,
  onOpen: openProject,
  onNew: () => addProject(freshStage()),
  onDuplicate: async (id) => {
    await saveNow();
    const rec = await store.get(id);
    if (rec) await store.put(projectRecord({ ...rec.stage, id: crypto.randomUUID(), name: `${rec.stage.name} (copy)`.slice(0, 120) }, { now: Date.now() }));
  },
  onDelete: async (id) => {
    const open = id === editor.stage().id;
    if (open) { autosave.cancel(); autosave.markSaved(editor.stage()); }   // no pending save may bring it back
    const all = await store.list();
    await store.remove(id);
    if (!open) return;
    const next = nextProjectAfterDelete(all, id);
    if (!(next && await openProject(next))) await addProject(freshStage());
  },
  onImport: (stage) => addProject(stage),
  onExport: async () => {
    await saveNow();
    const stage = editor.stage();
    const url = URL.createObjectURL(new Blob([stageToJson(stage)], { type: "application/json" }));
    const a = h("a", { href: url, download: exportFileName(stage) });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
const layers = createLayers(document.getElementById("layers"), { editor, menu });
// The left panel's tabs: Props (the library) and On stage (the props on the stage), remembered.
(() => {
  const panes = { props: document.getElementById("library-body"), layers: document.getElementById("layers") };
  const tabs = [["props", "Props"], ["layers", "On stage"]].map(([id, label]) => h("button", { type: "button", class: "lg-tab", role: "tab", id: `left-tab-${id}`,
    "aria-controls": panes[id].id, onclick: () => show(id), text: label }));
  const bar = h("div", { class: "lg-tabs left-tabs", role: "tablist", "aria-label": "Left panel" }, tabs);
  bar.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = tabs[(tabs.indexOf(document.activeElement) + 1) % tabs.length];
    next.focus(); next.click();
  });
  function show(id) {
    for (const b of tabs) b.setAttribute("aria-selected", String(b.id === `left-tab-${id}`));
    for (const [k, el] of Object.entries(panes)) el.hidden = k !== id;
    try { localStorage.setItem("dsb:left-tab", id); } catch { /* private mode */ }
  }
  document.getElementById("left-tabs").append(bar);
  let first = "props";
  try { if (localStorage.getItem("dsb:left-tab") === "layers") first = "layers"; } catch { /* private mode */ }
  show(first);
})();
updaters.push(
  createToolbar(document.getElementById("toolbar"), {
    editor, rig, status, onAbout: () => about.open(), onHelp: () => help.open(), onBriefing: () => briefing.open(), onPrint: () => printBrief(),
    onProjects: () => projects.open(), onSettings: () => settings.open(), onViewing: viewingFrom, walking: () => animator.playing(),
  }),
  library,
  layers.update,
  createInspector(document.getElementById("inspector-body"), { editor }),
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
      b.update();
      engine.requestRender();
    } });
  let pausedAt = 0;
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
if (matchMedia("(max-width: 1099px)").matches) document.getElementById("inspector").setAttribute("data-lg-dock-side", "bottom");
const dock = window.LadaGlass.dock.init(dockEl, { key: "dsb", onChange: () => engine.resize?.() });
const fold = (id) => ({ set: (f) => dock.fold(id, f), get collapsed() { return dock.folded(id); } });
folds.library = fold("library");
folds.inspector = fold("inspector");
briefing = createBriefing({ editor });
// Your own surroundings (templates in this browser); the store is ready once projects have opened.
let mine = null;
const mineApi = {
  list: () => mine?.list() ?? [],
  get: (id) => mine?.get(id) ?? null,
  newFromPlan: () => mine?.newFromPlan() ?? Promise.resolve(null),
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
  hide: [document.getElementById("inspector-body"), document.getElementById("stats")],
  onToggle: (open) => {
    document.querySelector('[aria-label="Settings"].tool')?.setAttribute("aria-pressed", String(open));
    if (open && folds.inspector?.collapsed) folds.inspector.set(false);
  },
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

// Open the last project, else the newest, else save the example stage as the first project.
(async () => {
  try { store = await openStore(); } catch (err) { console.warn(err); store = memoryStore(); }
  mine = createSurroundings({ store: store.surroundings, onChange: () => { surroundingsVersion++; render(editor.state); } });
  try { await mine.load(); surroundingsVersion++; } catch (err) { console.warn(err); }
  autosave = createAutosave({ store, getStage: () => editor.stage(), onStatus: onSaveStatus });
  autosave.markSaved(editor.stage());   // the example stage on screen is not a project until chosen below
  const all = sortProjects(await store.list());
  const last = recall();
  const pick = all.find((r) => r.id === last) ?? all[0];
  if (!(pick && await openProject(pick.id))) await addProject(demoStage());
  viewReady = true;                        // from now on the camera belongs to an opened project
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
