// The props on stage as a list: groups, hiding, locking, and copy and paste.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, addObject } from "../js/model/stage.js";
import { assignLabels } from "../js/model/numbering.js";
import { createEditor } from "../js/editor.js";
import { validateStage } from "../js/model/schema.js";
import { isLocked, isHidden, layerTree, itemName, groupObjects } from "../js/model/layers.js";
import { stageStats } from "../js/model/stats.js";

function setup() {
  let s = createStage({ width: 20, depth: 20 });
  const add = (t, p) => { const r = addObject(s, t, p); s = r.stage; return r.id; };
  const ids = { a: add("paper-ipsc", [0, 10]), b: add("paper-ipsc", [2, 10]), wall: add("wall-wood", [0, 6]), pop: add("popper", [4, 9]), sw: add("swinger", [-4, 12]) };
  return { ed: createEditor({ stage: assignLabels(s) }), ids };
}
const obj = (ed, id) => ed.stage().objects.find((o) => o.id === id);

test("locking and hiding are undo steps; hidden props still count", () => {
  const { ed, ids } = setup();
  const before = stageStats(ed.stage());
  ed.dispatch({ type: "setLocked", ids: [ids.wall], locked: true });
  ed.dispatch({ type: "setHidden", ids: [ids.a], hidden: true });
  assert.ok(isLocked(ed.stage(), obj(ed, ids.wall)));
  assert.ok(isHidden(ed.stage(), obj(ed, ids.a)));
  assert.deepEqual(stageStats(ed.stage()), before, "a hidden target is still on the stage");
  ed.dispatch({ type: "undo" });
  assert.ok(!isHidden(ed.stage(), obj(ed, ids.a)));
  ed.dispatch({ type: "setLocked", ids: [ids.wall], locked: false });
  assert.equal(obj(ed, ids.wall).locked, undefined);
});

test("a locked prop doesn't move with a drag or by rotating the selection", () => {
  const { ed, ids } = setup();
  ed.dispatch({ type: "setLocked", ids: [ids.wall], locked: true });
  const at = obj(ed, ids.wall).position;
  ed.dispatch({ type: "dragStart", ids: [ids.wall, ids.a] });
  ed.dispatch({ type: "dragMove", delta: [1, 1] });
  ed.dispatch({ type: "dragEnd" });
  assert.deepEqual(obj(ed, ids.wall).position, at, "the locked wall stayed");
  assert.notDeepEqual(obj(ed, ids.a).position, [0, 10], "the other prop moved");
  ed.dispatch({ type: "rotate", by: 90, ids: [ids.wall] });
  assert.equal(obj(ed, ids.wall).rotation, 0);
  ed.dispatch({ type: "delete", ids: [ids.wall] });
  assert.ok(obj(ed, ids.wall), "a locked prop isn't deleted; unlock it first");
});

test("grouping, renaming, hiding and locking a group, moving into and out of it, ungrouping", () => {
  const { ed, ids } = setup();
  ed.dispatch({ type: "group", ids: [ids.a, ids.b] });
  const g = ed.stage().groups[0];
  assert.equal(g.name, "Group 1");
  assert.deepEqual(ed.state.selection.sort(), [ids.a, ids.b].sort(), "the group's members stay selected");
  ed.dispatch({ type: "updateGroup", id: g.id, patch: { name: "Left array", hidden: true, locked: true } });
  assert.ok(isHidden(ed.stage(), obj(ed, ids.a)) && isLocked(ed.stage(), obj(ed, ids.b)), "a hidden, locked group hides and locks its members");
  ed.dispatch({ type: "moveToGroup", ids: [ids.pop], group: g.id });
  assert.equal(obj(ed, ids.pop).group, g.id);
  const tree = layerTree(ed.stage());
  const node = tree.find((n) => n.kind === "group");
  assert.equal(node.group.name, "Left array");
  assert.deepEqual(node.items.map((o) => o.id).sort(), [ids.a, ids.b, ids.pop].sort());
  ed.dispatch({ type: "moveToGroup", ids: [ids.a, ids.b, ids.pop], group: null });
  assert.equal(ed.stage().groups.length, 0, "an empty group goes away");
  ed.dispatch({ type: "undo" });
  ed.dispatch({ type: "ungroup", id: g.id });
  assert.ok(ed.stage().objects.every((o) => !o.group));
  assert.equal(itemName(obj(ed, ids.a)), `${obj(ed, ids.a).label} · IPSC target`);
});

test("copy and paste: new props beside the originals, renumbered, links between them kept", () => {
  const { ed, ids } = setup();
  ed.dispatch({ type: "setActivator", id: ids.sw, by: ids.pop });
  ed.dispatch({ type: "copy", ids: [ids.sw, ids.pop] });
  const n = ed.stage().objects.length;
  ed.dispatch({ type: "paste" });
  assert.equal(ed.stage().objects.length, n + 2);
  const pasted = ed.state.selection.map((id) => obj(ed, id));
  const sw2 = pasted.find((o) => o.type === "swinger"), pop2 = pasted.find((o) => o.type === "popper");
  assert.equal(sw2.activatedBy, pop2.id, "the pasted swinger is started by the pasted popper");
  assert.notEqual(sw2.label, obj(ed, ids.sw).label, "fresh target numbers");
  assert.deepEqual(pop2.position, [4.5, 9.5]);
  ed.dispatch({ type: "paste" });
  assert.equal(ed.stage().objects.length, n + 4, "paste again: another set");
  ed.dispatch({ type: "undo" }); ed.dispatch({ type: "undo" });
  assert.equal(ed.stage().objects.length, n);
  ed.dispatch({ type: "cut", ids: [ids.b] });
  assert.equal(obj(ed, ids.b), undefined, "cut removes it");
  ed.dispatch({ type: "paste" });
  assert.equal(ed.stage().objects.length, n);
});

test("select all of a kind skips hidden and locked props", () => {
  const { ed, ids } = setup();
  ed.dispatch({ type: "setHidden", ids: [ids.b], hidden: true });
  ed.dispatch({ type: "selectAll", propType: "paper-ipsc" });
  assert.deepEqual(ed.state.selection, [ids.a]);
  ed.dispatch({ type: "selectAll" });
  assert.equal(ed.state.selection.length, 4);
});

test("groups, locks and hiding are checked on import", () => {
  const { ed, ids } = setup();
  ed.dispatch({ type: "group", ids: [ids.a, ids.b] });
  ed.dispatch({ type: "setLocked", ids: [ids.wall], locked: true });
  ed.dispatch({ type: "setHidden", ids: [ids.pop], hidden: true });
  const json = JSON.parse(JSON.stringify(ed.stage()));
  const r = validateStage(json);
  assert.ok(r.ok, JSON.stringify(r.errors));
  assert.equal(r.stage.groups.length, 1);
  assert.equal(r.stage.objects.find((o) => o.id === ids.wall).locked, true);
  assert.equal(r.stage.objects.find((o) => o.id === ids.pop).hidden, true);
  json.objects.find((o) => o.id === ids.a).group = "nope";
  assert.equal(validateStage(json).stage.objects.find((o) => o.id === ids.a).group, undefined, "unknown group: dropped");
  json.objects[0].locked = "yes";
  assert.equal(validateStage(json).ok, false);
  assert.equal(validateStage({ ...JSON.parse(JSON.stringify(ed.stage())), groups: "x" }).ok, false);
  assert.ok(validateStage({ ...JSON.parse(JSON.stringify(ed.stage())), groups: undefined }).ok, "older stages have no groups");
  assert.ok(groupObjects);
});
