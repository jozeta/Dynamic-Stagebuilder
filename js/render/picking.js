// Pointer input on the 3D view, for mouse and touch alike:
// - select mode: tap an object to select it (Shift adds), drag a selected object to move it,
//   drag empty ground to orbit (OrbitControls), tap empty ground to clear the selection;
// - place mode: tap the ground to place the armed prop; mouse drag-and-drop from the library too;
// - draw mode: tap to add points, double-click (or the Finish button / Enter) to end;
// - start mode: tap to set the start position; the start box itself is selected, dragged and
//   turned like a prop (its id is "start");
// - a rotate ring (TransformControls, vertical axis only) on a single selected object, and inside it
//   the move arrows (render/move-arrows.js): the cube drags it anywhere, an arrow along x or z only,
//   the up arrow (props with a height) raises or lowers it.
import * as THREE from "three";
import { isLocked } from "../model/layers.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { groundPoint, createDragTracker } from "./ground.js";
import { yawDegrees } from "./rotation.js";
import { insertIndex } from "../model/route.js";
import { rotationSnap } from "../model/snap.js";
import { sweepRadius } from "../model/rotation-sweep.js";
import { dimensionsOf, liftParam } from "../model/props.js";
import { createMoveArrows } from "./move-arrows.js";
import { createRotationSweep, createMoveGuide, createAlignGuides } from "./rotation-sweep.js";
import { moveOf, alignGuides } from "../model/move-guide.js";

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
  // The ring turns in the stage's angle steps while dragging (Settings → Angle snap); holding Shift
  // turns it freely, and the prop then keeps that exact angle.
  let shift = false;
  const snapRing = () => gizmo.setRotationSnap(rotationSnap(editor.stage().settings.angleSnap, shift));
  const onShift = (e) => { if (e.shiftKey !== shift) { shift = e.shiftKey; snapRing(); } };
  window.addEventListener("keydown", onShift);
  window.addEventListener("keyup", onShift);
  // A sharp screen label for the guides ("+30°", "2.3 m"), pinned to a point on the ground. Text only
  // (textContent), placed with style properties (the CSP allows no inline style attributes).
  const tag = document.createElement("div");
  tag.className = "guide-tag";
  tag.hidden = true;
  canvas.parentElement?.append(tag);
  const tagAt = new THREE.Vector3();
  function showTag(text, [x, z], y = 0) {
    tagAt.set(x, y, z).project(camera);
    if (tagAt.z > 1) { tag.hidden = true; return; }           // behind the camera
    tag.textContent = text;
    tag.style.setProperty("left", `${canvas.offsetLeft + ((tagAt.x + 1) / 2) * canvas.clientWidth}px`);
    tag.style.setProperty("top", `${canvas.offsetTop + ((1 - tagAt.y) / 2) * canvas.clientHeight}px`);
    tag.hidden = false;
  }
  // Metres per screen pixel at a point on the ground, so guides keep their size on screen.
  const metresPerPixel = ([x, z], y = 0) => (2 * camera.position.distanceTo(new THREE.Vector3(x, y, z)) * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, canvas.clientHeight);

  // While the ring turns a prop: the angle it started at, the angle now and the turn, on the ground.
  const sweep = createRotationSweep();
  engine.groups.helper.add(sweep.group);
  let turning = null;      // { from, centre, y, radius } while the ring is dragged
  const showSweep = () => {
    if (!turning || !gizmo.object) return;
    const mpp = metresPerPixel(turning.centre, turning.y);
    // The circle a little wider than the ring; the turn just outside it.
    const s = sweep.show({ ...turning, radius: Math.max(turning.radius, 100 * mpp), gap: 28 * mpp, to: yawDegrees(gizmo.object) });
    showTag(s.text, s.labelAt, turning.y);
  };

  // The move arrows, sized like the rotate ring (TransformControls' own scale) every frame.
  const arrows = createMoveArrows();
  engine.groups.helper.add(arrows.group);
  const v3 = new THREE.Vector3();
  function placeArrows() {
    const node = gizmo.object;
    if (!node) { arrows.hide(); return; }
    node.getWorldPosition(v3);
    const factor = v3.distanceTo(camera.position) * Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7);
    const id = editor.state.selection[0];
    const o = editor.stage().objects.find((x) => x.id === id);
    arrows.show({ position: [v3.x, v3.z], scale: (factor * gizmo.size) / 4, lift: Boolean(o && liftParam(o.type)) });
  }
  engine.onRender?.(placeArrows);

  // While a prop is dragged: where it started, a line to where it is now, and how far it has moved.
  const moveGuide = createMoveGuide();
  engine.groups.helper.add(moveGuide.group);
  // …and a thin line to every other prop (or the start box) it is in line with, across or down range.
  const aligned = createAlignGuides();
  engine.groups.helper.add(aligned.group);
  const othersThan = (ids) => {
    const s = editor.stage();
    const pts = s.objects.filter((o) => !ids.includes(o.id) && !o.hidden && Array.isArray(o.position)).map((o) => o.position);
    if (s.start && !ids.includes("start")) pts.push(s.start.position);
    return pts;
  };
  let moving = null;       // { id, from } while a prop is dragged
  const placeOf = (id) => (id === "start" ? editor.stage().start : editor.stage().objects.find((x) => x.id === id));
  function showMove() {
    const o = moving && placeOf(moving.id);
    if (!o) return;
    const m = moveOf(moving.from, o.position);
    moveGuide.show({ from: moving.from, to: o.position, size: Math.max(0.12, 10 * metresPerPixel(moving.from)) });
    aligned.show(alignGuides(o.position, othersThan(editor.state.selection)));
    showTag(m.text, m.labelAt);
    engine.requestRender();
  }
  function endMove() { moving = null; moveGuide.hide(); aligned.hide(); tag.hidden = true; engine.requestRender(); }
  gizmo.addEventListener("objectChange", () => { showSweep(); engine.requestRender(); });
  gizmo.addEventListener("dragging-changed", (e) => {
    if (e.value && gizmo.object) {
      const o = editor.stage().objects.find((x) => x.id === gizmo.object.userData.id);
      const p = gizmo.object.getWorldPosition(new THREE.Vector3());
      turning = { from: yawDegrees(gizmo.object), centre: [p.x, p.z], y: o ? 0 : p.y, radius: sweepRadius(o ? dimensionsOf(o) : { w: 1, d: 1 }) };
      showSweep();
    } else { turning = null; sweep.hide(); tag.hidden = true; }
    engine.requestRender();
  });
  gizmo.addEventListener("dragging-changed", (e) => {
    cameraRig.controls.enabled = !e.value;
    if (!e.value && gizmo.object) {
      const id = gizmo.object.userData.id;
      editor.dispatch({ type: "setRotation", id, value: yawDegrees(gizmo.object), fine: shift });
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
  // Only what's drawn can be picked (a hidden prop, or a part hidden in Settings → View, can't).
  const shown = (o) => { for (let n = o; n; n = n.parent) if (!n.visible) return false; return true; };
  // The prop under the pointer: hidden props are skipped; a locked prop counts as empty ground
  // (so you orbit past it) unless `locked` is asked for (the right-click menu, to unlock it).
  function objectAt(e, { locked = false } = {}) {
    setPointer(e);
    const hits = raycaster.intersectObject(engine.groups.stage, true);
    for (const h of hits) {
      if (!shown(h.object)) continue;
      const id = stageView.idFor(h.object);
      if (!id || id === "route") continue;
      const o = editor.stage().objects.find((x) => x.id === id);
      if (o && isLocked(editor.stage(), o) && !locked) return null;
      return id;
    }
    return null;
  }
  // The shooter's route under the pointer: a grab point's handle, or the line itself (and where).
  function routeAt(e) {
    setPointer(e);
    for (const h of raycaster.intersectObject(engine.groups.stage, true)) {
      if (h.object.userData.via) return { via: h.object.userData.via };
      if (h.object.userData.routeLeg) return { leg: h.object.userData.routeLeg, point: [h.point.x, h.point.z] };
      if (stageView.idFor(h.object) !== "route" && h.object.visible) return null;     // something else is in front
    }
    return null;
  }

  let press = null;   // { x, y, id, ground, dragging, pointerId }

  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || press || gizmo.dragging) return;
    const mode = editor.state.mode;
    press = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, id: null, ground: groundAt(e), dragging: false, shift: e.shiftKey };
    if (mode === "select" && arrows.visible) {
      setPointer(e);
      const handle = arrows.pick(raycaster);
      if (handle) {                  // a move arrow (or the cube) of the selected prop
        press.handle = handle;
        press.id = editor.state.selection[0];
        cameraRig.controls.enabled = false;
        return;
      }
    }
    if (mode === "select") {
      const r = routeAt(e);
      if (r) {                       // the route: drag a grab point, tap it to remove it, tap the line to add one
        press.route = r;
        cameraRig.controls.enabled = false;
        return;
      }
      press.id = objectAt(e);
      if (press.id) {
        cameraRig.controls.enabled = false;
        if (!editor.state.selection.includes(press.id)) editor.dispatch({ type: "select", ids: [press.id], add: e.shiftKey });
        else if (e.shiftKey) press.toggle = true;
      }
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!press) {
      if (editor.state.mode !== "select") onHover(groundAt(e));
      else if (arrows.visible && !gizmo.dragging) {
        setPointer(e);
        const handle = arrows.pick(raycaster);
        if (arrows.hover(handle)) engine.requestRender();
        canvas.style.setProperty("cursor", handle === "free" ? "move" : handle ? "grab" : "");
      }
      return;
    }
    // The up arrow: the prop's height follows the pointer up and down the screen.
    if (press.handle === "y" && e.pointerId === press.pointerId) {
      if (!press.dragging && Math.abs(e.clientY - press.y) > TAP_PX) {
        press.dragging = true;
        editor.dispatch({ type: "liftStart", id: press.id });
        const o = editor.stage().objects.find((x) => x.id === press.id);
        press.lift = o ? { key: liftParam(o.type), mpp: metresPerPixel(o.position) } : null;
      }
      if (press.dragging && press.lift) {
        editor.dispatch({ type: "liftMove", by: (press.y - e.clientY) * press.lift.mpp });
        const o = editor.stage().objects.find((x) => x.id === press.id);
        if (o) showTag(`${press.lift.key === "mountHeight" ? "Stand" : "Base"} ${o.params[press.lift.key].toFixed(2)} m`, o.position, 0);
      }
      return;
    }
    if (press.route?.via && e.pointerId === press.pointerId) {
      const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_PX;
      if (!press.dragging && moved) { press.dragging = true; editor.dispatch({ type: "viaDragStart", ...press.route.via }); }
      if (press.dragging) { const g = groundAt(e); if (g) editor.dispatch({ type: "viaDragMove", point: g }); }
      return;
    }
    if (e.pointerId !== press.pointerId || !press.id || !press.ground) return;
    const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_PX;
    if (!press.dragging && moved) {
      press.dragging = true;
      press.tracker = createDragTracker();
      editor.dispatch({ type: "dragStart", ids: editor.state.selection });
      const o = placeOf(press.id);
      moving = o ? { id: press.id, from: [...o.position] } : null;
    }
    if (press.dragging) {
      const g = groundAt(e);
      if (!g) return;
      // Shift: a fifth of the speed and no snapping, for fine placement.
      const delta = press.tracker.update([g[0] - press.ground[0], g[1] - press.ground[1]], e.shiftKey);
      editor.dispatch({ type: "dragMove", delta, fine: e.shiftKey, axis: press.handle === "x" || press.handle === "z" ? press.handle : null });
      showMove();
    }
  });

  function release(e) {
    if (!press || e.pointerId !== press.pointerId) return;
    const p = press;
    press = null;
    cameraRig.controls.enabled = true;
    if (p.route) {
      if (p.dragging) { editor.dispatch({ type: "viaDragEnd" }); return; }
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > TAP_PX || e.type === "pointercancel") return;
      if (p.route.via) editor.dispatch({ type: "removeVia", ...p.route.via });
      else editor.dispatch({ type: "addVia", id: p.route.leg.to, index: insertIndex(p.route.leg.points, p.route.point), point: p.route.point });
      return;
    }
    if (p.handle === "y") { if (p.dragging) { editor.dispatch({ type: "liftEnd" }); tag.hidden = true; } return; }
    if (p.dragging) { editor.dispatch({ type: "dragEnd" }); endMove(); return; }
    if (p.handle) return;          // a tap on an arrow does nothing
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
    else if (mode?.measure && g) editor.dispatch({ type: "addMeasurePoint", point: g, fine: e.shiftKey });
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  canvas.addEventListener("dblclick", () => {
    if (editor.state.mode?.draw) editor.dispatch({ type: "finishDraw" });
  });

  // Mouse drag-and-drop from the prop library (props, start marks and shooting positions), and the
  // start position (a marking of its own).
  canvas.addEventListener("dragover", (e) => {
    if (e.dataTransfer?.types.includes("application/x-stage-prop") || e.dataTransfer?.types.includes("application/x-stage-start")) e.preventDefault();
  });
  canvas.addEventListener("drop", (e) => {
    const type = e.dataTransfer?.getData("application/x-stage-prop");
    const start = e.dataTransfer?.types.includes("application/x-stage-start");
    if (!type && !start) return;
    e.preventDefault();
    const g = groundAt(e);
    if (!g) return;
    if (start) { editor.dispatch({ type: "setStart", position: g, facing: editor.stage().start?.facing ?? 0 }); editor.dispatch({ type: "select", ids: ["start"] }); return; }
    editor.dispatch({ type: "place", propType: type, position: g });
    if (editor.state.mode?.place === type) editor.dispatch({ type: "setMode", mode: "select" });      // a drop places one
  });

  /** Put the rotate ring on the single selected object (call after every stage view sync). */
  function updateGizmo() {
    snapRing();
    const sel = editor.state.selection;
    const node = sel.length === 1 ? stageView.objectFor(sel[0]) : null;
    const o = node && editor.stage().objects.find((x) => x.id === sel[0]);
    const isObject = (o && !isLocked(editor.stage(), o)) || (node && sel[0] === "start");         // no rotate ring on a locked prop
    if (isObject && editor.state.mode === "select") { if (gizmo.object !== node) gizmo.attach(node); }
    else if (gizmo.object) gizmo.detach();
    placeArrows();
  }

  return { gizmo, updateGizmo, objectAt, groundAt };
}
