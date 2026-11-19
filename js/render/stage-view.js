// Keeps the stage group in step with the stage data. Each object, line and the start marker is one
// child, keyed by id; sync() rebuilds a child only when its JSON changed. Shared materials are never
// disposed here; geometries (and label textures) are.
import { buildProp, buildLine, buildStartMarker } from "./builders/index.js";
import { startFacing } from "../model/start-pose.js";
import { buildRoute, routeKey } from "./builders/route.js";
import { dimensionsOf, getProp } from "../model/props.js";

const LABEL_GAP = 0.22;

function disposeTree(obj) {
  obj.traverse((c) => {
    c.geometry?.dispose();
    if (c.userData.ownMaterial) { c.material.map?.dispose(); c.material.dispose(); }
  });
}

export function createStageView(group, { labelFactory = null } = {}) {
  const items = new Map();   // id → { node, key }

  function place(obj) {
    const node = buildProp(obj);
    node.position.set(obj.position[0], 0, obj.position[1]);
    node.rotation.y = (-obj.rotation * Math.PI) / 180;
    if (labelFactory && obj.label && getProp(obj.type).scoring) {
      const label = labelFactory(obj.label);
      label.position.y = dimensionsOf(obj).h + LABEL_GAP;
      node.add(label);
    }
    return node;
  }

  function put(id, key, build) {
    const old = items.get(id);
    if (old && old.key === key) return;
    if (old) { group.remove(old.node); disposeTree(old.node); }
    const node = build();
    node.userData.id = id;
    group.add(node);
    items.set(id, { node, key });
  }

  function sync(stage) {
    const seen = new Set();
    for (const o of stage.objects) { seen.add(o.id); put(o.id, JSON.stringify(o), () => place(o)); }
    for (const l of stage.lines) { seen.add(l.id); put(l.id, JSON.stringify(l), () => buildLine(l)); }
    if (stage.start) { seen.add("start"); put("start", JSON.stringify([stage.start, startFacing(stage), stage.briefing?.startPosition, stage.briefing?.gunCondition]), () => buildStartMarker(stage.start, stage)); }
    // The shooter's route (start → shooting positions), when there is one.
    if (stage.objects.some((o) => o.type === "shooting-position")) { seen.add("route"); put("route", routeKey(stage), () => buildRoute(stage)); }
    for (const [id, { node }] of items) {
      if (seen.has(id)) continue;
      group.remove(node);
      disposeTree(node);
      items.delete(id);
    }
  }

  function idFor(object3d) {
    for (let o = object3d; o; o = o.parent) {
      if (o.parent === group) return o.userData.id;
    }
    return undefined;
  }

  return {
    sync,
    objectFor: (id) => items.get(id)?.node,
    idFor,
    dispose() { for (const { node } of items.values()) { group.remove(node); disposeTree(node); } items.clear(); },
  };
}
