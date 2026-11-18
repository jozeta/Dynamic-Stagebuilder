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
import { h } from "./ui/dom.js";

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

let picking = null;
const editor = createEditor({ stage: demoStage(), onChange: (state) => render(state) });
picking = attachPicking({ engine, stageView: view, editor, cameraRig: rig, canvas });

updaters.push(
  createToolbar(document.getElementById("toolbar"), {
    editor, rig, onAbout: () => about.open(),
    onNew: () => editor.dispatch({ type: "newStage" }),
  }),
  createLibrary(document.getElementById("library"), { editor }),
  createInspector(document.getElementById("inspector-body"), { editor }),
  createStats(document.getElementById("stats")),
);
attachShortcuts({ editor, rig });

render(editor.state);
document.getElementById("boot-state")?.remove();
rig.preset("iso", editor.stage());
rig.frameAll(editor.stage());
