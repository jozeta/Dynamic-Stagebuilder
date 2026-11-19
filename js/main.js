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
import { h } from "./ui/dom.js";
import { createStage } from "./model/stage.js";
import { validateStage } from "./model/schema.js";
import { openStore, memoryStore } from "./storage/db.js";
import { projectRecord, sortProjects, nextProjectAfterDelete } from "./storage/projects.js";
import { exportFileName, stageToJson } from "./storage/files.js";
import { createProjects } from "./ui/projects.js";
import { makeCollapsible } from "./ui/panels.js";
import { createHelp } from "./ui/help.js";
import { loadHidden, saveHidden } from "./ui/prefs.js";
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
const about = createAbout();

let envKey = "";
let lookShown = null;
const highlight = new THREE.Group();
const preview = new THREE.Group();
engine.groups.helper.add(highlight, preview);
const ACCENT = 0x5a93c4;

const hint = document.getElementById("hint");
const updaters = [];

function render(state) {
  const stage = state.history.present;
  view.sync(stage);
  const key = `${stage.settings.environment}|${stage.bay.width}|${stage.bay.depth}`;
  if (key !== envKey) { envKey = key; lookShown = stage.settings.look; engine.setEnvironment(stage.settings.environment, stage.bay, stage.settings.look); }
  else if (stage.settings.look !== lookShown) { lookShown = stage.settings.look; engine.setLook(stage.settings.look, stage.bay); }

  // Selection outline.
  for (const c of [...highlight.children]) { highlight.remove(c); c.geometry.dispose(); c.material.dispose(); }
  for (const id of state.selection) {
    const node = view.objectFor(id);
    if (node) highlight.add(new THREE.BoxHelper(node, ACCENT));
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
  engine.groups.helper.visible = true;
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
  rig.preset("iso", editor.stage());        // the high oblique overview of the whole bay
  return true;
}
async function addProject(stage) {
  await saveNow();
  await store.put(projectRecord(stage, { now: Date.now() }));
  await openProject(stage.id);
}
const freshStage = () => {
  const s = createStage({ name: "New stage" });
  const cur = editor.stage().settings;
  return { ...s, settings: { ...s.settings, environment: cur.environment, look: cur.look } };
};

const projects = createProjects({
  panel: document.getElementById("projects"),
  hide: [document.getElementById("library-body")],
  onToggle: (open) => document.querySelector('[aria-label="Projects"].tool')?.setAttribute("aria-pressed", String(open)),
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
updaters.push(
  createToolbar(document.getElementById("toolbar"), {
    editor, rig, status, onAbout: () => about.open(), onHelp: () => help.open(), onBriefing: () => briefing.open(), onPrint: () => printBrief(),
    onProjects: () => projects.open(), onSettings: () => settings.open(),
  }),
  library,
  createInspector(document.getElementById("inspector-body"), { editor }),
  createStats(document.getElementById("stats")),
);
attachShortcuts({ editor, rig });
const appEl = document.querySelector(".app");
makeCollapsible(document.getElementById("library"), { app: appEl, name: "library", label: "props" });
makeCollapsible(document.getElementById("inspector"), { app: appEl, name: "inspector", label: "inspector" });
briefing = createBriefing({ editor });
settings = createSettings({
  editor,
  panel: document.getElementById("settings-panel"),
  hide: [document.getElementById("inspector-body"), document.getElementById("stats")],
  onToggle: (open) => document.querySelector('[aria-label="Settings"].tool')?.setAttribute("aria-pressed", String(open)),
  getHidden: () => hiddenProps,
  onHidden: (next) => { hiddenProps = next; saveHidden(next); library.setHidden(next); },
});

render(editor.state);
document.getElementById("boot-state")?.remove();
rig.preset("iso", editor.stage());

// Open the last project, else the newest, else save the example stage as the first project.
(async () => {
  try { store = await openStore(); } catch (err) { console.warn(err); store = memoryStore(); }
  autosave = createAutosave({ store, getStage: () => editor.stage(), onStatus: onSaveStatus });
  autosave.markSaved(editor.stage());   // the example stage on screen is not a project until chosen below
  const all = sortProjects(await store.list());
  const last = recall();
  const pick = all.find((r) => r.id === last) ?? all[0];
  if (!(pick && await openProject(pick.id))) await addProject(demoStage());
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
