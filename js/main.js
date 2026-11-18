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
import { renderPrint } from "./ui/print.js";
import { h } from "./ui/dom.js";
import { createStage } from "./model/stage.js";
import { validateStage } from "./model/schema.js";
import { openStore, memoryStore } from "./storage/db.js";
import { projectRecord, sortProjects, nextProjectAfterDelete } from "./storage/projects.js";
import { exportFileName, stageToJson } from "./storage/files.js";
import { createProjects } from "./ui/projects.js";

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
  if (key !== envKey) { envKey = key; engine.setEnvironment(stage.settings.environment, stage.bay); }

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
  const cam = engine.camera.position.clone();
  const target = rig.controls.target.clone();
  engine.groups.helper.visible = false;
  rig.preset("iso", editor.stage());
  rig.frameAll(editor.stage());
  engine.renderer.render(engine.scene, engine.camera);
  const url = canvas.toDataURL("image/png");
  engine.groups.helper.visible = true;
  engine.camera.position.copy(cam);
  rig.controls.target.copy(target);
  rig.controls.update();
  engine.requestRender();
  return url;
}
function printBrief() {
  renderPrint(document.getElementById("print"), editor.stage(), snapshot());
  window.print();
}

let picking = null;
let briefing = null;
const editor = createEditor({ stage: demoStage(), onChange: (state) => { render(state); scheduleSave(); } });
picking = attachPicking({ engine, stageView: view, editor, cameraRig: rig, canvas });

// --- Saved projects: autosave 600 ms after the last change, and when the page is hidden. ---
const LAST = "dsb:last";
const status = h("span", { class: "lg-chip save-status", role: "status", "aria-live": "polite", text: "…" });
let store = null;
let savedStage = null;
let exportedAt = null;
let saveTimer = 0;

const remember = (id) => { try { localStorage.setItem(LAST, id); } catch { /* private mode */ } };
const recall = () => { try { return localStorage.getItem(LAST); } catch { return null; } };
function setStatus(text, tone = "") { status.textContent = text; status.className = `lg-chip save-status ${tone}`; }

function scheduleSave() {
  if (!store || editor.stage() === savedStage) return;
  setStatus("Saving…");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 600);
}
async function saveNow() {
  clearTimeout(saveTimer);
  const stage = editor.stage();
  if (!store || stage === savedStage) return;
  try {
    await store.put(projectRecord(stage, { now: Date.now(), exportedAt }));
    savedStage = stage;
    setStatus(store.memory ? "Not saved: this browser blocks storage" : "Saved", store.memory ? "lg-warn" : "lg-ok");
  } catch (err) {
    console.error(err);
    setStatus("Not saved: storage error", "lg-bad");
  }
}
addEventListener("pagehide", () => { saveNow(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });

async function openProject(id) {
  await saveNow();
  const rec = await store.get(id);
  if (!rec) return;
  const r = validateStage(rec.stage);
  if (!r.ok) { setStatus("That project could not be read", "lg-bad"); return; }
  exportedAt = rec.exportedAt ?? null;
  editor.dispatch({ type: "load", stage: r.stage });
  savedStage = editor.stage();
  remember(id);
  setStatus("Saved", "lg-ok");
  rig.preset("iso", editor.stage());
  rig.frameAll(editor.stage());
}
async function addProject(stage) {
  await saveNow();
  await store.put(projectRecord(stage, { now: Date.now() }));
  await openProject(stage.id);
}

const projects = createProjects({
  store: { list: () => store.list() },
  currentId: () => editor.stage().id,
  onOpen: openProject,
  onNew: () => addProject({ ...createStage({ name: "New stage" }), settings: { ...createStage().settings, environment: editor.stage().settings.environment } }),
  onDuplicate: async (id) => {
    await saveNow();
    const rec = await store.get(id);
    if (rec) await store.put(projectRecord({ ...rec.stage, id: crypto.randomUUID(), name: `${rec.stage.name} (copy)`.slice(0, 120) }, { now: Date.now() }));
  },
  onDelete: async (id) => {
    const all = await store.list();
    await store.remove(id);
    if (id !== editor.stage().id) return;
    savedStage = editor.stage();     // don't re-save the deleted project
    const next = nextProjectAfterDelete(all, id);
    if (next) await openProject(next);
    else await addProject(createStage({ name: "New stage" }));
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
    exportedAt = Date.now();
    await store.put(projectRecord(stage, { now: exportedAt - 1, exportedAt }));
    savedStage = stage;
  },
});

updaters.push(
  createToolbar(document.getElementById("toolbar"), {
    editor, rig, status, onAbout: () => about.open(), onBriefing: () => briefing.open(), onPrint: () => printBrief(),
    onProjects: () => projects.open(),
  }),
  createLibrary(document.getElementById("library"), { editor }),
  createInspector(document.getElementById("inspector-body"), { editor }),
  createStats(document.getElementById("stats")),
);
attachShortcuts({ editor, rig });
briefing = createBriefing({ editor });

render(editor.state);
document.getElementById("boot-state")?.remove();
rig.preset("iso", editor.stage());
rig.frameAll(editor.stage());

// Open the last project, else the newest, else save the example stage as the first project.
(async () => {
  try { store = await openStore(); } catch (err) { console.warn(err); store = memoryStore(); }
  const all = sortProjects(await store.list());
  const last = recall();
  const pick = all.find((r) => r.id === last) ?? all[0];
  if (pick) await openProject(pick.id);
  else await addProject(editor.stage());
})();
