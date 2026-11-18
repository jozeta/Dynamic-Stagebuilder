// Pointer input on the 3D view, for mouse and touch alike:
// - select mode: tap an object to select it (Shift adds), drag a selected object to move it,
//   drag empty ground to orbit (OrbitControls), tap empty ground to clear the selection;
// - place mode: tap the ground to place the armed prop; mouse drag-and-drop from the library too;
// - draw mode: tap to add points, double-click (or the Finish button / Enter) to end;
// - start mode: tap to set the start position;
// - a rotate ring (TransformControls, vertical axis only) on a single selected object.
import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { groundPoint } from "./ground.js";
import { yawDegrees } from "./rotation.js";

const TAP_PX = 6;

export function attachPicking({ engine, stageView, editor, cameraRig, canvas, onHover = () => {} }) {
  const { camera } = engine;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const gizmo = new TransformControls(camera, canvas);
  gizmo.setMode("rotate");
  gizmo.setSpace("local");
  gizmo.showX = false;
  gizmo.showZ = false;
  gizmo.setSize(0.8);
  engine.groups.helper.add(gizmo.getHelper());
  gizmo.addEventListener("change", () => engine.requestRender());
  gizmo.addEventListener("dragging-changed", (e) => {
    cameraRig.controls.enabled = !e.value;
    if (!e.value && gizmo.object) {
      const id = gizmo.object.userData.id;
      editor.dispatch({ type: "setRotation", id, value: yawDegrees(gizmo.object) });
    }
  });

  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  function groundAt(e) {
    setPointer(e);
    const { origin, direction } = raycaster.ray;
    return groundPoint(origin.toArray(), direction.toArray());
  }
  function objectAt(e) {
    setPointer(e);
    const hits = raycaster.intersectObject(engine.groups.stage, true);
    for (const h of hits) {
      const id = stageView.idFor(h.object);
      if (id && id !== "start") return id;
    }
    return null;
  }

  let press = null;   // { x, y, id, ground, dragging, pointerId }

  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || press || gizmo.dragging) return;
    const mode = editor.state.mode;
    press = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, id: null, ground: groundAt(e), dragging: false, shift: e.shiftKey };
    if (mode === "select") {
      press.id = objectAt(e);
      if (press.id) {
        cameraRig.controls.enabled = false;
        if (!editor.state.selection.includes(press.id)) editor.dispatch({ type: "select", ids: [press.id], add: e.shiftKey });
        else if (e.shiftKey) press.toggle = true;
      }
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!press) { if (editor.state.mode !== "select") onHover(groundAt(e)); return; }
    if (e.pointerId !== press.pointerId || !press.id || !press.ground) return;
    const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_PX;
    if (!press.dragging && moved) {
      press.dragging = true;
      editor.dispatch({ type: "dragStart", ids: editor.state.selection });
    }
    if (press.dragging) {
      const g = groundAt(e);
      if (g) editor.dispatch({ type: "dragMove", delta: [g[0] - press.ground[0], g[1] - press.ground[1]] });
    }
  });

  function release(e) {
    if (!press || e.pointerId !== press.pointerId) return;
    const p = press;
    press = null;
    cameraRig.controls.enabled = true;
    if (p.dragging) { editor.dispatch({ type: "dragEnd" }); return; }
    const tap = Math.hypot(e.clientX - p.x, e.clientY - p.y) <= TAP_PX;
    if (!tap || e.type === "pointercancel") return;
    const mode = editor.state.mode;
    const g = groundAt(e);
    if (mode === "select") {
      if (p.toggle) editor.dispatch({ type: "select", ids: [p.id], add: true });
      else if (!p.id && !p.shift && !gizmo.axis) editor.dispatch({ type: "select", ids: [] });
    } else if (mode?.place && g) editor.dispatch({ type: "place", propType: mode.place, position: g });
    else if (mode?.draw && g) editor.dispatch({ type: "addPoint", point: g });
    else if (mode === "start" && g) editor.dispatch({ type: "setStart", position: g, facing: 0 });
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  canvas.addEventListener("dblclick", () => {
    if (editor.state.mode?.draw) editor.dispatch({ type: "finishDraw" });
  });

  // Mouse drag-and-drop from the prop library.
  canvas.addEventListener("dragover", (e) => {
    if (e.dataTransfer?.types.includes("application/x-stage-prop")) e.preventDefault();
  });
  canvas.addEventListener("drop", (e) => {
    const type = e.dataTransfer?.getData("application/x-stage-prop");
    if (!type) return;
    e.preventDefault();
    const g = groundAt(e);
    if (g) editor.dispatch({ type: "place", propType: type, position: g });
  });

  /** Put the rotate ring on the single selected object (call after every stage view sync). */
  function updateGizmo() {
    const sel = editor.state.selection;
    const node = sel.length === 1 ? stageView.objectFor(sel[0]) : null;
    const isObject = node && editor.stage().objects.some((o) => o.id === sel[0]);
    if (isObject && editor.state.mode === "select") { if (gizmo.object !== node) gizmo.attach(node); }
    else if (gizmo.object) gizmo.detach();
  }

  return { gizmo, updateGizmo };
}
