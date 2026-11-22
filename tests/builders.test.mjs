// 3D builders draw every prop at its real size, standing on the ground, sharing materials.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3, Raycaster } from "three";
import { buildProp } from "../js/render/builders/index.js";
import { defaultParams, dimensionsOf, upgradeProp } from "../js/model/props.js";

// Older prop names (wall-port, wall-door, tyre-stack…) build as today's prop with that choice.
const obj = (old, oldParams = {}) => { const { type, params } = upgradeProp(old, oldParams); return { id: `id-${type}`, type, params: { ...defaultParams(type), ...params } }; };
const size = (g) => new Box3().setFromObject(g).getSize(new Vector3());
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a.toFixed(4)} vs ${b.toFixed(4)}`);

function checkSize(type, params) {
  const o = obj(type, params);
  const g = buildProp(o);
  const s = size(g.getObjectByName("berm-earth") ?? g);           // a berm's grass and bushes may stand above and beyond its earth
  const d = dimensionsOf(o);
  near(s.x, d.w, 0.01, `${type} width`);
  near(s.y, d.h, 0.01, `${type} height`);
  near(s.z, d.d, 0.01, `${type} depth`);
  near(new Box3().setFromObject(g).min.y, 0, 0.001, `${type} stands on the ground`);
  assert.equal(g.userData.id, o.id);
}

for (const type of ["paper-ipsc", "paper-mini", "popper", "plate-round", "plate-square"]) {
  test(`${type} is drawn at its real size`, () => checkSize(type));
}

test("raised targets keep their real size", () => {
  checkSize("paper-ipsc", { mountHeight: 1.5 });
  checkSize("popper", { baseHeight: 0.5 });
  checkSize("plate-round", { size: 0.3 });
});

test("two targets share one material", () => {
  const mats = (g) => { const m = []; g.traverse((c) => c.material && m.push(c.material)); return m; };
  const a = mats(buildProp(obj("paper-ipsc")));
  const b = mats(buildProp(obj("paper-ipsc")));
  assert.ok(a.length > 0);
  assert.ok(a.some((m) => b.includes(m)));
});


// --- Task 8: walls, ports, obstacles, lines and the start marker ---
import { buildLine, buildStartMarker } from "../js/render/builders/index.js";
import { getMaterial } from "../js/render/materials.js";

for (const type of ["wall-mesh", "wall-wood", "wall-port", "barrel", "tyre", "tyre-stack", "crate"]) {
  test(`${type} is drawn at its real size`, () => checkSize(type));
}

test("resized walls keep their real size", () => {
  checkSize("wall-mesh", { length: 3.5, height: 1.2 });
  checkSize("wall-port", { length: 1.2, height: 2.4, portBottom: 1.5 });
  checkSize("tyre-stack", { count: 5 });
});

test("a port is a real opening in the wall", () => {
  const g = buildProp(obj("wall-port", { portWidth: 0.4, portHeight: 0.4, portBottom: 1.0 }));
  g.updateMatrixWorld(true);
  const ray = (x, y) => new Raycaster(new Vector3(x, y, -1), new Vector3(0, 0, 1)).intersectObject(g, true);
  assert.equal(ray(0, 1.2).length, 0, "through the port centre");
  assert.ok(ray(0.5, 1.2).length > 0, "beside the port");
  assert.ok(ray(0, 0.5).length > 0, "below the port");
});

test("mesh colour comes from the wall's own setting", () => {
  const uses = (g, name) => { let found = false; g.traverse((c) => { if (c.material === getMaterial(name)) found = true; }); return found; };
  assert.ok(uses(buildProp(obj("wall-mesh", { mesh: "blue" })), "mesh-blue"));
  assert.ok(!uses(buildProp(obj("wall-mesh", { mesh: "blue" })), "mesh-black"));
  assert.ok(uses(buildProp(obj("wall-mesh", { frame: "wood" })), "wood"));
});

test("fault lines have one bar per segment, closing the loop when closed", () => {
  const pts = [[0, 0], [2, 0], [2, 2]];
  const bars = (l) => l.children.filter((c) => c.userData.bar).length;
  assert.equal(bars(buildLine({ id: "a", type: "fault-line", points: pts, closed: true })), 3);
  assert.equal(bars(buildLine({ id: "b", type: "fault-line", points: pts, closed: false })), 2);
  assert.equal(buildLine({ id: "b", type: "fault-line", points: pts, closed: false }).userData.id, "b");
});

test("start marker is a 1 m square on the ground", () => {
  const s = size(buildStartMarker({ position: [0, 1], facing: 0 }));
  near(s.x, 1, 0.01, "width");
  near(s.z, 1, 0.01, "depth");
});

// --- Snapping and look update ---
for (const type of ["wall-mesh-port", "plant-palm"]) {
  test(`${type} is drawn at its real size`, () => checkSize(type));
}

test("a mesh wall with port has a real opening with mesh around it", () => {
  const g = buildProp(obj("wall-mesh-port", { portWidth: 0.4, portHeight: 0.4, portBottom: 1.0 }));
  g.updateMatrixWorld(true);
  const ray = (x, y) => new Raycaster(new Vector3(x, y, -1), new Vector3(0, 0, 1)).intersectObject(g, true);
  assert.equal(ray(0, 1.2).length, 0, "through the port centre");
  assert.ok(ray(0.6, 1.2).length > 0, "mesh beside the port");
  assert.ok(ray(0, 0.5).length > 0, "mesh below the port");
  assert.ok(ray(0, 1.7).length > 0, "mesh above the port");
});

test("steel paint comes from the prop's own setting", () => {
  const uses = (g, name) => { let found = false; g.traverse((c) => { if (c.material === getMaterial(name)) found = true; }); return found; };
  assert.ok(uses(buildProp(obj("popper")), "steel-yellow"));
  assert.ok(uses(buildProp(obj("popper", { paint: "white" })), "steel-white"));
  assert.ok(uses(buildProp(obj("plate-square")), "steel-white"));
});

test("paper targets stand in a dark brown base", () => {
  const uses = (g, name) => { let found = false; g.traverse((c) => { if (c.material === getMaterial(name)) found = true; }); return found; };
  assert.ok(uses(buildProp(obj("paper-ipsc")), "stand-foot"), "dark brown stand feet");
});

// --- Detail update: new props, proportions ---
for (const type of ["wall-door", "ramp", "platform", "car", "table", "chair", "pallet", "sandbags", "cone"]) {
  test(`${type} is drawn at its real size`, () => checkSize(type));
}

test("stacks and resized structures keep their real size", () => {
  checkSize("pallet", { count: 4 });
  checkSize("sandbags", { length: 2.4, rows: 4 });
  checkSize("ramp", { length: 3.5, width: 1.5, height: 0.8 });
  checkSize("platform", { length: 3, width: 2, height: 1.2 });
  checkSize("table", { length: 1.2 });
  for (const color of ["blue", "red", "green"]) checkSize("barrel", { color });
});

test("a mesh doorway is open from the ground to the door height", () => {
  const g = buildProp(obj("wall-door", { doorWidth: 0.8, doorHeight: 1.95 }));
  g.updateMatrixWorld(true);
  const ray = (x, y) => new Raycaster(new Vector3(x, y, -1), new Vector3(0, 0, 1)).intersectObject(g, true);
  assert.equal(ray(0, 0.3).length, 0, "through the door low");
  assert.equal(ray(0, 1.8).length, 0, "through the door high");
  assert.ok(ray(0, 2.1).length > 0, "above the door");
  assert.ok(ray(0.6, 1.0).length > 0, "beside the door");
});

test("target sticks reach only half way up the card", () => {
  const o = obj("paper-ipsc");
  const g = buildProp(o);
  let stickTop = 0;
  g.traverse((c) => { if (c.material === getMaterial("stick-wood")) stickTop = Math.max(stickTop, new Box3().setFromObject(c).max.y); });
  const mount = o.params.mountHeight;
  near(stickTop, mount + 0.58 / 2, 0.03, "stick top");
});

test("short sandbag walls keep whole bags in every row", () => {
  for (const length of [0.6, 0.8, 1.2]) {
    const g = buildProp(obj("sandbags", { length, rows: 3 }));
    const bags = [];
    g.traverse((c) => { if (c.isMesh) bags.push(new Box3().setFromObject(c)); });
    const rows = [0, 1, 2].map((r) => bags.filter((b) => { const cy = (b.min.y + b.max.y) / 2; return cy > r * 0.13 && cy < (r + 1) * 0.13; }).length);
    assert.ok(rows.every((n) => n >= 1), `length ${length}: bags per row ${rows}`);
    for (const b of bags) assert.ok(b.max.y - b.min.y < 0.15, `length ${length}: a bag ${(b.max.y - b.min.y).toFixed(2)} m tall`);
  }
});

test("solid panel wall is drawn at its real size and blocks the view", () => {
  checkSize("wall-solid");
  const g = buildProp(obj("wall-solid"));
  g.updateMatrixWorld(true);
  assert.ok(new Raycaster(new Vector3(0, 1, -1), new Vector3(0, 0, 1)).intersectObject(g, true).length > 0);
});

test("paper targets print their scoring zones on the card (no line geometry)", () => {
  let lines = 0;
  buildProp(obj("paper-ipsc")).traverse((c) => { if (c.isLineSegments) lines++; });
  assert.equal(lines, 0);
});

test("orange netting is the default mesh, and walls have corner gussets and feet", () => {
  const uses = (g, name) => { let found = false; g.traverse((c) => { if (c.material === getMaterial(name)) found = true; }); return found; };
  const g = buildProp(obj("wall-mesh"));
  assert.ok(uses(g, "mesh-orange"));
  let gussets = 0;
  g.traverse((c) => { if (c.userData.gusset) gussets++; });
  assert.equal(gussets, 4);
});

test("cars come as a saloon, hatchback, pickup and van, each at its real size", async () => {
  const { CAR_MODELS } = await import("../js/model/props.js");
  assert.deepEqual(Object.keys(CAR_MODELS), ["sedan", "hatchback", "pickup", "van"]);
  assert.equal(defaultParams("car").model, "sedan");
  for (const model of Object.keys(CAR_MODELS)) for (const color of ["white", "red", "blue", "grey", "rust"]) {
    checkSize("car", { model, color });
    const d = dimensionsOf(obj("car", { model, color }));
    const m = CAR_MODELS[model];
    assert.deepEqual([d.w, d.h, d.d], [m.length, m.height, m.width], model);
  }
  assert.ok(CAR_MODELS.van.height > CAR_MODELS.sedan.height && CAR_MODELS.pickup.length > CAR_MODELS.sedan.length);
});

test("a car body is one smooth lofted shell with real glass, treaded wheels on alloys", () => {
  for (const model of ["sedan", "hatchback", "pickup", "van"]) {
    const g = buildProp(obj("car", { model, color: "blue" }));
    let tread = 0, rims = 0, body = null;
    g.traverse((c) => {
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      if (mats.includes(getMaterial("tread"))) tread++;
      if (c.userData.rim) rims++;
      if (c.userData.part === "body") body = c;
    });
    assert.equal(tread, 4, `${model}: tyres`);
    assert.equal(rims, 4, `${model}: rims`);
    assert.ok(body, `${model}: body`);
    const mats = body.material;
    const glassGroups = body.geometry.groups.filter((gr) => mats[gr.materialIndex] === getMaterial("glass") && gr.count > 0);
    assert.ok(glassGroups.length === 1 && glassGroups[0].count >= 60, `${model}: windows are part of the shell`);
    assert.ok(body.geometry.attributes.position.count > 1000, `${model}: a finely lofted body`);
    assert.ok(body.geometry.attributes.uv, `${model}: mapped for the paint texture`);
  }
});

test("cars carry the small parts: wheel wells, wipers, mirrors, handles, aerial, exhaust, indicators", () => {
  for (const model of ["sedan", "hatchback", "pickup", "van"]) {
    const g = buildProp(obj("car", { model, color: "blue" }));
    const count = (tag) => { let n = 0; g.traverse((c) => { if (c.userData.part === tag) n++; }); return n; };
    assert.equal(count("wheelwell"), 4, model);
    assert.equal(count("wiper"), 2, model);
    assert.equal(count("mirror"), 2, model);
    assert.ok(count("handle") >= 4, model);
    assert.equal(count("aerial"), 1, model);
    assert.equal(count("exhaust"), 1, model);
    assert.equal(count("indicator"), 2, model);
    assert.equal(count("headlight"), 2, model);
    assert.equal(count("taillight"), 2, model);
  }
});

test("every target layout is drawn at its real size, with one card per target and no-shoot", async () => {
  const { LAYOUTS, layoutDefaults, arrayCounts } = await import("../js/model/arrays.js");
  // Each layout with its usual cards, and with every card a no-shoot.
  const PRESENTATIONS = LAYOUTS.flatMap((l) => [{ id: l.id, params: layoutDefaults(l.id) }, { id: `${l.id} no-shoots`, params: { layout: l.id, card1: "noshoot", card2: "noshoot", card3: "noshoot" } }]);
  for (const t of ["paper-ipsc", "paper-mini"]) for (const p of PRESENTATIONS) for (const style of ["classic", "head"]) {
    checkSize(t, { ...p.params, style, mountHeight: 0.4 });
    const g = buildProp(obj(t, { ...p.params, style }));
    let targets = 0, noshoots = 0;
    g.traverse((c) => { if (c.userData.card === "target") targets++; if (c.userData.card === "noshoot") noshoots++; });
    const n = arrayCounts(obj(t, p.params));
    assert.deepEqual([targets, noshoots], [n.paper, n.noshoot], `${t} ${p.id}`);
  }
});

test("hard cover is painted black on its card, inside its outline", async () => {
  const { HARD_COVERS } = await import("../js/model/arrays.js");
  for (const c of HARD_COVERS) {
    const g = buildProp(obj("paper-ipsc", { card1: c.id === "none" ? "target" : `target:${c.id}` }));
    const covers = [];
    g.traverse((m) => { if (m.userData.part === "cover") covers.push(m); });
    assert.equal(covers.length, c.id === "none" ? 0 : 1, c.id);
    if (covers.length) {
      const b = new Box3().setFromObject(covers[0]);
      assert.ok(b.max.y <= 0.7 + 0.57 + 1e-6 && b.min.y >= 0.7 - 1e-6, `${c.id} stays on the card`);
      if (c.id.startsWith("lower")) {
        const f = { "lower-1/4": 0.25, "lower-1/3": 1 / 3, "lower-1/2": 0.5 }[c.id];
        near(b.max.y, 0.7 + 0.57 * f, 0.002, `${c.id} top`);
      }
    }
  }
});
